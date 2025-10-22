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
      noticiasReportadasMes: apiData.magnitude.noticias_reportadas_mes, // Now using real API data
      deteccionesPorIA: apiData.magnitude.detectadas_por_ia,
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
      tiempoViralizacionPromedio: parseTimeString(apiData.temporality.tiempo_viralizacion_promedio || "0h"), // Now using real API data
      evolucionSemanal: transformToWeeklySeries(apiData.temporality.reportados, apiData.temporality.detectados, apiData.temporality.validados),
      comparativaVerdaderasVsFalsas: [
        // Mock data until API provides this
        { tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 },
        { tipo: 'Falsas', interacciones: 8975, tiempo: 4.8 }
      ]
    },

    // Dimensión 3: Virulencia/Alcance
    datosAlcance: {
      indiceViralidad: apiData.virulence.indice_viralidad,
      casosCriticos: apiData.virulence.casos_criticos,
      vectoresPrincipales: apiData.virulence.vectores_principales,
      rangoViralizacion: {
        min: apiData.virulence.rango_viralizacion.min,
        max: apiData.virulence.rango_viralizacion.max,
        promedio: apiData.virulence.rango_viralizacion.avg
      },
      nivelEngagement: apiData.virulence.nivel_engagement,
      efectividadAlcance: {
        // Mock data until API provides this breakdown
        verdaderas: 3250,
        falsas: 8975,
        ratio: 0.36
      },
      distribucionViralidad: Object.entries(apiData.virulence.distribucion_viralidad).map(([rango, casos]) => {
        const total = Object.values(apiData.virulence.distribucion_viralidad).reduce((sum, val) => sum + val, 0);
        return {
          rango: rango.replace('1-10', '0-10').replace('11-50', '11-50').replace('51-100', '51-100').replace('101+', '100+'),
          casos,
          porcentaje: Math.round((casos / total) * 100)
        };
      })
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
        internacionales: apiData.geographic.fuentes_origen.Internacional,
        nacionales: apiData.geographic.fuentes_origen.Nacional,
        porcentajeInternacional: Math.round((apiData.geographic.fuentes_origen.Internacional /
          (apiData.geographic.fuentes_origen.Internacional + apiData.geographic.fuentes_origen.Nacional)) * 100) || 0
      },
      mapaCalor: Object.entries(apiData.geographic.casos_por_region)
        .slice(0, 5)
        .map(([departamento, casos], index) => ({
          departamento,
          casos,
          lat: apiData.geographic.clusters_espaciales?.[index]?.casos ?
            getCoordinatesForRegion(departamento).lat : 0,
          lon: apiData.geographic.clusters_espaciales?.[index]?.casos ?
            getCoordinatesForRegion(departamento).lon : 0
        })),
      totalRegionesActivas: apiData.geographic.total_regiones_activas,
      clustersEspaciales: apiData.geographic.clusters_espaciales
    },

    // Dimensión 5: Descriptivos
    datosDescriptivos: {
      porSector: apiData.descriptive.temas_principales.map(tema => {
        const total = apiData.magnitude.noticias_reportadas;
        const porcentaje = total > 0 ? Math.round((tema.cantidad / total) * 100) : 0;
        return {
          sector: tema.tema,
          casos: tema.cantidad,
          porcentaje
        };
      }),
      plataformasPropagacion: Object.entries(apiData.descriptive.casos_por_plataforma || {})
        .map(([plataforma, casos]) => ({
          plataforma,
          casos,
          porcentaje: Math.round((casos / apiData.magnitude.noticias_reportadas) * 100) || 0
        }))
        .sort((a, b) => b.casos - a.casos)
        .slice(0, 5),
      personalidadesAtacadas: [
        // Mock data until API provides this
        { nombre: 'Presidente de la República', ataques: 234 },
        { nombre: 'Alcalde de Bogotá', ataques: 189 }
      ],
      sectorMasEficiente: {
        sector: apiData.descriptive.sector_mas_eficiente || 'N/A',
        alcancePromedio: 12500, // Mock until API provides this detail
        viralidad: 85 // Mock until API provides this detail
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
      distribucionDesacuerdo: Object.entries(apiData.mitigation.distribucion_desacuerdo || {})
        .map(([categoria, casos]) => {
          const total = Object.values(apiData.mitigation.distribucion_desacuerdo || {}).reduce((sum, val) => sum + val, 0);
          return {
            categoria,
            casos,
            porcentaje: total > 0 ? Math.round((casos / total) * 100) : 0
          };
        }),
      noticiasMasReportadas: apiData.mitigation.noticias_mas_reportadas?.map(noticia => ({
        titulo: noticia.url || `Documento ${noticia.id.substring(0, 8)}...`,
        reportes: noticia.reportes
      })) || [],
      casosPorPrioridad: [
        // Mock data until API provides priority breakdown
        { prioridad: 'Alta', casos: 234, porcentaje: 15 },
        { prioridad: 'Media', casos: 589, porcentaje: 38 },
        { prioridad: 'Baja', casos: 744, porcentaje: 47 }
      ],
      redEpidemiologos: {
        totalActivos: 47, // Mock data
        casosProcesados: apiData.magnitude.validadas_por_humanos,
        tiempoPromedioVerificacion: parseTimeString(apiData.magnitude.tiempo_promedio_validacion),
        consensoPromedio: apiData.mitigation.consenso_humano_ia
      },
      redInmunizadores: {
        totalActivos: 32, // Mock data
        estrategiasDesarrolladas: 156, // Mock data
        estrategiasActivas: 134, // Mock data
        alcanceTotal: 1250000 // Mock data
      },
      marcadoresDiagnostico: transformClassificationsToMarkers(apiData.descriptive.clasificaciones),
      vectoresContagio: Object.entries(apiData.mitigation.vectores_contagio || {})
        .map(([tipo, casos]) => {
          const total = Object.values(apiData.mitigation.vectores_contagio || {}).reduce((sum, val) => sum + val, 0);
          const typeMap: Record<string, string> = {
            'Texto': 'T',
            'Imagen': 'I',
            'Video': 'V',
            'Audio': 'A'
          };
          return {
            tipo: `${tipo} (${typeMap[tipo] || 'X'})`,
            casos,
            porcentaje: total > 0 ? Math.round((casos / total) * 100) : 0,
            codigo: typeMap[tipo] || 'X'
          };
        }),
      casosPorEstado: [
        {
          estado: 'Validados',
          casos: apiData.mitigation.casos_por_estado.validados,
          porcentaje: apiData.mitigation.casos_por_estado.total > 0 ?
            Math.round((apiData.mitigation.casos_por_estado.validados / apiData.mitigation.casos_por_estado.total) * 100) : 0,
          color: '#10b981'
        },
        {
          estado: 'Solo IA',
          casos: apiData.mitigation.casos_por_estado.detectados,
          porcentaje: apiData.mitigation.casos_por_estado.total > 0 ?
            Math.round((apiData.mitigation.casos_por_estado.detectados / apiData.mitigation.casos_por_estado.total) * 100) : 0,
          color: '#3b82f6'
        },
        {
          estado: 'Pendientes',
          casos: apiData.mitigation.casos_por_estado.pendientes,
          porcentaje: apiData.mitigation.casos_por_estado.total > 0 ?
            Math.round((apiData.mitigation.casos_por_estado.pendientes / apiData.mitigation.casos_por_estado.total) * 100) : 0,
          color: '#94a3b8'
        }
      ],
      sistemaCodificacion: {
        totalCasos: apiData.mitigation.casos_por_estado.total,
        casosHoy: Math.floor(apiData.magnitude.incremento_semanal / 7), // Estimate
        casosSemana: apiData.magnitude.incremento_semanal,
        formatoEjemplo: 'T-WB-20241015-156'
      },
      recomendaciones: apiData.mitigation.recomendaciones
    },

    // Dimensión 7: Evolución por Perfil (Nueva)
    datosEvolucionPerfil: apiData.evolucion_por_perfil ? apiData.evolucion_por_perfil : null,

    // Dimensión 8: Tendencias por Mecanismo (Nueva)
    datosTendenciasMecanismo: apiData.tendencias_por_mecanismo ? apiData.tendencias_por_mecanismo : null
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
 * Get approximate coordinates for Colombian regions/departments
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
    'No especificada': { lat: 4.5709, lon: -74.2973 }, // Default to center of Colombia
  };

  return coords[region] || { lat: 4.5709, lon: -74.2973 }; // Colombia center
}

// Removed transformVectoresToPlatforms as we now use real API data

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
