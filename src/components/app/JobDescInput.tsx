'use client';

import { Briefcase } from 'lucide-react';

const MAX_CHARS = 10000;
const MIN_CHARS = 50;

const PLACEHOLDER = `Senior Software Engineer — Acme Corp
Location: San Francisco, CA (Remote OK)

About the Role:
We're looking for a Senior Software Engineer to join our platform team...

Requirements:
- 5+ years of experience with TypeScript and Node.js
- Experience with cloud infrastructure (AWS/GCP)
- Strong understanding of distributed systems
...

Paste the full job posting here`;

interface JobDescInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function JobDescInput({
  value,
  onChange,
  error,
  disabled = false,
}: JobDescInputProps) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const hasError = !!error || isOverLimit;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <Briefcase className="w-4 h-4 text-accent-secondary" />
        Job Description
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={PLACEHOLDER}
          rows={10}
          className={`
            w-full rounded-xl px-4 py-3
            bg-[var(--bg-tertiary)] text-text-primary text-sm leading-relaxed
            placeholder:text-text-tertiary
            border transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-primary/40
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y min-h-[160px]
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
              Paste the full job posting including requirements and qualifications.
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
