import { supabase } from '@/utils/supabase/client';
import { IMAGE_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import { AnalysisResult, JobStatusResponse } from '@/types/imageAnalysis';

// Re-export for external use
export type { JobStatusResponse } from '@/types/imageAnalysis';

// Helper: Convert File to Base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const POLLING_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60; // 2 minutes max

function enrichAnalysisResult(status: JobStatusResponse, file?: File): AnalysisResult {
    const apiResult = status.result as any;

    // Handle new format (already has human_report)
    if (apiResult && apiResult.human_report) {
        apiResult.meta = {
            job_id: status.id,
            timestamp: status.completed_at || status.created_at || new Date().toISOString(),
            status: 'completed'
        };
        return apiResult as AnalysisResult;
    }

    // Handle old format (details + summary) and transform it
    const isOldFormat = apiResult?.details && Array.isArray(apiResult.details) && apiResult.summary?.global_verdict;
    if (isOldFormat) {
        const oldData = apiResult;
        const metadataInsight = oldData.details?.[0]?.insights?.find((i: any) => i.algo === 'Metadatos')?.data || {};

        const transformedResult: AnalysisResult = {
            meta: {
                job_id: status.id,
                timestamp: status.completed_at || status.created_at || new Date().toISOString(),
                status: 'completed' as const
            },
            human_report: {
                level_1_analysis: oldData.details?.[0]?.insights?.map((alg: any) => ({
                    algorithm: alg.algo,
                    significance_score: alg.value,
                    interpretation: alg.description || `Value: ${alg.value}`
                })) || [],
                level_2_integration: {
                    consistency_score: oldData.summary?.global_score || 0,
                    metadata_risk_score: 0,
                    tampering_type: oldData.summary?.global_verdict === 'CLEAN' ? 'Inexistente' : 'Local (Inserción/Clonado)',
                    synthesis_notes: `Global verdict from legacy API: ${oldData.summary?.global_verdict}`
                },
                level_3_verdict: {
                    manipulation_probability: (oldData.summary?.global_score || 0) * 100,
                    severity_index: oldData.summary?.global_score || 0,
                    final_label: oldData.summary?.global_verdict === 'CLEAN' ? 'Auténtico' : 'Confirmado Manipulado',
                    user_explanation: `The image was analyzed with a global score of ${oldData.summary?.global_score.toFixed(2)}. Verdict: ${oldData.summary?.global_verdict}`
                }
            },
            raw_forensics: oldData.details?.map((detail: any) => ({
                summary: detail.summary || {},
                algorithms: detail.insights?.map((insight: any) => ({
                    name: insight.algo,
                    score: insight.value,
                    heatmap: insight.heatmap
                })) || [],
                metadata: {
                    exif: metadataInsight,
                    software_detected: !!metadataInsight.Software,
                    software_name: metadataInsight.Software
                }
            })) || [],
            file_info: {
                name: file?.name || 'image.jpg',
                size_bytes: file?.size || 0,
                mime_type: file?.type || 'image/jpeg',
                dimensions: {
                    width: metadataInsight.width || 0,
                    height: metadataInsight.height || 0
                },
                created_at: status.created_at || new Date().toISOString(),
                exif_data: metadataInsight
            },
            chain_of_custody: [
                { timestamp: status.created_at || '', action: "Caso creado", actor: "Sistema Botilito", details: "Recepción de archivo." },
                { timestamp: status.completed_at || '', action: "Análisis finalizado", actor: "Motor IA", details: "Generación de reporte (adaptado de formato legacy)." }
            ]
        };
        return transformedResult;
    }

    // Fallback for unknown or empty result
    throw new Error('Analysis result is in an unknown or empty format.');
}


// Polling Helper
async function pollJobStatus(jobId: string, token: string, file?: File): Promise<AnalysisResult> {
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    await new Promise(r => setTimeout(r, POLLING_INTERVAL_MS));
    attempts++;

    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      // 404 means job not found (maybe not ready yet?)
      if (response.status === 404 && attempts < 5) continue;
      throw new Error(`Polling failed: ${response.status}`);
    }

    const data: JobStatusResponse = await response.json();

    if (data.status === 'completed') {
      return enrichAnalysisResult(data, file);
    }

    if (data.status === 'failed') {
      throw new Error(data.error?.message || 'Image analysis failed');
    }
  }

  throw new Error('Analysis timed out');
}

export const imageAnalysisService = {
  // Main entry point
  submitJob: async (file: File): Promise<{ jobId?: string; result?: AnalysisResult }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const base64 = await convertFileToBase64(file);

    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        url: "https://example.com/placeholder.jpg",
        type: "image",
        image_base64: base64
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Submission failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'completed' && data.result) {
        return { jobId: data.id, result: enrichAnalysisResult(data, file) };
    }

    return { jobId: data.job_id || data.id };
  },

  submitImage: async (file: File): Promise<AnalysisResult> => {
    // Legacy wrapper
    const { jobId } = await imageAnalysisService.submitJob(file);
    if (!jobId) throw new Error("No Job ID returned");

    const { data: { session } } = await supabase.auth.getSession();
    return await pollJobStatus(jobId, session?.access_token || '', file);
  },

  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });

    if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
    return await response.json();
  },

  getAnalysisResult: async (jobId: string): Promise<AnalysisResult> => {
    const status = await imageAnalysisService.getJobStatus(jobId);
    if (status.status === 'completed') {
      return enrichAnalysisResult(status);
    }
    throw new Error(`Job not complete (Status: ${status.status})`);
  }
};