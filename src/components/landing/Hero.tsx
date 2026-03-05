"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--accent-primary)] opacity-[0.07] rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--accent-secondary)] opacity-[0.07] rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a855f7] opacity-[0.04] rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 animate-hero-fade-in"
          style={{ animationDelay: "0s" }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span className="text-xs font-medium text-text-secondary">
            Free AI-Powered Resume Optimizer
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-white animate-hero-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          Don&apos;t just scan your resume
          <br />
          <span className="text-gradient">&mdash; let AI rewrite it</span>
          <br />
          for the job.
        </h1>

        {/* Subheading */}
        <p
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-hero-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Paste your resume and a job description. Our AI analyzes keyword gaps,
          rewrites bullet points, and delivers an ATS-optimized resume in
          seconds.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-hero-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/app"
            className="btn-primary text-base px-8 py-4 rounded-xl shadow-lg shadow-[var(--accent-primary)]/20"
          >
            Tailor Your Resume Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-6 py-4"
          >
            See how it works
          </a>
        </div>

        {/* Social proof line */}
        <p
          className="mt-12 text-xs text-text-tertiary animate-hero-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          No signup required &middot; 3 free tailors per day &middot; Your data
          is never stored
        </p>
      </div>
    </section>
  );
}
