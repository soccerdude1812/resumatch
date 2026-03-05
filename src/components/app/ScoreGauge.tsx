'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  summary: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Moderate Match';
  if (score >= 25) return 'Weak Match';
  return 'Poor Match';
}

export default function ScoreGauge({ score, summary }: ScoreGaugeProps) {
  const [mounted, setMounted] = useState(false);

  // Clamp score to 0-100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG circle parameters
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 8;

  // Spring animation for the score number
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  // Spring animation for the stroke dash offset
  const strokeSpring = useSpring(circumference, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  const displayScore = useTransform(springValue, (val) => Math.round(val));
  const strokeDashoffset = useTransform(strokeSpring, (val) => val);

  const color = getScoreColor(clampedScore);
  const label = getScoreLabel(clampedScore);

  useEffect(() => {
    setMounted(true);
    const targetOffset = circumference - (clampedScore / 100) * circumference;
    // Small delay so the animation is visible after mount
    const timer = setTimeout(() => {
      springValue.set(clampedScore);
      strokeSpring.set(targetOffset);
    }, 200);
    return () => clearTimeout(timer);
  }, [clampedScore, circumference, springValue, strokeSpring]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium uppercase tracking-widest text-text-secondary">
        ATS Match Score
      </p>

      <div
        className="relative"
        role="meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ATS Match Score"
      >
        <svg
          viewBox="0 0 120 120"
          className="w-40 h-40 sm:w-48 sm:h-48 -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          {mounted ? (
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ strokeDashoffset }}
              className="drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
            />
          ) : (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
            />
          )}
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <motion.span
            className="text-4xl sm:text-5xl font-bold tabular-nums"
            style={{ color }}
          >
            {mounted ? (
              <DisplayNumber value={displayScore} />
            ) : (
              '0'
            )}
          </motion.span>
          <span
            className="text-xs font-medium mt-1 px-2 py-0.5 rounded-full"
            style={{
              color,
              backgroundColor: `${color}15`,
            }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-text-secondary text-center max-w-md leading-relaxed">
        {summary}
      </p>
    </div>
  );
}

/** Helper component to render the animated number from a MotionValue */
function DisplayNumber({ value }: { value: ReturnType<typeof useTransform<number, number>> }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = value.on('change', (latest) => {
      setDisplay(latest);
    });
    return unsubscribe;
  }, [value]);

  return <>{display}</>;
}
