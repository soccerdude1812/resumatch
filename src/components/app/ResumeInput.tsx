'use client';

import { FileText } from 'lucide-react';

const MAX_CHARS = 15000;
const MIN_CHARS = 50;

const PLACEHOLDER = `John Doe
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

EXPERIENCE
Senior Software Engineer — Acme Corp
Jan 2022 - Present
- Led development of microservices architecture serving 2M+ requests/day
- Reduced API latency by 40% through caching and query optimization
...

Paste your full resume here`;

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function ResumeInput({
  value,
  onChange,
  error,
  disabled = false,
}: ResumeInputProps) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const hasError = !!error || isOverLimit;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <FileText className="w-4 h-4 text-accent-primary" />
        Your Resume
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={PLACEHOLDER}
          rows={12}
          className={`
            w-full rounded-xl px-4 py-3
            bg-[var(--bg-tertiary)] text-text-primary text-sm leading-relaxed
            placeholder:text-text-tertiary
            border transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-primary/40
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y min-h-[200px]
            ${
              hasError
                ? 'border-danger focus:ring-danger/40'
                : 'border-[var(--glass-border)] focus:border-accent-primary'
            }
          `}
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {error ? (
            <p className="text-xs text-danger">{error}</p>
          ) : (
            <p className="text-xs text-text-tertiary">
              Paste your resume as plain text. Tip: Copy from your Word doc or PDF.
            </p>
          )}
        </div>
        <p
          className={`text-xs font-mono flex-shrink-0 ${
            isOverLimit
              ? 'text-danger'
              : charCount >= MIN_CHARS
              ? 'text-text-tertiary'
              : 'text-text-tertiary/60'
          }`}
        >
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
