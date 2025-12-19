import { supabase } from '@/utils/supabase/client';
import { IMAGE_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import { AnalysisResult, TestResult, Marker, GlobalVerdict } from '@/types/imageAnalysis';

// Helper: Convertir File a Base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- Raw Types from API ---
// --- Raw Types from API matching new 2.3.0 Spec ---
interface RawFileMetadata {
  filename?: string;
  size_bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  exif?: Record<string, string>;
  codec?: string;
  duration_sec?: number;
  fps?: string;
}

interface RawAlgorithm {
  name: string;
  score: number;
  heatmap?: string;
}

interface RawSummary {
  verdict?: 'CLEAN' | 'TAMPERED';
  score?: number;
  heatmap?: string;
  tampered_region?: string;
  global_verdict?: string; // fallback
  diagnosis?: string; // fallback
}

interface RawAnalysisResultItem {
  frame_index?: number;
  metadata?: RawFileMetadata;
  summary: RawSummary;
  algorithms?: RawAlgorithm[];

  // Backward compatibility fields if needed
  details?: { algorithms: RawAlgorithm[] }[];
}

interface RawAnalysisResultWrapper {
  meta?: {
    analyzed_at?: string;
    file_info?: RawFileMetadata;
  };
  details?: RawAnalysisResultItem[]; // Array of frames/results
  summary?: RawSummary;
}

interface AsyncStartResponse {
  job_id: string;
  status: string;
  message: string;
}

interface JobStatusResponse {
  id?: string;
  job_id?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: RawAnalysisResultWrapper | RawAnalysisResultItem[] | RawAnalysisResultItem;
  error?: string;
}

const POLLING_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60; // 2 minutes max

// --- Mapper Functions ---
function formatAlgorithmName(name: string): string {
  const map: Record<string, string> = {
    'slic': 'SLIC (Clustering)',
    'ela': 'Error Level Analysis',
    'noise': 'Noise Analysis'
  };
  return map[name.toLowerCase()] || name.toUpperCase();
}

function getAlgorithmDescription(name: string): string {
  const map: Record<string, string> = {
    'slic': 'Detects inconsistencies in lighting and shadows using superpixel clustering.',
    'ela': 'Highlights differences in compression levels across the image.',
    'noise': 'Analyzes local noise variance to find splices.'
  };
  return map[name.toLowerCase()] || 'Forensic analysis algorithm.';
}

function mapToAnalysisResult(raw: RawAnalysisResultWrapper | RawAnalysisResultItem, file: File): AnalysisResult {
  // Normalize input: it could be the wrapper (new spec) or a single item (legacy/direct)

  // 1. Try to get the "inner" item which has algorithms and specific metadata
  let innerItem: RawAnalysisResultItem | undefined;

  if ('details' in raw && Array.isArray(raw.details) && raw.details.length > 0) {
    innerItem = raw.details[0]; // Take first frame/image result
  } else if ('algorithms' in raw) {
    innerItem = raw as RawAnalysisResultItem;
  }

  // 2. Extract algorithms
  const algorithms = innerItem?.algorithms || (raw as any).details?.[0]?.algorithms || [];

  // Map Tests
  const testResults: TestResult[] = algorithms.map(algo => ({
    id: algo.name,
    name: formatAlgorithmName(algo.name),
    description: getAlgorithmDescription(algo.name),
    verdict: algo.score > 0.6 ? 'TAMPERED' : 'AUTHENTIC',
    confidence: algo.score,
    executionTimeMs: 0
  }));

  // Synthesize Markers
  const markers: Marker[] = [];
  algorithms.forEach(algo => {
    if (algo.score > 0.75) {
      markers.push({
        id: `${algo.name}-detection`,
        type: 'suspicious_pattern',
        description: `High indication of manipulation detected by ${formatAlgorithmName(algo.name)}`,
        confidence: algo.score,
        severity: 'high',
        location: { x: 0, y: 0, width: 0, height: 0 },
        category: 'SYNTHESIS',
        evidence: `High confidence score (${Math.round(algo.score * 100)}%) from ${formatAlgorithmName(algo.name)} algorithm.`
      });
    }
  });

  // Handle verdict and score with fallbacks from multiple levels
  const summarySource = (raw as any).summary || innerItem?.summary || {};
  const rawVerdict = summarySource.verdict || summarySource.global_verdict || 'UNKNOWN';

  // Robust Score Logic
  let score = summarySource.score;
  if (score === undefined || score === null) {
    if (rawVerdict === 'TAMPERED') score = 0.99;
    else if (rawVerdict === 'CLEAN') score = 0.01;
    else score = 0;
  }

  // Extract Metadata/EXIF from multiple possible sources
  // Priority: Inner Item Metadata > Wrapper Meta FileInfo > Default
  const metaSource = innerItem?.metadata || (raw as any).meta?.file_info || (raw as any).metadata || {};

  const dimensions = {
    width: metaSource.width || 0,
    height: metaSource.height || 0
  };

  return {
    meta: {
      id: 'job-id-placeholder',
      timestamp: new Date().toISOString(), // Spec doesn't seem to return timestamp in result, usually in job status
      status: 'completed'
    },
    summary: {
      global_verdict: rawVerdict as GlobalVerdict,
      confidence_score: score,
      risk_score: Math.round(score * 100),
      diagnosis: `Analysis completed. Global verdict: ${rawVerdict}`
    },
    file_info: {
      name: metaSource.filename || file.name,
      size_bytes: metaSource.size_bytes || file.size,
      mime_type: metaSource.format ? `image/${metaSource.format.toLowerCase()}` : file.type,
      dimensions: dimensions,
      created_at: new Date().toISOString(),
      exif_data: metaSource.exif || {}
    },
    stats: {
      tests_executed: algorithms.length,
      markers_found: markers.length,
      processing_time_ms: 0
    },
    details: testResults,
    markers: markers,
    recommendations: [
      "Verify source credibility",
      "Check EXIF metadata if available",
      "Look for visual inconsistencies"
    ]
  };
}

async function pollJobStatus(jobId: string, token: string, file: File): Promise<AnalysisResult> {
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    await new Promise(r => setTimeout(r, POLLING_INTERVAL_MS));
    attempts++;

    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Polling failed: ${response.status}`);
    }

    const data: JobStatusResponse = await response.json();

    if (data.status === 'completed' && data.result) {
      // New Spec: result is a wrapper object
      if (!Array.isArray(data.result)) {
        return mapToAnalysisResult(data.result as RawAnalysisResultWrapper, file);
      }
      // Legacy/Fallback: result is an array
      const resultItem = data.result[0];
      return mapToAnalysisResult(resultItem, file);
    }

    if (data.status === 'failed') {
      throw new Error(data.error || 'Image analysis failed');
    }
  }

  throw new Error('Analysis timed out');
}

export const imageAnalysisService = {
  submitImage: async (file: File): Promise<AnalysisResult> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const base64 = await convertFileToBase64(file);

    // 1. Submit
    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ image_base64: base64 }),
    });

    if (!response.ok) {
      // Check for specific error message structure
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || errorData.error || `Submission failed: ${response.status}`);
    }

    const data = await response.json();

    // Check for "queued" status (200 OK according to new spec, or check status field)
    if (data.status === 'queued' || response.status === 202) {
      const jobId = data.job_id;
      if (!jobId) throw new Error('No job_id returned from submission');
      return await pollJobStatus(jobId, session.access_token, file);
    }

    // Fallback/Legacy Direct Result
    if (data.result) {
      if (!Array.isArray(data.result)) {
        return mapToAnalysisResult(data.result as RawAnalysisResultWrapper, file);
      }
      const resultItem = data.result[0];
      return mapToAnalysisResult(resultItem, file);
    }

    throw new Error('Unexpected server response: ' + JSON.stringify(data));
  }
};
