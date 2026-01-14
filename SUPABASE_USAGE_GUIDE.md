# Guía de Uso de la API de Orquestación (Supabase) para Frontend

## Introducción

Esta guía está dirigida a los desarrolladores de frontend y detalla cómo interactuar con la **Supabase Function (`text-analysis-DTO`)**, que actúa como la puerta de enlace principal para el sistema de análisis de texto. Esta función simplifica la interacción con el backend, proporcionando un DTO (Data Transfer Object) estandarizado y fácil de consumir.

## Autenticación

Todas las solicitudes a la Supabase Function deben estar autenticadas. Debes incluir un token de acceso (JWT) válido de un usuario de Supabase en la cabecera `Authorization`.

**Ejemplo de Cabecera:**
```
Authorization: Bearer <SUPABASE_JWT_TOKEN>
```

## Flujo de Trabajo Asíncrono

La API opera de forma asíncrona. El proceso consta de dos pasos:

1.  **Paso 1: Iniciar el Análisis**: Realizas una solicitud `POST` a `/text-analysis-DTO/submit`. La API puede devolver un resultado de caché al instante o iniciar un nuevo trabajo y devolver un `job_id`.
2.  **Paso 2: Consultar el Resultado**: Si se inició un nuevo trabajo, usas el `job_id` para consultar periódicamente (hacer *polling*) el endpoint `/text-analysis-DTO/status/{job_id}` hasta que el análisis esté completo.

---

## Paso 1: Iniciar un Trabajo de Análisis

**Endpoint:** `POST /text-analysis-DTO/submit`

Este endpoint recibe una URL o un texto y comienza el proceso de análisis.

### Cuerpo de la Solicitud

| Campo       | Tipo      | Requerido | Descripción                                                                                             |
| ----------- | --------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `url`       | `string`  | Opcional  | La URL del artículo a analizar.                                                                         |
| `text`      | `string`  | Opcional  | Un bloque de texto a analizar.                                                                          |
| `use_cache` | `boolean` | Opcional  | Si es `true` (valor por defecto), la API intentará devolver un resultado de caché si la URL ya fue analizada. |

### Ejemplo de Solicitud con `fetch` (JavaScript)

```javascript
const supabaseToken = 'tu-jwt-de-supabase';
const functionUrl = 'https://<project-ref>.supabase.co/functions/v1/text-analysis-DTO/submit';

const response = await fetch(functionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseToken}`
  },
  body: JSON.stringify({
    url: 'https://www.example.com/news/article-to-analyze',
    use_cache: true
  })
});

const data = await response.json();
console.log(data);
```

---

## Paso 2: Consultar el Estado del Trabajo

Si recibiste un `job_id`, debes consultar el estado del trabajo periódicamente.

**Endpoint:** `GET /text-analysis-DTO/status/{job_id}`

### Lógica de Polling

Debes implementar una lógica en tu frontend para llamar a este endpoint a intervalos regulares (ej. cada 5 segundos) hasta que el `status` sea `completed` o `failed`.

```javascript
const pollStatus = async (jobId) => {
  const functionUrl = `https://<project-ref>.supabase.co/functions/v1/text-analysis-DTO/status/${jobId}`;
  const response = await fetch(functionUrl, {
    headers: { 'Authorization': `Bearer ${supabaseToken}` }
  });
  const data = await response.json();

  if (data.status === 'completed') {
    // ¡Análisis completo! Renderiza los datos.
    renderAnalysis(data.data.standardized_case);
  } else if (data.status === 'failed') {
    // El trabajo falló.
    showErrorState();
  } else {
    // Sigue procesando, vuelve a consultar en unos segundos.
    setTimeout(() => pollStatus(jobId), 5000);
  }
};
```

---

## Entendiendo el DTO: `standardized_case`

Este objeto es el corazón de la respuesta y está diseñado para que sea fácil de consumir por el frontend. A continuación se presenta un ejemplo completo y luego un desglose de sus partes.

### Ejemplo de Payload Completo

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "created_at": "2026-01-15T10:00:00.000Z",
  "type": "text",
  "lifecycle": {
    "job_status": "completed",
    "custody_status": "ai_processed",
    "last_update": "2026-01-15T10:00:00.000Z"
  },
  "overview": {
    "title": "La oposición no tiene nada que ofrecer",
    "summary": "El artículo desarrolla una tesis crítica sobre política internacional con un enfoque ideológico y argumentativo, más que informativo, sosteniendo que Venezuela enfrenta una agresión neocolonial.",
    "verdict_label": "Necesita Estrategias AMI",
    "risk_score": 25.0,
    "main_asset_url": "https://<r2-bucket-url>/jobs/a1b2c3d4.../screenshot.jpg",
    "source_url": "https://www.example.com/opinion/oposicion-critica",
    "source_domain": "www.example.com"
  },
  "insights": [
    {
      "id": "meta_context_type",
      "category": "metadata",
      "label": "Clasificación de Contexto",
      "value": "Opinión",
      "score": null,
      "description": "Texto argumentativo basado en juicios de valor y perspectiva subjetiva."
    },
    {
      "id": "struct_thesis",
      "category": "metadata",
      "label": "Tesis Central",
      "value": "La ignorancia del gobierno ante la crisis es inaceptable.",
      "score": null,
      "description": "El argumento principal propuesto en el texto de opinión."
    },
    {
      "id": "struct_stance",
      "category": "metadata",
      "label": "Postura del Autor",
      "value": "Indignación crítica y denuncia social.",
      "score": null,
      "description": "La perspectiva o ángulo que adopta el autor."
    },
    {
      "id": "fc_0",
      "category": "fact_check",
      "label": "Verificación de Afirmación",
      "value": "Refutado",
      "score": 0,
      "description": "Estados Unidos interferirá en las elecciones de Brasil y Colombia.",
      "artifacts": [
        {
          "type": "text_snippet",
          "content": "No hay evidencia pública y creíble que respalde una interferencia directa de EE.UU. en dichas elecciones en este momento.",
          "label": "Análisis Interno"
        }
      ]
    },
    {
      "id": "ami_crit_9",
      "category": "content_quality",
      "label": "Lenguaje emocional",
      "value": "No Cumple",
      "score": 10,
      "description": "Usa términos cargados como 'agresión neocolonial' y 'no tienen nada que ofrecer', buscando generar indignación y resistencia en el lector."
    },
    {
      "id": "rec_comp_0",
      "category": "recommended_competency",
      "label": "Identificación de Sesgos y Perspectivas",
      "value": "Recomendado",
      "score": null,
      "description": "Es crucial que el lector aprenda a identificar la perspectiva ideológica del autor y cómo esta influye en la presentación de la información."
    }
  ],
  "reporter": {
    "id": "user-uuid-12345",
    "name": "Gerardo Rojas",
    "reputation": 150
  },
  "community": {
    "votes": 0,
    "status": "ai_only"
  }
}
```

### Desglose para la Interfaz de Usuario

#### `overview`: El Resumen Principal

Usa esta sección para las vistas de "tarjeta" o el encabezado principal de la página de resultados.

| Campo             | Mapeo en la UI                                                              |
| ----------------- | --------------------------------------------------------------------------- |
| `title`           | El título principal de la página de análisis.                               |
| `summary`         | Un párrafo introductorio que resume el contenido.                           |
| `verdict_label`   | La etiqueta del veredicto final (ej. "Necesita Estrategias AMI").           |
| `risk_score`      | El puntaje de riesgo/cumplimiento (0-100). Puedes usarlo para una barra de progreso o un indicador de color. |
| `main_asset_url`  | La URL de la **captura de pantalla**. Úsala como la imagen principal (`<img>`). |
| `source_url`      | La **URL original** del artículo. Úsala para un enlace "Ver fuente original". |
| `source_domain`   | El dominio de la fuente (ej. `example.com`).                                |

#### `insights`: Los Hallazgos Detallados

Este es un array de objetos, donde cada objeto es un "hallazgo" del análisis. Debes iterar sobre este array para construir la lista de resultados detallados. La propiedad `category` te ayuda a decidir cómo renderizar cada `insight`.

| `category`                 | `label` (Ejemplo)                  | `description` (Contenido)                                                                    | Uso en la UI                                                                                             |
| -------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `metadata`                 | Clasificación de Contexto          | Indica si el texto es "Hecho", "Opinión" o "Investigación" y por qué.                        | Mostrar una etiqueta destacada al inicio del análisis para contextualizar al usuario.                    |
| `metadata`                 | Tesis Central / Qué Sucedió        | Muestra los **elementos estructurales** del texto. Si es una opinión, mostrará su tesis. Si es un hecho, mostrará qué pasó, quién, etc. | Crear una sección de "Análisis Estructural" que resuma los componentes clave del texto.                  |
| `content_quality`          | Claridad de la fuente              | La justificación de por qué el texto cumple o no con uno de los 20 criterios AMI.            | El núcleo del análisis. Renderiza una lista con los 20 criterios, mostrando su `score` y `description`. |
| `fact_check`               | Verificación de Afirmación         | La afirmación verificada (`description`) y el veredicto (`value`: "Verificado", "Refutado"). | Crear una tabla o sección de "Fact-Checking" para mostrar las afirmaciones y sus veredictos.           |
| `compliance`               | EVALUACION CRITICA                 | El análisis de una de las 4 competencias AMI.                                                | Mostrar una sección sobre las competencias AMI desarrolladas o necesarias.                               |
| `forensics`                | Coherencia Titular-Contenido       | El análisis sobre si el titular es `clickbait`.                                              | Mostrar una alerta o indicador si se detecta `clickbait`.                                                |
| `recommended_competency`   | Identificación de Sesgos y Perspectivas | Una competencia AMI específica que se recomienda al usuario desarrollar.                      | Mostrar una sección de "Próximos Pasos" o "Competencias a Mejorar" para guiar al usuario.                |

## Manejo de Errores

*   **`401 Unauthorized`**: Ocurre si el token JWT no es válido o ha expirado. Deberías redirigir al usuario para que inicie sesión de nuevo.
*   **`404 Not Found`**: Ocurre si consultas un `job_id` que no existe.
*   **`status: 'failed'`**: Indica que el análisis no se pudo completar. Deberías mostrar un mensaje de error al usuario.