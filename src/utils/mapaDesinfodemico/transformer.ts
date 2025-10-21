import type { MapaResult, TimeSeriesPoint } from './types';

/**
 * Transform API response to dashboard format
 * Converts snake_case API fields to camelCase dashboard fields
 * and restructures data to match existing dashboard component expectations
 */
export function transformMapaData(apiData: MapaResult) {
  return {
    // Dimensión 1: Magnitud
    datosMagnitud: {
      noticiasReportadas: apiData.magnitude.noticias_reportadas,
      noticiasReportadasSemana: apiData.magnitude.incremento_semanal,
      noticiasReportadasMes: apiData.magnitude.incremento_semanal * 4, // Estimate
      detectadasPorIA: apiData.magnitude.detectadas_por_ia,
      deteccionesPorHumanos: apiData.magnitude.validadas_por_humanos,
      tiempoDeteccionIA: parseTimeString(apiData.magnitude.tiempo_promedio_deteccion),
      tiempoDeteccionHumanos: parseTimeString(apiData.magnitude.tiempo_promedio_validacion),
      fuentesGeneradoras: apiData.sources.slice(0, 5).map(source => ({
        fuente: source.nombre,
        casos: source.casos_detectados,
        tipo: source.tipo
      }))
    },

    // Dimensión 2: Temporalidad
    datosTemporalidad: {
      velocidadDeteccion: parseTimeString(apiData.magnitude.tiempo_promedio_deteccion),
      tiempoViralizacionPromedio: 6.2, // TODO: Add to API if available
      evolucionSemanal: transformToWeeklySeries(apiData.temporality.reportados, apiData.temporality.detectados, apiData.temporality.validados),
      comparativaVerdaderasVsFalsas: [
        // TODO: Add to API if available
        { tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 },
        { tipo: 'Falsas', interacciones: 8975, tiempo: 4.8 }
      ]
    },

    // Dimensión 3: Virulencia/Alcance
    datosAlcance: {
      indiceViralidad: apiData.virulence.indice_viralidad,
      casosCriticos: apiData.virulence.casos_criticos,
      vectoresPrincipales: apiData.virulence.vectores_principales,
      rangoViralizacion: { min: 100, max: 125000, promedio: 8450 }, // TODO: Add to API
      nivelEngagement: 78, // TODO: Add to API
      efectividadAlcance: {
        verdaderas: 3250,
        falsas: 8975,
        ratio: 0.36
      },
      distribucionViralidad: [
        // TODO: Add to API if available
        { rango: '0-1K', casos: 456, porcentaje: 29 },
        { rango: '1K-10K', casos: 589, porcentaje: 38 },
        { rango: '10K-50K', casos: 378, porcentaje: 24 },
        { rango: '50K+', casos: 144, porcentaje: 9 }
      ]
    },

    // Dimensión 4: Geográficos
    datosGeograficos: {
      casosPorRegion: Object.entries(apiData.geographic.casos_por_region).map(([region, casos]) => ({
        region,
        casos,
        densidad: calculateDensity(casos).toFixed(1),
        color: getRegionColor(region)
      })),
      regionMasAfectada: apiData.geographic.region_mas_afectada,
      fuentesInternacionalesVsNacionales: {
        internacionales: 423, // TODO: Add to API
        nacionales: 1144, // TODO: Add to API
        porcentajeInternacional: 27
      },
      mapaCalor: Object.entries(apiData.geographic.casos_por_region)
        .slice(0, 5)
        .map(([departamento, casos]) => ({
          departamento,
          casos,
          lat: 0, // TODO: Add coordinates to API
          lon: 0
        }))
    },

    // Dimensión 5: Descriptivos
    datosDescriptivos: {
      porSector: apiData.descriptive.temas_principales.map(tema => {
        const total = apiData.magnitude.noticias_reportadas;
        const porcentaje = Math.round((tema.cantidad / total) * 100);
        return {
          sector: tema.tema,
          casos: tema.cantidad,
          porcentaje
        };
      }),
      plataformasPropagacion: transformVectoresToPlatforms(apiData.virulence.vectores_principales),
      personalidadesAtacadas: [
        // TODO: Add to API if available
        { nombre: 'Presidente de la República', ataques: 234 },
        { nombre: 'Alcalde de Bogotá', ataques: 189 }
      ],
      sectorMasEficiente: {
        sector: apiData.descriptive.temas_principales[0]?.tema || 'Salud',
        alcancePromedio: 12500,
        viralidad: 85
      }
    },

    // Dimensión 6: Mitigación
    datosMitigacion: {
      consensoValidacionHumana: apiData.mitigation.consenso_humano_ia,
      consensoHumanoVsIA: {
        acuerdo: Math.round(apiData.mitigation.consenso_humano_ia),
        desacuerdo: Math.round(100 - apiData.mitigation.consenso_humano_ia)
      },
      casosEnDesacuerdo: apiData.mitigation.casos_en_desacuerdo,
      distribucionDesacuerdo: [
        // TODO: Add to API if available
        { categoria: 'IA dice Falso, Humanos Verdadero', casos: 67, porcentaje: 35 },
        { categoria: 'IA dice Verdadero, Humanos Falso', casos: 45, porcentaje: 24 },
        { categoria: 'Desacuerdo en clasificación', casos: 78, porcentaje: 41 }
      ],
      noticiasMasReportadas: [
        // TODO: Add to API if available
        { titulo: 'Vacuna causa efectos secundarios graves', reportes: 456 },
        { titulo: 'Alcalde involucrado en corrupción', reportes: 389 }
      ],
      casosPorPrioridad: [
        // TODO: Add to API if available
        { prioridad: 'Alta', casos: 234, porcentaje: 15 },
        { prioridad: 'Media', casos: 589, porcentaje: 38 },
        { prioridad: 'Baja', casos: 744, porcentaje: 47 }
      ],
      redEpidemiologos: {
        totalActivos: 47,
        casosProcesados: apiData.magnitude.validadas_por_humanos,
        tiempoPromedioVerificacion: parseTimeString(apiData.magnitude.tiempo_promedio_validacion),
        consensoPromedio: apiData.mitigation.consenso_humano_ia
      },
      redInmunizadores: {
        totalActivos: 32,
        estrategiasDesarrolladas: 156,
        estrategiasActivas: 134,
        alcanceTotal: 1250000
      },
      marcadoresDiagnostico: transformClassificationsToMarkers(apiData.descriptive.clasificaciones),
      vectoresContagio: [
        // TODO: Add to API if available
        { tipo: 'Texto (T)', casos: 734, porcentaje: 47, codigo: 'T' },
        { tipo: 'Imagen (I)', casos: 423, porcentaje: 27, codigo: 'I' },
        { tipo: 'Video (V)', casos: 267, porcentaje: 17, codigo: 'V' },
        { tipo: 'Audio (A)', casos: 143, porcentaje: 9, codigo: 'A' }
      ],
      casosPorEstado: [
        { estado: 'Verificados', casos: apiData.magnitude.validadas_por_humanos, porcentaje: 76, color: '#10b981' },
        { estado: 'Solo IA', casos: apiData.magnitude.detectadas_por_ia - apiData.magnitude.validadas_por_humanos, porcentaje: 24, color: '#3b82f6' }
      ],
      sistemaCodificacion: {
        totalCasos: apiData.magnitude.noticias_reportadas,
        casosHoy: Math.floor(apiData.magnitude.incremento_semanal / 7), // Estimate
        casosSemana: apiData.magnitude.incremento_semanal,
        formatoEjemplo: 'T-WB-20241015-156'
      },
      recomendaciones: apiData.mitigation.recomendaciones
    }
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
  // Placeholder calculation
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
    'Insular': '#FFD60A'
  };

  return colorMap[region] || '#3b82f6';
}

/**
 * Transform vector names to platform data
 */
function transformVectoresToPlatforms(vectores: string[]) {
  const platformMap: Record<string, number> = {
    'WhatsApp': 2345,
    'Facebook': 1987,
    'Twitter': 1234,
    'Instagram': 456,
    'TikTok': 189
  };

  return vectores.map((plataforma, index) => ({
    plataforma,
    casos: platformMap[plataforma] || 1000 - (index * 200),
    porcentaje: index === 0 ? 38 : index === 1 ? 32 : 20
  }));
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
    porcentaje: Math.round((casos / total) * 100),
    color: colorMap[tipo] || '#6b7280'
  }));
}
