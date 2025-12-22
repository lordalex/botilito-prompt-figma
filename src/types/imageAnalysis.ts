export type GlobalVerdict = 'AUTHENTIC' | 'TAMPERED' | 'UNKNOWN'; // Compatible adapter type
export type TestVerdict = 'AUTHENTIC' | 'TAMPERED' | 'INCONCLUSIVE'; // Compatible adapter type

export interface AnalysisMeta {
    job_id: string;
    python_job_id?: string;
    timestamp: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
}

// Level 1: Individual Algorithms
export interface Level1AnalysisItem {
    algorithm: string; // "ELA", "Noise", "SLIC", "Ghosting", "Clone"
    significance_score: number; // 0.0 - 1.0
    interpretation: string;
}

// Level 2: Integration
export interface Level2Integration {
    consistency_score: number;
    metadata_risk_score: number;
    tampering_type: 'Inexistente' | 'Global (Filtros)' | 'Local (Inserción/Clonado)';
    synthesis_notes: string;
}

// Level 3: Verdict
export interface Level3Verdict {
    manipulation_probability: number; // 0-100
    severity_index: number; // 0-1
    final_label: 'Auténtico' | 'Baja Sospecha' | 'Alta Sospecha' | 'Confirmado Manipulado';
    user_explanation: string;
}

export interface HumanReport {
    level_1_analysis: Level1AnalysisItem[];
    level_2_integration: Level2Integration;
    level_3_verdict: Level3Verdict;
}

// Raw Forensics
export interface RawForensicsSummary {
    score?: number;
    verdict?: string;
    heatmap?: string; // base64
    tampered_region?: string; // base64
}

export interface RawAlgorithmResult {
    name: string;
    score: number;
    heatmap?: string; // base64
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

// Main Result
export interface AnalysisResult {
    meta: AnalysisMeta;
    human_report: HumanReport;
    raw_forensics: RawForensicsItem[];

    // Legacy/Adapter fields (optional to ease transition if needed, but we should try to use new ones)
    file_info?: FileInfo;
    chain_of_custody?: ChainOfCustodyEvent[];
    recommendations?: string[];
    local_image_url?: string; // Client-side only
}

export interface FileInfo {
    name: string;
    size_bytes: number;
    mime_type: string;
    dimensions: { width: number; height: number };
    created_at?: string;
    exif_data?: Record<string, any>;
    url?: string;
}

export interface ChainOfCustodyEvent {
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    hash?: string;
}

// API Responses
export interface SubmitResponse {
    job_id: string;
    status: string;
}

export interface JobStatusResponse {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    current_step?: string;
    error?: { message: string };
    result?: AnalysisResult;
}
