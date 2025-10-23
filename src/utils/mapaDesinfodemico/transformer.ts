import type { MapaResult, TimeSeriesPoint } from './types';

/**
 * Transform Edge Function API response to dashboard format
 * BACKWARD COMPATIBLE: Handles both old and new API structures
 *
 * NEW STRUCTURE (from Edge Function):
 * - global_kpis: { casos_activos, tasa_reproduccion_r0, indice_gravedad_igc, ... }
 * - dimension_magnitud: { indicadores: {...}, graficos: {...}, tablas: {...} }
 * - dimension_temporalidad: { indicadores: {...}, graficos: {...}, tablas: {...} }
 * - dimension_alcance_virulencia: { indicadores: {...}, graficos: {...}, tablas: {...} }
 * - dimension_geografica: { indicadores: {...}, tablas: {...} }
 * - dimension_descriptiva: { indicadores: {...}, graficos: {...} }
 * - dimension_mitigacion: { indicadores: {...} }
 *
 * OLD STRUCTURE (legacy):
 * - magnitude, temporality, virulence, geographic, descriptive, mitigation
 */
export function transformMapaData(apiData: MapaResult) {
  // Check if this is the NEW structure or OLD structure
  const isNewStructure = 'dimension_magnitud' in apiData && apiData.dimension_magnitud !== undefined;

  if (isNewStructure) {
    return transformNewStructure(apiData);
  } else {
    return transformOldStructure(apiData);
  }
}

/**
 * Transform NEW Edge Function structure
 */
function transformNewStructure(apiData: any) {
  const { global_kpis, dimension_magnitud, dimension_temporalidad, dimension_alcance_virulencia,
          dimension_geografica, dimension_descriptiva, dimension_mitigacion } = apiData;

  return {
    // ===== DIMENSIÓN 1: MAGNITUD =====
    datosMagnitud: {
      noticiasReportadas: dimension_magnitud.indicadores.noticias_reportadas_totales,
      noticiasReportadasSemana: dimension_magnitud.indicadores.incremento_semanal,
      noticiasReportadasMes: dimension_magnitud.indicadores.noticias_reportadas_mes,
      deteccionesPorIA: dimension_magnitud.indicadores.detectadas_por_ia,
      deteccionesPorHumanos: dimension_magnitud.indicadores.validadas_por_humanos,
      tiempoDeteccionIA: parseTimeString(dimension_magnitud.indicadores.tiempo_promedio_deteccion),
      tiempoDeteccionHumanos: parseTimeString(dimension_magnitud.indicadores.tiempo_promedio_validacion),
      // For sources, we'll use top regions from geographic dimension as proxy
      fuentesGeneradoras: dimension_geografica.tablas.casos_por_region
        .slice(0, 5)
        .map(item => ({
          fuente: item.region,
          casos: item.casos,
          tipo: 'Región'
        }))
    },

    // ===== DIMENSIÓN 2: TEMPORALIDAD =====
    datosTemporalidad: {
      velocidadDeteccion: parseTimeString(dimension_temporalidad.indicadores.tiempo_promedio_deteccion),
      tiempoViralizacionPromedio: parseTimeString(dimension_temporalidad.indicadores.tiempo_viralizacion_promedio || "0h"),
      evolucionSemanal: transformToWeeklySeries(
        dimension_temporalidad.graficos.serie_temporal_reportados,
        dimension_temporalidad.graficos.serie_temporal_detectados,
        dimension_temporalidad.graficos.serie_temporal_validados
      ),
      // Mock data for comparative analysis (not yet in API)
      comparativaVerdaderasVsFalsas: [
        { tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 },
        { tipo: 'Falsas', interacciones: 8975, tiempo: 4.8 }
      ]
    },

    // ===== DIMENSIÓN 3: ALCANCE/VIRULENCIA =====
    datosAlcance: {
      indiceViralidad: dimension_alcance_virulencia.indicadores.indice_viralidad,
      casosCriticos: dimension_alcance_virulencia.indicadores.casos_criticos,
      vectoresPrincipales: dimension_alcance_virulencia.graficos.vectores_principales.map(v => v.vector),
      rangoViralizacion: {
        min: 0, // Not explicitly provided in new structure
        max: 100,
        promedio: dimension_alcance_virulencia.indicadores.indice_viralidad
      },
      nivelEngagement: dimension_alcance_virulencia.indicadores.nivel_engagement,
      efectividadAlcance: {
        verdaderas: 3250, // Mock data
        falsas: 8975,
        ratio: 0.36
      },
      distribucionViralidad: dimension_alcance_virulencia.graficos.distribucion_viralidad.map(item => ({
        rango: item.rango,
        casos: item.cantidad,
        porcentaje: Math.round((item.cantidad / dimension_magnitud.indicadores.noticias_reportadas_totales) * 100)
      }))
    },

    // ===== DIMENSIÓN 4: GEOGRÁFICA =====
    datosGeograficos: {
      casosPorRegion: dimension_geografica.tablas.casos_por_region.map(item => ({
        region: item.region,
        casos: item.casos,
        densidad: calculateDensity(item.casos).toFixed(1),
        color: getRegionColor(item.region)
      })),
      regionMasAfectada: dimension_geografica.indicadores.region_mas_afectada,
      fuentesInternacionalesVsNacionales: {
        internacionales: dimension_geografica.indicadores.fuentes_internacionales,
        nacionales: dimension_geografica.indicadores.fuentes_nacionales,
        porcentajeInternacional: Math.round(
          (dimension_geografica.indicadores.fuentes_internacionales /
            (dimension_geografica.indicadores.fuentes_internacionales + dimension_geografica.indicadores.fuentes_nacionales)) * 100
        ) || 0
      },
      mapaCalor: dimension_geografica.tablas.casos_por_region
        .slice(0, 5)
        .map(item => ({
          departamento: item.region,
          casos: item.casos,
          lat: getCoordinatesForRegion(item.region).lat,
          lon: getCoordinatesForRegion(item.region).lon
        })),
      totalRegionesActivas: dimension_geografica.indicadores.total_regiones_activas,
      clustersEspaciales: dimension_geografica.tablas.clusters_espaciales
    },

    // ===== DIMENSIÓN 5: DESCRIPTIVA =====
    datosDescriptivos: {
      porSector: dimension_descriptiva.graficos.temas_principales.map(tema => ({
        sector: tema.tema,
        casos: tema.cantidad,
        porcentaje: Math.round((tema.cantidad / dimension_magnitud.indicadores.noticias_reportadas_totales) * 100)
      })),
      plataformasPropagacion: dimension_descriptiva.graficos.distribucion_plataformas
        .map(plat => ({
          plataforma: plat.plataforma,
          casos: plat.casos,
          porcentaje: Math.round((plat.casos / dimension_magnitud.indicadores.noticias_reportadas_totales) * 100)
        }))
        .sort((a, b) => b.casos - a.casos)
        .slice(0, 5),
      personalidadesAtacadas: [
        // Mock data (not yet in API)
        { nombre: 'Presidente de la República', ataques: 234 },
        { nombre: 'Alcalde de Bogotá', ataques: 189 }
      ],
      sectorMasEficiente: {
        sector: dimension_descriptiva.indicadores.sector_mas_eficiente,
        alcancePromedio: 12500, // Mock
        viralidad: dimension_alcance_virulencia.indicadores.indice_viralidad
      }
    },

    // ===== DIMENSIÓN 6: MITIGACIÓN =====
    datosMitigacion: {
      consensoValidacionHumana: dimension_mitigacion.indicadores.consenso_humano_ia,
      consensoHumanoVsIA: {
        acuerdo: Math.round(dimension_mitigacion.indicadores.consenso_humano_ia),
        desacuerdo: Math.round(100 - dimension_mitigacion.indicadores.consenso_humano_ia)
      },
      casosEnDesacuerdo: dimension_mitigacion.indicadores.casos_en_desacuerdo,
      distribucionDesacuerdo: [
        // Mock data structure (not explicitly in new API)
        { categoria: 'Falso vs Engañoso', casos: Math.floor(dimension_mitigacion.indicadores.casos_en_desacuerdo * 0.4), porcentaje: 40 },
        { categoria: 'Verdadero vs Falso', casos: Math.floor(dimension_mitigacion.indicadores.casos_en_desacuerdo * 0.35), porcentaje: 35 },
        { categoria: 'Otros', casos: Math.floor(dimension_mitigacion.indicadores.casos_en_desacuerdo * 0.25), porcentaje: 25 }
      ],
      noticiasMasReportadas: [
        // Mock data (not in new structure)
        { titulo: 'Documento 001...', reportes: 45 },
        { titulo: 'Documento 002...', reportes: 38 }
      ],
      casosPorPrioridad: [
        // Mock data
        { prioridad: 'Alta', casos: dimension_alcance_virulencia.indicadores.casos_criticos, porcentaje: 15 },
        { prioridad: 'Media', casos: Math.floor(dimension_magnitud.indicadores.noticias_reportadas_mes * 0.38), porcentaje: 38 },
        { prioridad: 'Baja', casos: Math.floor(dimension_magnitud.indicadores.noticias_reportadas_mes * 0.47), porcentaje: 47 }
      ],
      redEpidemiologos: {
        totalActivos: 47, // Mock
        casosProcesados: dimension_magnitud.indicadores.validadas_por_humanos,
        tiempoPromedioVerificacion: parseTimeString(dimension_magnitud.indicadores.tiempo_promedio_validacion),
        consensoPromedio: dimension_mitigacion.indicadores.consenso_humano_ia
      },
      redInmunizadores: {
        totalActivos: 32, // Mock
        estrategiasDesarrolladas: 156, // Mock
        estrategiasActivas: 134, // Mock
        alcanceTotal: 1250000 // Mock
      },
      marcadoresDiagnostico: dimension_descriptiva.graficos.clasificaciones.map(clasif => ({
        tipo: clasif.clasificacion,
        casos: clasif.cantidad,
        porcentaje: Math.round((clasif.cantidad / dimension_magnitud.indicadores.noticias_reportadas_totales) * 100),
        color: getClassificationColor(clasif.clasificacion)
      })),
      vectoresContagio: dimension_alcance_virulencia.graficos.vectores_principales.map(vector => {
        const total = dimension_alcance_virulencia.graficos.vectores_principales.reduce((sum, v) => sum + v.casos, 0);
        const typeMap: Record<string, string> = {
          'WhatsApp': 'W',
          'Facebook': 'F',
          'Twitter': 'T',
          'Instagram': 'I',
          'TikTok': 'TK',
          'URL': 'U'
        };
        return {
          tipo: `${vector.vector} (${typeMap[vector.vector] || 'X'})`,
          casos: vector.casos,
          porcentaje: Math.round((vector.casos / total) * 100),
          codigo: typeMap[vector.vector] || 'X'
        };
      }),
      casosPorEstado: [
        {
          estado: 'Validados',
          casos: dimension_mitigacion.indicadores.casos_validados,
          porcentaje: Math.round((dimension_mitigacion.indicadores.casos_validados / dimension_magnitud.indicadores.noticias_reportadas_totales) * 100),
          color: '#10b981'
        },
        {
          estado: 'Solo IA',
          casos: dimension_mitigacion.indicadores.casos_detectados,
          porcentaje: Math.round((dimension_mitigacion.indicadores.casos_detectados / dimension_magnitud.indicadores.noticias_reportadas_totales) * 100),
          color: '#3b82f6'
        },
        {
          estado: 'Pendientes',
          casos: dimension_mitigacion.indicadores.casos_pendientes,
          porcentaje: Math.round((dimension_mitigacion.indicadores.casos_pendientes / dimension_magnitud.indicadores.noticias_reportadas_totales) * 100),
          color: '#94a3b8'
        }
      ],
      sistemaCodificacion: {
        totalCasos: dimension_magnitud.indicadores.noticias_reportadas_totales,
        casosHoy: Math.floor(dimension_magnitud.indicadores.incremento_semanal / 7),
        casosSemana: dimension_magnitud.indicadores.incremento_semanal,
        formatoEjemplo: 'T-WB-20241015-156'
      },
      recomendaciones: [
        // Mock recommendations (not in new structure yet)
        {
          tipo: 'error' as const,
          titulo: 'Nivel de casos críticos elevado',
          descripcion: `Se detectaron ${dimension_alcance_virulencia.indicadores.casos_criticos} casos con alta virulencia`,
          prioridad: 1
        }
      ]
    },

    // ===== GLOBAL KPIs (NEW - displayed at top of dashboard) =====
    globalKPIs: {
      casosActivos: global_kpis.casos_activos,
      tasaReproduccionR0: global_kpis.tasa_reproduccion_r0,
      indiceGravedadIGC: global_kpis.indice_gravedad_igc,
      tiempoDeteccion: global_kpis.tiempo_deteccion,
      infectividad: global_kpis.infectividad,
      virulencia: global_kpis.virulencia
    },

    // Legacy dimensions (not in new API yet)
    datosEvolucionPerfil: null,
    datosTendenciasMecanismo: null
  };
}

/**
 * Parse time string like "2.3h" to number
 */
function parseTimeString(timeStr: string): number {
  const match = timeStr.match(/^(\d+\.?\d*)([mhd])$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'm': return value / 60; // Convert minutes to hours
    case 'h': return value;
    case 'd': return value * 24; // Convert days to hours
    default: return value;
  }
}

/**
 * Transform daily time series to weekly aggregates
 */
function transformToWeeklySeries(
  reportados: TimeSeriesPoint[],
  detectados: TimeSeriesPoint[],
  validados: TimeSeriesPoint[]
) {
  // Get last 4 weeks of data
  const last28Days = reportados.slice(-28);

  if (last28Days.length === 0) {
    return [];
  }

  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = i * 7;
    const weekEnd = weekStart + 7;
    const weekData = last28Days.slice(weekStart, weekEnd);

    if (weekData.length > 0) {
      weeks.push({
        semana: `Sem ${i + 1}`,
        detectadas: sumValues(detectados.slice(weekStart, weekEnd)),
        viralizadas: sumValues(reportados.slice(weekStart, weekEnd)),
        tiempo: 6.2 // TODO: Calculate from data
      });
    }
  }

  return weeks;
}

/**
 * Sum values from time series points
 */
function sumValues(points: TimeSeriesPoint[]): number {
  return points.reduce((sum, point) => sum + point.valor, 0);
}

/**
 * Calculate population density estimate
 */
function calculateDensity(casos: number): number {
  return (casos / 1000000) * 100;
}

/**
 * Get color for Colombian region
 */
function getRegionColor(region: string): string {
  const colorMap: Record<string, string> = {
    'Caribe': '#00B4D8',
    'Pacífica': '#0077B6',
    'Andina': '#7209B7',
    'Orinoquía': '#F72585',
    'Amazonía': '#06FFA5',
    'Insular': '#FFD60A',
    'Bogotá': '#7209B7',
    'Bogotá D.C.': '#7209B7',
    'Antioquia': '#7209B7',
    'Cundinamarca': '#7209B7',
    'Valle del Cauca': '#0077B6',
    'Atlántico': '#00B4D8',
    'Santander': '#7209B7',
    'Bolívar': '#00B4D8'
  };

  return colorMap[region] || '#3b82f6';
}

/**
 * Get coordinates for Colombian regions/departments
 */
function getCoordinatesForRegion(region: string): { lat: number; lon: number } {
  const coords: Record<string, { lat: number; lon: number }> = {
    'Bogotá': { lat: 4.7110, lon: -74.0721 },
    'Bogotá D.C.': { lat: 4.7110, lon: -74.0721 },
    'Antioquia': { lat: 6.2442, lon: -75.5812 },
    'Valle del Cauca': { lat: 3.4516, lon: -76.5320 },
    'Atlántico': { lat: 10.9685, lon: -74.7813 },
    'Cundinamarca': { lat: 4.5709, lon: -74.2973 },
    'Santander': { lat: 7.1193, lon: -73.1227 },
    'Bolívar': { lat: 10.3910, lon: -75.4794 },
    'No especificada': { lat: 4.5709, lon: -74.2973 },
  };

  return coords[region] || { lat: 4.5709, lon: -74.2973 };
}

/**
 * Get color for classification type
 */
function getClassificationColor(clasificacion: string): string {
  const colorMap: Record<string, string> = {
    'Falso': '#ef4444',
    'Engañoso': '#f97316',
    'Sensacionalista': '#fb923c',
    'Sin contexto': '#f59e0b',
    'Desinformación': '#ef4444',
    'Sátira': '#84cc16',
    'Verdadero': '#10b981'
  };

  return colorMap[clasificacion] || '#6b7280';
}

/**
 * Transform OLD API structure (legacy compatibility)
 */
function transformOldStructure(apiData: any) {
  return {
    // Dimensión 1: Magnitud
    datosMagnitud: {
      noticiasReportadas: apiData.magnitude?.noticias_reportadas || 0,
      noticiasReportadasSemana: apiData.magnitude?.incremento_semanal || 0,
      noticiasReportadasMes: apiData.magnitude?.noticias_reportadas_mes || 0,
      deteccionesPorIA: apiData.magnitude?.detectadas_por_ia || 0,
      deteccionesPorHumanos: apiData.magnitude?.validadas_por_humanos || 0,
      tiempoDeteccionIA: parseTimeString(apiData.magnitude?.tiempo_promedio_deteccion || "0h"),
      tiempoDeteccionHumanos: parseTimeString(apiData.magnitude?.tiempo_promedio_validacion || "0h"),
      fuentesGeneradoras: apiData.sources?.slice(0, 5).map((source: any) => ({
        fuente: source.nombre,
        casos: source.casos_detectados,
        tipo: source.tipo
      })) || []
    },

    // Dimensión 2: Temporalidad
    datosTemporalidad: {
      velocidadDeteccion: parseTimeString(apiData.magnitude?.tiempo_promedio_deteccion || "0h"),
      tiempoViralizacionPromedio: parseTimeString(apiData.temporality?.tiempo_viralizacion_promedio || "0h"),
      evolucionSemanal: transformToWeeklySeries(
        apiData.temporality?.reportados || [],
        apiData.temporality?.detectados || [],
        apiData.temporality?.validados || []
      ),
      comparativaVerdaderasVsFalsas: [
        { tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 },
        { tipo: 'Falsas', interacciones: 8975, tiempo: 4.8 }
      ]
    },

    // Dimensión 3: Virulencia/Alcance
    datosAlcance: {
      indiceViralidad: apiData.virulence?.indice_viralidad || 0,
      casosCriticos: apiData.virulence?.casos_criticos || 0,
      vectoresPrincipales: apiData.virulence?.vectores_principales || [],
      rangoViralizacion: {
        min: apiData.virulence?.rango_viralizacion?.min || 0,
        max: apiData.virulence?.rango_viralizacion?.max || 100,
        promedio: apiData.virulence?.rango_viralizacion?.avg || 0
      },
      nivelEngagement: apiData.virulence?.nivel_engagement || 0,
      efectividadAlcance: {
        verdaderas: 3250,
        falsas: 8975,
        ratio: 0.36
      },
      distribucionViralidad: Object.entries(apiData.virulence?.distribucion_viralidad || {}).map(([rango, casos]) => {
        const total = Object.values(apiData.virulence?.distribucion_viralidad || {}).reduce((sum: number, val: any) => sum + val, 0);
        return {
          rango: rango.replace('1-10', '0-10').replace('11-50', '11-50').replace('51-100', '51-100').replace('101+', '100+'),
          casos: casos as number,
          porcentaje: total > 0 ? Math.round((casos as number / total) * 100) : 0
        };
      })
    },

    // Dimensión 4: Geográficos
    datosGeograficos: {
      casosPorRegion: Object.entries(apiData.geographic?.casos_por_region || {}).map(([region, casos]) => ({
        region,
        casos: casos as number,
        densidad: calculateDensity(casos as number).toFixed(1),
        color: getRegionColor(region)
      })),
      regionMasAfectada: apiData.geographic?.region_mas_afectada || 'N/A',
      fuentesInternacionalesVsNacionales: {
        internacionales: apiData.geographic?.fuentes_origen?.Internacional || 0,
        nacionales: apiData.geographic?.fuentes_origen?.Nacional || 0,
        porcentajeInternacional: Math.round((apiData.geographic?.fuentes_origen?.Internacional || 0) /
          ((apiData.geographic?.fuentes_origen?.Internacional || 0) + (apiData.geographic?.fuentes_origen?.Nacional || 1)) * 100) || 0
      },
      mapaCalor: Object.entries(apiData.geographic?.casos_por_region || {})
        .slice(0, 5)
        .map(([departamento, casos]) => ({
          departamento,
          casos: casos as number,
          lat: getCoordinatesForRegion(departamento).lat,
          lon: getCoordinatesForRegion(departamento).lon
        })),
      totalRegionesActivas: apiData.geographic?.total_regiones_activas || 0,
      clustersEspaciales: apiData.geographic?.clusters_espaciales || []
    },

    // Dimensión 5: Descriptivos
    datosDescriptivos: {
      porSector: (apiData.descriptive?.temas_principales || []).map((tema: any) => {
        const total = apiData.magnitude?.noticias_reportadas || 1;
        return {
          sector: tema.tema,
          casos: tema.cantidad,
          porcentaje: Math.round((tema.cantidad / total) * 100)
        };
      }),
      plataformasPropagacion: Object.entries(apiData.descriptive?.casos_por_plataforma || {})
        .map(([plataforma, casos]) => ({
          plataforma,
          casos: casos as number,
          porcentaje: Math.round((casos as number / (apiData.magnitude?.noticias_reportadas || 1)) * 100)
        }))
        .sort((a, b) => b.casos - a.casos)
        .slice(0, 5),
      personalidadesAtacadas: [
        { nombre: 'Presidente de la República', ataques: 234 },
        { nombre: 'Alcalde de Bogotá', ataques: 189 }
      ],
      sectorMasEficiente: {
        sector: apiData.descriptive?.sector_mas_eficiente || 'N/A',
        alcancePromedio: 12500,
        viralidad: apiData.virulence?.indice_viralidad || 0
      }
    },

    // Dimensión 6: Mitigación
    datosMitigacion: {
      consensoValidacionHumana: apiData.mitigation?.consenso_humano_ia || 0,
      consensoHumanoVsIA: {
        acuerdo: Math.round(apiData.mitigation?.consenso_humano_ia || 0),
        desacuerdo: Math.round(100 - (apiData.mitigation?.consenso_humano_ia || 0))
      },
      casosEnDesacuerdo: apiData.mitigation?.casos_en_desacuerdo || 0,
      distribucionDesacuerdo: Object.entries(apiData.mitigation?.distribucion_desacuerdo || {})
        .map(([categoria, casos]) => {
          const total = Object.values(apiData.mitigation?.distribucion_desacuerdo || {}).reduce((sum: number, val: any) => sum + val, 0);
          return {
            categoria,
            casos: casos as number,
            porcentaje: total > 0 ? Math.round((casos as number / total) * 100) : 0
          };
        }),
      noticiasMasReportadas: (apiData.mitigation?.noticias_mas_reportadas || []).map((noticia: any) => ({
        titulo: noticia.url || `Documento ${noticia.id.substring(0, 8)}...`,
        reportes: noticia.reportes
      })),
      casosPorPrioridad: [
        { prioridad: 'Alta', casos: apiData.virulence?.casos_criticos || 0, porcentaje: 15 },
        { prioridad: 'Media', casos: Math.floor((apiData.magnitude?.noticias_reportadas_mes || 0) * 0.38), porcentaje: 38 },
        { prioridad: 'Baja', casos: Math.floor((apiData.magnitude?.noticias_reportadas_mes || 0) * 0.47), porcentaje: 47 }
      ],
      redEpidemiologos: {
        totalActivos: 47,
        casosProcesados: apiData.magnitude?.validadas_por_humanos || 0,
        tiempoPromedioVerificacion: parseTimeString(apiData.magnitude?.tiempo_promedio_validacion || "0h"),
        consensoPromedio: apiData.mitigation?.consenso_humano_ia || 0
      },
      redInmunizadores: {
        totalActivos: 32,
        estrategiasDesarrolladas: 156,
        estrategiasActivas: 134,
        alcanceTotal: 1250000
      },
      marcadoresDiagnostico: transformClassificationsToMarkers(apiData.descriptive?.clasificaciones || {}),
      vectoresContagio: Object.entries(apiData.mitigation?.vectores_contagio || {})
        .map(([tipo, casos]) => {
          const total = Object.values(apiData.mitigation?.vectores_contagio || {}).reduce((sum: number, val: any) => sum + val, 0);
          const typeMap: Record<string, string> = {
            'Texto': 'T',
            'Imagen': 'I',
            'Video': 'V',
            'Audio': 'A'
          };
          return {
            tipo: `${tipo} (${typeMap[tipo] || 'X'})`,
            casos: casos as number,
            porcentaje: total > 0 ? Math.round((casos as number / total) * 100) : 0,
            codigo: typeMap[tipo] || 'X'
          };
        }),
      casosPorEstado: [
        {
          estado: 'Validados',
          casos: apiData.mitigation?.casos_por_estado?.validados || 0,
          porcentaje: (apiData.mitigation?.casos_por_estado?.total || 0) > 0 ?
            Math.round(((apiData.mitigation?.casos_por_estado?.validados || 0) / apiData.mitigation?.casos_por_estado?.total) * 100) : 0,
          color: '#10b981'
        },
        {
          estado: 'Solo IA',
          casos: apiData.mitigation?.casos_por_estado?.detectados || 0,
          porcentaje: (apiData.mitigation?.casos_por_estado?.total || 0) > 0 ?
            Math.round(((apiData.mitigation?.casos_por_estado?.detectados || 0) / apiData.mitigation?.casos_por_estado?.total) * 100) : 0,
          color: '#3b82f6'
        },
        {
          estado: 'Pendientes',
          casos: apiData.mitigation?.casos_por_estado?.pendientes || 0,
          porcentaje: (apiData.mitigation?.casos_por_estado?.total || 0) > 0 ?
            Math.round(((apiData.mitigation?.casos_por_estado?.pendientes || 0) / apiData.mitigation?.casos_por_estado?.total) * 100) : 0,
          color: '#94a3b8'
        }
      ],
      sistemaCodificacion: {
        totalCasos: apiData.mitigation?.casos_por_estado?.total || 0,
        casosHoy: Math.floor((apiData.magnitude?.incremento_semanal || 0) / 7),
        casosSemana: apiData.magnitude?.incremento_semanal || 0,
        formatoEjemplo: 'T-WB-20241015-156'
      },
      recomendaciones: apiData.mitigation?.recomendaciones || []
    },

    // Legacy global KPIs (mock for old structure)
    globalKPIs: {
      casosActivos: apiData.magnitude?.noticias_reportadas_mes || 0,
      tasaReproduccionR0: 1.2,
      indiceGravedadIGC: 65,
      tiempoDeteccion: apiData.magnitude?.tiempo_promedio_deteccion || "0h",
      infectividad: 0,
      virulencia: 0
    },

    // Dimensión 7 y 8
    datosEvolucionPerfil: apiData.evolucion_por_perfil || null,
    datosTendenciasMecanismo: apiData.tendencias_por_mecanismo || null
  };
}

/**
 * Transform classifications to diagnostic markers
 */
function transformClassificationsToMarkers(clasificaciones: Record<string, number>) {
  const colorMap: Record<string, string> = {
    'Falso': '#ef4444',
    'Engañoso': '#f97316',
    'Sensacionalista': '#fb923c',
    'Sin contexto': '#f59e0b',
    'Desinformación': '#ef4444'
  };

  const total = Object.values(clasificaciones).reduce((sum, val) => sum + val, 0);

  return Object.entries(clasificaciones).map(([tipo, casos]) => ({
    tipo,
    casos,
    porcentaje: total > 0 ? Math.round((casos / total) * 100) : 0,
    color: colorMap[tipo] || '#6b7280'
  }));
}
