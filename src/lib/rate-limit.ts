import 'server-only';
import { supabase } from './supabase';

const FREE_LIMIT = 3;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetsAt: string;
}

/**
 * Checks the rate limit for a given cookie UID and IP hash.
 * Uses dual-layer identification: queries both identifiers and uses the
 * HIGHER count as the effective usage to prevent circumvention.
 */
export async function checkRateLimit(
  cookieUid: string,
  ipHash: string
): Promise<RateLimitResult> {
  const today = new Date().toISOString().split('T')[0];

  // Calculate when the limit resets (midnight UTC of the next day)
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const resetsAt = tomorrow.toISOString();

  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .select('identifier_type, count')
      .in('identifier', [cookieUid, ipHash])
      .eq('date', today);

    if (error) {
      console.error('Rate limit check failed:', error.message);
      // Fail open: allow the request if we can't check
      return { allowed: true, remaining: FREE_LIMIT, limit: FREE_LIMIT, resetsAt };
    }

    const cookieCount =
      data?.find((r) => r.identifier_type === 'cookie')?.count ?? 0;
    const ipCount =
      data?.find((r) => r.identifier_type === 'ip')?.count ?? 0;
    const effectiveCount = Math.max(cookieCount, ipCount);

    const remaining = Math.max(0, FREE_LIMIT - effectiveCount);
    const allowed = effectiveCount < FREE_LIMIT;

    return { allowed, remaining, limit: FREE_LIMIT, resetsAt };
  } catch (err) {
    console.error('Rate limit check exception:', err);
    // Fail open on unexpected errors
    return { allowed: true, remaining: FREE_LIMIT, limit: FREE_LIMIT, resetsAt };
  }
}

/**
 * Increments the rate limit counters for both cookie UID and IP hash.
 * Uses select-then-upsert since the RPC function may not exist.
 */
export async function incrementRateLimit(
  cookieUid: string,
  ipHash: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  async function incrementOne(identifier: string, identifierType: string) {
    // Try to select existing row
    const { data } = await supabase
      .from('rate_limits')
      .select('id, count')
      .eq('identifier', identifier)
      .eq('identifier_type', identifierType)
      .eq('date', today)
      .single();

    if (data) {
      // Row exists — increment count
      const { error } = await supabase
        .from('rate_limits')
        .update({ count: data.count + 1, updated_at: new Date().toISOString() })
        .eq('id', data.id);
      if (error) console.error('Rate limit update failed:', error.message);
    } else {
      // No row — insert new
      const { error } = await supabase
        .from('rate_limits')
        .insert({
          identifier,
          identifier_type: identifierType,
          date: today,
          count: 1,
        });
      if (error) console.error('Rate limit insert failed:', error.message);
    }
  }

  try {
    await Promise.all([
      incrementOne(cookieUid, 'cookie'),
      incrementOne(ipHash, 'ip'),
    ]);
  } catch (err) {
    console.error('Rate limit increment exception:', err);
  }
}
