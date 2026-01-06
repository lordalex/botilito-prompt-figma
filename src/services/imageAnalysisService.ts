import { supabase } from '@/utils/supabase/client';
import { IMAGE_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import { AnalysisResult, JobStatusResponse } from '@/types/imageAnalysis';

// Re-export for external use
export type { JobStatusResponse } from '@/types/imageAnalysis';

const POLLING_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 60; // 2 minutes max
const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB

// --- Hashing Utility ---
async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Data Transformation ---
function transformApiResult(status: JobStatusResponse, file?: File): AnalysisResult {
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
      recommendations: [] // Service can derive if needed, or component does it
    };
  }

  // 2. Legacy Fallback
  const forensicResult = status.result || {};
  const aiAnalysis = forensicResult.ai_analysis || {};
  const details = forensicResult.details || [];
  const summary = forensicResult.summary || {};

  const transformed: AnalysisResult = {
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
async function pollJobStatus(jobId: string, token: string, file?: File): Promise<AnalysisResult> {
  let attempts = 0;
  while (attempts < MAX_ATTEMPTS) {
    await new Promise(r => setTimeout(r, POLLING_INTERVAL_MS));
    attempts++;

    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 404 && attempts < 5) continue;
      throw new Error(`Polling failed: ${response.status}`);
    }

    const data: JobStatusResponse = await response.json();

    if (data.status === 'completed') {
      return transformApiResult(data, file);
    }

    if (data.status === 'failed') {
      throw new Error(data.error?.message || 'Image analysis failed');
    }
  }
  throw new Error('Analysis timed out');
}

// --- Service Definition ---
export const imageAnalysisService = {
  submitJob: async (file: File): Promise<{ jobId?: string; result?: AnalysisResult }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');
    const token = session.access_token;

    // 1. Get file hash
    const fileHash = await getFileHash(file);
    const useCache = import.meta.env.VITE_USE_CACHE === 'true';

    // 2. Init Upload
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const initResponse = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/upload_session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        action: 'init',
        filename: file.name,
        total_chunks: totalChunks,
        total_size: file.size,
        file_hash: fileHash,
        use_cache: useCache,
      }),
    });

    if (!initResponse.ok) throw new Error('Upload initialization failed.');
    const initData = await initResponse.json();

    if (initData.job_id && initData.status === 'completed' && initData.result) {
      // This would be a cache hit if the API returned the result on init
      return { jobId: initData.job_id, result: transformApiResult(initData, file) };
    }

    const uploadId = initData.upload_id;
    if (!uploadId) throw new Error('Failed to get upload_id from server.');

    // 3. Upload Chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('action', 'chunk');
      formData.append('upload_id', uploadId);
      formData.append('chunk_index', String(i));
      formData.append('chunk_data', chunk);

      const chunkResponse = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/upload_session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!chunkResponse.ok) throw new Error(`Chunk ${i} upload failed.`);
    }

    // 4. Finish Upload
    const finishResponse = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/upload_session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        action: 'finish',
        upload_id: uploadId,
        file_hash: fileHash,
      }),
    });

    if (!finishResponse.ok) throw new Error('Upload finalization failed.');
    const finishData = await finishResponse.json();

    return { jobId: finishData.job_id };
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
