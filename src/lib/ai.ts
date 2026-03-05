import 'server-only';

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { trimEnv } from './utils';
import type { TailorResult, KeywordItem, ChangeSummary } from '@/types';

// ─── Provider Initialization ───────────────────────────────────────────────────

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = trimEnv('GEMINI_API_KEY');
  if (!apiKey) {
    console.warn('[AI] GEMINI_API_KEY not set — Gemini provider unavailable');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

function getGroqClient(): Groq | null {
  const apiKey = trimEnv('GROQ_API_KEY');
  if (!apiKey) {
    console.warn('[AI] GROQ_API_KEY not set — Groq provider unavailable');
    return null;
  }
  return new Groq({ apiKey });
}

// ─── JSON Parsing ──────────────────────────────────────────────────────────────

/**
 * Strips markdown code fences if the model wrapped the JSON in them.
 */
function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    cleaned = cleaned.replace(/\n?\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Parses and validates a raw string as a TailorResult.
 * Throws if the response is invalid.
 */
function parseAndValidate(raw: string): TailorResult {
  const cleaned = stripCodeFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI response is not valid JSON: ${cleaned.substring(0, 200)}...`);
  }

  const obj = parsed as Record<string, unknown>;

  // Validate required top-level fields
  if (typeof obj.matchScore !== 'number') {
    throw new Error('AI response missing or invalid matchScore');
  }
  if (typeof obj.summary !== 'string' || obj.summary.length === 0) {
    throw new Error('AI response missing or empty summary');
  }
  if (typeof obj.tailoredResume !== 'string' || obj.tailoredResume.length === 0) {
    throw new Error('AI response missing or empty tailoredResume');
  }
  if (!obj.keywords || typeof obj.keywords !== 'object') {
    throw new Error('AI response missing keywords object');
  }
  if (!Array.isArray(obj.changes)) {
    throw new Error('AI response missing changes array');
  }

  // Validate keywords sub-fields
  const kw = obj.keywords as Record<string, unknown>;
  if (!Array.isArray(kw.found)) throw new Error('AI response missing keywords.found');
  if (!Array.isArray(kw.missing)) throw new Error('AI response missing keywords.missing');
  if (!Array.isArray(kw.added)) throw new Error('AI response missing keywords.added');

  // Validate keyword items
  const validRelevance = new Set(['critical', 'important', 'nice-to-have']);
  const validateKeywordItems = (items: unknown[], label: string): KeywordItem[] => {
    return items.map((item, i) => {
      const ki = item as Record<string, unknown>;
      if (typeof ki.keyword !== 'string') {
        throw new Error(`${label}[${i}] missing keyword`);
      }
      if (!validRelevance.has(ki.relevance as string)) {
        // Default to 'important' if relevance is unrecognized
        ki.relevance = 'important';
      }
      return {
        keyword: ki.keyword as string,
        relevance: ki.relevance as KeywordItem['relevance'],
        context: typeof ki.context === 'string' ? ki.context : '',
      };
    });
  };

  const found = validateKeywordItems(kw.found as unknown[], 'keywords.found');
  const missing = validateKeywordItems(kw.missing as unknown[], 'keywords.missing');
  const added = validateKeywordItems(kw.added as unknown[], 'keywords.added');

  // Validate changes
  const validChangeTypes = new Set(['rewrite', 'addition', 'removal', 'reorder']);
  const changes: ChangeSummary[] = (obj.changes as unknown[]).map((item, i) => {
    const c = item as Record<string, unknown>;
    if (typeof c.section !== 'string') {
      throw new Error(`changes[${i}] missing section`);
    }
    if (!validChangeTypes.has(c.type as string)) {
      c.type = 'rewrite'; // Default
    }
    return {
      section: c.section as string,
      type: c.type as ChangeSummary['type'],
      description: typeof c.description === 'string' ? c.description : '',
    };
  });

  // Clamp matchScore to 0-100 integer
  const matchScore = Math.max(0, Math.min(100, Math.round(obj.matchScore as number)));

  return {
    matchScore,
    summary: obj.summary as string,
    keywords: { found, missing, added },
    tailoredResume: obj.tailoredResume as string,
    changes,
  };
}

// ─── Gemini Provider ───────────────────────────────────────────────────────────

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number
): Promise<TailorResult> {
  const client = getGeminiClient();
  if (!client) throw new Error('Gemini client unavailable');

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    });

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Gemini returned empty response');
    }

    return parseAndValidate(text);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Groq Provider ─────────────────────────────────────────────────────────────

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number
): Promise<TailorResult> {
  const client = getGroqClient();
  if (!client) throw new Error('Groq client unavailable');

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 8192,
  }, {
    timeout: timeoutMs,
  });

  const text = completion.choices?.[0]?.message?.content;

  if (!text || text.trim().length === 0) {
    throw new Error('Groq returned empty response');
  }

  return parseAndValidate(text);
}

// ─── Main Entry Point ──────────────────────────────────────────────────────────

/**
 * Calls the AI provider with tiered fallback.
 *
 * Strategy:
 * - Try Gemini first with a 40s timeout
 * - If Gemini fails, fall back to Groq with the remaining budget (max 15s)
 * - Total budget: 55s (leaving 5s buffer for the 60s Vercel limit)
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string
): Promise<TailorResult> {
  const startTime = Date.now();
  const TOTAL_BUDGET_MS = 55_000;
  const GEMINI_TIMEOUT_MS = 40_000;
  const GROQ_MAX_TIMEOUT_MS = 15_000;

  // Try Gemini first
  try {
    console.log('[AI] Attempting Gemini 2.0 Flash...');
    const result = await callGemini(systemPrompt, userPrompt, GEMINI_TIMEOUT_MS);
    console.log('[AI] Gemini succeeded');
    return result;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const geminiError = error instanceof Error ? error.message : String(error);
    console.warn(`[AI] Gemini failed after ${elapsed}ms: ${geminiError}`);

    // Calculate remaining budget for Groq
    const remainingBudget = TOTAL_BUDGET_MS - elapsed;
    const groqTimeout = Math.min(GROQ_MAX_TIMEOUT_MS, Math.max(remainingBudget, 5_000));

    if (remainingBudget < 3_000) {
      throw new Error(`AI providers exhausted — no time budget remaining (${elapsed}ms elapsed)`);
    }

    // Fall back to Groq
    try {
      console.log(`[AI] Falling back to Groq (timeout: ${groqTimeout}ms)...`);
      const result = await callGroq(systemPrompt, userPrompt, groqTimeout);
      console.log('[AI] Groq fallback succeeded');
      return result;
    } catch (groqError) {
      const totalElapsed = Date.now() - startTime;
      const groqMsg = groqError instanceof Error ? groqError.message : String(groqError);
      console.error(`[AI] Groq also failed after ${totalElapsed}ms total: ${groqMsg}`);
      throw new Error(
        `All AI providers failed. Gemini: ${geminiError}. Groq: ${groqMsg}`
      );
    }
  }
}
