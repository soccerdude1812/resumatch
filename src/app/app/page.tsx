'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import GlassCard from '@/components/shared/GlassCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ResumeInput from '@/components/app/ResumeInput';
import JobDescInput from '@/components/app/JobDescInput';
import SubmitButton from '@/components/app/SubmitButton';
import ResultsTabs from '@/components/app/ResultsTabs';
import EmptyState from '@/components/app/EmptyState';
import RateLimitBanner from '@/components/app/RateLimitBanner';
import ScoreGauge from '@/components/app/ScoreGauge';
import KeywordAnalysis from '@/components/app/KeywordAnalysis';
import TailoredResume from '@/components/app/TailoredResume';
import DiffViewer from '@/components/app/DiffViewer';
import ExportButton from '@/components/app/ExportButton';
import { useTailor } from '@/hooks/useTailor';
import { useRateLimit } from '@/hooks/useRateLimit';

const MIN_RESUME = 50;
const MAX_RESUME = 15000;
const MIN_JD = 50;
const MAX_JD = 10000;

export default function AppPage() {
  const { state, activeTab, setActiveTab, submitTailor, resetToInput } =
    useTailor();
  const rateLimit = useRateLimit();

  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeError, setResumeError] = useState<string | undefined>();
  const [jdError, setJdError] = useState<string | undefined>();

  // Update rate limit from tailor response
  const prevRateLimit =
    state.phase === 'results' ? state.rateLimit : null;
  if (prevRateLimit && prevRateLimit.remaining !== rateLimit.remaining) {
    rateLimit.updateFromResponse(prevRateLimit);
  }

  const validate = useCallback((): boolean => {
    let valid = true;

    if (resume.length < MIN_RESUME) {
      setResumeError(
        `Resume must be at least ${MIN_RESUME} characters (currently ${resume.length})`
      );
      valid = false;
    } else if (resume.length > MAX_RESUME) {
      setResumeError(
        `Resume must be ${MAX_RESUME.toLocaleString()} characters or fewer`
      );
      valid = false;
    } else {
      setResumeError(undefined);
    }

    if (jobDescription.length < MIN_JD) {
      setJdError(
        `Job description must be at least ${MIN_JD} characters (currently ${jobDescription.length})`
      );
      valid = false;
    } else if (jobDescription.length > MAX_JD) {
      setJdError(
        `Job description must be ${MAX_JD.toLocaleString()} characters or fewer`
      );
      valid = false;
    } else {
      setJdError(undefined);
    }

    return valid;
  }, [resume, jobDescription]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    if (rateLimit.remaining <= 0) return;
    await submitTailor(resume, jobDescription);
  }, [validate, rateLimit.remaining, submitTailor, resume, jobDescription]);

  const handleReset = useCallback(() => {
    resetToInput();
  }, [resetToInput]);

  const isLoading = state.phase === 'loading';
  const isResults = state.phase === 'results';
  const isError = state.phase === 'error';
  const isInput = state.phase === 'input';

  const inputsDisabled = isLoading;
  const submitDisabled =
    isLoading ||
    resume.length < MIN_RESUME ||
    resume.length > MAX_RESUME ||
    jobDescription.length < MIN_JD ||
    jobDescription.length > MAX_JD ||
    rateLimit.remaining <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Rate Limit Banner */}
          {!rateLimit.loading && (
            <RateLimitBanner
              remaining={rateLimit.remaining}
              limit={rateLimit.limit}
              resetsAt={rateLimit.resetsAt}
            />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Column — Inputs or Collapsed Summary */}
            <div className="space-y-4">
              {(isInput || isLoading || isError) && (
                <>
                  <GlassCard hover={false} padding="p-5">
                    <ResumeInput
                      value={resume}
                      onChange={(val) => {
                        setResume(val);
                        if (resumeError) setResumeError(undefined);
                      }}
                      error={resumeError}
                      disabled={inputsDisabled}
                    />
                  </GlassCard>

                  <GlassCard hover={false} padding="p-5">
                    <JobDescInput
                      value={jobDescription}
                      onChange={(val) => {
                        setJobDescription(val);
                        if (jdError) setJdError(undefined);
                      }}
                      error={jdError}
                      disabled={inputsDisabled}
                    />
                  </GlassCard>

                  <SubmitButton
                    loading={isLoading}
                    disabled={submitDisabled}
                    onClick={handleSubmit}
                    loadingStartedAt={
                      state.phase === 'loading' ? state.startedAt : undefined
                    }
                  />

                  {/* Error State */}
                  {isError && (
                    <GlassCard hover={false} padding="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-danger" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary mb-1">
                            Something went wrong
                          </p>
                          <p className="text-xs text-text-secondary">
                            {state.message}
                          </p>
                          {state.retryable && (
                            <button
                              onClick={handleSubmit}
                              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent-primary hover:text-accent-secondary transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Try again
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  )}
                </>
              )}

              {/* Collapsed input panel when showing results */}
              {isResults && (
                <>
                  <GlassCard hover={false} padding="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent-primary" />
                          Analysis Complete
                        </h3>
                        <button
                          onClick={handleReset}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-primary hover:text-accent-secondary transition-colors"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Tailor Another
                        </button>
                      </div>

                      {/* Summary of inputs */}
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
                          <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-semibold mb-1">
                            Resume
                          </p>
                          <p className="text-xs text-text-secondary line-clamp-2">
                            {resume.slice(0, 150)}
                            {resume.length > 150 ? '...' : ''}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
                          <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-semibold mb-1">
                            Job Description
                          </p>
                          <p className="text-xs text-text-secondary line-clamp-2">
                            {jobDescription.slice(0, 150)}
                            {jobDescription.length > 150 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Export Button */}
                  <div className="flex justify-center">
                    <ExportButton
                      resumeText={state.result.tailoredResume}
                      className="w-full justify-center rounded-xl py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] text-text-primary hover:bg-[var(--bg-tertiary)]/80"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right Column — Results */}
            <div className="min-h-[400px]">
              {/* Empty state */}
              {isInput && (
                <GlassCard hover={false} className="h-full min-h-[400px]">
                  <EmptyState />
                </GlassCard>
              )}

              {/* Loading state */}
              {isLoading && (
                <GlassCard
                  hover={false}
                  className="h-full min-h-[400px] flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-4 py-16">
                    <LoadingSpinner size="lg" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-primary">
                        Analyzing your resume
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        This usually takes 15-30 seconds
                      </p>
                    </div>
                    {/* Progress dots */}
                    <div className="flex gap-1.5 mt-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-accent-primary"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Error state on results side */}
              {isError && (
                <GlassCard hover={false} className="h-full min-h-[400px]">
                  <EmptyState />
                </GlassCard>
              )}

              {/* Results */}
              {isResults && (
                <div className="space-y-4">
                  <ResultsTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />

                  <GlassCard hover={false} padding="p-5">
                    {activeTab === 'score' && (
                      <ScoreGauge
                        score={state.result.matchScore}
                        summary={state.result.summary}
                      />
                    )}

                    {activeTab === 'keywords' && (
                      <KeywordAnalysis
                        keywords={state.result.keywords}
                      />
                    )}

                    {activeTab === 'tailored' && (
                      <TailoredResume
                        resumeText={state.result.tailoredResume}
                        changes={state.result.changes}
                      />
                    )}

                    {activeTab === 'diff' && (
                      <DiffViewer
                        original={state.originalResume}
                        tailored={state.result.tailoredResume}
                      />
                    )}
                  </GlassCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
