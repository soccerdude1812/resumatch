'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  loadingStartedAt?: number;
}

const LOADING_MESSAGES = [
  { threshold: 0, text: 'Analyzing your resume...' },
  { threshold: 3000, text: 'Matching against job requirements...' },
  { threshold: 10000, text: 'Tailoring your resume...' },
  { threshold: 25000, text: 'Almost done...' },
];

function getLoadingMessage(elapsed: number): string {
  let message = LOADING_MESSAGES[0].text;
  for (const entry of LOADING_MESSAGES) {
    if (elapsed >= entry.threshold) {
      message = entry.text;
    }
  }
  return message;
}

export default function SubmitButton({
  loading,
  disabled,
  onClick,
  loadingStartedAt,
}: SubmitButtonProps) {
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].text);

  useEffect(() => {
    if (!loading || !loadingStartedAt) {
      setLoadingMessage(LOADING_MESSAGES[0].text);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - loadingStartedAt;
      setLoadingMessage(getLoadingMessage(elapsed));
    }, 500);

    return () => clearInterval(interval);
  }, [loading, loadingStartedAt]);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative w-full py-3.5 px-6 rounded-xl
        font-semibold text-white text-sm
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
        disabled:cursor-not-allowed
        ${
          loading
            ? 'bg-accent-primary/80'
            : disabled
            ? 'bg-[var(--bg-tertiary)] text-text-tertiary'
            : 'bg-gradient-accent hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)]'
        }
      `}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      whileHover={
        !disabled && !loading ? { y: -1 } : undefined
      }
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <AnimatePresence mode="wait">
              <motion.span
                key={loadingMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {loadingMessage}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Tailor My Resume
          </motion.span>
        )}
      </AnimatePresence>

      {/* Shimmer effect when active */}
      {!disabled && !loading && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}
    </motion.button>
  );
}
