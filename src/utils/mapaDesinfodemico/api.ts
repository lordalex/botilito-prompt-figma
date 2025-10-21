import { supabase } from '../supabase/client';
import type { MapaJobResponse, MapaJobStatus } from './types';

// Mapa Desinfodémico API base URL
const MAPA_API_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/mapa-async-auth';

/**
 * Create a new mapa desinfodémico generation job
 * Requires authentication
 *
 * @returns Job ID and initial status
 * @throws Error if authentication fails or API request fails
 */
export async function createMapaJob(): Promise<MapaJobResponse> {
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  const response = await fetch(MAPA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
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
  const response = await fetch(`${MAPA_API_URL}/status/${jobId}`, {
    method: 'GET'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
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

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const jobStatus = await getMapaJobStatus(jobId);

    // Call progress callback
    if (onProgress) {
      onProgress(jobStatus.status);
    }

    // Check if completed successfully
    if (jobStatus.status === 'completed' && jobStatus.result) {
      return jobStatus;
    }

    // Check if failed
    if (jobStatus.status === 'failed') {
      const errorMsg = jobStatus.error?.message || 'El análisis falló';
      throw new Error(errorMsg);
    }

    // Wait before next poll (unless this is the last attempt)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  // Timeout
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
  // Step 1: Create job
  const { job_id, status } = await createMapaJob();

  // Notify initial status
  if (onProgress) {
    onProgress(status);
  }

  // Step 2: Poll until complete
  return await pollMapaJob(job_id, onProgress);
}
