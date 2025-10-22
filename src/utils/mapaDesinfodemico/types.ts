// API Request/Response Types for Mapa Desinfodémico

/**
 * Response when creating a new mapa job
 */
export interface MapaJobResponse {
  job_id: string;
  status: 'pending' | 'processing';
  message: string;
}

/**
 * Job status response
 */
export interface MapaJobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: MapaResult;
  error?: { message: string };
  created_at: string;
  completed_at?: string;
}

/**
 * Complete mapa desinfodémico result with all 8 dimensions
 */
export interface MapaResult {
  magnitude: MagnitudeDimension;
  temporality: TemporalityDimension;
  virulence: VirulenceDimension;
  geographic: GeographicDimension;
  descriptive: DescriptiveDimension;
  mitigation: MitigationDimension;
  evolucion_por_perfil: EvolucionPerfilDimension;
  tendencias_por_mecanismo: TendenciasMecanismoDimension;
  sources: SourceRanking[];
  timestamp: string;
}

/**
 * Dimensión 1: Magnitud
 * Cuantifica el volumen total de contenido reportado, detectado por IA y validado por humanos
 */
export interface MagnitudeDimension {
  noticias_reportadas: number;
  noticias_reportadas_mes: number; // Reports in last 30 days
  detectadas_por_ia: number;
  validadas_por_humanos: number;
  incremento_semanal: number;
  tiempo_promedio_deteccion: string; // "2.3h"
  tiempo_promedio_validacion: string; // "4.8h"
}

/**
 * Dimensión 2: Temporalidad
 * Evolución temporal de los casos en los últimos 90 días
 */
export interface TemporalityDimension {
  reportados: TimeSeriesPoint[];
  detectados: TimeSeriesPoint[];
  validados: TimeSeriesPoint[];
  tiempo_viralizacion_promedio: string; // Average viralization time
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  fecha: string; // "2025-01-15" (ISO date format)
  valor: number;
}

/**
 * Dimensión 3: Virulencia
 * Mide el potencial de propagación viral del contenido desinformativo
 */
export interface VirulenceDimension {
  indice_viralidad: number;
  nivel_engagement: number;
  casos_criticos: number;
  ventana_critica_horas: number;
  rango_viralizacion: {
    min: number;
    max: number;
    avg: number;
  };
  distribucion_viralidad: Record<string, number>; // {"1-10": 15, "11-50": 0, ...}
  vectores_principales: string[]; // ["WhatsApp", "Facebook", "Twitter"]
}

/**
 * Dimensión 4: Geográfica
 * Distribución espacial de los casos de desinformación por región
 */
export interface GeographicDimension {
  casos_por_region: Record<string, number>; // {"Bogotá": 450, "Antioquia": 320}
  region_mas_afectada: string;
  fuentes_origen: {
    Nacional: number;
    Internacional: number;
  };
  total_regiones_activas: number;
  clusters_espaciales: Array<{
    region: string;
    casos: number;
    porcentaje: number;
  }>;
}

/**
 * Dimensión 5: Descriptiva
 * Caracterización temática y clasificación del contenido desinformativo
 */
export interface DescriptiveDimension {
  temas_principales: Array<{
    tema: string;
    cantidad: number;
  }>;
  casos_por_plataforma: Record<string, number>; // {"URL": 15, "WhatsApp": 10}
  sector_mas_eficiente: string;
  clasificaciones: Record<string, number>; // {"Desinformación": 650, "Sátira": 234}
}

/**
 * Dimensión 6: Mitigación
 * Métricas de consenso entre IA y humanos, y recomendaciones de intervención
 */
export interface MitigationDimension {
  consenso_humano_ia: number; // 81.5 (percentage)
  casos_en_desacuerdo: number;
  distribucion_desacuerdo: Record<string, number>;
  noticias_mas_reportadas: Array<{
    id: string;
    url?: string;
    reportes: number;
  }>;
  casos_por_estado: {
    total: number;
    pendientes: number;
    detectados: number;
    validados: number;
  };
  vectores_contagio: Record<string, number>; // {"Texto": 15, "Imagen": 5}
  recomendaciones: InterventionRecommendation[];
}

/**
 * Intervention recommendation for epidemiological action
 */
export interface InterventionRecommendation {
  tipo: 'error' | 'warning' | 'info' | 'success';
  titulo: string;
  descripcion: string;
  prioridad: number; // 1 = highest priority
}

/**
 * Source ranking information
 */
export interface SourceRanking {
  ranking: number; // 1-10
  nombre: string; // "@noticiasfalsas_col"
  tipo: string; // "Twitter", "WhatsApp", etc.
  casos_detectados: number;
  porcentaje_total: number;
}

/**
 * Dimensión 7: Evolución por Perfil de Usuario
 * Análisis de actividad de reportes por usuario a través del tiempo
 */
export type EvolucionPerfilDimension = Array<{
  nombre: string;
  departamento: string;
  serie_temporal: TimeSeriesPoint[];
  total_reportes: number;
}>

/**
 * Dimensión 8: Tendencias por Mecanismo
 * Análisis de los mecanismos y técnicas de propagación de desinformación
 */
export type TendenciasMecanismoDimension = Array<{
  mecanismo: string; // "URL", "WhatsApp", "Twitter/X", etc.
  serie_temporal: TimeSeriesPoint[];
  total_reportes: number;
  porcentaje_total: number;
}>
