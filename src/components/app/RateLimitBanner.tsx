'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';

interface RateLimitBannerProps {
  remaining: number;
  limit: number;
  resetsAt: string | null;
}

function formatResetTime(resetsAt: string | null): string {
  if (!resetsAt) return 'midnight UTC';
  try {
    const resetDate = new Date(resetsAt);
    return resetDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return 'midnight UTC';
  }
}

export default function RateLimitBanner({
  remaining,
  limit,
  resetsAt,
}: RateLimitBannerProps) {
  const exhausted = remaining <= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          rounded-xl px-4 py-2.5 flex items-center gap-3
          text-xs font-medium border
          ${
            exhausted
              ? 'bg-[var(--warning)]/5 border-[var(--warning)]/20 text-[var(--warning)]'
              : 'bg-accent-primary/5 border-accent-primary/15 text-accent-primary'
          }
        `}
      >
        {exhausted ? (
          <>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              You&apos;ve used all {limit} free tailors today. Pro plan coming
              soon! Resets at {formatResetTime(resetsAt)}.
            </span>
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {remaining} of {limit} free tailor{limit !== 1 ? 's' : ''}{' '}
              remaining today
            </span>
            {/* Usage dots */}
            <div className="flex gap-1 ml-auto">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i < limit - remaining
                      ? 'bg-accent-primary/60'
                      : 'bg-accent-primary'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
