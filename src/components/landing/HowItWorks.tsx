"use client";

import { ClipboardPaste, FileSearch, Zap } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: ClipboardPaste,
    title: "Paste your resume",
    description:
      "Copy and paste your current resume text. No file upload needed, no account required.",
  },
  {
    step: 2,
    icon: FileSearch,
    title: "Paste the job description",
    description:
      "Drop in the job listing you want to apply for. Our AI will analyze every requirement.",
  },
  {
    step: 3,
    icon: Zap,
    title: "Get your tailored resume",
    description:
      "In seconds, receive an optimized resume with a match score, keyword analysis, and a downloadable PDF.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--accent-primary)] opacity-[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Three steps. <span className="text-gradient">Thirty seconds.</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-lg mx-auto">
            No signup, no file uploads, no complexity. Just paste and go.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step) => (
              <div
                key={step.step}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number + icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--accent-primary)] flex items-center justify-center">
                    <span className="text-xs font-bold text-[var(--accent-primary)]">
                      {step.step}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
