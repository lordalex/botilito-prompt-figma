# Guía de Integración del DTO StandardizedCase

## Índice

1. [Introducción](#1-introducción)
2. [Endpoint y Estructura Base](#2-endpoint-y-estructura-base)
3. [Identificación y Tipo de Caso](#3-identificación-y-tipo-de-caso)
4. [Ciclo de Vida (Lifecycle)](#4-ciclo-de-vida-lifecycle)
5. [Resumen General (Overview)](#5-resumen-general-overview)
6. [Evidencias Detalladas (Insights)](#6-evidencias-detalladas-insights)
   - 6.1 [Metadatos (metadata)](#61-metadatos-metadata)
   - 6.2 [Análisis Forense (forensics)](#62-análisis-forense-forensics)
   - 6.3 [Calidad de Contenido (content_quality)](#63-calidad-de-contenido-content_quality)
   - 6.4 [Verificación de Hechos (fact_check)](#64-verificación-de-hechos-fact_check)
7. [Consenso Comunitario (Community)](#7-consenso-comunitario-community)
8. [Información del Reportero (Reporter)](#8-información-del-reportero-reporter)
9. [Ejemplo Completo de Payload](#9-ejemplo-completo-de-payload)
10. [Referencia de Rutas JSON](#10-referencia-de-rutas-json)

---

## 1. Introducción

El sistema devuelve un formato JSON estandarizado denominado `StandardizedCase`. Este formato normaliza los resultados de múltiples algoritmos de análisis (ELA, Detección de Ruido, Metadatos, YOLO, AMI, Fact-Checking) en una estructura única y predecible para el Frontend.

El objeto puede representar análisis de diferentes tipos de medios: texto, imagen, video o audio.

**Nota sobre nombres de variables:** Los nombres de contenedores como `result` y `standardized_case` que aparecen en los ejemplos son específicos de la implementación actual y pueden variar según el endpoint o la versión de la API. Los nombres de propiedades internas como `id`, `type`, `overview`, `insights`, etc., son estándar y consistentes en todas las implementaciones.

---

## 2. Endpoint y Estructura Base

### Endpoint de Consulta

```
GET /functions/v1/image-analysis-DTO/status/{job_id}
```

### Estructura de Respuesta

La respuesta contiene un objeto con la estructura del caso estandarizado. En el ejemplo siguiente, `result` y `standardized_case` son nombres de contenedores específicos de esta implementación:

```json
{
  "result": {
    "standardized_case": {
      "id": "uuid-...",
      "type": "image",
      "created_at": "2026-01-10T12:00:00Z",
      "lifecycle": { ... },
      "overview": { ... },
      "insights": [ ... ],
      "community": { ... },
      "reporter": { ... }
    }
  }
}
```

**Importante:** Los nombres `result` y `standardized_case` son variables del contexto específico. Las propiedades del objeto del caso (`id`, `type`, `lifecycle`, `overview`, `insights`, `community`, `reporter`) son estándar.

---

## 3. Identificación y Tipo de Caso

Campos básicos para identificar el recurso analizado.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | Identificador único del caso en la base de datos |
| `type` | String | Tipo de medio analizado: `"text"`, `"image"`, `"video"`, `"audio"` |
| `created_at` | ISO-8601 | Fecha de creación del registro |

### Ejemplo

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "image",
  "created_at": "2024-05-20T10:00:00Z"
}
```

---

## 4. Ciclo de Vida (Lifecycle)

Describe el estado técnico y de negocio del caso durante el proceso de análisis.

### Propiedades

| Propiedad | Tipo | Valores Posibles | Descripción |
|-----------|------|------------------|-------------|
| `job_status` | String | `processing`, `completed`, `failed` | Estado técnico del trabajo de IA |
| `custody_status` | String | `ai_processed`, `human_review`, `finalized` | Estado en el flujo de moderación |
| `last_update` | ISO-8601 | - | Última actualización del caso |

### Descripción de Estados

**job_status:**
- `processing`: El análisis está en curso
- `completed`: El análisis finalizó exitosamente
- `failed`: El análisis encontró un error

**custody_status:**
- `ai_processed`: Solo la IA ha procesado el contenido
- `human_review`: El caso está siendo revisado por moderadores
- `finalized`: Tiene consenso definitivo

### Ejemplo

```json
{
  "lifecycle": {
    "job_status": "completed",
    "custody_status": "ai_processed",
    "last_update": "2026-01-10T12:00:00Z"
  }
}
```

---

## 5. Resumen General (Overview)

Contiene la información resumida para renderizar vistas previas, tarjetas y el veredicto principal del análisis.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `title` | String | Título del reporte o del contenido analizado |
| `summary` | String | Resumen ejecutivo generado por la IA |
| `verdict_label` | String | Etiqueta cualitativa del veredicto |
| `risk_score` | Number (0-100) | Puntuación de riesgo o calidad |
| `main_asset_url` | URL | URL del recurso principal (imagen original, captura de pantalla) |
| `source_domain` | String | Dominio de origen (para contenido web) |

### Interpretación del Risk Score

El significado del `risk_score` depende del contexto:

**Para análisis forense (imágenes/videos):**
- 0-30: Auténtico
- 31-70: Sospechoso
- 71-100: Alta probabilidad de manipulación

**Para análisis AMI (textos):**
- 0-30: Requiere enfoque AMI
- 31-70: Cumplimiento parcial
- 71-100: Desarrolla las premisas AMI

### Ejemplo

```json
{
  "overview": {
    "title": "Image Forensic Analysis",
    "summary": "El análisis automatizado detectó un 85% de probabilidad de manipulación. Veredicto final: Probablemente Manipulado.",
    "verdict_label": "Probablemente Manipulado",
    "risk_score": 85,
    "main_asset_url": "https://pub.r2.dev/uploads/original_source.jpg",
    "source_domain": null
  }
}
```

---

## 6. Evidencias Detalladas (Insights)

Array polimórfico que contiene todos los hallazgos del análisis. Cada elemento representa una evidencia específica.

### Estructura Genérica

```json
{
  "id": "identificador_unico",
  "category": "metadata | forensics | content_quality | fact_check",
  "label": "Título legible del insight",
  "value": "Valor principal",
  "score": 85,
  "description": "Explicación narrativa detallada del hallazgo",
  "artifacts": [
    {
      "type": "image_url | text_snippet",
      "label": "Descripción del artefacto",
      "content": "URL o texto"
    }
  ],
  "raw_data": { }
}
```

### Propiedades Comunes

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | String | Identificador único del insight |
| `category` | String | Categoría del análisis |
| `label` | String | Título descriptivo |
| `value` | String/Number | Valor principal del hallazgo |
| `score` | Number (0-100) | Nivel de riesgo o cumplimiento (opcional) |
| `description` | String | Explicación detallada |
| `artifacts` | Array | Evidencias de soporte (imágenes, textos) |
| `raw_data` | Object | Datos técnicos adicionales (opcional) |

---

### 6.1 Metadatos (metadata)

Información técnica sobre el archivo o clasificación del contenido.

#### 6.1.1 Metadatos Técnicos de Archivo

**ID:** `meta_tech`

Verifica si el archivo contiene rastros de software de edición.

**Propiedades específicas:**

| Propiedad en raw_data | Tipo | Descripción |
|----------------------|------|-------------|
| `format` | String | Formato del archivo |
| `Software` | String | Software de edición detectado |
| `DateTime` | String | Fecha de última modificación |
| `Dimensions` | String | Dimensiones del archivo |

```json
{
  "id": "meta_tech",
  "category": "metadata",
  "label": "Technical Metadata",
  "value": "JPEG",
  "score": 100,
  "description": "Dimensions: 1920x1080. Software traces: Found.",
  "artifacts": [],
  "raw_data": {
    "format": "JPEG",
    "Software": "Adobe Photoshop 21.0",
    "DateTime": "2023:10:05",
    "Dimensions": "1920x1080"
  }
}
```

**Nota:** Un `score > 0` o la presencia de `raw_data.Software` indica que se detectaron rastros de edición.

#### 6.1.2 Clasificación de Contexto

**ID:** `meta_context_type`

Indica si el texto analizado es un hecho, opinión o investigación periodística.

**Valores posibles:**
- `"Hecho"`
- `"Opinión"`
- `"Periodismo de Investigación"`

```json
{
  "id": "meta_context_type",
  "category": "metadata",
  "label": "Clasificación de Contexto",
  "value": "Hecho",
  "description": "El artículo se limita a reportar sucesos verificables",
  "artifacts": [
    {
      "type": "text_snippet",
      "label": "Fuentes Identificadas",
      "content": "Ministerio de Salud, Reuters"
    }
  ]
}
```

---

### 6.2 Análisis Forense (forensics)

Resultados de algoritmos matemáticos de detección de manipulación.

#### 6.2.1 Error Level Analysis (ELA)

**ID:** `algo_ela`

Detecta compresión inconsistente que indica manipulación.

**Artifacts típicos:**
- `artifacts[0]`: Heatmap Visualization (mapa de calor)
- `artifacts[1]`: Manipulation Mask (máscara de manipulación)

```json
{
  "id": "algo_ela",
  "category": "forensics",
  "label": "ERROR LEVEL ANALYSIS",
  "value": "85%",
  "score": 85,
  "description": "Algoritmo de análisis forense que detecta artefactos de compresión",
  "artifacts": [
    {
      "type": "image_url",
      "label": "Heatmap Visualization",
      "content": "https://pub.r2.dev/jobs/123/ela_hm.jpg"
    },
    {
      "type": "image_url",
      "label": "Manipulation Mask",
      "content": "https://pub.r2.dev/jobs/123/ela_mk.jpg"
    }
  ]
}
```

**Nota:** El `score` indica el nivel de sospecha de manipulación (0-100). Los mapas de calor visualizan áreas con niveles de compresión inconsistentes.

#### 6.2.2 Detección de Clickbait

**ID:** `tech_clickbait`

Analiza coherencia entre titular y contenido.

**Interpretación del score:**
- `0`: Clickbait detectado
- `100`: Titular coherente

```json
{
  "id": "tech_clickbait",
  "category": "forensics",
  "label": "Coherencia Titular-Contenido",
  "value": "Clickbait Detectado",
  "score": 0,
  "description": "El titular promete una revelación que el texto no entrega"
}
```

---

### 6.3 Calidad de Contenido (content_quality)

Análisis semántico del contenido mediante IA.

#### 6.3.1 Detección de Objetos (YOLO)

**ID:** `obj_yolo`

Identifica objetos presentes en imágenes usando YOLOv8.

**Estructura de artifacts:**
- `artifacts[0]`: Generalmente "Context View" (vista general)
- `artifacts[1..n]`: Recortes individuales de objetos detectados

**Propiedades en raw_data:**

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `count` | Number | Número de objetos detectados |
| `objects` | Array | Lista de nombres de objetos |

```json
{
  "id": "obj_yolo",
  "category": "content_quality",
  "label": "Detected Objects",
  "value": "3 Objects",
  "score": 0,
  "description": "El análisis semántico identificó 3 objetos",
  "artifacts": [
    {
      "type": "image_url",
      "label": "Context View",
      "content": "https://pub.r2.dev/jobs/123/context_512px.jpg"
    },
    {
      "type": "image_url",
      "label": "person (90%)",
      "content": "https://pub.r2.dev/jobs/123/obj_0_120.jpg"
    },
    {
      "type": "image_url",
      "label": "car (85%)",
      "content": "https://pub.r2.dev/jobs/123/obj_1_120.jpg"
    }
  ],
  "raw_data": {
    "count": 2,
    "objects": ["person", "car"]
  }
}
```

**Nota:** El `label` de cada artifact incluye el tipo de objeto y el porcentaje de confianza de la detección.

#### 6.3.2 Criterios AMI

**ID:** `ami_crit_{numero}` (del 1 al 20)

Indicadores de alfabetización mediática e informacional.

**Valores posibles:**
- `"Cumple"`
- `"No Cumple"`
- `"Parcial"`

**Valores de score:**
- `0`: No cumple
- `50`: Cumple parcialmente
- `100`: Cumple completamente

```json
{
  "id": "ami_crit_1",
  "category": "content_quality",
  "label": "Claridad de la Fuente",
  "value": "Cumple",
  "score": 100,
  "description": "El autor y el medio están claramente identificados",
  "artifacts": [
    {
      "type": "text_snippet",
      "label": "Cita",
      "content": "Por Juan Pérez, BBC Mundo"
    }
  ]
}
```

---

### 6.4 Verificación de Hechos (fact_check)

Afirmaciones específicas extraídas y verificadas.

**ID:** `fc_{indice}` (ej: `fc_0`, `fc_1`)

**Valores posibles:**
- `"Verificado"`
- `"Refutado"`
- `"No Verificable"`

```json
{
  "id": "fc_0",
  "category": "fact_check",
  "label": "Verificación de Afirmación",
  "value": "Refutado",
  "score": 0,
  "description": "Afirmación: 'El cielo es verde'",
  "artifacts": [
    {
      "type": "text_snippet",
      "label": "Análisis",
      "content": "Físicamente imposible bajo condiciones atmosféricas normales"
    }
  ]
}
```

---

## 7. Consenso Comunitario (Community)

Información sobre la validación humana del caso.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `votes` | Number | Número total de votos recibidos |
| `status` | String | Estado de consenso: `"ai_only"` o `"human_consensus"` |
| `breakdown` | Object | Conteo de votos por categoría (opcional) |

### Interpretación

- `votes = 0` y `status = "ai_only"`: El caso está pendiente de revisión humana
- `votes > 0` y `status = "human_consensus"`: El caso tiene participación comunitaria

### Ejemplo

```json
{
  "community": {
    "votes": 15,
    "status": "human_consensus",
    "breakdown": {
      "Verdadero": 12,
      "Falso": 3
    }
  }
}
```

---

## 8. Información del Reportero (Reporter)

Usuario que envió el caso originalmente.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | Identificador único del usuario |
| `name` | String | Nombre del usuario |
| `reputation` | Number | Puntuación de reputación |

### Ejemplo

```json
{
  "reporter": {
    "id": "user-uuid-1234",
    "name": "María González",
    "reputation": 120
  }
}
```

---

## 9. Ejemplo Completo de Payload

Este ejemplo muestra la estructura completa de una respuesta. **Nota:** Los nombres `result` y `standardized_case` son contenedores específicos de la implementación actual.

```json
{
  "result": {
    "standardized_case": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "created_at": "2024-05-20T10:00:00Z",
      "type": "image",
      "lifecycle": {
        "job_status": "completed",
        "custody_status": "ai_processed",
        "last_update": "2024-05-20T10:00:05Z"
      },
      "overview": {
        "title": "Image Forensic Analysis",
        "summary": "El análisis automatizado detectó un 85% de probabilidad de manipulación. Veredicto final: Probablemente Manipulado.",
        "verdict_label": "Probablemente Manipulado",
        "risk_score": 85,
        "main_asset_url": "https://pub.r2.dev/uploads/original_source.jpg"
      },
      "insights": [
        {
          "id": "meta_tech",
          "category": "metadata",
          "label": "Technical Metadata",
          "value": "JPEG",
          "score": 100,
          "description": "Dimensions: 800x600. Software traces: Found.",
          "artifacts": [],
          "raw_data": {
            "format": "JPEG",
            "Software": "Adobe Photoshop CC",
            "DateTime": "2023:01:15"
          }
        },
        {
          "id": "algo_ela",
          "category": "forensics",
          "label": "ERROR LEVEL ANALYSIS",
          "value": "85%",
          "score": 85,
          "description": "Algoritmo de análisis forense que detecta artefactos de compresión",
          "artifacts": [
            {
              "type": "image_url",
              "content": "https://pub.r2.dev/jobs/123/ela_hm.jpg",
              "label": "Heatmap Visualization"
            },
            {
              "type": "image_url",
              "content": "https://pub.r2.dev/jobs/123/ela_mk.jpg",
              "label": "Manipulation Mask"
            }
          ]
        },
        {
          "id": "obj_yolo",
          "category": "content_quality",
          "label": "Detected Objects",
          "value": "2 Objects",
          "score": 0,
          "description": "El análisis semántico identificó 2 objetos",
          "artifacts": [
            {
              "type": "image_url",
              "content": "https://pub.r2.dev/jobs/123/context_512px.jpg",
              "label": "Context View"
            },
            {
              "type": "image_url",
              "content": "https://pub.r2.dev/jobs/123/obj_0_120.jpg",
              "label": "person (92%)"
            }
          ],
          "raw_data": {
            "count": 2,
            "objects": ["person"]
          }
        }
      ],
      "community": {
        "votes": 0,
        "status": "ai_only"
      },
      "reporter": {
        "id": "user-uuid",
        "name": "Usuario Demo",
        "reputation": 150
      }
    }
  }
}
```

---

## 10. Referencia de Rutas JSON

Esta tabla muestra las rutas para acceder a cada propiedad. **Importante:** Las rutas incluyen los contenedores `result.standardized_case` que son específicos de la implementación actual. Las propiedades finales (`id`, `type`, etc.) son estándar.

| Dato | Ruta en Implementación Actual | Propiedad Estándar |
|------|-------------------------------|-------------------|
| ID del caso | `result.standardized_case.id` | `id` |
| Tipo de medio | `result.standardized_case.type` | `type` |
| Fecha de creación | `result.standardized_case.created_at` | `created_at` |
| Estado del trabajo | `result.standardized_case.lifecycle.job_status` | `lifecycle.job_status` |
| Estado de custodia | `result.standardized_case.lifecycle.custody_status` | `lifecycle.custody_status` |
| Última actualización | `result.standardized_case.lifecycle.last_update` | `lifecycle.last_update` |
| Título | `result.standardized_case.overview.title` | `overview.title` |
| Resumen | `result.standardized_case.overview.summary` | `overview.summary` |
| Puntuación de riesgo | `result.standardized_case.overview.risk_score` | `overview.risk_score` |
| Veredicto | `result.standardized_case.overview.verdict_label` | `overview.verdict_label` |
| Imagen principal | `result.standardized_case.overview.main_asset_url` | `overview.main_asset_url` |
| Dominio fuente | `result.standardized_case.overview.source_domain` | `overview.source_domain` |
| Lista de evidencias | `result.standardized_case.insights` | `insights` |
| ID de evidencia | `result.standardized_case.insights[i].id` | `insights[i].id` |
| Categoría de evidencia | `result.standardized_case.insights[i].category` | `insights[i].category` |
| Etiqueta de evidencia | `result.standardized_case.insights[i].label` | `insights[i].label` |
| Valor de evidencia | `result.standardized_case.insights[i].value` | `insights[i].value` |
| Score de evidencia | `result.standardized_case.insights[i].score` | `insights[i].score` |
| Descripción de evidencia | `result.standardized_case.insights[i].description` | `insights[i].description` |
| Artefactos | `result.standardized_case.insights[i].artifacts` | `insights[i].artifacts` |
| Datos crudos | `result.standardized_case.insights[i].raw_data` | `insights[i].raw_data` |
| Votos comunitarios | `result.standardized_case.community.votes` | `community.votes` |
| Estado de consenso | `result.standardized_case.community.status` | `community.status` |
| Desglose de votos | `result.standardized_case.community.breakdown` | `community.breakdown` |
| ID del reportero | `result.standardized_case.reporter.id` | `reporter.id` |
| Nombre del reportero | `result.standardized_case.reporter.name` | `reporter.name` |
| Reputación | `result.standardized_case.reporter.reputation` | `reporter.reputation` |

### Notas Importantes sobre Rutas

1. Los contenedores `result` y `standardized_case` son variables específicas del contexto de respuesta
2. Las propiedades estándar (`id`, `type`, `lifecycle`, `overview`, `insights`, `community`, `reporter`) son consistentes
3. El array `insights` requiere indexación (`insights[i]`) para acceder a elementos individuales
4. Las propiedades opcionales pueden no estar presentes en todas las respuestas