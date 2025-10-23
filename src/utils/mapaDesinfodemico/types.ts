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
 * Complete mapa desinfodémico result with all dimensions
 * NEW STRUCTURE - matches Edge Function payload
 */
export interface MapaResult {
  timestamp: string;
  global_kpis: GlobalKPIs;
  dimension_magnitud: DimensionMagnitud;
  dimension_temporalidad: DimensionTemporalidad;
  dimension_alcance_virulencia: DimensionAlcanceVirulencia;
  dimension_geografica: DimensionGeografica;
  dimension_descriptiva: DimensionDescriptiva;
  dimension_mitigacion: DimensionMitigacion;
}

/**
 * Global epidemiological KPIs
 */
export interface GlobalKPIs {
  casos_activos: number;
  tasa_reproduccion_r0: number;
  indice_gravedad_igc: number;
  tiempo_deteccion: string;
  infectividad: number;
  virulencia: number;
}

/**
 * Base structure for dimension with indicators, charts, and tables
 */
export interface DimensionMagnitud {
  indicadores: {
    noticias_reportadas_totales: number;
    noticias_reportadas_mes: number;
    detectadas_por_ia: number;
    validadas_por_humanos: number;
    incremento_semanal: number;
    tiempo_promedio_deteccion: string;
    tiempo_promedio_validacion: string;
  };
  graficos: {
    evolucion_temporal: Array<{ fecha: string; reportados: number; detectados: number; validados: number }>;
  };
  tablas: {
    resumen: Array<{
      metrica: string;
      valor: string | number;
      tendencia: string;
    }>;
  };
}

export interface DimensionTemporalidad {
  indicadores: {
    tiempo_promedio_deteccion: string;
    ventana_critica_horas: number;
    casos_pico_reciente: number;
    fecha_pico_reciente: string;
    tiempo_viralizacion_promedio: string;
  };
  graficos: {
    serie_temporal_reportados: TimeSeriesPoint[];
    serie_temporal_detectados: TimeSeriesPoint[];
    serie_temporal_validados: TimeSeriesPoint[];
  };
  tablas: {
    metricas_temporales: Array<{
      metrica: string;
      valor: string;
      interpretacion: string;
    }>;
  };
}

export interface DimensionAlcanceVirulencia {
  indicadores: {
    indice_viralidad: number;
    nivel_engagement: number;
    casos_criticos: number;
    tasa_reproduccion_efectiva: number;
    infectividad: number;
    virulencia: number;
  };
  graficos: {
    distribucion_viralidad: Array<{ rango: string; cantidad: number }>;
    vectores_principales: Array<{ vector: string; casos: number }>;
  };
  tablas: {
    metricas_virulencia: Array<{
      metrica: string;
      valor: string | number;
      estado: string;
    }>;
    casos_criticos: Array<{
      id: string;
      viralidad: number;
      vector: string;
    }>;
  };
}

export interface DimensionGeografica {
  indicadores: {
    total_regiones_activas: number;
    region_mas_afectada: string;
    casos_region_principal: number;
    fuentes_nacionales: number;
    fuentes_internacionales: number;
  };
  tablas: {
    casos_por_region: Array<{
      region: string;
      casos: number;
      porcentaje: number;
    }>;
    clusters_espaciales: Array<{
      region: string;
      casos: number;
      porcentaje: number;
    }>;
  };
}

export interface DimensionDescriptiva {
  indicadores: {
    temas_identificados: number;
    tema_predominante: string;
    plataforma_principal: string;
    sector_mas_eficiente: string;
  };
  graficos: {
    temas_principales: Array<{ tema: string; cantidad: number }>;
    distribucion_plataformas: Array<{ plataforma: string; casos: number }>;
    clasificaciones: Array<{ clasificacion: string; cantidad: number }>;
  };
}

export interface DimensionMitigacion {
  indicadores: {
    consenso_humano_ia: number;
    casos_en_desacuerdo: number;
    tasa_validacion_exitosa: number;
    casos_pendientes: number;
    casos_detectados: number;
    casos_validados: number;
  };
}

/**
 * LEGACY INTERFACES - kept for backward compatibility during transition
 * These will be deprecated once transformer is fully updated
 */
export interface MagnitudeDimension {
  noticias_reportadas: number;
  noticias_reportadas_mes: number;
  detectadas_por_ia: number;
  validadas_por_humanos: number;
  incremento_semanal: number;
  tiempo_promedio_deteccion: string;
  tiempo_promedio_validacion: string;
}

export interface TemporalityDimension {
  reportados: TimeSeriesPoint[];
  detectados: TimeSeriesPoint[];
  validados: TimeSeriesPoint[];
  tiempo_viralizacion_promedio: string;
}

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
  distribucion_viralidad: Record<string, number>;
  vectores_principales: string[];
}

export interface GeographicDimension {
  casos_por_region: Record<string, number>;
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

export interface DescriptiveDimension {
  temas_principales: Array<{
    tema: string;
    cantidad: number;
  }>;
  casos_por_plataforma: Record<string, number>;
  sector_mas_eficiente: string;
  clasificaciones: Record<string, number>;
}

export interface MitigationDimension {
  consenso_humano_ia: number;
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
  vectores_contagio: Record<string, number>;
  recomendaciones: InterventionRecommendation[];
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  fecha: string; // "2025-01-15" (ISO date format)
  valor: number;
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
