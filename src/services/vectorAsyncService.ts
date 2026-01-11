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

  // Return the case directly
  console.log('[VectorAsync] Lookup raw data type:', typeof data);
  console.log('[VectorAsync] Lookup raw data:', data);

  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      console.error('[VectorAsync] Failed to parse data string:', e);
    }
  }

  if (parsedData && parsedData.case) {
    console.log('[VectorAsync] Case found in response:', parsedData.case.id);
    return parsedData.case;
  } else {
    console.warn('[VectorAsync] data.case is missing/falsy', {
      dataKeys: parsedData ? Object.keys(parsedData) : 'null',
      isString: typeof data === 'string'
    });
  }

  // If we got a job_id (legacy path?), we might poll, but new API says it returns "case".
  // Fallback if data is just the job response without 'case'
  const job = data as VectorJobResponse;
  if (job?.job_id) {
    return await pollJobStatus<StandardizedCase>(job.job_id);
  }

  return null;
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
