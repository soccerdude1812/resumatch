'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { diffWords, type Change } from 'diff';
import { GitCompareArrows, Plus, Minus, Percent } from 'lucide-react';

interface DiffViewerProps {
  original: string;
  tailored: string;
}

interface DiffStats {
  wordsAdded: number;
  wordsRemoved: number;
  totalOriginalWords: number;
  percentChanged: number;
}

function computeStats(changes: Change[]): DiffStats {
  let wordsAdded = 0;
  let wordsRemoved = 0;
  let totalOriginalWords = 0;

  for (const change of changes) {
    const wordCount = change.value.trim().split(/\s+/).filter(Boolean).length;

    if (change.added) {
      wordsAdded += wordCount;
    } else if (change.removed) {
      wordsRemoved += wordCount;
      totalOriginalWords += wordCount;
    } else {
      totalOriginalWords += wordCount;
    }
  }

  const totalChanges = wordsAdded + wordsRemoved;
  const percentChanged =
    totalOriginalWords > 0
      ? Math.round((totalChanges / (totalOriginalWords * 2)) * 100)
      : 0;

  return { wordsAdded, wordsRemoved, totalOriginalWords, percentChanged };
}

export default function DiffViewer({ original, tailored }: DiffViewerProps) {
  const { changes, stats } = useMemo(() => {
    const result = diffWords(original, tailored);
    return {
      changes: result,
      stats: computeStats(result),
    };
  }, [original, tailored]);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-1.5">
          <GitCompareArrows className="w-4 h-4 text-accent-primary" />
          <span className="text-sm font-medium text-text-primary">
            Diff View
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-green-400">
            <Plus className="w-3 h-3" />
            {stats.wordsAdded} word{stats.wordsAdded !== 1 ? 's' : ''} added
          </span>
          <span className="inline-flex items-center gap-1 text-red-400">
            <Minus className="w-3 h-3" />
            {stats.wordsRemoved} word{stats.wordsRemoved !== 1 ? 's' : ''} removed
          </span>
          <span className="inline-flex items-center gap-1 text-text-secondary">
            <Percent className="w-3 h-3" />
            {stats.percentChanged}% changed
          </span>
        </div>
      </motion.div>

      {/* Diff content */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
            {changes.map((change, idx) => {
              if (change.added) {
                return (
                  <span
                    key={idx}
                    className="bg-green-900/20 text-green-400 border-l-2 border-green-500 pl-1 rounded-r-sm"
                  >
                    {change.value}
                  </span>
                );
              }

              if (change.removed) {
                return (
                  <span
                    key={idx}
                    className="bg-red-900/20 text-red-400 line-through border-l-2 border-red-500 pl-1 rounded-r-sm decoration-red-400/50"
                  >
                    {change.value}
                  </span>
                );
              }

              // Unchanged text
              return (
                <span key={idx} className="text-text-primary">
                  {change.value}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-900/20 border-l-2 border-green-500" />
          <span>Added text</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-900/20 border-l-2 border-red-500" />
          <span>Removed text</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-bg-tertiary" />
          <span>Unchanged</span>
        </div>
      </div>
    </div>
  );
}
