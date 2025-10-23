// src/utils/mapaDesinfodemico/api.ts

import { supabase } from '../supabase/client';

const BASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/mapa-desinfodemico-verbose';
const POLLING_INTERVAL_MS = 3000; // Poll every 3 seconds
const JOB_TIMEOUT_MS = 180000; // 3 minutes timeout

/**
 * Initiates and polls for the result of the infodemic map data generation.
 * @param onProgress - A callback function to report the status of the job.
 * @returns A promise that resolves with the final dashboard data.
 */
export async function generateMapa(onProgress: (status: string) => void): Promise<any> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('Authentication required to generate the map.');
  }

  // 1. Start the Job via POST request
  onProgress('starting_job');
  const startResponse = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!startResponse.ok) {
    const errorBody = await startResponse.json();
    throw new Error(`Failed to start map generation job: ${errorBody.error || startResponse.statusText}`);
  }

  const { job_id } = await startResponse.json();
  onProgress(`Job started with ID: ${job_id}`);

  // 2. Poll for the Job Status via GET request
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const intervalId = setInterval(async () => {
      // Check for timeout
      if (Date.now() - startTime > JOB_TIMEOUT_MS) {
        clearInterval(intervalId);
        reject(new Error(`Job timed out after ${JOB_TIMEOUT_MS / 1000} seconds.`));
        return;
      }

      try {
        const statusResponse = await fetch(`${BASE_URL}/status/${job_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!statusResponse.ok) {
          // Don't stop polling on a single failed GET, could be a network blip
          console.warn(`Polling failed with status: ${statusResponse.status}`);
          return;
        }

        const jobStatus = await statusResponse.json();

        switch (jobStatus.status) {
          case 'completed':
            clearInterval(intervalId);
            onProgress('completed');
            resolve(jobStatus.result);
            break;
          case 'failed':
            clearInterval(intervalId);
            onProgress('failed');
            reject(new Error(jobStatus.error?.message || 'Map generation failed.'));
            break;
          case 'processing':
          case 'pending':
            onProgress(jobStatus.status);
            break;
          default:
            // Continue polling
            break;
        }
      } catch (error) {
        console.error('Error during polling:', error);
        // Don't reject immediately, allow for recovery
      }
    }, POLLING_INTERVAL_MS);
  });
}

