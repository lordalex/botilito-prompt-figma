import { supabase } from '../utils/supabase/client';
import { WEB_SNAPSHOT_URL, ANALYSIS_FUNCTION_URL } from './apiEndpoints';

// Helper to get Supabase token
async function getSupabaseToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }
  return session.access_token;
}

// --- Web Snapshot Service ---

interface SnapshotRequest {
  url: string;
}

interface SnapshotJobResponse {
  job_id?: string;
  job?: {
    id: string;
  };
}

interface SnapshotResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  current_step?: string;
  result?: {
    cleaned_text: string;
  };
  error?: {
    message: string;
  };
}

async function submitSnapshot(url: string): Promise<string> {
  const token = await getSupabaseToken();
  const response = await fetch(`${WEB_SNAPSHOT_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ url } as SnapshotRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown snapshot submission error' }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  const data: SnapshotJobResponse = await response.json();
  const jobId = data.job_id || data.job?.id;
  if (!jobId) {
    console.error("Failed to extract job ID from snapshot response", data);
    throw new Error("Could not find job ID in snapshot submission response.");
  }
  return jobId;
}

async function pollSnapshot(jobId: string, onProgress: (status: string) => void): Promise<string> {
  const maxRetries = 30; // 30 * 2s = 60s
  const pollInterval = 2000; // 2 seconds
  const token = await getSupabaseToken();

  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(`${WEB_SNAPSHOT_URL}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      continue;
    }

    const result: SnapshotResult = await response.json();
    onProgress(result.current_step || result.status);

    if (result.status === 'completed' && result.result?.cleaned_text) {
      return result.result.cleaned_text;
    }

    if (result.status === 'failed') {
      throw new Error(result.error?.message || 'Snapshot job failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Snapshot job timed out.');
}

// --- Analysis Service ---

interface AnalysisRequest {
  text: string;
  url?: string;
}

interface AnalysisJobResponse {
  job_id?: string;
  cached?: boolean;
  data?: any;
}

export interface AnalysisResult {
  id: string;
  job_id?: string; // Add optional job_id for consistency
  user_id: string;
  status: string;
  current_step?: string;
  progress?: {
    step: string;
    percent: number;
  };
  result?: any;
  error?: {
    message: string;
  };
}

export async function submitAnalysisJob(text: string, url?: string): Promise<string | AnalysisResult> {
  const token = await getSupabaseToken();
  const response = await fetch(`${ANALYSIS_FUNCTION_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ text, url } as AnalysisRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown analysis submission error' }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  const data: AnalysisJobResponse = await response.json();

  if (data.cached && data.data) {
    return {
      id: data.data.id,
      user_id: data.data.user_id,
      status: 'completed',
      result: data.data,
    };
  }

  const jobId = data.job_id;
  if (!jobId) {
    throw new Error("Could not find job ID in analysis submission response.");
  }
  return jobId;
}

export async function checkAnalysisStatusOnce(jobId: string): Promise<AnalysisResult> {
  const token = await getSupabaseToken();
  const response = await fetch(`${ANALYSIS_FUNCTION_URL}/status/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Analysis status check failed: ${response.status}`);
  }

  return await response.json();
}

// Legacy polling for backward compatibility if needed, using checkAnalysisStatusOnce
async function pollAnalysis(jobId: string, onProgress: (status: string, percent?: number) => void): Promise<AnalysisResult> {
  const maxRetries = 60;
  const pollInterval = 3000;

  for (let i = 0; i < maxRetries; i++) {
    const result = await checkAnalysisStatusOnce(jobId);
    onProgress(result.current_step || result.status, result.progress?.percent);

    if (result.status === 'completed' && result.result) {
      return result;
    }

    if (result.status === 'failed') {
      throw new Error(result.error?.message || 'Analysis job failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Analysis job timed out.');
}


// --- Main Pipeline Orchestrator ---

function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch (_) {
    return false;
  }
}

export async function analysisPipeline(
  textOrUrl: string,
  onProgress: (progress: { step: string; status: string; percent?: number }) => void,
  onJobCreated?: (jobId: string) => void
): Promise<{ result: any, user_id: string }> {
  let cleanedText = textOrUrl;
  let submissionUrl: string | undefined = undefined;

  if (isUrl(textOrUrl)) {
    submissionUrl = textOrUrl;
    onProgress({ step: 'snapshot', status: 'Starting URL snapshot...' });
    const snapshotJobId = await submitSnapshot(textOrUrl);
    cleanedText = await pollSnapshot(snapshotJobId, (status) => {
      onProgress({ step: 'snapshot', status });
    });
  }

  onProgress({ step: 'analysis', status: 'Starting analysis...' });
  const submissionResponse = await submitAnalysisJob(cleanedText, submissionUrl);

  let analysisResult: AnalysisResult;
  if (typeof submissionResponse === 'string') {
    // We got a job ID
    if (onJobCreated) onJobCreated(submissionResponse);

    // We got a job ID, so we need to poll
    analysisResult = await pollAnalysis(submissionResponse, (status, percent) => {
      onProgress({ step: 'analysis', status, percent });
    });
  } else {
    // Cached result
    analysisResult = submissionResponse;
    onProgress({ step: 'analysis', status: 'completed' });
  }

  return { result: analysisResult.result, user_id: analysisResult.user_id };
}