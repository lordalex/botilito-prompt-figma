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
