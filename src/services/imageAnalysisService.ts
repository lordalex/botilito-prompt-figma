import { supabase } from '../utils/supabase/client';
import { IMAGE_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import { AnalysisResult, JobStatusResponse } from '@/types/imageAnalysis';

// Re-export for external use
export type { JobStatusResponse } from '@/types/imageAnalysis';

const POLLING_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60; // 2 minutes max

// --- Base64 Conversion Utility ---
export async function convertFileToBase64(file: File): Promise<string> {
  console.log(`[Base64] Starting conversion for ${file.name} size=${file.size}`);

  const conversionPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      console.log('[Base64] Reader onload fired');
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      console.log(`[Base64] Resolved string length: ${base64.length}`);
      resolve(base64);
    };

    reader.onerror = (error) => {
      console.error('[Base64] Reader error:', error);
      reject(error);
    };

    reader.onabort = () => {
      console.warn('[Base64] Reader aborted');
      reject(new Error('FileReader aborted'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('[Base64] readAsDataURL threw error:', e);
      reject(e);
    }
  });

  // Add 10s timeout
  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error('Base64 conversion timed out (>10s)')), 10000)
  );

  return Promise.race([conversionPromise, timeoutPromise]);
}

// --- Data Transformation ---
function transformApiResult(status: JobStatusResponse, file?: File): AnalysisResult & { type: string; standardized_case?: any } {
  // 1. Check for StandardizedCase DTO (New API)
  const stdCase = status.result?.standardized_case;

  if (stdCase) {
    const insights = stdCase.insights || [];
    const overview = stdCase.overview || {};

    // Map Insights to Level 1 Analysis
    const level1 = insights
      .filter((i: any) => i.category === 'forensics' || i.category === 'metadata')
      .map((i: any) => ({
        algorithm: i.label,
        significance_score: (i.score !== undefined ? i.score : 0) / 100, // Normalize 0-100 to 0-1
        interpretation: i.description,
        timestamp: undefined // Not present in generic DTO
      }));

    // Build Raw Forensics (Visualizations)
    const rawForensics = insights.map((i: any) => {
      const heatmapArtifact = i.artifacts?.find((a: any) => a.type === 'image_url' && (a.label?.toLowerCase().includes('heatmap') || a.label?.toLowerCase().includes('calor')));
      return {
        summary: {
          heatmap: heatmapArtifact?.content
        },
        algorithms: [{
          name: i.label,
          score: i.score || 0,
          heatmap: heatmapArtifact?.content
        }],
        metadata: {}
      };
    }).filter((rf: any) => rf.summary.heatmap); // Only keep those with visual artifacts? Or keep all.

    return {
      type: 'image_analysis',
      meta: {
        job_id: status.id || stdCase.id,
        timestamp: stdCase.created_at || new Date().toISOString(),
        status: 'completed'
      },
      human_report: {
        level_1_analysis: level1,
        level_2_integration: {
          consistency_score: (overview.risk_score || 0) / 100,
          metadata_risk_score: 0, // Default for now
          synthesis_notes: overview.summary || "Sin notas",
          tampering_type: 'Inexistente' // valid enum default
        },
        level_3_verdict: {
          final_label: overview.verdict_label === 'TAMPERED' ? 'Confirmado Manipulado' : 'Auténtico',
          manipulation_probability: overview.risk_score || 0,
          severity_index: (overview.risk_score || 0) / 100,
          user_explanation: overview.summary || ""
        }
      },
      raw_forensics: rawForensics,
      file_info: {
        name: file?.name || 'image.jpg',
        size_bytes: file?.size || 0,
        mime_type: file?.type || 'image/jpeg',
        dimensions: { width: 0, height: 0 },
        created_at: stdCase.created_at,
        url: overview.main_asset_url,
        exif_data: {} // Could extract from metadata insights if structured
      },
      chain_of_custody: [],
      recommendations: [], // Service can derive if needed, or component does it
      // Preserve the full DTO for the unified view
      standardized_case: stdCase
    };
  }

  // 2. Legacy Fallback
  const forensicResult = status.result || {};
  const aiAnalysis = forensicResult.ai_analysis || {};
  const details = forensicResult.details || [];
  const summary = forensicResult.summary || {};

  const transformed: AnalysisResult & { type: string; standardized_case?: any } = {
    type: 'image_analysis',
    meta: {
      job_id: status.id,
      timestamp: (status as any).completed_at || new Date().toISOString(),
      status: 'completed',
    },
    human_report: {
      level_1_analysis: details.flatMap((d: any) => d.insights?.map((i: any) => ({
        algorithm: i.algo,
        significance_score: typeof i.value === 'number' ? i.value : 0,
        interpretation: i.description,
        timestamp: d.timestamp, // Add frame timestamp to each insight
      })) || []) || [],
      level_2_integration: {
        ...(aiAnalysis.level_2_integration || {}),
        consistency_score: summary.global_score || 0,
        synthesis_notes: `Global verdict: ${summary.global_verdict}`,
      },
      level_3_verdict: {
        ...(aiAnalysis.level_3_verdict || {}),
        manipulation_probability: (summary.global_score || 0) * 100,
        final_label: summary.global_verdict === 'CLEAN' ? 'Auténtico' : 'Confirmado Manipulado',
      }
    },
    raw_forensics: details.map((d: any) => ({
      summary: {
        heatmap: d.insights?.find((i: any) => i.algo === 'Veredicto Compuesto')?.heatmap,
      },
      algorithms: d.insights?.map((i: any) => ({
        name: i.algo,
        score: typeof i.value === 'number' ? i.value : 0,
        heatmap: i.heatmap,
      })) || [],
      metadata: {}
    })),
    file_info: {
      name: file?.name || 'image.jpg',
      size_bytes: file?.size || 0,
      mime_type: file?.type || 'image/jpeg',
      dimensions: { width: 0, height: 0 }, // This should be filled from metadata insight if available
      created_at: (status as any).created_at || new Date().toISOString(),
      url: details[0]?.original_frame, // Pass the original frame URL
      original_video_url: summary.original_video, // Add original video URL
    },
    chain_of_custody: [],
    recommendations: [],
  };

  return transformed;
}


// --- Polling Helper ---
// --- Polling Helper using Lookup Endpoint ---
async function pollJobStatus(jobId: string, token: string, file?: File): Promise<AnalysisResult> {
  console.log(`[ImageService] Polling Job ID via Lookup: ${jobId}`);
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    await new Promise(r => setTimeout(r, POLLING_INTERVAL_MS));
    attempts++;

    // Use LOOKUP_ENDPOINT to find the case by Job ID
    // Note: We use the raw fetch here to avoid circular dependency with searchService if any, 
    // but importing searchService's logic would be cleaner. 
    // Since searchService is simple, we can reproduce the specific lookup needed here 
    // or import it if the architecture permits. 
    // To be safe and self-contained, I will fetch using the LOOKUP logic pattern.

    // Using LOOKUP_ENDPOINT from imports
    const matchEndpoint = IMAGE_ANALYSIS_BASE_URL.replace('image-analysis-DTO', 'search-dto') + '/lookup'; // Or import LOOKUP_ENDPOINT if available in scope
    // Actually we imported IMAGE_ANALYSIS_BASE_URL. 
    // Let's import LOOKUP_ENDPOINT in the file properly or use the one we have.
    // I will assume I can fix imports in a separate block if needed, but for now I'll use a direct fetch to the endpoint I know.

    // Correction: I should update imports to include LOOKUP_ENDPOINT
    const lookupUrl = `${IMAGE_ANALYSIS_BASE_URL.replace('/functions/v1/image-analysis-DTO', '/functions/v1/search-dto')}/lookup`;

    const response = await fetch(lookupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ identifier: jobId })
    });

    if (!response.ok) {
      // If 404, it might mean the job is not yet indexed or found (still initializing?) or really missing.
      // We continue polling on 404 for a bit.
      console.warn(`[ImageService] Poll/Lookup attempt ${attempts} status: ${response.status}`);
      if (response.status === 404 && attempts < 10) continue;
      throw new Error(`Polling failed: ${response.status}`);
    }

    const data = await response.json();
    const stdCase = data.case; // The Lookup returns { case: ... }

    if (stdCase) {
      const status = stdCase.lifecycle?.job_status;
      console.log(`[ImageService] Poll attempt ${attempts} status: ${status}`);

      if (status === 'completed') {
        // Success! Return the case wrapped as AnalysisResult
        // We can reuse a simplified transform that just wraps the stdCase
        return {
          type: 'image_analysis', // match expected type
          meta: {
            job_id: stdCase.id,
            timestamp: stdCase.created_at,
            status: 'completed'
          },
          human_report: {} as any, // Legacy fillers
          raw_forensics: [],
          file_info: {} as any,
          chain_of_custody: [],
          recommendations: [],
          standardized_case: stdCase // THE IMPORTANT PART
        } as AnalysisResult;
      }

      if (status === 'failed') {
        throw new Error(stdCase.lifecycle?.failure_reason || 'Image analysis job failed');
      }
    }
  }
  throw new Error('Analysis timed out');
}

// --- Service Definition ---
export const imageAnalysisService = {
  submitJob: async (file: File): Promise<{ jobId?: string; result?: AnalysisResult }> => {
    try {
      console.log(`[ImageService] Submitting job for file: ${file.name} (${file.type})`);

      // 1. Convert file to Base64 (CPU task, no network needed yet)
      console.log('[ImageService] Starting Base64 conversion...');
      const base64 = await convertFileToBase64(file);
      console.log(`[ImageService] Base64 conversion complete. Length: ${base64.length}`);

      // 2. Get Session with Timeout
      console.log('[ImageService] requesting Supabase Session...');

      // Create a timeout promise
      const timeout = new Promise<{ data: { session: null } }>((_, reject) =>
        setTimeout(() => reject(new Error('Session retrieval timed out')), 5000)
      );

      const { data: { session } } = await Promise.race([
        supabase.auth.getSession(),
        timeout
      ]) as any;

      console.log('[ImageService] Session retrieved:', session ? 'Active' : 'Null');

      if (!session) {
        console.error('[ImageService] No active session found.');
        throw new Error('No active session');
      }
      const token = session.access_token;

      const useCache = import.meta.env.VITE_USE_CACHE === 'true';

      // Submit to /submit endpoint with Base64
      console.log(`[ImageService] Posting to: ${IMAGE_ANALYSIS_BASE_URL}/submit`);
      const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_base64: base64,
          use_cache: useCache,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ImageService] API Error:', response.status, errorData);
        throw new Error(errorData.error || `Image analysis submission failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ImageService] Submission successful:', data);

      // Extract jobId: API returns 'id' field
      const jobId = data.id || data.job_id;

      // Check if result is already available (cache hit)
      if (data.status === 'completed' && data.result) {
        console.log('[ImageService] Immediate result (Cache Hit)');
        return { jobId, result: transformApiResult(data, file) };
      }

      return { jobId };
    } catch (error) {
      console.error('[ImageService] CRITICAL ERROR in submitJob:', error);
      throw error;
    }
  },

  submitImage: async (file: File): Promise<AnalysisResult> => {
    const { jobId, result } = await imageAnalysisService.submitJob(file);
    if (result) return result;
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
      return transformApiResult(status, undefined);
    }
    throw new Error(`Job not complete (Status: ${status.status})`);
  }
};
