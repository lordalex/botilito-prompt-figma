import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';
import type { JobStatusResponse } from '@/utils/humanVerification/types';

const POLLING_INTERVAL = 5000;

export function useSearchJobTracker<T>(jobId: string | null) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | 'idle'>('idle');
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!jobId || !session) {
      setStatus('idle');
      setResult(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const poll = async () => {
      try {
        const statusResult = await api.ingestion.getStatus(session, jobId) as JobStatusResponse<T>;

        if (!isMounted) return;

        if (statusResult.status === 'completed') {
          setStatus('completed');
          setResult(statusResult.result as T);
        } else if (statusResult.status === 'failed') {
          setStatus('failed');
          setError(statusResult.error || 'Job failed.');
        } else {
          setStatus('pending');
          setTimeout(poll, POLLING_INTERVAL);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('failed');
          setError(err.message || 'Error polling job status.');
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
    };
  }, [jobId, session]);

  return { status, result, error };
}
