export interface VectorJobResponse {
  job_id: string;
  message: string;
}

export interface TraceLogEntry {
  t: string;
  msg: string;
  meta?: any;
}

export interface EnrichedCase {
  id: string;
  created_at: string;
  title: string;
  url?: string | null;
  submission_type: 'Text' | 'URL';
  status: string;
  summary: string;
  metadata?: {
    analyzed_at?: string;
    duration_ms?: number;
    cached?: boolean;
    confidence_score?: number;
    global_verdict?: string; // TAMPERED | CLEAN
    [key: string]: any;
  };
  diagnostic_labels?: string[];
  human_votes?: {
    count: number;
    breakdown?: Record<string, number>;
    statistics?: any[];
    entries?: Array<{
      vote: string;
      reason: string;
      date: string;
      user: {
        id: string;
        nombre_completo: string;
        reputation: number;
      };
    }>;
  };
  consensus?: {
    state: 'human_consensus' | 'ai_only' | 'conflicted';
    final_labels?: string[];
  };
  content?: string; // Included only in lookup
  related_documents?: any[];
}

export interface SearchResultPayload {
  cases: EnrichedCase[];
  pagination: {
    page: number;
    pageSize: number;
    returnedCount: number;
    hasMore: boolean;
  };
}

export interface LookupResultPayload {
  case: EnrichedCase | null;
  error?: string;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: SearchResultPayload | LookupResultPayload;
  error?: any;
  trace_log?: TraceLogEntry[];
}
