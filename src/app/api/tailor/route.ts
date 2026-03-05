import 'server-only';

import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts';
import { sanitizeInput, getClientIP, hashIP, trimEnv } from '@/lib/utils';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';
import type {
  TailorRequest,
  TailorResponse,
  TailorErrorResponse,
  RateLimitInfo,
} from '@/types';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function errorResponse(
  error: string,
  code: TailorErrorResponse['code'],
  status: number,
  rateLimit?: RateLimitInfo
): NextResponse<TailorErrorResponse> {
  return NextResponse.json(
    { success: false as const, error, code, rateLimit },
    { status }
  );
}

function successResponse(
  data: TailorResponse['data'],
  rateLimit: RateLimitInfo
): NextResponse<TailorResponse> {
  return NextResponse.json(
    { success: true as const, data, rateLimit },
    { status: 200 }
  );
}

// ─── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. CSRF — Verify Origin header
    const origin = request.headers.get('origin');
    const appUrl = trimEnv('NEXT_PUBLIC_APP_URL');

    if (appUrl && origin) {
      const originHost = new URL(origin).host;
      const appHost = new URL(appUrl).host;
      if (originHost !== appHost) {
        return errorResponse(
          'Invalid origin',
          'INVALID_INPUT',
          403
        );
      }
    }

    // 2. Verify rm_uid cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...rest] = c.trim().split('=');
        return [key, rest.join('=')];
      })
    );
    const cookieUid = cookies['rm_uid']?.trim();

    if (!cookieUid) {
      return errorResponse(
        'Session identifier missing. Please refresh the page.',
        'INVALID_INPUT',
        400
      );
    }

    // 3. Extract and hash client IP
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // 4. Parse and validate request body
    let body: TailorRequest;
    try {
      body = await request.json();
    } catch {
      return errorResponse(
        'Invalid JSON in request body',
        'INVALID_INPUT',
        400
      );
    }

    if (!body.resume || typeof body.resume !== 'string') {
      return errorResponse(
        'Resume text is required',
        'INVALID_INPUT',
        400
      );
    }

    if (!body.jobDescription || typeof body.jobDescription !== 'string') {
      return errorResponse(
        'Job description text is required',
        'INVALID_INPUT',
        400
      );
    }

    const resume = sanitizeInput(body.resume);
    const jobDescription = sanitizeInput(body.jobDescription);

    if (resume.length < 50) {
      return errorResponse(
        'Resume must be at least 50 characters',
        'INVALID_INPUT',
        400
      );
    }

    if (resume.length > 15000) {
      return errorResponse(
        'Resume must be 15,000 characters or fewer',
        'INVALID_INPUT',
        400
      );
    }

    if (jobDescription.length < 50) {
      return errorResponse(
        'Job description must be at least 50 characters',
        'INVALID_INPUT',
        400
      );
    }

    if (jobDescription.length > 10000) {
      return errorResponse(
        'Job description must be 10,000 characters or fewer',
        'INVALID_INPUT',
        400
      );
    }

    // 5. Check rate limit
    const rateLimitStatus = await checkRateLimit(cookieUid, ipHash);

    if (!rateLimitStatus.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMITED',
        429,
        {
          remaining: rateLimitStatus.remaining,
          limit: rateLimitStatus.limit,
          resetsAt: rateLimitStatus.resetsAt,
        }
      );
    }

    // 6. Call AI
    const userPrompt = buildUserPrompt(resume, jobDescription);
    let result;

    try {
      result = await callAI(SYSTEM_PROMPT, userPrompt);
    } catch (aiError) {
      const msg = aiError instanceof Error ? aiError.message : 'Unknown AI error';
      console.error('[API] AI call failed:', msg);
      return errorResponse(
        'Our AI service is temporarily unavailable. Please try again in a moment.',
        'AI_ERROR',
        502
      );
    }

    // 7. Increment rate limit (after successful AI call)
    try {
      await incrementRateLimit(cookieUid, ipHash);
    } catch (rlError) {
      // Log but don't fail the request — the user already got their result
      console.error('[API] Failed to increment rate limit:', rlError);
    }

    // 8. Return success response
    const rateLimit: RateLimitInfo = {
      remaining: Math.max(0, rateLimitStatus.remaining - 1),
      limit: rateLimitStatus.limit,
      resetsAt: rateLimitStatus.resetsAt,
    };

    return successResponse(result, rateLimit);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[API] Unhandled error:', msg);
    return errorResponse(
      'An unexpected error occurred. Please try again.',
      'SERVER_ERROR',
      500
    );
  }
}
