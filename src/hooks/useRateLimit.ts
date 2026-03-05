'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RateLimitInfo } from '@/types';

interface UseRateLimitReturn {
  remaining: number;
  limit: number;
  resetsAt: string | null;
  loading: boolean;
  updateFromResponse: (rateLimit: RateLimitInfo) => void;
}

export function useRateLimit(): UseRateLimitReturn {
  const [remaining, setRemaining] = useState(3);
  const [limit, setLimit] = useState(3);
  const [resetsAt, setResetsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRateLimit() {
      try {
        const response = await fetch('/api/rate-limit', {
          credentials: 'include',
        });

        if (!response.ok) {
          // Fail open — assume full allowance
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setRemaining(data.remaining ?? 3);
          setLimit(data.limit ?? 3);
          setResetsAt(data.resetsAt ?? null);
        }
      } catch {
        // Fail open — keep defaults
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRateLimit();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateFromResponse = useCallback((rateLimit: RateLimitInfo) => {
    setRemaining(rateLimit.remaining);
    setLimit(rateLimit.limit);
    setResetsAt(rateLimit.resetsAt);
  }, []);

  return {
    remaining,
    limit,
    resetsAt,
    loading,
    updateFromResponse,
  };
}
