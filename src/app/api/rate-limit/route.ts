import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIP, hashIP } from '@/lib/utils';
import type { RateLimitStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Read the rm_uid cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...rest] = c.trim().split('=');
        return [key, rest.join('=')];
      })
    );
    const cookieUid = cookies['rm_uid'] || '';

    if (!cookieUid) {
      // No cookie yet — middleware hasn't set it. Return full allowance.
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);

      const status: RateLimitStatus = {
        used: 0,
        remaining: 3,
        limit: 3,
        resetsAt: tomorrow.toISOString(),
      };

      return NextResponse.json(status);
    }

    // Hash the client IP for privacy
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check current rate limit status
    const result = await checkRateLimit(cookieUid, ipHash);

    const status: RateLimitStatus = {
      used: result.limit - result.remaining,
      remaining: result.remaining,
      limit: result.limit,
      resetsAt: result.resetsAt,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Rate limit API error:', error);

    // Fail open — return a permissive response on errors
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const status: RateLimitStatus = {
      used: 0,
      remaining: 3,
      limit: 3,
      resetsAt: tomorrow.toISOString(),
    };

    return NextResponse.json(status, { status: 200 });
  }
}
