// Types for Image Forgery Analysis API v1.0.0

export interface SubmitRequest {
  image_base64: string;
}

export interface AsyncResponse {
  job_id: string;
  message: string;
  status_url: string;
}

export interface CachedResponse {
  job_id: string;
  status: 'completed';
  result: AnalysisResult;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  result?: AnalysisResult;
  error?: string | null;
  trace_log?: any[];
}

export interface AnalysisResult {
  meta: {
    analyzed_at: string;
    duration_ms: number;
    cached: boolean;
  };
  summary: {
    global_verdict: 'TAMPERED' | 'CLEAN';
    confidence_score: number;
  };
  details: any[];
}
