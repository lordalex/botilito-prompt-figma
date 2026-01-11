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
// Helper for polling (Now strictly uses Lookup logic or is deprecated)
// Since the new Lookup endpoint provides the case directly, we only poll if we suspect async processing is still active.
// However, the `search-dto/lookup` IS the unified way to get data.
// If we need to "poll" a job until it's done, we do it by calling lookup repeatedly.

async function pollJobStatus<T>(jobId: string, interval = 2000, timeout = 60000): Promise<T> {
  const start = Date.now();
  console.log(`[VectorAsync] Polling Job via Lookup: ${jobId}`);

  while (Date.now() - start < timeout) {
    // USE LOOKUP, NOT STATUS
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_NAME}/lookup`, {
      method: 'POST',
      body: { identifier: jobId }
    });

    if (error) {
      // If 404, might be initializing
      console.warn(`[VectorAsync] Lookup failed: ${error.message}`);
      if (Date.now() - start > 10000) throw error; // Allow 10s grace for 404s
    } else if (data && data.case) {
      const status = data.case.lifecycle?.job_status;
      if (status === 'completed') {
        return data.case as T; // Return StandardizedCase
      } else if (status === 'failed') {
        throw new Error(data.case.lifecycle?.failure_reason || 'Job failed');
      }
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
  if (!identifier) {
    console.warn("lookupCase called with empty identifier");
    return null;
  }
  // Direct Lookup for sync retrieval
  const { data, error } = await supabase.functions.invoke(`${FUNCTION_NAME}/lookup`, {
    method: 'POST',
    body: { identifier },
  });

  if (error) throw error;

  // Parse response if it's a string
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      console.error('[VectorAsync] Failed to parse data string:', e);
    }
  }

  // Handle multiple response formats from the API
  let caseData = null;

  if (parsedData?.case) {
    // Standard LookupResultPayload format
    console.log('[VectorAsync] Found parsedData.case');
    caseData = parsedData.case;
  } else if (parsedData?.standardized_case) {
    // DTO documentation format: { standardized_case: {...} }
    console.log('[VectorAsync] Found parsedData.standardized_case');
    caseData = parsedData.standardized_case;
  } else if (parsedData?.cases && Array.isArray(parsedData.cases) && parsedData.cases.length > 0) {
    // Array format from search-like endpoints
    console.log('[VectorAsync] Found parsedData.cases array');
    caseData = parsedData.cases[0];
  } else if (parsedData?.id && parsedData?.overview) {
    // Direct case object (result IS the case)
    console.log('[VectorAsync] parsedData is direct case object');
    caseData = parsedData;
  } else if (parsedData?.job_id) {
    // Legacy path: poll if we got a job_id
    console.log('[VectorAsync] Falling back to job polling');
    return await pollJobStatus<StandardizedCase>(parsedData.job_id);
  } else {
    console.warn('[VectorAsync] No matching format found', {
      dataKeys: parsedData ? Object.keys(parsedData) : 'null'
    });
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
