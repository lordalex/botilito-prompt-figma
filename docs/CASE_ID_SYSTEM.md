# Sistema de Identificacion de Casos v2.0

## Resumen

Este documento describe el sistema de identificacion de casos para Botilito. El sistema proporciona IDs de caso legibles, informativos y faciles de buscar, manteniendo los UUIDs como clave primaria en la base de datos.

**Formato:** `VECTOR-TIPO-REGION-TEMA-HASH`
**Ejemplo:** `WE-TX-LA-PO-22D`

---

## Historial de Versiones

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| v1.0 | 2024-12-10 | Formato inicial: `TIPO-VECTOR-FECHA-HASH` |
| v2.0 | 2024-12-10 | Nuevo formato: `VECTOR-TIPO-REGION-TEMA-HASH` con contexto semantico |

---

## Planteamiento del Problema

### Situacion Actual
- La base de datos usa UUIDs como claves primarias (ej: `22dea48b-bc92-461f-b027-2ee091369e6c`)
- Los UUIDs no son amigables para referencia o comunicacion verbal
- La implementacion actual (v1.0) usa formato `IAWbTxPn000000` que no es intuitivo
- Se requiere incluir **region** y **tema** para mejor contexto y filtrado

### Objetivo
Los usuarios necesitan **encontrar y referenciar** casos usando un ID legible que:
- Sea facil de comunicar verbalmente
- Contenga contexto semantico significativo (vector, tipo, region, tema)
- Sea unico garantizado (sin colisiones via UUID hash)
- Permita filtrado rapido por cualquier componente
- Sea compacto (maximo 15 caracteres)

---

## Formato del Display ID v2.0

```
Formato: VECTOR-TIPO-REGION-TEMA-HASH

         WE  - TX  - LA  - PO  - 22D
         |     |     |     |     |
         |     |     |     |     +-- 3 caracteres del UUID (identificador unico)
         |     |     |     +-- Tema: Categoria tematica del contenido
         |     |     +-- Region: Area geografica relacionada
         |     +-- Tipo: Formato del contenido
         +-- Vector: Plataforma de transmision/origen
```

### Componentes

#### VECTOR (Plataforma de Origen) - 2 caracteres
| Codigo | Plataforma | Descripcion |
|--------|------------|-------------|
| `WE` | Web | Sitios web genericos, portales de noticias |
| `WH` | WhatsApp | Mensajes de WhatsApp |
| `FA` | Facebook | Posts, comentarios de Facebook |
| `XX` | Twitter/X | Tweets, hilos de X (antes Twitter) |
| `IG` | Instagram | Posts, stories, reels de Instagram |
| `TK` | TikTok | Videos de TikTok |
| `YT` | YouTube | Videos de YouTube |
| `TL` | Telegram | Mensajes de Telegram |
| `RD` | Reddit | Posts de Reddit |
| `LI` | LinkedIn | Posts de LinkedIn |
| `OT` | Otro | Otras plataformas no especificadas |

#### TIPO (Formato de Contenido) - 2 caracteres
| Codigo | Tipo | Descripcion |
|--------|------|-------------|
| `TX` | Texto | Texto plano, URLs, articulos |
| `IM` | Imagen | Fotografias, graficos, memes |
| `VI` | Video | Contenido audiovisual |
| `AU` | Audio | Podcasts, notas de voz, audios |

#### REGION (Area Geografica) - 2 caracteres
| Codigo | Region | Descripcion |
|--------|--------|-------------|
| `LA` | America Latina | Latinoamerica en general |
| `CO` | Colombia | Especifico de Colombia |
| `VE` | Venezuela | Especifico de Venezuela |
| `NA` | Norteamerica | Estados Unidos, Canada, Mexico |
| `EU` | Europa | Union Europea y paises europeos |
| `GL` | Global | Alcance mundial, sin region especifica |
| `AS` | Asia | Continente asiatico |
| `AF` | Africa | Continente africano |
| `OC` | Oceania | Australia, Nueva Zelanda, islas |
| `XX` | No Aplica | Region no determinada |

#### TEMA (Categoria Tematica) - 2 caracteres
| Codigo | Tema | Descripcion |
|--------|------|-------------|
| `PO` | Politica | Gobierno, elecciones, politicos |
| `IN` | Internacional | Relaciones internacionales, geopolitica |
| `EC` | Economia | Finanzas, mercados, comercio |
| `SA` | Salud | Medicina, pandemias, bienestar |
| `SU` | Sucesos | Noticias, eventos, accidentes |
| `DE` | Deportes | Eventos deportivos |
| `TE` | Tecnologia | Tech, ciencia, innovacion |
| `AM` | Ambiente | Medio ambiente, clima, ecologia |
| `SO` | Social | Temas sociales, cultura |
| `OT` | Otro | Otros temas no categorizados |

#### HASH (Identificador Unico) - 3 caracteres
- 3 caracteres alfanumericos derivados del UUID
- Usa los primeros 3 caracteres del UUID (sin guiones)
- Convertido a MAYUSCULAS
- Garantiza unicidad (ya que el UUID es unico)

---

## Ejemplos

### Display IDs Generados

| UUID | Vector | Tipo | Region | Tema | Display ID |
|------|--------|------|--------|------|------------|
| `22dea48b-bc92-461f-...` | Web (CNN) | Texto | Norteamerica | Politica | `WE-TX-NA-PO-22D` |
| `45546e51-7a98-45f8-...` | Web (CNN) | Texto | Latinoamerica | Politica | `WE-TX-LA-PO-455` |
| `2e5840b1-80eb-47a7-...` | Web (Globovision) | Texto | Global | Internacional | `WE-TX-GL-IN-2E5` |
| `a8797891-7944-43f1-...` | Telegram | Texto | Venezuela | Politica | `TL-TX-VE-PO-A87` |
| `6cf36f81-3a8b-4836-...` | Web (Cotejo) | Texto | Venezuela | Politica | `WE-TX-VE-PO-6CF` |

### Visualizacion para el Usuario

```
+------------------------------------------------------------+
|  Caso WE-TX-LA-PO-22D                                      |
|  ----------------------------------------------------------+
|  Web | Texto | America Latina | Politica                   |
|                                                             |
|  "Que se sabe sobre la ofensiva migratoria prevista        |
|   para esta semana en Nueva Orleans?"                       |
|                                                             |
|  Pendiente de verificacion  |  Solo analisis IA            |
+------------------------------------------------------------+
```

---

## Casos de Uso

### 1. Referencia Verbal
```
Usuario A: "Oye, revisa el caso WE-TX-LA-PO-22D"
Usuario B: [busca WE-TX-LA-PO-22D, encuentra el caso al instante]
```

### 2. Busqueda y Filtrado
```
Buscar por ID completo:    WE-TX-LA-PO-22D  -> Coincidencia exacta
Filtrar por vector:        WE-*              -> Todos los casos de Web
Filtrar por tipo:          *-TX-*            -> Todos los casos de texto
Filtrar por region:        *-*-LA-*          -> Todos de Latinoamerica
Filtrar por tema:          *-*-*-PO-*        -> Todos de Politica
Filtrar por hash:          *-22D             -> Encontrar por ID parcial
Combinar filtros:          WE-*-VE-PO-*      -> Web + Venezuela + Politica
```

### 3. Compartir
```
URL: https://botilito.app/caso/WE-TX-LA-PO-22D
Copiar: "Caso WE-TX-LA-PO-22D"
```

### 4. Reportes y Estadisticas
```
"Hoy recibimos 47 casos de WhatsApp sobre Politica (WH-*-*-PO-*)"
"Esta semana hubo 12 videos de Venezuela (??-VI-VE-*-*)"
"Los temas mas frecuentes en Latinoamerica: Politica (65%), Internacional (20%)"
```

---

## Cambios Requeridos en la API

### Estado Actual del Payload

Actualmente el endpoint `/vector-async/summary` retorna:

```json
{
  "recent_cases": [
    {
      "id": "22dea48b-bc92-461f-b027-2ee091369e6c",
      "url": "https://cnnespanol.cnn.com/...",
      "title": "...",
      "submission_type": "URL",
      "diagnostic_labels": [],
      "consensus": { "state": "ai_only", "final_labels": [] },
      "related_documents": [
        {
          "id": "...",
          "theme": "Politica",    // <-- TEMA esta aqui
          "summary": "..."
        }
      ]
    }
  ],
  "regions_distribution": [...],   // <-- REGION agregada, pero no por caso
  "themes_distribution": [...]
}
```

### Cambios Requeridos en el Backend

#### Opcion A: Agregar campos directamente a cada caso (RECOMENDADO)

Modificar el endpoint para incluir `theme` y `region` directamente en cada `recent_case`:

```json
{
  "recent_cases": [
    {
      "id": "22dea48b-bc92-461f-b027-2ee091369e6c",
      "url": "https://cnnespanol.cnn.com/...",
      "title": "...",
      "submission_type": "URL",
      "theme": "Politica",           // <-- NUEVO: Tema del caso
      "region": "America Latina",    // <-- NUEVO: Region del caso
      "vector": "Web",               // <-- NUEVO (opcional): Vector detectado
      "diagnostic_labels": [],
      "consensus": { "state": "ai_only", "final_labels": [] },
      "related_documents": [...]
    }
  ]
}
```

#### Opcion B: Usar primer related_document (FALLBACK)

Si no se puede modificar la API inmediatamente, el frontend puede extraer:
- `theme`: Del primer `related_documents[0].theme`
- `region`: Detectar del dominio URL o usar "XX" por defecto

**Nota:** La Opcion A es preferida para consistencia y rendimiento.

### Campos a Agregar en la API

| Campo | Tipo | Fuente | Descripcion |
|-------|------|--------|-------------|
| `theme` | string | AI analysis / related_documents | Tema principal: "Politica", "Internacional", etc. |
| `region` | string | AI analysis / URL detection | Region geografica: "America Latina", "Venezuela", etc. |
| `vector` | string (opcional) | URL detection | Plataforma detectada: "Web", "WhatsApp", etc. |

---

## Implementacion Frontend

### Archivo: `src/utils/historial/api.ts`

#### Funcion `generateDisplayId()` - Version 2.0

```typescript
/**
 * Generate display ID for a case
 * Format: VECTOR-TIPO-REGION-TEMA-HASH
 * Example: WE-TX-LA-PO-22D
 */
export function generateDisplayId(caseData: RecentCase): string {
  // VECTOR: Detect from URL
  const vector = detectVector(caseData.url);

  // TIPO: From submission_type
  const tipo = getTipoCode(caseData.submission_type);

  // REGION: From API field (when available) or fallback
  const region = getRegionCode(caseData.region || extractRegionFromCase(caseData));

  // TEMA: From API field (when available) or fallback to related_documents
  const tema = getTemaCode(caseData.theme || extractThemeFromCase(caseData));

  // HASH: First 3 characters of UUID, uppercase
  const hash = caseData.id.replace(/-/g, '').substring(0, 3).toUpperCase();

  return `${vector}-${tipo}-${region}-${tema}-${hash}`;
}
```

#### Mapeo de Vectores

```typescript
function detectVector(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();

  const vectorMap: Record<string, string> = {
    'whatsapp.com': 'WH',
    'facebook.com': 'FA', 'fb.com': 'FA',
    'twitter.com': 'XX', 'x.com': 'XX',
    'instagram.com': 'IG',
    'tiktok.com': 'TK',
    'youtube.com': 'YT', 'youtu.be': 'YT',
    'telegram.org': 'TL', 't.me': 'TL',
    'reddit.com': 'RD',
    'linkedin.com': 'LI',
  };

  for (const [domain, code] of Object.entries(vectorMap)) {
    if (hostname.includes(domain)) return code;
  }

  return 'WE'; // Default: Web
}
```

#### Mapeo de Tipos

```typescript
function getTipoCode(submissionType: string): string {
  const tipoMap: Record<string, string> = {
    'URL': 'TX',
    'TEXT': 'TX',
    'IMAGE': 'IM',
    'VIDEO': 'VI',
    'AUDIO': 'AU',
  };
  return tipoMap[submissionType] || 'TX';
}
```

#### Mapeo de Regiones

```typescript
function getRegionCode(region: string): string {
  const regionMap: Record<string, string> = {
    'America Latina': 'LA',
    'Latinoamerica': 'LA',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'America del Norte': 'NA',
    'Norteamerica': 'NA',
    'Estados Unidos': 'NA',
    'Europa': 'EU',
    'Global': 'GL',
    'Asia': 'AS',
    'Africa': 'AF',
    'Oceania': 'OC',
    'N/A': 'XX',
  };
  return regionMap[region] || 'XX';
}
```

#### Mapeo de Temas

```typescript
function getTemaCode(theme: string): string {
  const temaMap: Record<string, string> = {
    'Politica': 'PO',
    'Internacional': 'IN',
    'Economia': 'EC',
    'Salud': 'SA',
    'Sucesos': 'SU',
    'Deportes': 'DE',
    'Tecnologia': 'TE',
    'Ambiente': 'AM',
    'Social': 'SO',
    'Otro': 'OT',
  };
  return temaMap[theme] || 'OT';
}
```

#### Fallback: Extraer tema de related_documents

```typescript
function extractThemeFromCase(caseData: RecentCase): string {
  if (caseData.related_documents?.length > 0) {
    return caseData.related_documents[0].theme || 'Otro';
  }
  return 'Otro';
}
```

---

## Plan de Implementacion

### Fase 1: Modificacion de la API (Backend)

**Responsable:** Equipo Backend
**Prioridad:** Alta

1. [ ] Agregar campo `theme` a la respuesta de cada caso en `/vector-async/summary`
2. [ ] Agregar campo `region` a la respuesta de cada caso
3. [ ] (Opcional) Agregar campo `vector` pre-calculado
4. [ ] Actualizar documentacion de la API
5. [ ] Desplegar cambios a staging para pruebas

### Fase 2: Actualizacion del Frontend

**Responsable:** Equipo Frontend
**Prioridad:** Alta (despues de Fase 1)

1. [ ] Actualizar tipos TypeScript en `src/utils/historial/types.ts`
   ```typescript
   interface RecentCase {
     // ... campos existentes
     theme?: string;    // Nuevo
     region?: string;   // Nuevo
     vector?: string;   // Nuevo (opcional)
   }
   ```

2. [ ] Refactorizar `generateDisplayId()` en `src/utils/historial/api.ts`
   - Implementar nueva logica de formato v2.0
   - Agregar funciones de mapeo
   - Mantener fallbacks para compatibilidad

3. [ ] Actualizar `ContentReview.tsx`
   - Verificar que el nuevo formato se muestre correctamente
   - Actualizar logica de busqueda si es necesario

4. [ ] Pruebas manuales
   - Verificar generacion correcta de IDs
   - Probar busqueda por componentes
   - Validar fallbacks cuando falten datos

### Fase 3: Documentacion y Limpieza

1. [ ] Actualizar CLAUDE.md con nuevo formato
2. [ ] Actualizar documentacion de usuario
3. [ ] Eliminar codigo legacy de v1.0
4. [ ] Merge a main

---

## Consideraciones de Compatibilidad

### Durante la Transicion

Mientras la API no tenga los nuevos campos, el frontend debe:

1. **Para `theme`:** Extraer de `related_documents[0].theme` si existe
2. **Para `region`:** Usar valor por defecto "XX" (No Aplica)
3. **Para `vector`:** Detectar del URL (ya implementado)

### Despues de la Actualizacion de API

Una vez disponibles los campos en la API:
1. Usar campos directos: `caseData.theme`, `caseData.region`
2. Mantener fallbacks por seguridad
3. Eliminar logica de extraccion de `related_documents`

---

## Comparacion: v1.0 vs v2.0

| Aspecto | v1.0 | v2.0 |
|---------|------|------|
| Formato | `IAWbTxPn000000` | `WE-TX-LA-PO-22D` |
| Separadores | Ninguno | Guiones `-` |
| Legibilidad | Baja | Alta |
| Componentes | Detector, Red, Tipo, Etiqueta, Correlativo | Vector, Tipo, Region, Tema, Hash |
| Info contextual | Limitada | Rica (region + tema) |
| Longitud | 14 chars | 15 chars max |
| Filtrado | Dificil | Facil por componente |

---

## Registro de Decisiones

| Fecha | Decision | Justificacion |
|-------|----------|---------------|
| 2024-12-10 | Usar guiones como separadores | Mejora legibilidad y permite filtrado facil |
| 2024-12-10 | Incluir Region y Tema | Proporciona contexto semantico valioso para usuarios |
| 2024-12-10 | Usar 2 caracteres por componente | Balance entre brevedad e informacion |
| 2024-12-10 | Mantener 3 chars de UUID como hash | Suficiente unicidad, facil de recordar |
| 2024-12-10 | Requiere cambios en API | Necesario para tener datos limpios de region/tema |
| 2024-12-10 | Vector primero en el formato | Permite identificar rapidamente la plataforma de origen |

---

## Apendice: Payload de Referencia

### Estructura actual de `recent_cases`

```json
{
  "id": "22dea48b-bc92-461f-b027-2ee091369e6c",
  "url": "https://cnnespanol.cnn.com/2025/12/01/eeuu/ofensiva-migratoria-nueva-orleans-trax",
  "title": "Que se sabe sobre la ofensiva migratoria...",
  "priority": "medium",
  "consensus": {
    "state": "ai_only",
    "final_labels": []
  },
  "created_at": "2025-12-01T16:21:14.630774+00:00",
  "submission_type": "URL",
  "diagnostic_labels": [],
  "human_votes_count": 0,
  "related_documents": [
    {
      "id": "99275408-e9b0-446f-b53d-de4353f216b5",
      "url": "...",
      "title": "...",
      "summary": "...",
      "similarity": 0.987886735190471
    }
  ],
  "web_search_results": []
}
```

### Estructura propuesta (con nuevos campos)

```json
{
  "id": "22dea48b-bc92-461f-b027-2ee091369e6c",
  "url": "https://cnnespanol.cnn.com/...",
  "title": "Que se sabe sobre la ofensiva migratoria...",
  "priority": "medium",
  "theme": "Politica",              // NUEVO
  "region": "America del Norte",   // NUEVO
  "vector": "Web",                 // NUEVO (opcional)
  "consensus": { ... },
  "created_at": "2025-12-01T16:21:14.630774+00:00",
  "submission_type": "URL",
  "diagnostic_labels": [],
  "human_votes_count": 0,
  "related_documents": [ ... ],
  "web_search_results": []
}
```

---

*Documento actualizado: 10 de diciembre, 2024*
*Version: 2.0*
*Estado: Planificacion - Pendiente cambios en API*
