export type GlobalVerdict = 'AUTHENTIC' | 'TAMPERED' | 'UNKNOWN';
export type TestVerdict = 'AUTHENTIC' | 'TAMPERED' | 'INCONCLUSIVE';

export interface AnalysisMeta {
    id: string; // Added id
    timestamp: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisSummary {
    global_verdict: GlobalVerdict;
    confidence_score: number;
    risk_score: number; // 0-100
    diagnosis: string;
    heatmap?: string; // base64
    tampered_region?: string; // base64 (mask/composite)
    original_image?: string; // base64 or url if returned
}

export interface FileInfo {
    name: string; // Added name
    size_bytes: number;
    mime_type: string;
    dimensions: { width: number; height: number };
    created_at?: string;
    exif_data: Record<string, any>;
}

export interface AnalysisStats {
    tests_executed: number;
    markers_found: number;
    processing_time_ms: number; // Added processing_time_ms
}

export interface AlgorithmResult {
    name: string;
    description?: string; // made optional as payload might not have it
    verdict?: TestVerdict; // made optional
    confidence?: number; // made optional
    score?: number; // added score from payload
    executionTimeMs?: number;
    heatmap?: string; // base64
}

export interface Marker {
    id: string;
    type: string; // Using string to allow flexibility
    description: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical'; // Adjusted case to match service if needed, but easier to fix service to match this if standard.
    // actually service used 'high' lowercase. I will update types to allow lowercase or update service. 
    // Let's allow lowercase here as it's more standard in JSON usually.
    location: any; // Simplified for now
    category: string; // Added to match UI usage
    evidence: string; // Added to match UI usage
}

export interface AnalysisDetail {
    summary: AnalysisSummary;
    algorithms: AlgorithmResult[];
}

export interface AnalysisResult {
    meta: AnalysisMeta;
    summary: AnalysisSummary;
    file_info?: FileInfo; // file_info is sometimes inside details or meta, making optional here
    stats?: AnalysisStats; // stats might not be in the new payload structure directly
    details: AnalysisDetail[]; // Changed from TestResult[] nested inside
    markers?: Marker[];
    recommendations?: string[];
}
