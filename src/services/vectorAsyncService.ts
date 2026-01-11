/**
 * Search DTO Service
 * 
 * Provides async search, lookup, and dashboard feed functionality
 * using the unified search-dto API that returns StandardizedCase DTOs.
 * 
 * @see /search-dto.json for OpenAPI specification
 */
import { supabase } from '@/utils/supabase/client';
import {
  VectorJobResponse,
  JobStatusResponse,
  EnrichedCase,
  StandardizedCase,
  SearchResultPayload,
  LookupResultPayload
} from '@/types/vector-api';

const FUNCTION_NAME = 'search-dto';

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
 * Returns either StandardizedCase (new format) or EnrichedCase (legacy).
 *
 * Handles multiple API response formats:
 * - result.case (expected by LookupResultPayload type)
 * - result.standardized_case (per DTO documentation)
 * - result.cases[0] (array format from some endpoints)
 * - result directly if it has id and overview (direct case object)
 */
export async function lookupCase(identifier: string): Promise<EnrichedCase | StandardizedCase | null> {
  const { data: submitData, error: submitError } = await supabase.functions.invoke(`${FUNCTION_NAME}/lookup`, {
    method: 'POST',
    body: { identifier },
  });

  if (submitError) throw submitError;
  const job = submitData as VectorJobResponse;

  const result = await pollJobStatus<any>(job.job_id);

  // Debug: Log the actual API response structure
  console.log('[lookupCase] API result:', JSON.stringify(result, null, 2));
  console.log('[lookupCase] Result keys:', Object.keys(result || {}));

  // Handle multiple response formats from the API
  let caseData = null;

  if (result.case) {
    // Standard LookupResultPayload format
    console.log('[lookupCase] Found result.case');
    caseData = result.case;
  } else if (result.standardized_case) {
    // DTO documentation format: { standardized_case: {...} }
    console.log('[lookupCase] Found result.standardized_case');
    caseData = result.standardized_case;
  } else if (result.cases && Array.isArray(result.cases) && result.cases.length > 0) {
    // Array format from search-like endpoints
    console.log('[lookupCase] Found result.cases array');
    caseData = result.cases[0];
  } else if (result.id && result.overview) {
    // Direct case object (result IS the case)
    console.log('[lookupCase] Result is direct case object');
    caseData = result;
  } else {
    console.log('[lookupCase] No matching format found');
  }

  return caseData;
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
