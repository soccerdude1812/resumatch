import { createHash } from 'crypto';

/**
 * Reads a process.env variable and trims whitespace/newlines.
 * Returns undefined if the variable is not set or is empty after trimming.
 */
export function trimEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Sanitizes user input text before passing to AI.
 * - Strips null bytes
 * - Trims leading/trailing whitespace
 * - Strips prompt injection patterns (system/assistant role markers, delimiter overrides)
 */
export function sanitizeInput(text: string): string {
  if (typeof text !== 'string') return '';

  let sanitized = text;

  // Strip null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Strip common prompt injection patterns
  // Remove attempts to override system/assistant roles
  sanitized = sanitized.replace(/\b(system|assistant)\s*:/gi, '');
  sanitized = sanitized.replace(/<<\s*(SYS|SYSTEM|INST)\s*>>/gi, '');
  sanitized = sanitized.replace(/\[INST\]/gi, '');
  sanitized = sanitized.replace(/\[\/INST\]/gi, '');
  sanitized = sanitized.replace(/<\|im_start\|>/gi, '');
  sanitized = sanitized.replace(/<\|im_end\|>/gi, '');
  sanitized = sanitized.replace(/<\|endoftext\|>/gi, '');

  // Trim
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Extracts the client IP address from the request.
 * Checks x-forwarded-for header first (common behind proxies/Vercel),
 * then falls back to x-real-ip, then defaults to 'unknown'.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; the first is the client
    const firstIP = forwarded.split(',')[0].trim();
    if (firstIP.length > 0) return firstIP;
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  return 'unknown';
}

/**
 * Hashes an IP address using SHA-256 for privacy-safe rate limiting.
 * Returns the hash prefixed with 'ip_'.
 */
export function hashIP(ip: string): string {
  const hash = createHash('sha256').update(ip).digest('hex');
  return `ip_${hash}`;
}
