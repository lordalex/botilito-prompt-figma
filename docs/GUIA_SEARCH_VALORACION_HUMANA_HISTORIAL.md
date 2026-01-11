📘 Guía de Integración API: Search DTO (Búsqueda y Análisis)

Base URL: https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/search-dto

Esta API actúa como un orquestador unificado para buscar casos existentes y analizar nuevo contenido. Su característica principal es la capacidad de filtrar por el estado de "consenso comunitario" y proyectar solo los campos necesarios para optimizar la respuesta.

1. Búsqueda y Filtrado (POST /search)

Este es el endpoint principal para poblar listados, feeds y colas de moderación.

📌 Escenario A: Cola de Validación Humana ("Por Revisar")

Recupera casos que han sido procesados por la IA pero que aún no tienen veredicto humano (es decir, la columna case_judgement es null).

Payload:

code
JSON
download
content_copy
expand_less
{
  "consensus_filter": "missing",
  "page": 1,
  "limit": 10,
  "select_fields": [
    "id",
    "created_at",
    "type",
    "overview.title",
    "overview.risk_score",
    "overview.verdict_label",
    "overview.main_asset_url",
    "community"
  ]
}

consensus_filter: "missing": Indica al backend que busque registros donde cases.case_judgement es nulo.

select_fields: Lista de campos a devolver. Usar esto reduce drásticamente el tamaño del JSON (ideal para tarjetas en móviles).

📌 Escenario B: Historial de Casos ("Ya Votados")

Recupera casos que ya tienen un veredicto humano o participación comunitaria.

Payload:

code
JSON
download
content_copy
expand_less
{
  "consensus_filter": "present",
  "page": 1,
  "limit": 10,
  "select_fields": [
    "id",
    "created_at",
    "type",
    "overview",
    "community"
  ]
}

consensus_filter: "present": Busca registros donde cases.case_judgement no es nulo.

📌 Escenario C: Búsqueda por Texto

Busca documentos por contenido semántico o coincidencia de texto.

Payload:

code
JSON
download
content_copy
expand_less
{
  "query": "elecciones venezuela",
  "page": 1,
  "limit": 20
}
2. Consulta de Estado (GET /status/{jobId})

Como la búsqueda es asíncrona (para manejar grandes volúmenes de datos y joins complejos), debes sondear este endpoint con el job_id devuelto por /search.

Respuesta Exitosa (completed):

code
JSON
download
content_copy
expand_less
{
  "id": "uuid-del-job",
  "status": "completed",
  "result": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "returnedCount": 10
    },
    "cases": [
      {
        "id": "8df8bd34-4287-43d7-a300-b692086a1d49",
        "created_at": "2026-01-07T20:47:28.349+00:00",
        "type": "text",
        "overview": {
          "title": "Título de la Noticia",
          "risk_score": 85,
          "verdict_label": "Desarrolla las estrategias AMI",
          "main_asset_url": "https://..."
        },
        "community": {
          "votes": 0,
          "status": "ai_only" // O 'human_consensus'
        }
      }
      // ... más casos
    ]
  }
}
3. Análisis de Contenido (POST /submit)

Envía nuevo contenido para ser procesado por el motor de IA.

Payload:

code
JSON
download
content_copy
expand_less
{
  "url": "https://elpais.com/noticia-ejemplo",
  "use_cache": true
}

(Nota: También acepta text si no hay URL).

4. Estructura del Objeto StandardizedCase

Este es el esquema completo (DTO) que devuelve el backend antes de aplicar select_fields.

Campo	Tipo	Descripción
id	UUID	Identificador único del documento.
type	String	text, image, video.
lifecycle	Object	Estado del procesamiento (job_status, custody_status).
overview	Object	Resumen visual: title, summary, risk_score (0-100), verdict_label.
insights	Array	Lista de hallazgos detallados (Verificación, Contexto, AMI).
reporter	Object	Datos del usuario que reportó (name, reputation).
community	Object	Estado del consenso: votes (conteo), status (ai_only / human_consensus).
Detalle de insights (Novedad: Clasificación de Contexto)

El backend ahora incluye automáticamente la clasificación de contexto (Hecho vs Opinión) dentro del array insights:

code
JSON
download
content_copy
expand_less
{
  "id": "meta_context_type",
  "category": "metadata",
  "label": "Clasificación de Contexto",
  "value": "Hecho", // O "Opinión", "Periodismo de Investigación"
  "description": "Justificación generada por la IA...",
  "artifacts": [
    {
      "type": "text_snippet",
      "label": "Fuentes Identificadas",
      "content": "Ministerio de Salud, OMS"
    }
  ]
}
Resumen de Integración Frontend

Validación Humana: Llama a /search con consensus_filter: "missing". Renderiza las tarjetas usando los datos de overview.

Historial: Llama a /search con consensus_filter: "present".

Detalle del Caso: Si necesitas ver el detalle completo de un ítem de la lista, puedes hacer una llamada a /lookup con el ID, o simplemente usar los datos ya obtenidos si no usaste select_fields restrictivos.
