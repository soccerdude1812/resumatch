'use client';

import { useState, useCallback } from 'react';
import type {
  AppState,
  ResultTab,
  TailorResponse,
  TailorErrorResponse,
} from '@/types';

interface UseTailorReturn {
  state: AppState;
  activeTab: ResultTab;
  setActiveTab: (tab: ResultTab) => void;
  submitTailor: (resume: string, jobDescription: string) => Promise<void>;
  resetToInput: (keepJD?: boolean) => void;
}

export function useTailor(): UseTailorReturn {
  const [state, setState] = useState<AppState>({ phase: 'input' });
  const [activeTab, setActiveTab] = useState<ResultTab>('score');

  const submitTailor = useCallback(
    async (resume: string, jobDescription: string) => {
      // Transition to loading
      setState({ phase: 'loading', startedAt: Date.now() });
      setActiveTab('score');

      // Set up abort controller with 55s client-side timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);

      try {
        const response = await fetch('/api/tailor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ resume, jobDescription }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data: TailorResponse = await response.json();
          setState({
            phase: 'results',
            result: data.data,
            originalResume: resume,
            rateLimit: data.rateLimit,
          });
        } else {
          const errorData: TailorErrorResponse = await response.json();
          const retryable =
            errorData.code === 'AI_ERROR' || errorData.code === 'SERVER_ERROR';

          setState({
            phase: 'error',
            message: errorData.error,
            code: errorData.code,
            retryable,
          });
        }
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof DOMException && err.name === 'AbortError') {
          setState({
            phase: 'error',
            message:
              'The request timed out. The AI is taking longer than expected. Please try again.',
            code: 'SERVER_ERROR',
            retryable: true,
          });
        } else {
          setState({
            phase: 'error',
            message:
              'Unable to connect to the server. Please check your internet connection and try again.',
            code: 'SERVER_ERROR',
            retryable: true,
          });
        }
      }
    },
    []
  );

  const resetToInput = useCallback((_keepJD?: boolean) => {
    setState({ phase: 'input' });
  }, []);

  return {
    state,
    activeTab,
    setActiveTab,
    submitTailor,
    resetToInput,
  };
}
