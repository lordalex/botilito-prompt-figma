export type AudioAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AudioMeta {
    job_id: string;
    timestamp: string;
    status?: AudioAnalysisStatus;
    current_step?: string;
}

// Human Report for Audio Analysis
export interface AudioHumanReport {
    summary: string;
    transcription?: {
        text: string;
        language?: string;
        confidence?: number;
        segments?: Array<{
            start_time: number;
            end_time: number;
            text: string;
            speaker?: string;
        }>;
    };
    speaker_analysis?: {
        num_speakers: number;
        speakers?: Array<{
            id: string;
            segments: Array<{ start_time: number; end_time: number }>;
        }>;
    };
    audio_forensics?: {
        authenticity_score: number;
        manipulation_detected: boolean;
        anomalies?: string[];
    };
    sentiment_analysis?: {
        overall_sentiment: 'positive' | 'negative' | 'neutral';
        confidence: number;
    };
    verdict: {
        conclusion: string;
        confidence: number;
        risk_level: 'low' | 'medium' | 'high' | 'critical';
    };
}

// Raw Results Summary
export interface AudioRawResultsSummary {
    duration_seconds?: number;
    sample_rate?: number;
    channels?: number;
    format?: string;
    file_size_bytes?: number;
    spectral_analysis?: Record<string, any>;
    waveform_data?: number[];
}

// Main Audio Analysis Result
export interface AudioAnalysisResult {
    type: 'audio_analysis';
    meta: AudioMeta;
    human_report: AudioHumanReport;
    raw_results_summary?: AudioRawResultsSummary;

    // Optional fields for compatibility
    file_info?: AudioFileInfo;
    chain_of_custody?: ChainOfCustodyEvent[];
    recommendations?: string[];
    local_audio_url?: string; // Client-side only for playback
}

export interface AudioFileInfo {
    name: string;
    size_bytes: number;
    mime_type: string;
    duration_seconds: number;
    created_at?: string;
    metadata?: Record<string, any>;
}

export interface ChainOfCustodyEvent {
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    hash?: string;
}

// API Responses
export interface AudioSubmitResponse {
    job_id: string;
    status: string;
}

export interface AudioJobStatusResponse {
    id: string;
    status: AudioAnalysisStatus;
    current_step?: string;
    error?: { message: string };
    result?: AudioAnalysisResult;
    created_at?: string;
    completed_at?: string;
}
