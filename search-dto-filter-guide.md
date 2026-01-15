# Guía de Filtros Avanzados para el Gateway de Búsqueda de Digitalia

El endpoint `POST /search` del gateway permite realizar búsquedas complejas sin texto a través del parámetro `filter_mode`. Estos filtros son la herramienta principal para construir las diferentes vistas y colas de trabajo en la aplicación.

**Importante:** Todos los filtros avanzados requieren que la petición esté autenticada con un token JWT de usuario válido en la cabecera `Authorization`.

### Estructura General del Payload de Entrada (Request)

Para utilizar un filtro, se debe enviar una petición `POST` al endpoint `/search`. La operación es **asíncrona**: la API responderá inmediatamente con un `job_id`, y deberás consultar el endpoint `GET /status/{jobId}` para obtener los resultados.

**Cuerpo de la Petición (Request Body):**

```json
{
  "filter_mode": "<nombre_del_filtro>",
  "page": 1,
  "pageSize": 10,
  "select_fields": ["id", "overview.title", "community.votes"]
}
```
*   `filter_mode` (string, **requerido**): El nombre del filtro a aplicar.
*   `page` (number, opcional): El número de página para la paginación (por defecto `1`).
*   `pageSize` (number, opcional): El número de resultados por página (por defecto `10`).
*   `select_fields` (string[], opcional): Un array de campos para reducir el tamaño de la respuesta, ideal para optimizar listados.

---

## Filtro: `voted_by_me`

### Descripción
Devuelve **únicamente** los casos en los que tú, como usuario autenticado, has emitido un voto. Es la base para construir vistas como "Mi Actividad" o "Mis Votos".

### Payload de Ejemplo
```json
{
  "filter_mode": "voted_by_me",
  "page": 1,
  "pageSize": 5
}
```

### Respuesta Esperada (Exitosa)
Tras consultar el estado del trabajo, una respuesta exitosa contendrá un array de casos donde tu ID de usuario está presente en la relación de votos de cada caso.

```json
{
  "job_id": "c1d2e3f4-e5f6-4a0b-9876-543210abcdef",
  "status": "completed",
  "data": {
    "cases": [
      {
        "id": "doc-uuid-123",
        "overview": { "title": "Caso en el que ya he votado", "risk_score": 75, "...": "..." },
        "community": {
          "votes": 5, // Hay 5 votos en total
          "status": "human_consensus",
          // ... el desglose incluye tu voto
        },
        // ... otros campos del DTO
      }
    ],
    "pagination": { "page": 1, "pageSize": 5, "returnedCount": 1, "hasMore": false }
  }
}
```

### Respuesta Esperada (Resultado Vacío)
Es muy común que este filtro devuelva un array vacío. **Esto no es un error**, es un comportamiento esperado.

*   **Razón:** Ocurre si el usuario autenticado aún no ha votado en ningún caso. La API funciona correctamente al no encontrar coincidencias.

```json
{
  "job_id": "d2e3f4g5-f6g7-4b1c-a987-abcdef123456",
  "status": "completed",
  "data": {
    "cases": [], // El array de casos está vacío, lo cual es correcto.
    "pagination": { "page": 1, "pageSize": 5, "returnedCount": 0, "hasMore": false }
  }
}
```
---

## Filtro: `not_voted_by_me`

### Descripción
Devuelve todos los casos que están pendientes de tu voto. Este es el filtro principal para poblar la cola de trabajo de un usuario ("Casos por Revisar"). Incluye tanto los casos en los que otros han votado pero tú no, como los casos completamente nuevos que aún no tienen ningún voto.

### Payload de Ejemplo
```json
{
  "filter_mode": "not_voted_by_me",
  "page": 1,
  "pageSize": 10
}
```

### Respuesta Esperada (Exitosa)
La respuesta contendrá un listado de casos que no tienen un registro de voto asociado a tu ID de usuario.

```json
{
  "job_id": "e3f4g5h6-g7h8-4c2d-b876-cdef123456ab",
  "status": "completed",
  "data": {
    "cases": [
      {
        "id": "doc-uuid-456",
        "overview": { "title": "Caso pendiente de mi voto (otros ya votaron)", "...": "..." },
        "community": {
          "votes": 2, // Otros 2 usuarios ya votaron
          "status": "human_consensus",
          // ... pero tú no estás en la lista de votantes
        }
      },
      {
        "id": "doc-uuid-789",
        "overview": { "title": "Caso nuevo, sin votos de nadie", "...": "..." },
        "community": {
          "votes": 0, // Nadie ha votado todavía
          "status": "ai_only"
        }
      }
    ],
    "pagination": { "page": 1, "pageSize": 10, "returnedCount": 2, "hasMore": true }
  }
}
```

### Respuesta Esperada (Resultado Vacío)
*   **Razón:** Este resultado solo ocurriría en el caso excepcional de que hayas votado en absolutamente todos los casos existentes en la plataforma.

---

## Filtro: `has_consensus`

### Descripción
Devuelve **únicamente** los casos que han recibido **al menos un voto** de **cualquier** usuario. Este filtro es útil para visualizar contenido que ya ha pasado por algún nivel de revisión humana o que tiene actividad comunitaria, separándolo del contenido que solo tiene análisis de IA.

### Payload de Ejemplo
```json
{
  "filter_mode": "has_consensus",
  "page": 1,
  "pageSize": 20
}
```
### Respuesta Esperada (Exitosa)
La respuesta contendrá únicamente casos cuyo contador `community.votes` sea mayor que 0.

```json
{
  "job_id": "f4g5h6i7-h8i9-4d3e-a765-def123456abc",
  "status": "completed",
  "data": {
    "cases": [
      {
        "id": "doc-uuid-123",
        "overview": { "title": "Este caso tiene 5 votos", "...": "..." },
        "community": { "votes": 5, "status": "human_consensus", "...": "..." }
      },
      {
        "id": "doc-uuid-456",
        "overview": { "title": "Este caso tiene 2 votos", "...": "..." },
        "community": { "votes": 2, "status": "human_consensus", "...": "..." }
      }
    ],
    "pagination": { "page": 1, "pageSize": 20, "returnedCount": 2, "hasMore": false }
  }
}
