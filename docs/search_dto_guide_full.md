# 🚀 Guía Completa de Integración y Uso

**Supabase Edge Function: `search-dto`**

------------------------------------------------------------------------

## 🌐 Base URL

    https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/search-dto

Esta API es el **punto único de entrada** para obtener, buscar, filtrar
y consultar casos analizados.\
Se basa en un modelo de **Jobs asíncronos**, lo que permite manejar
grandes volúmenes y consultas costosas sin bloquear al cliente.

------------------------------------------------------------------------

# 📦 Endpoints Disponibles

  Acción                   Método   Ruta
  ------------------------ -------- --------------------
  Buscar / filtrar casos   `POST`   `/search`
  Resumen para dashboard   `POST`   `/summary`
  Consulta individual      `POST`   `/lookup`
  Estado del job           `GET`    `/status/{job_id}`

------------------------------------------------------------------------

# 🔍 1. Búsqueda y Filtrado --- `POST /search`

Este es el endpoint más versátil para listados y feeds.

------------------------------------------------------------------------

## 📌 Escenario A: Casos pendientes (AI Only)

``` json
{
  "consensus_filter": "missing",
  "page": 1,
  "limit": 10,
  "select_fields": [
    "id",
    "overview.title",
    "overview.risk_score",
    "community"
  ]
}
```

**Resultado esperado** - `community.votes = 0` -
`community.status = "ai_only"`

------------------------------------------------------------------------

## 📌 Escenario B: Casos verificados (Human Consensus)

``` json
{
  "consensus_filter": "present",
  "page": 1,
  "limit": 10
}
```

**Resultado esperado** - `community.votes > 0` -
`community.status = "human_consensus"`

------------------------------------------------------------------------

## 📌 Escenario C: Búsqueda por Contenido

``` json
{
  "query": "elecciones venezuela",
  "page": 1,
  "limit": 20
}
```

------------------------------------------------------------------------

# 🏠 2. Resumen para Home --- `POST /summary`

Ideal para carga inicial rápida.

``` json
{
  "select_fields": ["id", "overview", "lifecycle"]
}
```

Internamente ejecuta una función RPC optimizada:
`get_dashboard_summary_paged`

------------------------------------------------------------------------

# 🧬 3. Consulta Individual --- `POST /lookup`

### 🔎 Por ID

``` json
{
  "identifier": "8df8bd34-4287-43d7-a300-b692086a1d49"
}
```

### 🔗 Por URL

``` json
{
  "identifier": "https://www.bbc.com/mundo/noticias-internacional-123"
}
```

**Respuesta:** objeto único del tipo `StandardizedCase`

------------------------------------------------------------------------

# 🔁 4. Modelo Asíncrono basado en Jobs

## 🧭 Diagrama de Flujo (Flowchart)

``` mermaid
flowchart TD
    A[Cliente hace POST /search|summary|lookup] --> B((Job Queue))
    B --> C[Responder 202 + job_id]
    C --> D[Cliente hace GET /status/{job_id}]
    D -->|processing| D
    D -->|completed| E[Devolver result JSON]
    D -->|failed| F[Error controlado]
```

------------------------------------------------------------------------

## 🎬 Diagrama de Secuencia (Architecture)

``` mermaid
sequenceDiagram
    participant App
    participant EdgeFn as Edge Function search-dto
    participant Queue
    participant DB

    App->>EdgeFn: POST /search
    EdgeFn->>Queue: Encola job
    EdgeFn-->>App: 202 Accepted + job_id
    App->>EdgeFn: GET /status/{id}
    EdgeFn->>Queue: ¿Trabajo listo?
    Queue->>DB: Ejecuta query
    DB-->>Queue: Devuelve datos
    Queue-->>EdgeFn: completed
    EdgeFn-->>App: Result + pagination
```

------------------------------------------------------------------------

# ✂️ 5. Optimización con `select_fields`

Envía solamente los campos necesarios.

### Ejemplo

``` json
"select_fields": [
  "id",
  "overview.title",
  "overview.verdict_label",
  "community.votes"
]
```

### Resultado

``` json
{
  "id": "123",
  "overview": {
    "title": "Noticia Fake",
    "verdict_label": "Requiere AMI"
  },
  "community": {
    "votes": 12
  }
}
```

------------------------------------------------------------------------

# 🧠 6. Buenas Prácticas y Antipatrones

## ✔️ Recomendado

-   Poll cada **1--2 segundos**
-   Implementar **backoff exponencial**
-   Manejar:
    -   `completed`
    -   `processing`
    -   `failed`
    -   `timeout`
-   Usar `/lookup` para un solo caso

------------------------------------------------------------------------

## ❌ Evitar

-   Poll infinito sin límite
-   `limit` muy grande en móvil (máx recomendado: 50)
-   No usar `/search` para buscar **1** caso → usa `/lookup`

------------------------------------------------------------------------

# 💻 7. Plantillas Express

## JS --- Ejecutar y Poll

``` js
const start = await fetch(BASE + '/search', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ consensus_filter:'missing' })
});
const { job_id } = await start.json();

async function poll(id) {
  const res = await fetch(BASE + '/status/' + id);
  const data = await res.json();
  if (data.status === 'processing') return poll(id);
  return data.result;
}
```

------------------------------------------------------------------------

# 🎯 Resumen Final

La función `search-dto` permite:

-   Construir feeds de noticias inteligentes
-   Filtrar por validación humana vs IA
-   Consultar casos individuales
-   Segmentar datos para cargas ligeras
-   Escalar automáticamente mediante trabajos asincrónicos

Tu app puede mover fácilmente datos **de resumen → búsqueda → detalle**
sin cambiar endpoint.

------------------------------------------------------------------------

*Archivo Markdown generado automáticamente*
