import { supabase } from '../utils/supabase/client';

const WEB_SNAPSHOT_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/web-snapshot';
const ANALYSIS_FUNCTION_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/analysis_function';

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
  job_id: string;
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
  return data.job_id;
}

async function pollSnapshot(jobId: string, onProgress: (status: string) => void): Promise<string> {
  const maxRetries = 30; // 30 * 2s = 60s
  const pollInterval = 30000;
  const token = await getSupabaseToken();

  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(`${WEB_SNAPSHOT_URL}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      // Don't throw immediately, maybe a transient error
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
  job_id: string;
}

export interface AnalysisResult {
    id: string;
    user_id: string;
    status: string;
    current_step?: string;
    result?: any; // Replace 'any' with a proper type from your spec
    error?: {
        message: string;
    };
}


async function submitAnalysis(text: string, url?: string): Promise<string> {
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
  return data.job_id;
}

async function pollAnalysis(jobId: string, onProgress: (status: string) => void): Promise<AnalysisResult> {
    const maxRetries = 60; // 60 * 3s = 180s
    const pollInterval = 30000;
    const token = await getSupabaseToken();

    for (let i = 0; i < maxRetries; i++) {
        const response = await fetch(`${ANALYSIS_FUNCTION_URL}/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            continue;
        }

        const result: AnalysisResult = await response.json();
        onProgress(result.current_step || result.status);

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
  onProgress: (progress: { step: string; status: string }) => void
): Promise<{ result: any, user_id: string }> {
  if (isUrl(textOrUrl)) {
    onProgress({ step: 'snapshot', status: 'Starting URL snapshot...' });
    const snapshotJobId = await submitSnapshot(textOrUrl);
    const cleanedText = await pollSnapshot(snapshotJobId, (status) => {
      onProgress({ step: 'snapshot', status });
    });

    onProgress({ step: 'analysis', status: 'Starting analysis...' });
    const analysisJobId = await submitAnalysis(cleanedText, textOrUrl);
    const analysisResult = await pollAnalysis(analysisJobId, (status) => {
      onProgress({ step: 'analysis', status });
    });

    return { result: analysisResult.result, user_id: analysisResult.user_id };
  } else {
    onProgress({ step: 'analysis', status: 'Starting analysis...' });
    const analysisJobId = await submitAnalysis(textOrUrl);
    const analysisResult = await pollAnalysis(analysisJobId, (status) => {
      onProgress({ step: 'analysis', status });
    });

    return { result: analysisResult.result, user_id: analysisResult.user_id };
  }
}