'use client';

import { motion } from 'framer-motion';
import { FileText, Briefcase, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Paste your resume',
    description: 'Copy your existing resume as plain text',
    color: 'text-accent-primary',
    bgColor: 'bg-accent-primary/10',
  },
  {
    icon: Briefcase,
    title: 'Paste the job description',
    description: 'Include requirements and qualifications',
    color: 'text-accent-secondary',
    bgColor: 'bg-accent-secondary/10',
  },
  {
    icon: Sparkles,
    title: 'Get your tailored resume',
    description: 'AI-optimized for ATS and the role',
    color: 'text-[var(--success)]',
    bgColor: 'bg-[var(--success)]/10',
  },
];

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          How it works
        </h3>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          Three simple steps to a perfectly tailored resume
        </p>
      </motion.div>

      <div className="space-y-6 w-full max-w-sm">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className="flex items-start gap-4"
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${step.color}`} />
              </div>
              <div className="pt-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                    Step {index + 1}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-text-primary">
                  {step.title}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative dotted connector line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.6 }}
        className="absolute left-[39px] top-[156px] w-px h-[120px] border-l border-dashed border-text-tertiary hidden"
        aria-hidden="true"
      />
    </div>
  );
}
