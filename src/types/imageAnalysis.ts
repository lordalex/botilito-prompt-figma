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
    diagnosis: string; // Renamed from diagnosis_text to match service
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

export interface TestResult {
    id: string;
    name: string;
    description: string;
    verdict: TestVerdict;
    confidence: number;
    executionTimeMs: number; // Renamed from execution_time_seconds to match service usage
    // Removed "type" if not used or make optional
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

export interface AnalysisResult {
    meta: AnalysisMeta;
    summary: AnalysisSummary;
    file_info: FileInfo;
    stats: AnalysisStats;
    details: TestResult[];
    markers: Marker[];
    recommendations: string[];
}
