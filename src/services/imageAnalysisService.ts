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
    const forensicResult = status.result || {};
    const aiAnalysis = forensicResult.ai_analysis || {};
    const details = forensicResult.details || [];
    const summary = forensicResult.summary || {};
    const metadataInsight = details[0]?.insights?.find((i: any) => i.algo === 'Metadatos')?.data || {};
    const exifData = metadataInsight.exif || {};

    const transformed: AnalysisResult = {
        meta: {
            job_id: status.id,
            timestamp: status.completed_at || new Date().toISOString(),
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
            metadata: {
                exif: exifData,
                software_detected: !!metadataInsight.software_name,
                software_name: metadataInsight.software_name
            }
        })),
        file_info: {
            name: file?.name || metadataInsight.filename || 'image.jpg',
            size_bytes: file?.size || metadataInsight.size_bytes || 0,
            mime_type: file?.type || `image/${metadataInsight.format?.toLowerCase()}` || 'image/jpeg',
            dimensions: { 
                width: metadataInsight.width || 0,
                height: metadataInsight.height || 0
            },
            created_at: status.created_at || new Date().toISOString(),
            url: details[0]?.original_frame, // Pass the original frame URL
            original_video_url: summary.original_video, // Add original video URL
            exif_data: exifData,
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
