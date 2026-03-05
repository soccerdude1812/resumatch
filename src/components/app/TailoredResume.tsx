'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, FileText, Pen, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import type { ChangeSummary } from '@/types';

interface TailoredResumeProps {
  resumeText: string;
  changes: ChangeSummary[];
}

const typeBadgeConfig: Record<
  ChangeSummary['type'],
  { bg: string; text: string; border: string; icon: typeof Pen }
> = {
  rewrite: {
    bg: 'bg-indigo-900/30',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    icon: Pen,
  },
  addition: {
    bg: 'bg-green-900/30',
    text: 'text-green-400',
    border: 'border-green-500/30',
    icon: Plus,
  },
  removal: {
    bg: 'bg-red-900/30',
    text: 'text-red-400',
    border: 'border-red-500/30',
    icon: Trash2,
  },
  reorder: {
    bg: 'bg-amber-900/30',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: ArrowUpDown,
  },
};

export default function TailoredResume({ resumeText, changes }: TailoredResumeProps) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(async () => {
    if (copied) return;

    try {
      // Prefer clipboard API (requires secure context)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(resumeText);
      } else {
        // Fallback: select all text in the pre element
        if (textRef.current) {
          const range = document.createRange();
          range.selectNodeContents(textRef.current);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
          }
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [resumeText, copied]);

  return (
    <div className="space-y-6">
      {/* Resume text card */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-glass">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-primary" />
            <span className="text-sm font-medium text-text-primary">
              Tailored Resume
            </span>
          </div>

          <motion.button
            onClick={handleCopy}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5
              rounded-lg text-xs font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-accent-primary/50
              ${
                copied
                  ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 border border-glass'
              }
            `}
            whileTap={{ scale: 0.95 }}
            aria-label={copied ? 'Copied to clipboard' : 'Copy resume text to clipboard'}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Resume text content */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          <pre
            ref={textRef}
            className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed break-words"
          >
            {resumeText}
          </pre>
        </div>
      </div>

      {/* Changes made section */}
      {changes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Pen className="w-4 h-4 text-accent-primary" />
            Changes Made
            <span className="text-xs text-text-secondary font-normal">
              ({changes.length} {changes.length === 1 ? 'change' : 'changes'})
            </span>
          </h3>

          <div className="space-y-2">
            {changes.map((change, idx) => {
              const config = typeBadgeConfig[change.type];
              const TypeIcon = config.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  className="glass rounded-lg p-3 flex items-start gap-3"
                >
                  {/* Section name */}
                  <div className="shrink-0 min-w-[100px]">
                    <span className="text-sm font-semibold text-text-primary">
                      {change.section}
                    </span>
                  </div>

                  {/* Type badge */}
                  <span
                    className={`
                      shrink-0 inline-flex items-center gap-1 px-2 py-0.5
                      rounded text-[11px] font-medium capitalize border
                      ${config.bg} ${config.text} ${config.border}
                    `}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {change.type}
                  </span>

                  {/* Description */}
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">
                    {change.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
