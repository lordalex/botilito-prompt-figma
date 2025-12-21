import { supabase } from '@/utils/supabase/client';
import { IMAGE_ANALYSIS_BASE_URL } from '@/lib/apiEndpoints';
import {
  AnalysisResult,
  JobStatusResponse,
  FrameAnalysis,
  Insight,
  ChainOfCustodyEvent,
  FileInfo
} from '@/types/imageAnalysis';

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

/**
 * Normalize individual insight per OpenAPI spec
 * Schema reference: #/components/schemas/Insight
 * 
 * Required fields: algo, type, value, description
 * Optional fields: heatmap, mask, data
 */
function normalizeInsight(insight: any): Insight {
  return {
    // Required: Technical algorithm name (e.g., ELA, SLIC, CLONE, MOTION_FLOW)
    algo: insight.algo || insight.name || 'Unknown',
    // Required: Category enum - classic_algo, ai_model, or metadata
    type: insight.type || 'classic_algo',
    // Required: Confidence (0-1) or qualitative summary
    value: insight.value ?? insight.score ?? 0,
    // Required: Spanish explanation of what this engine detects
    description: insight.description || '',
    // Optional: Base64 JET colormap visualization (Red=Suspect, Blue=Clean)
    heatmap: insight.heatmap,
    // Optional: Base64 binary mask (White/Black) isolating anomaly pixels
    mask: insight.mask,
    // Optional: Additional context data
    data: insight.data
  };
}


/**
 * Normalize API response to match our AnalysisResult type
 * TRUTH BASE: image-analysis-api.json (OpenAPI v3.0.0)
 * 
 * This parser is the source of truth for mapping API responses to our types.
 * It handles both the new OpenAPI format and legacy formats for backward compatibility.
 */
function normalizeAnalysisResult(raw: any): AnalysisResult {
  // Check if it's already in the new OpenAPI format (has summary.global_verdict and details)
  if (raw.summary && raw.summary.global_verdict !== undefined && Array.isArray(raw.details)) {
    // New format - matches OpenAPI spec exactly
    // Schema reference: #/components/schemas/AnalysisResult
    return {
      summary: {
        // Schema: summary.global_score (number, 0.0 to 1.0)
        global_score: raw.summary.global_score ?? raw.summary.score ?? 0,
        // Schema: summary.global_verdict (enum: CLEAN, SUSPICIOUS, TAMPERED)
        global_verdict: raw.summary.global_verdict
      },
      // Schema: details (array of FrameAnalysis)
      details: raw.details.map((frame: any) => ({
        // Schema: FrameAnalysis.frame_index (integer, 0 for static images)
        frame_index: frame.frame_index ?? 0,
        // Schema: FrameAnalysis.original_frame (Base64 string, optional)
        original_frame: frame.original_frame,
        // Schema: FrameAnalysis.max_score (number, highest manipulation probability)
        max_score: frame.max_score ?? 0,
        // Schema: FrameAnalysis.insights (array of Insight)
        insights: (frame.insights || []).map((insight: any) => normalizeInsight(insight))
      })) as FrameAnalysis[]
    };
  }

  // Legacy format handling - convert to new structure
  // This handles old responses with human_report/raw_forensics structure
  const summary = {
    global_score: raw.summary?.global_score ?? raw.summary?.score ?? 0,
    global_verdict: raw.summary?.global_verdict ?? 'SUSPICIOUS' as const
  };

  // Convert legacy details/algorithms to insights
  let details: FrameAnalysis[] = [];

  if (raw.details && Array.isArray(raw.details)) {
    details = raw.details.map((detail: any, idx: number) => {
      // Handle both old format (algorithms array in details) and new format
      const insights: Insight[] = [];

      // Old format: detail.algorithms
      if (detail.algorithms && Array.isArray(detail.algorithms)) {
        detail.algorithms.forEach((alg: any) => {
          insights.push(normalizeInsight({
            algo: alg.name,
            type: 'classic_algo',
            value: alg.score,
            description: `Score: ${((alg.score ?? 0) * 100).toFixed(1)}%`,
            heatmap: alg.heatmap,
            mask: alg.mask
          }));
        });
      }

      // New format: detail.insights - use normalizeInsight for consistency
      if (detail.insights && Array.isArray(detail.insights)) {
        detail.insights.forEach((ins: any) => {
          insights.push(normalizeInsight(ins));
        });
      }

      return {
        frame_index: detail.frame_index ?? idx,
        // Capture original_frame from legacy format if present
        original_frame: detail.original_frame,
        max_score: detail.max_score ?? detail.summary?.score ?? 0,
        insights
      };
    });
  }

  return {
    summary,
    details,
    // Preserve any existing extended fields
    file_info: raw.file_info,
    chain_of_custody: raw.chain_of_custody,
    recommendations: raw.recommendations,
    // Preserve legacy fields for backward compatibility
    meta: raw.meta,
    human_report: raw.human_report,
    raw_forensics: raw.raw_forensics
  };
}

/**
 * Enrich normalized result with client-side data
 */
function enrichAnalysisResult(result: AnalysisResult, file?: File): AnalysisResult {
  const enriched = { ...result };

  // Generate timestamp from available sources
  const timestamp = (result as any).meta?.timestamp ||
    (result as any).created_at ||
    new Date().toISOString();

  // 1. Chain of Custody (Simulation if missing)
  if (!enriched.chain_of_custody || enriched.chain_of_custody.length === 0) {
    enriched.chain_of_custody = [
      {
        timestamp: timestamp,
        action: "Caso creado",
        actor: "Sistema Botilito",
        details: "Recepción de archivo y asignación de ID único.",
        hash: "pending-hash"
      },
      {
        timestamp: new Date().toISOString(),
        action: "Análisis finalizado",
        actor: "Motor IA",
        details: "Generación de reporte forense."
      }
    ];
  }

  // 2. File Info enrichment from client file
  if (!enriched.file_info && file) {
    enriched.file_info = {
      name: file.name,
      size_bytes: file.size,
      mime_type: file.type,
      dimensions: { width: 0, height: 0 },
      created_at: new Date().toISOString()
    };
  }

  // 3. Generate recommendations based on verdict
  if (!enriched.recommendations) {
    const verdict = enriched.summary?.global_verdict;
    if (verdict === 'TAMPERED' || verdict === 'SUSPICIOUS') {
      enriched.recommendations = [
        'Verificar la fuente original del archivo',
        'Revisar metadatos EXIF para inconsistencias',
        'Considerar análisis forense adicional',
        'No utilizar como evidencia sin verificación'
      ];
    } else {
      enriched.recommendations = [
        'La imagen parece auténtica',
        'Verificar procedencia antes de uso'
      ];
    }
  }

  return enriched;
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
      if (response.status === 404 && attempts < 5) continue;
      throw new Error(`Polling failed: ${response.status}`);
    }

    const data = await response.json();

    // Handle error field (can be string or object per OpenAPI spec)
    if (data.status === 'failed') {
      const errorMsg = typeof data.error === 'string'
        ? data.error
        : data.error?.message || 'Image analysis failed';
      throw new Error(errorMsg);
    }

    if (data.status === 'completed' && data.result) {
      const normalized = normalizeAnalysisResult(data.result);
      return enrichAnalysisResult(normalized, file);
    }
  }

  throw new Error('Analysis timed out');
}

export const imageAnalysisService = {
  /**
   * Submit image for analysis
   * Based on OpenAPI /submit endpoint
   */
  submitJob: async (file: File): Promise<{ jobId?: string; result?: AnalysisResult }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const base64 = await convertFileToBase64(file);

    // OpenAPI spec requires image_base64 field
    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        image_base64: base64
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Submission failed: ${response.status}`);
    }

    const data = await response.json();
    return { jobId: data.job_id };
  },

  /**
   * Submit image and wait for result (blocking)
   */
  submitImage: async (file: File): Promise<AnalysisResult> => {
    const { jobId } = await imageAnalysisService.submitJob(file);
    if (!jobId) throw new Error("No Job ID returned");

    const { data: { session } } = await supabase.auth.getSession();
    return await pollJobStatus(jobId, session?.access_token || '', file);
  },

  /**
   * Get job status by ID
   * Based on OpenAPI /status/{job_id} endpoint
   */
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`${IMAGE_ANALYSIS_BASE_URL}/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });

    if (!response.ok) throw new Error(`Status check failed: ${response.status}`);

    const data = await response.json();

    // Normalize the result if present
    if (data.result) {
      data.result = normalizeAnalysisResult(data.result);
    }

    return data as JobStatusResponse;
  },

  /**
   * Get completed analysis result
   */
  getAnalysisResult: async (jobId: string): Promise<AnalysisResult> => {
    const status = await imageAnalysisService.getJobStatus(jobId);
    if (status.status === 'completed' && status.result) {
      return enrichAnalysisResult(status.result);
    }
    throw new Error(`Job not complete (Status: ${status.status})`);
  }
};
