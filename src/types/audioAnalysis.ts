export type AudioAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AudioMeta {
    job_id: string;
    timestamp: string;
    status?: AudioAnalysisStatus;
    current_step?: string;
}

// Types from audio-analysis-api.json
export interface AudioAnalysisContent {
  type: string;
  structure_notes: string;
}

export interface AudioAnalysisForensics {
  is_synthetic: boolean;
  confidence_score: number;
  manipulation_type: 'Ninguna' | 'Clonación' | 'Edición';
  explanation: string;
}

export interface AudioAnalysisDetails {
  content: AudioAnalysisContent;
  forensics: AudioAnalysisForensics;
}

export interface AudioAssets {
  report_html: string;
  spectrogram: string;
}

export interface AudioMetadata {
  type: 'audio';
  duration: number;
  engine_job_id: string;
  audio_url: string;
  analysis: AudioAnalysisDetails;
  assets: AudioAssets;
}

export interface AudioApiAnalysisResult {
  title: string;
  content: string;
  transcription: string;
  metadata: AudioMetadata;
}
// End: types from audio-analysis-api.json


// Human Report for Audio Analysis - This structure is likely inside the datos_json
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

// Raw Results Summary - This structure is likely inside the datos_json
export interface AudioRawResultsSummary {
    duration_seconds?: number;
    sample_rate?: number;
    channels?: number;
    format?: string;
    file_size_bytes?: number;
    spectral_analysis?: Record<string, any>;
    waveform_data?: number[];
}

// Main Audio Analysis Result for UI
export interface AudioAnalysisResult {
    type: 'audio_analysis';
    meta: AudioMeta;
    human_report: AudioHumanReport;
    raw_results_summary?: AudioRawResultsSummary;

    // New field to hold cloud resources
    assets?: AudioAssets;

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
    result?: AudioApiAnalysisResult;
    payload?: AudioApiAnalysisResult;
    created_at?: string;
    completed_at?: string;
}