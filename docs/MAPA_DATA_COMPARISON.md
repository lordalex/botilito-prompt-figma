# Mapa Desinfodémico - API vs Mock Data Comparison

**Date:** 2025-01-21
**Status:** API Integration In Progress
**Backend:** Deployed (Supabase Edge Function)
**Frontend:** Using Fallback Mock Data

---

## Data Flow Architecture

```
Supabase Edge Function (snake_case)
    ↓
transformer.ts (converts to camelCase)
    ↓
MapaDesinfodemico.tsx (displays with fallback to mock data)
```

---

## Dimension 1: Magnitud

### ✅ Properties from API

| API Property (Backend) | Transformer Output | Component Usage | Source |
|------------------------|-------------------|-----------------|---------|
| `magnitude.noticias_reportadas` | `datosMagnitud.noticiasReportadas` | Total documents count | `documents.length` |
| `magnitude.detectadas_por_ia` | `datosMagnitud.deteccionesPorIA` | Unique AI cases | `uniqueAICases.size` |
| `magnitude.validadas_por_humanos` | `datosMagnitud.deteccionesPorHumanos` | Unique human-validated cases | `uniqueHumanCases.size` |
| `magnitude.incremento_semanal` | `datosMagnitud.noticiasReportadasSemana` | Last 7 days count | `weekDocsRes.count` |
| `magnitude.tiempo_promedio_deteccion` | `datosMagnitud.tiempoDeteccionIA` | Average AI detection time | Calculated from timestamps |
| `magnitude.tiempo_promedio_validacion` | `datosMagnitud.tiempoDeteccionHumanos` | Average human validation time | Calculated from timestamps |
| `sources[]` (top 5) | `datosMagnitud.fuentesGeneradoras` | Top 5 misinformation sources | Database query |

### ⚠️ Properties Using Mock Data

| Property | Mock Value | Why Mock? |
|----------|-----------|-----------|
| `noticiasReportadasMes` | `incremento_semanal * 4` | Estimated from weekly (needs 30-day query) |

**Mock Data Example:**
```typescript
fuentesGeneradoras: [
  { fuente: '@noticiasfalsas_col', casos: 456, tipo: 'Cuenta Twitter' },
  { fuente: 'GrupoWhatsApp "Noticias Urgentes"', casos: 389, tipo: 'WhatsApp' },
  // ... 3 more
]
```

---

## Dimension 2: Temporalidad

### ✅ Properties from API

| API Property (Backend) | Transformer Output | Component Usage | Source |
|------------------------|-------------------|-----------------|---------|
| `temporality.reportados[]` | `datosTemporalidad.evolucionSemanal` | Weekly reported cases timeline | Last 90 days data |
| `temporality.detectados[]` | `datosTemporalidad.evolucionSemanal` | Weekly detected cases timeline | Last 90 days data |
| `temporality.validados[]` | `datosTemporalidad.evolucionSemanal` | Weekly validated cases timeline | Last 90 days data |
| `magnitude.tiempo_promedio_deteccion` | `datosTemporalidad.velocidadDeteccion` | Average detection speed | Same as Magnitude |

**Data Structure (from API):**
```typescript
TimeSeriesPoint[] = [
  { fecha: "2025-01-15", valor: 34 },
  { fecha: "2025-01-16", valor: 28 },
  // ... 90 days
]
```

**Transformation:**
- API provides daily data for 90 days
- Transformer aggregates to weekly (last 4 weeks)
- Output: `[{ semana: "Sem 1", detectadas: 145, viralizadas: 198, tiempo: 6.2 }, ...]`

### ⚠️ Properties Using Mock Data

| Property | Mock Value | Why Mock? |
|----------|-----------|-----------|
| `tiempoViralizacionPromedio` | `6.2` hours | Not tracked in database yet |
| `comparativaVerdaderasVsFalsas` | Hardcoded array | True/false content comparison not in API |
| `evolucionSemanal[].tiempo` | `6.2` | Viralization time calculation not implemented |

**Mock Data Example:**
```typescript
comparativaVerdaderasVsFalsas: [
  { tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 },
  { tipo: 'Falsas', interacciones: 8975, tiempo: 4.8 }
]
```

---

## Dimension 3: Virulencia/Alcance

### ✅ Properties from API

| API Property (Backend) | Transformer Output | Component Usage | Source |
|------------------------|-------------------|-----------------|---------|
| `virulence.indice_viralidad` | `datosAlcance.indiceViralidad` | Virality index (0-100) | Calculated from engagement |
| `virulence.casos_criticos` | `datosAlcance.casosCriticos` | Critical cases count | High-engagement cases |
| `virulence.vectores_principales[]` | `datosAlcance.vectoresPrincipales` | Top propagation platforms | WhatsApp, Facebook, etc. |

**Calculation (from backend):**
```typescript
indice_viralidad = Math.min(100, (avgViralityScore / 10) * 100)
casos_criticos = cases with virality > threshold
vectores_principales = top 3 platforms by case count
```

### ⚠️ Properties Using Mock Data

| Property | Mock Value | Why Mock? |
|----------|-----------|-----------|
| `rangoViralizacion` | `{ min: 100, max: 125000, promedio: 8450 }` | Engagement stats not aggregated in API |
| `nivelEngagement` | `78` | Overall engagement metric not calculated |
| `efectividadAlcance` | `{ verdaderas: 3250, falsas: 8975, ratio: 0.36 }` | True/false content reach not tracked |
| `distribucionViralidad[]` | Hardcoded ranges | Engagement distribution not in API |
| `vectoresPrincipales` (platform data) | Estimated counts | API only returns platform names, not case counts per platform |

**Mock Data Example:**
```typescript
distribucionViralidad: [
  { rango: '0-1K', casos: 456, porcentaje: 29 },
  { rango: '1K-10K', casos: 589, porcentaje: 38 },
  { rango: '10K-50K', casos: 378, porcentaje: 24 },
  { rango: '50K+', casos: 144, porcentaje: 9 }
]
```

---

## Dimension 4: Geográficos

### ✅ Properties from API

| API Property (Backend) | Transformer Output | Component Usage | Source |
|------------------------|-------------------|-----------------|---------|
| `geographic.casos_por_region` | `datosGeograficos.casosPorRegion[]` | Cases by region map | Aggregated from metadata |
| `geographic.region_mas_afectada` | `datosGeograficos.regionMasAfectada` | Most affected region | Max cases region |

**Data Structure (from API):**
```typescript
casos_por_region: {
  "Bogotá": 450,
  "Antioquia": 320,
  "Valle del Cauca": 178,
  // ... all regions
}
```

**Transformation:**
```typescript
// Adds density calculation and color coding
casosPorRegion: [
  { region: "Bogotá", casos: 450, densidad: "0.045", color: "#7209B7" },
  // ...
]
```

### ⚠️ Properties Using Mock Data

| Property | Mock Value | Why Mock? |
|----------|-----------|-----------|
| `fuentesInternacionalesVsNacionales` | `{ internacionales: 423, nacionales: 1144 }` | Source origin tracking not in API |
| `mapaCalor[].lat` | `0` | Geographic coordinates not in database |
| `mapaCalor[].lon` | `0` | Geographic coordinates not in database |
| `densidad` | Placeholder calculation | `(casos / 1000000) * 100` - needs real population data |

**Mock Data Example:**
```typescript
fuentesInternacionalesVsNacionales: {
  internacionales: 423,
  nacionales: 1144,
  porcentajeInternacional: 27
}
```

---

## Dimension 5: Descriptivos

### ✅ Properties from API

| API Property (Backend) | Transformer Output | Component Usage | Source |
|------------------------|-------------------|-----------------|---------|
| `descriptive.temas_principales[]` | `datosDescriptivos.porSector[]` | Top themes/topics | Aggregated from metadata |
| `descriptive.clasificaciones{}` | `datosMitigacion.marcadoresDiagnostico[]` | Classification types | Label counts |
| `virulence.vectores_principales[]` | `datosDescriptivos.plataformasPropagacion[]` | Platform distribution | Top platforms |

**Data Structure (from API):**
```typescript
temas_principales: [
  { tema: "Salud", cantidad: 450 },
  { tema: "Política", cantidad: 380 },
  // ... more themes
]

clasificaciones: {
  "Desinformación": 650,
  "Engañoso": 234,
  "Sátira": 89,
  // ...
}
```

**Transformation:**
- Calculates percentage of total
- Adds color coding for classifications
- Estimates platform case counts (not in API)

### ⚠️ Properties Using Mock Data

| Property | Mock Value | Why Mock? |
|----------|-----------|-----------|
| `plataformasPropagacion[].casos` | Estimated counts | API only returns platform names |
| `plataformasPropagacion[].porcentaje` | Estimated percentages | Not calculated in API |
| `personalidadesAtacadas[]` | Hardcoded array | Entity tracking not implemented |
| `sectorMasEficiente` | Mock data | Sector effectiveness metrics not in API |

**Mock Data Example:**
```typescript
personalidadesAtacadas: [
  { nombre: 'Presidente de la República', ataques: 234 },
  { nombre: 'Alcalde de Bogotá', ataques: 189 }
]

sectorMasEficiente: {
  sector: 'Salud',
  alcancePromedio: 12500,
  viralidad: 85
}
```

---

## Dimension 6: Mitigación

### ✅ Properties from API

| API Property (Backend) | Transformer Output | Component Usage | Source |
|------------------------|-------------------|-----------------|---------|
| `mitigation.consenso_humano_ia` | `datosMitigacion.consensoValidacionHumana` | AI-human agreement % | Calculated from labels |
| `mitigation.consenso_humano_ia` | `datosMitigacion.consensoHumanoVsIA` | Agreement/disagreement split | Same source |
| `mitigation.casos_en_desacuerdo` | `datosMitigacion.casosEnDesacuerdo` | Disagreement count | Counted from labels |
| `mitigation.recomendaciones[]` | `datosMitigacion.recomendaciones[]` | AI-generated interventions | Generated recommendations |
| `magnitude.validadas_por_humanos` | `datosMitigacion.redEpidemiologos.casosProcesados` | Human-verified cases | Same as Magnitude |
| `magnitude.tiempo_promedio_validacion` | `datosMitigacion.redEpidemiologos.tiempoPromedioVerificacion` | Avg verification time | Same as Magnitude |
| `descriptive.clasificaciones{}` | `datosMitigacion.marcadoresDiagnostico[]` | Classification markers | With colors and % |

**Data Structure (from API):**
```typescript
mitigation: {
  consenso_humano_ia: 81.5, // percentage
  casos_en_desacuerdo: 190,
  recomendaciones: [
    {
      tipo: 'error',
      titulo: 'Alto volumen de desinformación detectado',
      descripcion: 'Se recomienda intervención inmediata...',
      prioridad: 1
    },
    // ... more recommendations
  ]
}
```

### ⚠️ Properties Using Mock Data

| Property | Mock Value | Why Mock? |
|----------|-----------|-----------|
| `distribucionDesacuerdo[]` | Hardcoded categories | Disagreement type breakdown not in API |
| `noticiasMasReportadas[]` | Hardcoded array | Most-reported content ranking not implemented |
| `casosPorPrioridad[]` | Hardcoded array | Priority classification not in API |
| `redEpidemiologos.totalActivos` | `47` | Active user tracking not implemented |
| `redInmunizadores.*` | All mock | Immunization studio metrics not tracked |
| `vectoresContagio[]` | Hardcoded array | Content type distribution not in API |
| `casosPorEstado[]` | Calculated estimate | Partial - only verified vs AI-only |
| `sistemaCodificacion.*` | Calculated estimates | Case coding system metrics not in API |

**Mock Data Example:**
```typescript
distribucionDesacuerdo: [
  { categoria: 'IA dice Falso, Humanos Verdadero', casos: 67, porcentaje: 35 },
  { categoria: 'IA dice Verdadero, Humanos Falso', casos: 45, porcentaje: 24 },
  { categoria: 'Desacuerdo en clasificación', casos: 78, porcentaje: 41 }
]

redInmunizadores: {
  totalActivos: 32,
  estrategiasDesarrolladas: 156,
  estrategiasActivas: 134,
  alcanceTotal: 1250000
}

vectoresContagio: [
  { tipo: 'Texto (T)', casos: 734, porcentaje: 47, codigo: 'T' },
  { tipo: 'Imagen (I)', casos: 423, porcentaje: 27, codigo: 'I' },
  { tipo: 'Video (V)', casos: 267, porcentaje: 17, codigo: 'V' },
  { tipo: 'Audio (A)', casos: 143, porcentaje: 9, codigo: 'A' }
]
```

---

## Summary Statistics

### API Coverage

| Dimension | Properties from API | Mock Properties | Coverage % |
|-----------|-------------------|----------------|-----------|
| **Magnitud** | 7 / 8 | 1 / 8 | 88% |
| **Temporalidad** | 4 / 7 | 3 / 7 | 57% |
| **Virulencia** | 3 / 9 | 6 / 9 | 33% |
| **Geográficos** | 2 / 6 | 4 / 6 | 33% |
| **Descriptivos** | 3 / 7 | 4 / 7 | 43% |
| **Mitigación** | 8 / 22 | 14 / 22 | 36% |
| **TOTAL** | **27 / 59** | **32 / 59** | **46%** |

---

## Key Properties Missing from API

### High Priority (Affects Core Functionality)

1. **Platform-Specific Case Counts** - API returns platform names but not case counts per platform
   - Affects: Dimension 3 (Virulencia), Dimension 5 (Descriptivos)
   - Current: Estimated/hardcoded values
   - Needs: Query to aggregate cases by platform metadata

2. **Geographic Coordinates** - No lat/lon for heat map visualization
   - Affects: Dimension 4 (Geográficos)
   - Current: All coordinates set to 0
   - Needs: Static mapping of Colombian regions to coordinates

3. **Content Type Distribution** - No breakdown by text/image/video/audio
   - Affects: Dimension 6 (Mitigación - vectores de contagio)
   - Current: Hardcoded distribution
   - Needs: Content type field in database + aggregation query

4. **Viralization Time Metrics** - Average time to viral spread not tracked
   - Affects: Dimension 2 (Temporalidad)
   - Current: Hardcoded 6.2 hours
   - Needs: Timestamp tracking for viralization events

### Medium Priority (Enhances Insights)

5. **True vs False Content Comparison** - No classification of factual accuracy
   - Affects: Dimension 2 (Temporalidad), Dimension 3 (Virulencia)
   - Current: Hardcoded comparison data
   - Needs: Fact-check verdict field + aggregation

6. **Engagement Distribution** - No breakdown by virality ranges
   - Affects: Dimension 3 (Virulencia)
   - Current: Hardcoded distribution
   - Needs: Engagement score bucketing query

7. **International vs National Sources** - Source origin not tracked
   - Affects: Dimension 4 (Geográficos)
   - Current: Hardcoded ratio
   - Needs: Source origin field in metadata

8. **Disagreement Type Breakdown** - No categorization of AI-human disagreements
   - Affects: Dimension 6 (Mitigación)
   - Current: Hardcoded categories
   - Needs: Analysis of disagreement patterns

### Low Priority (Nice to Have)

9. **Active User Counts** - Epidemiologists and immunizers not tracked
   - Affects: Dimension 6 (Mitigación)
   - Current: Hardcoded numbers
   - Needs: User activity tracking system

10. **Most Reported Content** - Top content by report frequency not queried
    - Affects: Dimension 6 (Mitigación)
    - Current: Hardcoded examples
    - Needs: Report frequency aggregation

11. **Attacked Personalities** - Entity mentions not tracked
    - Affects: Dimension 5 (Descriptivos)
    - Current: Hardcoded examples
    - Needs: Named entity recognition + tracking

12. **Immunization Studio Metrics** - Strategy creation/deployment not tracked
    - Affects: Dimension 6 (Mitigación - red inmunizadores)
    - Current: All mock data
    - Needs: Immunization studio database + tracking

---

## Recommendations

### Phase 1: Quick Wins (Improve to 60% API coverage)
1. ✅ Add platform case count aggregation (already in backend code)
2. Add Colombian region coordinate mapping (static data)
3. Calculate monthly increment properly (30-day query instead of estimate)
4. Add content type field to documents table

### Phase 2: Core Metrics (Improve to 75% API coverage)
1. Track viralization timestamps and calculate average spread time
2. Add fact-check verdict classification
3. Implement engagement score bucketing for distribution
4. Add source origin field (international/national)

### Phase 3: Advanced Analytics (Improve to 90% API coverage)
1. Implement AI-human disagreement categorization
2. Add user activity tracking (epidemiologists, immunizers)
3. Build most-reported content ranking
4. Implement named entity recognition for personality tracking

### Phase 4: Feature Complete
1. Build immunization studio database and metrics
2. Add priority classification system
3. Implement case state tracking beyond verified/AI-only
4. Create comprehensive case coding system

---

## Current Status

**Backend:** ✅ Deployed
**Frontend:** ⚠️ API call temporarily disabled due to runtime errors
**Display Mode:** Fallback to mock data until backend stability confirmed

**Last Updated:** 2025-01-21
**Branch:** `mapa-desinfodemico`
