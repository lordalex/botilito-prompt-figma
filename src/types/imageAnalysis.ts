/**
 * TypeScript types for Image Analysis API
 * Based on OpenAPI spec: image-analysis-api.json v3.0.0
 * Sistema Forense de Detección Multimodal (Botilito v3)
 */

// ============================================
// API Response Types (from OpenAPI spec)
// ============================================

export type GlobalVerdict = 'CLEAN' | 'SUSPICIOUS' | 'TAMPERED';
export type InsightType = 'classic_algo' | 'ai_model' | 'metadata';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Individual insight from an analysis engine
 * Corresponds to: #/components/schemas/Insight
 * 
 * Required fields: algo, type, value, description
 * Optional fields: heatmap, mask, data
 */
export interface Insight {
    algo: string;           // Technical algorithm name (e.g., ELA, SLIC, CLONE, MOTION_FLOW)
    type: InsightType;      // Category: classic_algo, ai_model, or metadata
    value: number | string; // Confidence (0-1) or qualitative summary
    description: string;    // Spanish explanation of what this engine detects
    heatmap?: string;       // Base64 JET colormap visualization (Red=Suspect, Blue=Clean)
    mask?: string;          // Base64 binary mask (White/Black) isolating anomaly pixels
    data?: {                // Additional context data
        overlay?: string;           // Base64 image with red highlights on original
        software_detected?: string; // Detected software (e.g., "Photoshop CC 2024")
        motion_magnitude?: number;  // Motion flow magnitude
        execution_time?: string;    // Algorithm execution time
        [key: string]: any;         // Allow additional arbitrary data
    };
}

/**
 * Forensic analysis of a specific frame from the original source
 * Corresponds to: #/components/schemas/FrameAnalysis
 * 
 * For static images, frame_index is 0 and details contains a single element.
 * For videos, frame_index varies based on dynamic sampling.
 */
export interface FrameAnalysis {
    frame_index: number;      // Position in original sequence (0 for static images)
    original_frame?: string;  // Base64 capture of the original analyzed frame (for comparison with heatmap)
    max_score: number;        // Highest manipulation probability found among all insights
    insights: Insight[];      // Polymorphic collection of findings for this frame
}

/**
 * Summary of the analysis
 * Part of AnalysisResult
 */
export interface AnalysisSummary {
    global_score: number;       // 0.0 to 1.0
    global_verdict: GlobalVerdict;
}

/**
 * Main analysis result
 * Corresponds to: #/components/schemas/AnalysisResult
 */
export interface AnalysisResult {
    summary: AnalysisSummary;
    details: FrameAnalysis[];

    // Extended fields (added by frontend/enrichment)
    file_info?: FileInfo;
    chain_of_custody?: ChainOfCustodyEvent[];
    recommendations?: string[];
    local_image_url?: string;   // Client-side only

    // Legacy compatibility fields (for old format responses)
    meta?: AnalysisMeta;
    human_report?: HumanReport;
    raw_forensics?: RawForensicsItem[];
}

/**
 * Job status response from /status/{job_id}
 * Corresponds to: #/components/schemas/JobResponse
 */
export interface JobStatusResponse {
    id: string;
    status: JobStatus;
    error?: string | null;
    result?: AnalysisResult;
}

/**
 * Submit response from /submit
 * Corresponds to: #/components/schemas/SubmissionResponse
 */
export interface SubmitResponse {
    job_id: string;
    status: string;
    message?: string;
}

// ============================================
// Extended/Enrichment Types
// ============================================

export interface FileInfo {
    name: string;
    size_bytes: number;
    mime_type: string;
    dimensions: { width: number; height: number };
    created_at?: string;
    exif_data?: Record<string, any>;
}

export interface ChainOfCustodyEvent {
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    hash?: string;
}

// ============================================
// Legacy Types (for backward compatibility)
// ============================================

export interface AnalysisMeta {
    job_id: string;
    python_job_id?: string;
    timestamp: string;
    status?: JobStatus;
}

export interface Level1AnalysisItem {
    algorithm: string;
    significance_score: number;
    interpretation: string;
}

export interface Level2Integration {
    consistency_score: number;
    metadata_risk_score: number;
    tampering_type: 'Inexistente' | 'Global (Filtros)' | 'Local (Inserción/Clonado)';
    synthesis_notes: string;
}

export interface Level3Verdict {
    manipulation_probability: number;
    severity_index: number;
    final_label: 'Auténtico' | 'Baja Sospecha' | 'Alta Sospecha' | 'Confirmado Manipulado';
    user_explanation: string;
}

export interface HumanReport {
    level_1_analysis: Level1AnalysisItem[];
    level_2_integration: Level2Integration;
    level_3_verdict: Level3Verdict;
}

export interface RawForensicsSummary {
    score?: number;
    verdict?: string;
    heatmap?: string;
    tampered_region?: string;
}

export interface RawAlgorithmResult {
    name: string;
    score: number;
    heatmap?: string;
}

export interface RawExif {
    software_detected: boolean;
    software_name?: string;
    exif?: Record<string, string>;
}

export interface RawForensicsItem {
    summary: RawForensicsSummary;
    algorithms: RawAlgorithmResult[];
    metadata: RawExif;
}
