import { supabase } from '../supabase/client';
import type { MapaJobResponse, MapaJobStatus } from './types';

// Mapa Desinfodémico API base URL
const MAPA_API_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/mapa-infodemico-indicadores';

/**
 * Create a new mapa desinfodémico generation job
 * Requires authentication
 *
 * @returns Job ID and initial status
 * @throws Error if authentication fails or API request fails
 */
export async function createMapaJob(): Promise<MapaJobResponse> {
  console.log('%c🚀 [MAPA API] Creating new job...', 'color: #10b981; font-weight: bold');
  console.log('%c📍 API URL:', 'color: #3b82f6; font-weight: bold', MAPA_API_URL);

  // Get current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.error('%c❌ [MAPA API] No active session', 'color: #ef4444; font-weight: bold');
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  console.log('%c🔑 [MAPA API] Auth token present:', 'color: #8b5cf6', `${session.access_token.substring(0, 20)}...`);

  const requestBody = {};
  console.log('%c📤 [MAPA API] Request body:', 'color: #f59e0b', requestBody);

  const response = await fetch(MAPA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  console.log('%c📥 [MAPA API] Response status:', 'color: #ec4899', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    console.error('%c❌ [MAPA API] Error response:', 'color: #ef4444; font-weight: bold', error);
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('%c✅ [MAPA API] Job created successfully:', 'color: #10b981; font-weight: bold', result);
  console.log('%c🆔 Job ID:', 'color: #3b82f6', result.job_id);
  console.log('%c📊 Initial status:', 'color: #f59e0b', result.status);

  return result;
}

/**
 * Get the status of a mapa generation job
 * Does not require authentication
 *
 * @param jobId - Unique job identifier
 * @returns Current job status and results (if completed)
 * @throws Error if job not found or API request fails
 */
export async function getMapaJobStatus(jobId: string): Promise<MapaJobStatus> {
  const statusUrl = `${MAPA_API_URL}/status/${jobId}`;
  console.log('%c🔍 [MAPA API] Checking job status...', 'color: #06b6d4; font-weight: bold');
  console.log('%c📍 Status URL:', 'color: #3b82f6', statusUrl);
  console.log('%c🆔 Job ID:', 'color: #8b5cf6', jobId);

  const response = await fetch(statusUrl, {
    method: 'GET'
  });

  console.log('%c📥 [MAPA API] Status response:', 'color: #ec4899', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    console.error('%c❌ [MAPA API] Status check failed:', 'color: #ef4444; font-weight: bold', error);
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
  }

  const jobStatus = await response.json();
  console.log('%c📊 [MAPA API] Job status:', 'color: #f59e0b; font-weight: bold', jobStatus.status);

  if (jobStatus.status === 'completed' && jobStatus.result) {
    console.log('%c✅ [MAPA API] Job completed!', 'color: #10b981; font-weight: bold');
    console.log('%c📦 Result keys:', 'color: #3b82f6', Object.keys(jobStatus.result));
    console.log('%c📦 Full result payload:', 'color: #06b6d4', jobStatus.result);
  } else if (jobStatus.status === 'failed') {
    console.error('%c❌ [MAPA API] Job failed:', 'color: #ef4444; font-weight: bold', jobStatus.error);
  } else {
    console.log('%c⏳ [MAPA API] Job still processing...', 'color: #f59e0b', jobStatus.status);
  }

  return jobStatus;
}

/**
 * Poll job status until completion or failure
 *
 * @param jobId - Unique job identifier
 * @param onProgress - Optional callback to track progress
 * @returns Completed job status with results
 * @throws Error if job fails or times out
 */
export async function pollMapaJob(
  jobId: string,
  onProgress?: (status: string) => void
): Promise<MapaJobStatus> {
  const maxRetries = 60; // 60 * 3s = 3 minutes max wait
  const pollInterval = 3000; // 3 seconds

  console.log('%c⏱️ [MAPA POLL] Starting to poll job...', 'color: #8b5cf6; font-weight: bold');
  console.log('%c🆔 Job ID:', 'color: #3b82f6', jobId);
  console.log('%c⚙️ Max retries:', 'color: #f59e0b', maxRetries);
  console.log('%c⚙️ Poll interval:', 'color: #f59e0b', `${pollInterval / 1000}s`);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log('%c🔄 [MAPA POLL] Attempt:', 'color: #06b6d4', `${attempt + 1}/${maxRetries}`);

    const jobStatus = await getMapaJobStatus(jobId);

    // Call progress callback
    if (onProgress) {
      onProgress(jobStatus.status);
    }

    // Check if completed successfully
    if (jobStatus.status === 'completed' && jobStatus.result) {
      console.log('%c✅ [MAPA POLL] Job completed successfully!', 'color: #10b981; font-weight: bold');
      return jobStatus;
    }

    // Check if failed
    if (jobStatus.status === 'failed') {
      const errorMsg = jobStatus.error?.message || 'El análisis falló';
      console.error('%c❌ [MAPA POLL] Job failed:', 'color: #ef4444; font-weight: bold', errorMsg);
      throw new Error(errorMsg);
    }

    // Wait before next poll (unless this is the last attempt)
    if (attempt < maxRetries - 1) {
      console.log('%c⏳ [MAPA POLL] Waiting 3s before next check...', 'color: #94a3b8');
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  // Timeout
  console.error('%c⏱️ [MAPA POLL] Timeout reached!', 'color: #ef4444; font-weight: bold');
  throw new Error('Tiempo de espera agotado. El mapa está tomando más tiempo del esperado. Por favor, intenta de nuevo.');
}

/**
 * Main function: Create job and poll until completion
 *
 * @param onProgress - Optional callback to track progress
 * @returns Completed job status with mapa results
 * @throws Error if job creation, polling, or processing fails
 */
export async function generateMapa(
  onProgress?: (status: string) => void
): Promise<MapaJobStatus> {
  console.log('%c🎬 [MAPA] Starting mapa generation workflow...', 'color: #ec4899; font-size: 14px; font-weight: bold');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ec4899');

  // Step 1: Create job
  console.log('%c📝 [MAPA] Step 1: Creating job...', 'color: #3b82f6; font-weight: bold');
  const { job_id, status } = await createMapaJob();

  console.log('%c✅ [MAPA] Job created successfully', 'color: #10b981; font-weight: bold');

  // Notify initial status
  if (onProgress) {
    onProgress(status);
  }

  // Step 2: Poll until complete
  console.log('%c🔄 [MAPA] Step 2: Polling for completion...', 'color: #3b82f6; font-weight: bold');
  const result = await pollMapaJob(job_id, onProgress);

  console.log('%c🎉 [MAPA] Workflow completed!', 'color: #10b981; font-size: 14px; font-weight: bold');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981');

  return result;
}
