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
