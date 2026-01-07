/**
 * Types definition based on openapi_mapa_desinfodemico.json version 5.1.0
 */

export interface KPIData {
  total_cases: number;
  active_cases: number;
  average_consensus: string;
  pi_generated: number;
  active_users: number;
}

export interface TimePoint {
  date: string;
  cases: number;
  validations: number;
  pi: number;
}

export interface RadarDimensions {
  magnitude: number;
  temporality: number;
  reach: number;
  impact: number;
  response: number;
}

export interface AMIMetrics {
  develops_rate: number;
  needs_focus_rate: number;
  supervision_rate: number;
  iami_score: string;
}

export interface ForensicMetrics {
  authentic_rate: number;
  manipulated_rate: number;
  ai_rate: number;
  deepfake_rate: number;
}

export interface EpidemiologicalMetrics {
  r0: string;
  transmission_speed: string;
  infectivity: string;
  virulence: string;
}

export interface IndicatorsGroup {
  ami: AMIMetrics;
  forensic: ForensicMetrics;
  epidemiological: EpidemiologicalMetrics;
}

export interface MetricCategory {
  [key: string]: string | number;
}

export interface DetailedMetrics {
  magnitude: {
    generation_rate: string;
    recurrence: string;
    source_diversity: number;
    content_concentration: string;
    incidence_rate: string;
  };
  temporality: {
    detection_time: string;
    transmission_speed: string;
    resolution_time: string;
    response_latency: string;
    peak_frequency: string;
  };
  reach: {
    viral_index: string;
    engagement: string;
    diffusion_rate: string;
    demographics: string;
    channel_amplitude: number;
  };
  impact: {
    cumulative_exposure: number;
    exposed_population: number;
    penetration_rate: string;
  };
  response: {
    effectiveness: string;
    consensus_rate: string;
    participation: number;
  };
}

export interface DashboardResponse {
  kpi: KPIData;
  evolution_chart: TimePoint[];
  radar_dimensions: RadarDimensions;
  indicators: IndicatorsGroup;
  detailed_metrics: DetailedMetrics;
}

export type TimeFrame = 'daily' | 'weekly' | 'monthly';
export type Region = 'andina' | 'caribe' | 'pacifica' | 'orinoquia' | 'amazonia' | 'insular' | 'global';
