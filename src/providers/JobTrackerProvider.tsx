// src/providers/JobTrackerProvider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthProvider';
import * as api from '../utils/api';
import type { AnalysisJob, IngestPayload, JobStatus } from '../types';

interface JobTrackerContextType {
  jobs: Record<string, AnalysisJob>;
  activeJobId: string | null;
  startNewAnalysis: (data: { type: 'URL' | 'Text', content: string }) => Promise<string>;
  setActiveJobId: (jobId: string | null) => void;
  clearHistory: () => void;
}

const JobTrackerContext = createContext<JobTrackerContextType | undefined>(undefined);
const JOBS_STORAGE_KEY = 'figma-design-analysis-jobs';
const POLLING_INTERVAL_MS = 5000; // 5 seconds

export const JobTrackerProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Record<string, AnalysisJob>>({});
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  // Load jobs from localStorage on initial mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem(JOBS_STORAGE_KEY);
      if (savedJobs) {
        setJobs(JSON.parse(savedJobs));
      }
    } catch (error) {
      console.error("Failed to load jobs from localStorage:", error);
    }
  }, []);

  // Persist jobs to localStorage whenever they change
  useEffect(() => {
    try {
      if (Object.keys(jobs).length > 0) {
        localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
      }
    } catch (error) {
      console.error("Failed to save jobs to localStorage:", error);
    }
  }, [jobs]);

  const updateJob = useCallback((jobId: string, updates: Partial<AnalysisJob>) => {
    setJobs(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], ...updates },
    }));
  }, []);

  // Polling logic for processing jobs
  useEffect(() => {
    Object.values(jobs).forEach(job => {
      if (job.status === 'processing' && job.jobId && !pollingIntervals.current[job.id]) {
        const intervalId = setInterval(async () => {
          try {
            const statusResponse = await api.getJobStatus(job.jobId!);
            if (statusResponse.status === 'completed') {
              updateJob(job.id, { status: 'completed', result: statusResponse.result!, endTime: new Date().toISOString() });
              clearInterval(pollingIntervals.current[job.id]);
              delete pollingIntervals.current[job.id];
            } else if (statusResponse.status === 'failed') {
              updateJob(job.id, { status: 'failed', error: statusResponse.error || 'Unknown error', endTime: new Date().toISOString() });
              clearInterval(pollingIntervals.current[job.id]);
              delete pollingIntervals.current[job.id];
            }
          } catch (error: any) {
            console.error(`Error polling for job ${job.jobId}:`, error);
            updateJob(job.id, { status: 'failed', error: error.message, endTime: new Date().toISOString() });
            clearInterval(pollingIntervals.current[job.id]);
            delete pollingIntervals.current[job.id];
          }
        }, POLLING_INTERVAL_MS);
        pollingIntervals.current[job.id] = intervalId;
      }
    });

    // Cleanup intervals on component unmount
    return () => {
      Object.values(pollingIntervals.current).forEach(clearInterval);
    };
  }, [jobs, updateJob]);


  const startNewAnalysis = useCallback(async (data: { type: 'URL' | 'Text', content: string }): Promise<string> => {
    if (!isAuthenticated) throw new Error("Authentication required to start analysis.");
    
    const clientJobId = crypto.randomUUID();
    const payload: IngestPayload & { content: string } = data.type === 'URL'
      ? { url: data.content, content: data.content }
      : { text: data.content, content: data.content };

    const newJob: AnalysisJob = {
      id: clientJobId,
      status: 'pending',
      payload,
      result: null,
      error: null,
      startTime: new Date().toISOString(),
    };

    setJobs(prev => ({ ...prev, [clientJobId]: newJob }));
    setActiveJobId(clientJobId);

    try {
      const response = await api.startAnalysis(payload);
      if ('job_id' in response) {
        // It's an async job
        updateJob(clientJobId, { status: 'processing', jobId: response.job_id });
      } else {
        // It was a cached result
        updateJob(clientJobId, { status: 'completed', result: response, endTime: new Date().toISOString() });
      }
      return clientJobId;
    } catch (error: any) {
      updateJob(clientJobId, { status: 'failed', error: error.message, endTime: new Date().toISOString() });
      throw error; // Re-throw to be caught by the UI
    }
  }, [isAuthenticated, updateJob]);

  const clearHistory = useCallback(() => {
    // Stop all polling before clearing
    Object.values(pollingIntervals.current).forEach(clearInterval);
    pollingIntervals.current = {};
    setJobs({});
    localStorage.removeItem(JOBS_STORAGE_KEY);
  }, []);

  const value = { jobs, activeJobId, startNewAnalysis, setActiveJobId, clearHistory };

  return (
    <JobTrackerContext.Provider value={value}>
      {children}
    </JobTrackerContext.Provider>
  );
};

export const useJobTracker = (): JobTrackerContextType => {
  const context = useContext(JobTrackerContext);
  if (context === undefined) {
    throw new Error('useJobTracker must be used within a JobTrackerProvider');
  }
  return context;
};
