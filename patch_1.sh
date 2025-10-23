#!/bin/bash

# --- Stage 1: Foundational Enhancements ---

echo "🚀 Stage 1: Creating foundational providers and utilities..."

# Create necessary directories
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/providers

# 1. Create types/index.ts
echo "📄 Creating src/types/index.ts..."
cat > ./src/types/index.ts << 'EOF'
// src/types/index.ts

/**
 * Represents the payload sent to the backend to start a new analysis.
 * It can be either a URL or a text content.
 */
export type IngestPayload = {
  url: string;
  content_hash?: string;
  perform_case_inference?: boolean;
} | {
  text: string;
  content_hash?: string;
  vector_de_transmision?: string;
  perform_case_inference?: boolean;
};

/**
 * Represents the full, detailed analysis result for a piece of content.
 * This structure is flexible to accommodate various analysis modules.
 * This is a simplified version based on `project-base`.
 */
export interface FullAnalysisResponse {
  id: string;
  content_hash: string;
  created_at: string;
  summary?: {
    title?: string;
    final_conclusion?: string;
  };
  case_study?: {
    case_id: string;
    is_new_case: boolean;
  };
  risk_analysis?: {
    final_risk_score: number;
    risk_level: string;
  };
  // Add other potential fields from the analysis here
  [key: string]: any;
}

/**
 * Represents the current status of an asynchronous job.
 * - pending: The job has been created on the client but not yet confirmed by the server.
 * - processing: The server has accepted the job and is working on it.
 * - completed: The job finished successfully, and results are available.
 * - failed: The job failed due to an error.
 */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';


/**
 * Represents the client-side object for tracking a single analysis job.
 */
export interface AnalysisJob {
  id: string; // Client-generated UUID
  jobId?: string; // Backend-generated job ID
  status: JobStatus;
  payload: IngestPayload & { content: string }; // Includes original content for display
  result: FullAnalysisResponse | null;
  error: string | null;
  startTime: string; // ISO string
  endTime?: string; // ISO string
}
EOF

# 2. Create utils/api.ts
echo "📄 Creating src/utils/api.ts..."
cat > ./src/utils/api.ts << 'EOF'
// src/utils/api.ts

import { getSession } from './supabase/auth';
import type { IngestPayload, FullAnalysisResponse } from '../types';

// IMPORTANT: Replace with your actual backend function URLs
const API_BASE_URL = 'https://your-supabase-url.supabase.co/functions/v1';
const INGEST_ENDPOINT = `${API_BASE_URL}/ingest-content`;
const STATUS_ENDPOINT = `${API_BASE_URL}/get-job-status`;

/**
 * A helper function to make authenticated API requests.
 * It retrieves the current session token and adds it to the headers.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns The JSON response.
 */
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown API error occurred.');
  }

  return response.json();
}

/**
 * Submits content to the backend for analysis.
 * @param payload The content to analyze (URL or text).
 * @returns An object containing the backend job_id or the cached result.
 */
export const startAnalysis = async (payload: IngestPayload): Promise<{ job_id: string } | FullAnalysisResponse> => {
  return authenticatedFetch(INGEST_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Fetches the status and result of an ongoing analysis job.
 * @param jobId The ID of the job to check.
 * @returns An object with the job status and the result if completed.
 */
export const getJobStatus = async (jobId: string): Promise<{ status: 'processing' | 'completed' | 'failed'; result?: FullAnalysisResponse; error?: string }> => {
  return authenticatedFetch(`${STATUS_ENDPOINT}?job_id=${jobId}`, {
    method: 'GET',
  });
};
EOF

# 3. Create providers/JobTrackerProvider.tsx
echo "📄 Creating src/providers/JobTrackerProvider.tsx..."
cat > ./src/providers/JobTrackerProvider.tsx << 'EOF'
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
EOF

# 4. Create providers/Providers.tsx
echo "📄 Creating src/providers/Providers.tsx..."
cat > ./src/providers/Providers.tsx << 'EOF'
// src/providers/Providers.tsx

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { ConfigProvider } from './ConfigProvider';
import { MessageProvider } from './MessageProvider';
import { SchemaProvider } from './SchemaProvider';
import { JobTrackerProvider } from './JobTrackerProvider';

/**
 * A single component to wrap the entire application with all necessary context providers.
 * This simplifies the main application entry point.
 */
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ConfigProvider>
      <MessageProvider>
        <SchemaProvider>
          <AuthProvider>
            <JobTrackerProvider>
              {children}
            </JobTrackerProvider>
          </AuthProvider>
        </SchemaProvider>
      </MessageProvider>
    </ConfigProvider>
  );
};
EOF

echo "✅ Stage 1 complete."
echo "------------------------------------------------"
echo "👉 NEXT STEP: You must now update your application's entry point (e.g., src/index.tsx or src/main.tsx) to use the new <Providers> component."
echo ""
echo "It should look something like this:"
echo ""
echo "import React from 'react';"
echo "import ReactDOM from 'react-dom/client';"
echo "import App from './App';"
echo "import { Providers } from './providers/Providers';"
echo "import './styles/globals.css';"
echo ""
echo "ReactDOM.createRoot(document.getElementById('root')!).render("
echo "  <React.StrictMode>"
echo "    <Providers>"
echo "      <App />"
echo "    </Providers>"
echo "  </React.StrictMode>"
echo ");"
echo ""
echo "This ensures that all components in your app have access to the contexts from all providers, including the new JobTrackerProvider."

