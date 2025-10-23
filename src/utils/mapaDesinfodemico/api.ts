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
  console.log('\n%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #10b981; font-weight: bold');
  console.log('%c║                       🚀 CREATING MAPA JOB                                 ║', 'color: #10b981; font-weight: bold');
  console.log('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #10b981; font-weight: bold');

  console.log('\n%c📍 ENDPOINT:', 'color: #3b82f6; font-weight: bold');
  console.log('  ', MAPA_API_URL);

  // Get current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.error('\n%c❌ ERROR: No active session', 'color: #ef4444; font-weight: bold');
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  console.log('\n%c🔑 AUTHENTICATION:', 'color: #8b5cf6; font-weight: bold');
  console.log('   Token:', `${session.access_token.substring(0, 30)}...`);

  const requestBody = {};
  console.log('\n%c📤 REQUEST:', 'color: #f59e0b; font-weight: bold');
  console.log('   Method: POST');
  console.log('   Headers:', {
    'Authorization': 'Bearer [TOKEN]',
    'Content-Type': 'application/json'
  });
  console.log('   Body:', JSON.stringify(requestBody, null, 2));

  console.log('\n%c⏳ Sending request...', 'color: #94a3b8');

  const response = await fetch(MAPA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  console.log('\n%c📥 RESPONSE:', 'color: #ec4899; font-weight: bold');
  console.log('   Status:', response.status, response.statusText);
  console.log('   Headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    console.error('\n%c❌ ERROR RESPONSE:', 'color: #ef4444; font-weight: bold');
    console.error(JSON.stringify(error, null, 2));
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('\n%c✅ SUCCESS - JOB CREATED:', 'color: #10b981; font-weight: bold');
  console.log('   Job ID:', result.job_id);
  console.log('   Status:', result.status);
  console.log('   Message:', result.message);
  console.log('\n%c📦 FULL RESPONSE PAYLOAD:', 'color: #06b6d4');
  console.log(JSON.stringify(result, null, 2));

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

  console.log('\n%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #06b6d4; font-weight: bold');
  console.log('%c║                     🔍 CHECKING JOB STATUS                                 ║', 'color: #06b6d4; font-weight: bold');
  console.log('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #06b6d4; font-weight: bold');

  console.log('\n%c🆔 JOB ID:', 'color: #8b5cf6; font-weight: bold');
  console.log('  ', jobId);

  console.log('\n%c📍 ENDPOINT:', 'color: #3b82f6; font-weight: bold');
  console.log('  ', statusUrl);

  console.log('\n%c📤 REQUEST:', 'color: #f59e0b; font-weight: bold');
  console.log('   Method: GET');
  console.log('   Auth: Not required (public status endpoint)');

  console.log('\n%c⏳ Fetching status...', 'color: #94a3b8');

  const response = await fetch(statusUrl, {
    method: 'GET'
  });

  console.log('\n%c📥 RESPONSE:', 'color: #ec4899; font-weight: bold');
  console.log('   Status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    console.error('\n%c❌ STATUS CHECK FAILED:', 'color: #ef4444; font-weight: bold');
    console.error(JSON.stringify(error, null, 2));
    throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
  }

  const jobStatus = await response.json();

  console.log('\n%c📊 JOB STATUS:', 'color: #f59e0b; font-weight: bold');
  console.log('   Current Status:', jobStatus.status);
  console.log('   Created At:', jobStatus.created_at);
  if (jobStatus.completed_at) {
    console.log('   Completed At:', jobStatus.completed_at);
  }

  if (jobStatus.status === 'completed' && jobStatus.result) {
    console.log('\n%c✅ JOB COMPLETED!', 'color: #10b981; font-weight: bold; font-size: 14px');
    console.log('\n%c📦 RESULT STRUCTURE:', 'color: #3b82f6; font-weight: bold');
    console.log('   Top-level keys:', Object.keys(jobStatus.result));

    if (jobStatus.result.global_kpis) {
      console.log('\n%c🌍 GLOBAL KPIs:', 'color: #8b5cf6; font-weight: bold');
      console.log(JSON.stringify(jobStatus.result.global_kpis, null, 2));
    }

    console.log('\n%c📐 DIMENSIONS PRESENT:', 'color: #06b6d4; font-weight: bold');
    const dimensions = Object.keys(jobStatus.result).filter(k => k.startsWith('dimension_'));
    dimensions.forEach(dim => {
      console.log(`   ✓ ${dim}`);
    });

    console.log('\n%c📦 COMPLETE RESULT PAYLOAD:', 'color: #10b981');
    console.log(JSON.stringify(jobStatus.result, null, 2));

  } else if (jobStatus.status === 'failed') {
    console.error('\n%c❌ JOB FAILED:', 'color: #ef4444; font-weight: bold; font-size: 14px');
    console.error('   Error:', jobStatus.error);
    console.error('\n%c📦 FULL ERROR DETAILS:', 'color: #ef4444');
    console.error(JSON.stringify(jobStatus.error, null, 2));

  } else {
    console.log('\n%c⏳ JOB STILL PROCESSING...', 'color: #f59e0b; font-size: 14px');
    console.log('   Status:', jobStatus.status);
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

  console.log('\n%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #8b5cf6; font-weight: bold');
  console.log('%c║                       ⏱️  POLLING JOB STATUS                               ║', 'color: #8b5cf6; font-weight: bold');
  console.log('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #8b5cf6; font-weight: bold');

  console.log('\n%c⚙️  POLLING CONFIG:', 'color: #f59e0b; font-weight: bold');
  console.log('   Job ID:', jobId);
  console.log('   Max Retries:', maxRetries);
  console.log('   Poll Interval:', `${pollInterval / 1000}s`);
  console.log('   Max Wait Time:', `${(maxRetries * pollInterval) / 1000}s (${(maxRetries * pollInterval) / 60000} minutes)`);

  const startTime = Date.now();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n%c─────────────────────────────────────────────────────────────────────────────', 'color: #64748b');
    console.log('%c🔄 POLL ATTEMPT #' + (attempt + 1), 'color: #06b6d4; font-weight: bold');
    console.log('   Progress:', `${attempt + 1}/${maxRetries}`);
    console.log('   Elapsed Time:', `${elapsedSeconds}s`);

    const jobStatus = await getMapaJobStatus(jobId);

    // Call progress callback
    if (onProgress) {
      onProgress(jobStatus.status);
    }

    // Check if completed successfully
    if (jobStatus.status === 'completed' && jobStatus.result) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('\n%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #10b981; font-weight: bold; font-size: 14px');
      console.log('%c║                    ✅ POLLING COMPLETE - SUCCESS!                         ║', 'color: #10b981; font-weight: bold; font-size: 14px');
      console.log('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #10b981; font-weight: bold; font-size: 14px');
      console.log('\n%c📊 SUMMARY:', 'color: #10b981; font-weight: bold');
      console.log('   Total Attempts:', attempt + 1);
      console.log('   Total Time:', `${totalTime}s`);
      console.log('   Status:', jobStatus.status);
      return jobStatus;
    }

    // Check if failed
    if (jobStatus.status === 'failed') {
      const errorMsg = jobStatus.error?.message || 'El análisis falló';
      console.error('\n%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #ef4444; font-weight: bold; font-size: 14px');
      console.error('%c║                      ❌ POLLING FAILED                                     ║', 'color: #ef4444; font-weight: bold; font-size: 14px');
      console.error('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #ef4444; font-weight: bold; font-size: 14px');
      console.error('\n%c📊 SUMMARY:', 'color: #ef4444; font-weight: bold');
      console.error('   Attempts Before Failure:', attempt + 1);
      console.error('   Error Message:', errorMsg);
      throw new Error(errorMsg);
    }

    // Wait before next poll (unless this is the last attempt)
    if (attempt < maxRetries - 1) {
      console.log('\n%c⏳ Waiting 3s before next check...', 'color: #94a3b8');
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  // Timeout
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.error('\n%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #ef4444; font-weight: bold; font-size: 14px');
  console.error('%c║                      ⏱️  POLLING TIMEOUT                                   ║', 'color: #ef4444; font-weight: bold; font-size: 14px');
  console.error('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #ef4444; font-weight: bold; font-size: 14px');
  console.error('\n%c📊 TIMEOUT DETAILS:', 'color: #ef4444; font-weight: bold');
  console.error('   Max Retries Reached:', maxRetries);
  console.error('   Total Time Elapsed:', `${totalTime}s`);
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
  console.log('\n\n');
  console.log('%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #ec4899; font-weight: bold; font-size: 16px');
  console.log('%c║                                                                            ║', 'color: #ec4899; font-weight: bold; font-size: 16px');
  console.log('%c║              🗺️  MAPA DESINFODÉMICO GENERATION WORKFLOW                   ║', 'color: #ec4899; font-weight: bold; font-size: 16px');
  console.log('%c║                                                                            ║', 'color: #ec4899; font-weight: bold; font-size: 16px');
  console.log('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #ec4899; font-weight: bold; font-size: 16px');

  const workflowStartTime = Date.now();

  // Step 1: Create job
  console.log('\n\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6; font-weight: bold');
  console.log('%c  STEP 1: CREATE JOB', 'color: #3b82f6; font-weight: bold; font-size: 14px');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6; font-weight: bold');

  const { job_id, status } = await createMapaJob();

  console.log('\n%c✅ STEP 1 COMPLETE', 'color: #10b981; font-weight: bold; font-size: 14px');
  console.log('   Job ID:', job_id);
  console.log('   Initial Status:', status);

  // Notify initial status
  if (onProgress) {
    onProgress(status);
  }

  // Step 2: Poll until complete
  console.log('\n\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6; font-weight: bold');
  console.log('%c  STEP 2: POLL FOR COMPLETION', 'color: #3b82f6; font-weight: bold; font-size: 14px');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3b82f6; font-weight: bold');

  const result = await pollMapaJob(job_id, onProgress);

  const workflowTotalTime = ((Date.now() - workflowStartTime) / 1000).toFixed(1);

  console.log('\n\n%c╔════════════════════════════════════════════════════════════════════════════╗', 'color: #10b981; font-weight: bold; font-size: 16px');
  console.log('%c║                                                                            ║', 'color: #10b981; font-weight: bold; font-size: 16px');
  console.log('%c║                    🎉 WORKFLOW COMPLETED SUCCESSFULLY!                     ║', 'color: #10b981; font-weight: bold; font-size: 16px');
  console.log('%c║                                                                            ║', 'color: #10b981; font-weight: bold; font-size: 16px');
  console.log('%c╚════════════════════════════════════════════════════════════════════════════╝', 'color: #10b981; font-weight: bold; font-size: 16px');

  console.log('\n%c📊 WORKFLOW SUMMARY:', 'color: #10b981; font-weight: bold');
  console.log('   Job ID:', job_id);
  console.log('   Final Status:', result.status);
  console.log('   Total Workflow Time:', `${workflowTotalTime}s`);
  console.log('   Result Data Size:', result.result ? `${Object.keys(result.result).length} top-level keys` : 'N/A');

  return result;
}
