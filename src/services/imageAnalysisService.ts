import { Session } from '@supabase/supabase-js';
import { api } from '@/services/api';
import type { JobStatusResponse, AnalysisResult } from './imageAnalysisTypes';

async function pollJobStatus(jobId: string): Promise<AnalysisResult> {
  const maxAttempts = 30;
  const pollInterval = 2000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await api.imageAnalysis.getStatus(jobId);
    
    if (response.ok) {
      const data: JobStatusResponse = await response.json();
      if (data.status === 'completed' && data.result) {
        return data.result;
      }
      if (data.status === 'failed') {
        const errorMessage = typeof data.error === 'string' ? data.error : 'El trabajo de análisis de imagen falló';
        throw new Error(errorMessage);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
  }

  throw new Error('Tiempo de espera agotado para el análisis de la imagen.');
}

export async function performImageAnalysis(session: Session | null, imageBase64: string): Promise<AnalysisResult> {
  try {
    const response = await api.imageAnalysis.submit(session, imageBase64);

    if (response.status === 200) { // Cache Hit
      const data = await response.json();
      return data.result;
    }

    if (response.status === 202) { // Async Job
      const { job_id } = await response.json();
      if (!job_id) {
        throw new Error('No se recibió un ID de trabajo válido');
      }
      return await pollJobStatus(job_id);
    }

    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${response.status}`);

  } catch (error) {
    console.error('Error performing image analysis:', error);
    throw error;
  }
}
