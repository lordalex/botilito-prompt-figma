/**
 * Search DTO Service (Refactored to use fetch)
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
import * as apiEndpoints from '@/lib/apiEndpoints';
import { logger } from '@/utils/logger';

/**
 * Helper to get auth token from Supabase session.
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Generic fetch wrapper for Supabase Edge Functions.
 */
async function fetchEdgeFunction<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required: No active session.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
    cache: 'no-store', // Disable caching
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error(`[VectorAsync] Fetch failed: ${response.status}`, errorBody);
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

// Helper for polling
async function pollJobStatus<T>(jobId: string, interval = 2000, timeout = 60000): Promise<T> {
  const start = Date.now();
  logger.info(`[VectorAsync] Polling Job via Lookup: ${jobId}`);

  while (Date.now() - start < timeout) {
    try {
      const data = await fetchEdgeFunction<any>(apiEndpoints.LOOKUP_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ identifier: jobId }),
      });

      if (data?.case) {
        const status = data.case.lifecycle?.job_status;
        if (status === 'completed') {
          return data.case as T;
        } else if (status === 'failed') {
          throw new Error(data.case.lifecycle?.failure_reason || 'Job failed');
        }
      }
    } catch (err: any) {
      logger.warn(`[VectorAsync] Lookup poll failed: ${err.message}`);
      if (Date.now() - start > 10000) throw err;
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
  const effectiveQuery = query.trim() === "" ? "*" : query;

  const submitData = await fetchEdgeFunction<VectorJobResponse>(apiEndpoints.SEARCH_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      query: effectiveQuery,
      page,
      pageSize
    }),
  });

  return await pollJobStatus<SearchResultPayload>(submitData.job_id);
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
    logger.warn("[VectorAsync] lookupCase called with empty identifier");
    return null;
  }

  logger.debug('[VectorAsync] Calling lookupCase with identifier:', identifier);

  const parsedData = await fetchEdgeFunction<any>(apiEndpoints.LOOKUP_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });

  logger.debug('[VectorAsync] Lookup Response:', parsedData);

  // Handle multiple response formats from the API
  let caseData = null;

  if (parsedData?.case) {
    logger.info('[VectorAsync] Found parsedData.case');
    caseData = parsedData.case;
  } else if (parsedData?.standardized_case) {
    logger.info('[VectorAsync] Found parsedData.standardized_case');
    caseData = parsedData.standardized_case;
  } else if (parsedData?.cases && Array.isArray(parsedData.cases) && parsedData.cases.length > 0) {
    logger.info('[VectorAsync] Found parsedData.cases array');
    caseData = parsedData.cases[0];
  } else if (parsedData?.id && parsedData?.overview) {
    logger.info('[VectorAsync] parsedData is direct case object');
    caseData = parsedData;
  } else if (parsedData?.job_id) {
    logger.info('[VectorAsync] Falling back to job polling');
    return await pollJobStatus<StandardizedCase>(parsedData.job_id);
  } else {
    logger.warn('[VectorAsync] No matching format found', {
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
  const submitData = await fetchEdgeFunction<VectorJobResponse>(`${apiEndpoints.SUMMARY_ENDPOINT}?page=${page}&pageSize=${pageSize}`, {
    method: 'POST',
  });

  return await pollJobStatus<SearchResultPayload>(submitData.job_id);
}
