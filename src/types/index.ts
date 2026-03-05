/** POST /api/tailor — request body */
export interface TailorRequest {
  resume: string;         // Raw resume text (50-15,000 chars)
  jobDescription: string; // Raw job description text (50-10,000 chars)
}

/** POST /api/tailor — success response */
export interface TailorResponse {
  success: true;
  data: TailorResult;
  rateLimit: RateLimitInfo;
}

/** POST /api/tailor — error response */
export interface TailorErrorResponse {
  success: false;
  error: string;
  code: 'RATE_LIMITED' | 'INVALID_INPUT' | 'AI_ERROR' | 'SERVER_ERROR';
  rateLimit?: RateLimitInfo;
}

/** Core result object returned by AI */
export interface TailorResult {
  matchScore: number;           // 0-100 integer
  summary: string;              // 2-3 sentence executive summary
  keywords: KeywordAnalysis;
  tailoredResume: string;       // Full rewritten resume text
  changes: ChangeSummary[];     // List of changes made
}

export interface KeywordAnalysis {
  found: KeywordItem[];
  missing: KeywordItem[];
  added: KeywordItem[];
}

export interface KeywordItem {
  keyword: string;
  relevance: 'critical' | 'important' | 'nice-to-have';
  context: string;
}

export interface ChangeSummary {
  section: string;
  type: 'rewrite' | 'addition' | 'removal' | 'reorder';
  description: string;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetsAt: string;
}

export interface RateLimitStatus extends RateLimitInfo {
  used: number;
}

export type AppState =
  | { phase: 'input' }
  | { phase: 'loading'; startedAt: number }
  | { phase: 'results'; result: TailorResult; originalResume: string; rateLimit: RateLimitInfo }
  | { phase: 'error'; message: string; code: string; retryable: boolean };

export type ResultTab = 'score' | 'keywords' | 'tailored' | 'diff';
