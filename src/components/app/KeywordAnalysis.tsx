'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, PlusCircle, Info } from 'lucide-react';
import type { KeywordAnalysis as KeywordAnalysisType, KeywordItem } from '@/types';

interface KeywordAnalysisProps {
  keywords: KeywordAnalysisType;
}

type SectionKey = 'found' | 'missing' | 'added';

interface SectionConfig {
  key: SectionKey;
  title: string;
  icon: typeof CheckCircle2;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  iconColor: string;
  emptyMessage: string;
}

const sections: SectionConfig[] = [
  {
    key: 'found',
    title: 'Found',
    icon: CheckCircle2,
    chipBg: 'bg-green-900/30',
    chipBorder: 'border-green-500/30',
    chipText: 'text-green-400',
    iconColor: 'text-green-400',
    emptyMessage: 'No matching keywords found yet.',
  },
  {
    key: 'missing',
    title: 'Missing',
    icon: XCircle,
    chipBg: 'bg-red-900/30',
    chipBorder: 'border-red-500/30',
    chipText: 'text-red-400',
    iconColor: 'text-red-400',
    emptyMessage: 'No missing keywords \u2014 great match!',
  },
  {
    key: 'added',
    title: 'Added',
    icon: PlusCircle,
    chipBg: 'bg-indigo-900/30',
    chipBorder: 'border-indigo-500/30',
    chipText: 'text-indigo-400',
    iconColor: 'text-indigo-400',
    emptyMessage: 'No keywords were added during tailoring.',
  },
];

function getRelevanceOpacity(relevance: KeywordItem['relevance']): string {
  switch (relevance) {
    case 'critical':
      return 'opacity-100 font-semibold';
    case 'important':
      return 'opacity-80';
    case 'nice-to-have':
      return 'opacity-60';
  }
}

function getRelevanceDotColor(relevance: KeywordItem['relevance'], section: SectionKey): string {
  const colorMap: Record<SectionKey, Record<string, string>> = {
    found: {
      critical: 'bg-green-400',
      important: 'bg-green-400/60',
      'nice-to-have': 'bg-green-400/30',
    },
    missing: {
      critical: 'bg-red-400',
      important: 'bg-red-400/60',
      'nice-to-have': 'bg-red-400/30',
    },
    added: {
      critical: 'bg-indigo-400',
      important: 'bg-indigo-400/60',
      'nice-to-have': 'bg-indigo-400/30',
    },
  };
  return colorMap[section][relevance] || 'bg-white/30';
}

export default function KeywordAnalysis({ keywords }: KeywordAnalysisProps) {
  const [expandedChip, setExpandedChip] = useState<string | null>(null);

  const toggleChip = useCallback((chipId: string) => {
    setExpandedChip((prev) => (prev === chipId ? null : chipId));
  }, []);

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const items = keywords[section.key];
        const Icon = section.icon;

        return (
          <div key={section.key}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${section.iconColor}`} />
              <h3 className="text-sm font-semibold text-text-primary">
                {section.title}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${section.chipBg} ${section.chipText} ${section.chipBorder} border`}
              >
                {items.length}
              </span>
            </div>

            {/* Keywords or empty state */}
            {items.length === 0 ? (
              <p className="text-sm text-text-secondary italic pl-6">
                {section.emptyMessage}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {items.map((item, idx) => {
                  const chipId = `${section.key}-${idx}`;
                  const isExpanded = expandedChip === chipId;
                  const relevanceStyle = getRelevanceOpacity(item.relevance);
                  const dotColor = getRelevanceDotColor(item.relevance, section.key);

                  return (
                    <div key={chipId} className="relative">
                      <motion.button
                        onClick={() => toggleChip(chipId)}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5
                          rounded-full border text-sm cursor-pointer
                          transition-all duration-200
                          ${section.chipBg} ${section.chipBorder} ${section.chipText}
                          ${relevanceStyle}
                          hover:brightness-125
                          focus:outline-none focus:ring-2 focus:ring-accent-primary/50
                        `}
                        whileTap={{ scale: 0.95 }}
                        aria-expanded={isExpanded}
                        aria-label={`${item.keyword} - ${item.relevance} relevance. Click for context.`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                        <span>{item.keyword}</span>
                        <Info className="w-3 h-3 opacity-40" />
                      </motion.button>

                      {/* Context tooltip / expanded area */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`
                              absolute z-20 top-full mt-2 left-0
                              w-64 max-w-[80vw] p-3 rounded-lg
                              glass border text-xs text-text-secondary
                              shadow-lg
                            `}
                          >
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span
                                className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${section.chipBg} ${section.chipText}`}
                              >
                                {item.relevance}
                              </span>
                            </div>
                            <p className="leading-relaxed">{item.context}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
