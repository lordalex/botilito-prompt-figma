# Vista ContentUploadResult - Mapeo del Payload

Este documento mapea las secciones de la interfaz en `ContentUploadResult.tsx` a sus correspondientes campos en la respuesta de la API StandardizedCase.

---

## Resumen de la Estructura del Payload

```json
{
  "case": {
    "id": "cadena",
    "type": "texto | imagen | audio | video",
    "created_at": "cadena fecha ISO",
    "overview": { ... },
    "insights": [ ... ],
    "reporter": { ... },
    "community": { ... },
    "lifecycle": { ... }
  }
}
```

---

## Mapeo de Secciones

### 1. Encabezado / Tarjeta de Información del Caso

| Campo UI | Ruta en Payload | Valores por Defecto (Fallbacks) |
|----------|-----------------|---------------------------------|
| Caso (ID) | `case.id` → `generateCaseCode()` | Generado desde tipo + vector |
| Tipo | `case.type` | `"TEXT"` |
| Vector de transmisión | `case.overview.source_domain` ? `"Web"` : metadata.vector | `"Web"` |
| Reportado por | `case.reporter.name` | `"-"` |
| Fecha | `case.created_at` | Fecha actual |

---

### 2. Previsualización de Imagen/Captura

| Campo UI | Ruta en Payload |
|----------|-----------------|
| Imagen Principal de Activo | `case.overview.main_asset_url` |
| Etiqueta "Captura Original" | Etiqueta estática |

---

### 3. Título y Meta Sección (Casos de Texto)

| Campo UI | Ruta en Payload | Valores por Defecto |
|----------|-----------------|---------------------|
| Titular | `case.overview.title` | `"Sin título"` |
| Contenido Analizado | `case.overview.summary` | `"Sin resumen disponible."` |

---

### 4. Fila de Etiquetas

| Elemento UI | Ruta en Payload | Condición |
|-------------|-----------------|-----------|
| Badge de Fuente | `case.overview.source_domain` | Solo si existe |
| Badge de Tipo | `insights[id='meta_context_type'].value` | `"Hecho"` por defecto |
| Badge de Tema | `case.metadata.theme` | Solo si existe |
| "Ver contenido original →" | `case.overview.source_url` | Solo si existe |

---

### 5. Tarjeta de Diagnóstico Infodémico

| Campo UI | Ruta en Payload |
|----------|-----------------|
| Puntuación % | `case.overview.risk_score` |
| Badge de Veredicto | Derivado del umbral de `risk_score` |
| Descripción | Texto estático basado en `risk_score` |

---

### 6. Tarjeta de Análisis Humano

| Campo UI | Ruta en Payload |
|----------|-----------------|
| Consenso % | `case.community.votes * 10` (máx 100) |
| Badge de Estado | `case.community.status` |

---

### 7. Resumen del Contenido (Sección AMI)

| Campo UI | Ruta en Payload (Prioridad Nueva > Antigua) | Valores por Defecto |
|----------|---------------------------------------------|---------------------|
| **Qué** | `raw_data.estructura_hecho.que` / `estructura_opinion.tesis_central` / `analisis_hecho.resumen.que_sucedio` | `overview.summary` |
| **Quién** | `raw_data.estructura_hecho.quien` / `estructura_opinion.postura_autor` / `analisis_hecho.resumen.quien_involucrado` | `overview.source_domain` |
| **Cuándo** | `raw_data.estructura_hecho.cuando` / `analisis_hecho.resumen.cuando_ocurrio` | `created_at` formateado |
| **Dónde** | `raw_data.estructura_hecho.donde` / `estructura_investigacion.tipos_evidencia` / `analisis_hecho.resumen.donde_sucedio` | Vector de transmisión |

---

### 8. Análisis de Fuentes y Datos (Tarjeta Azul)

| Campo UI | Ruta en Payload |
|----------|-----------------|
| Descripción | `insights[id='tech_sources'].description` |

---

### 9. Alerta: Titular vs. Contenido (Tarjeta Roja)

| Campo UI | Ruta en Payload |
|----------|-----------------|
| Descripción | `insights[id='tech_clickbait'].raw_data.analisis_ami` |

---

### 10. Competencias AMI Recomendadas (Tarjeta Verde)

| Campo UI | Ruta en Payload | Valores por Defecto |
|----------|-----------------|---------------------|
| Ítems de la Lista | 1. `insights[cualquiera].raw_data.recomendaciones[]` (Nuevo Schema) <br> 2. `insights[id='meta_context_type'].raw_data.orientacion_usuario[]` (Viejo Schema) | `insights[category='competency'].description` |
| Conclusión | `raw_data.diagnosticoAMI` / `raw_data.conclusion` | Ninguno |

---

### 11. Tarjeta de Estadísticas del Análisis

| Campo UI | Ruta en Payload |
|----------|-----------------|
| Pruebas realizadas | `insights.length` |
| Tiempo total | `"12.0s"` (estático) |
| Nivel de precisión | `overview.risk_score + "%"` |

---

### 12. Módulo de Cadena de Custodia

| Campo UI | Ruta en Payload |
|----------|-----------------|
| Caso creado | `case.created_at` |
| Análisis ejecutado | `case.created_at + 5s` |
| Diagnóstico generado | `overview.verdict_label` |

---

### 13. Tarjeta de Recomendaciones (Barra Lateral)

| Campo UI | Ruta en Payload | Orden de Prioridad |
|----------|-----------------|--------------------|
| Ítems de la Lista | 1. `insights[cualquiera].raw_data.recomendaciones[]` | Primario (Nuevo Schema) |
| | 2. `insights[id='meta_context_type'].raw_data.orientacion_usuario[]` | Secundario (Viejo Schema) |
| | 3. `case.recommendations[]` | Terciario |

---

## Categorías Clave de Insights

| Categoría | Propósito | Ejemplos de IDs de Insight |
|-----------|-----------|----------------------------|
| `metadata` | Análisis de fuente, info técnica | `meta_context_type`, `tech_sources` |
| `content_quality` | Puntuaciones criterios AMI | `ami_crit_1` hasta `ami_crit_20` |
| `fact_check` | Verificación de afirmaciones | `fc_0`, `fc_1`, etc. |
| `forensics` | Manipulación de imagen/audio | `tech_clickbait` |
| `competency` | Recomendaciones de habilidades AMI | (derivado de content_quality) |
| `recommendation`| Acciones sugeridas al usuario | (derivado o explícito) |

---

## Estructura del Insight `meta_context_type`

Este es el insight principal para el análisis de texto que contiene los datos estructurados:

```json
{
  "id": "meta_context_type",
  "label": "Clasificación de Contexto",
  "value": "Hecho | Opinión | Investigación",
  "category": "metadata",
  "raw_data": {
    "clasificacion": {
      "tipo": "Hecho",
      "razon": "..."
    },
    "analisis_hecho": {
      "resumen": {
        "que_sucedio": "...",
        "donde_sucedio": "...",
        "cuando_ocurrio": "...",
        "quien_involucrado": "..."
      },
      "alerta_clickbait": {
        "es_clickbait": false,
        "analisis": "..."
      },
      "analisis_contenido": {
        "fuentes_identificables": "...",
        "datos_contrastables": "..."
      }
    },
    "evaluacion_ami": {
      "etiqueta": "Desarrolla las premisas AMI",
      "justificacion": "..."
    },
    "orientacion_usuario": [
      "Recomendación 1",
      "Recomendación 2",
      "..."
    ],
    "conclusion": "Texto de conclusión resumida...",
    "invitacion": "CTA para cursos AMI..."
  }
}
```
