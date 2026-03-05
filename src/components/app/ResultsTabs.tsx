'use client';

import { motion } from 'framer-motion';
import { BarChart3, Key, FileCheck, GitCompare } from 'lucide-react';
import type { ResultTab } from '@/types';

interface ResultsTabsProps {
  activeTab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  disabled?: boolean;
}

const TABS: { id: ResultTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'score', label: 'Score', icon: BarChart3 },
  { id: 'keywords', label: 'Keywords', icon: Key },
  { id: 'tailored', label: 'Tailored', icon: FileCheck },
  { id: 'diff', label: 'Diff', icon: GitCompare },
];

export default function ResultsTabs({
  activeTab,
  onTabChange,
  disabled = false,
}: ResultsTabsProps) {
  return (
    <div className="relative flex gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => !disabled && onTabChange(tab.id)}
            disabled={disabled}
            className={`
              relative flex-1 flex items-center justify-center gap-1.5
              py-2 px-3 rounded-lg text-xs font-medium
              transition-colors duration-200
              disabled:cursor-not-allowed
              ${
                isActive
                  ? 'text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg bg-gradient-accent"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
