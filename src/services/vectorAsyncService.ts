import { supabase } from '@/utils/supabase/client';
import { 
  VectorJobResponse, 
  JobStatusResponse, 
  EnrichedCase,
  SearchResultPayload,
  LookupResultPayload
} from '@/types/vector-api';

const FUNCTION_NAME = 'vector-async';

// Helper for polling
async function pollJobStatus<T>(jobId: string, interval = 2000, timeout = 60000): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_NAME}/status/${jobId}`, { method: 'GET' });
    
    if (error) throw new Error(error.message || JSON.stringify(error));
    
    const response = data as JobStatusResponse;
    
    if (response.status === 'completed') {
      return response.result as T;
    }
    
    if (response.status === 'failed') {
      throw new Error(response.error?.message || 'Job failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Polling timed out');
}

/**
 * Uses /search endpoint.
 * FIX: Defaults query to "*" if empty to satisfy API requirement "Query required".
 */
export async function searchCases(
  query: string = "", 
  page: number = 1, 
  pageSize: number = 10
): Promise<SearchResultPayload> {
  // Fix: The API requires a non-empty query. 
  // We use "*" to represent "fetch all" (depending on backend implementation) or a generic term.
  const effectiveQuery = query.trim() === "" ? "*" : query;

  const { data: submitData, error: submitError } = await supabase.functions.invoke(`${FUNCTION_NAME}/search`, {
    method: 'POST',
    body: { 
      query: effectiveQuery, 
      page, 
      pageSize 
    },
  });

  if (submitError) throw submitError;
  const job = submitData as VectorJobResponse;

  return await pollJobStatus<SearchResultPayload>(job.job_id);
}

/**
 * Uses /lookup endpoint for single case details.
 */
export async function lookupCase(identifier: string): Promise<EnrichedCase | null> {
  const { data: submitData, error: submitError } = await supabase.functions.invoke(`${FUNCTION_NAME}/lookup`, {
    method: 'POST',
    body: { identifier },
  });

  if (submitError) throw submitError;
  const job = submitData as VectorJobResponse;

  const result = await pollJobStatus<LookupResultPayload>(job.job_id);
  return result.case || null;
}

/**
 * Uses /summary endpoint to get a paginated list of recent cases.
 */
export async function fetchHistorialSummary(
  page: number = 1, 
  pageSize: number = 10
): Promise<SearchResultPayload> {
  const { data: submitData, error: submitError } = await supabase.functions.invoke(`${FUNCTION_NAME}/summary?page=${page}&pageSize=${pageSize}`, {
    method: 'POST',
  });

  if (submitError) throw submitError;
  const job = submitData as VectorJobResponse;

  return await pollJobStatus<SearchResultPayload>(job.job_id);
}
