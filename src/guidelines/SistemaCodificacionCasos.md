# Sistema de Codificación de Casos - Botilito

## Formato Unificado

Todos los casos en Botilito siguen un formato de codificación estándar que permite identificar rápidamente:
1. El tipo de contenido analizado
2. El vector de transmisión (plataforma/medio)
3. La fecha del análisis
4. Un número de secuencia único

### Estructura del Código

```
TIPO-VECTOR-FECHA-SECUENCIA
```

**Ejemplo:** `T-WA-20241014-001`
- **T** = Texto
- **WA** = WhatsApp  
- **20241014** = 14 de octubre de 2024
- **001** = Caso número 001 de ese día

---

## Códigos de Tipo de Contenido

| Código | Tipo | Descripción |
|--------|------|-------------|
| **T** | Texto | Contenido textual, mensajes, publicaciones |
| **I** | Imagen | Fotos, capturas de pantalla, memes, infografías |
| **V** | Video | Videos en cualquier formato |
| **A** | Audio | Audios, notas de voz, podcasts |

---

## Códigos de Vector de Transmisión

| Código | Plataforma | Descripción |
|--------|------------|-------------|
| **WA** | WhatsApp | Mensajes, estados y grupos de WhatsApp |
| **FB** | Facebook | Publicaciones y contenido de Facebook |
| **TW** | Twitter/X | Tweets y contenido de Twitter/X |
| **IG** | Instagram | Posts, stories y reels de Instagram |
| **TK** | TikTok | Videos de TikTok |
| **YT** | YouTube | Videos de YouTube |
| **TL** | Telegram | Mensajes y canales de Telegram |
| **WB** | Web | Sitios web, blogs, portales de noticias |
| **EM** | Email | Correos electrónicos |
| **SMS** | SMS | Mensajes de texto tradicionales |
| **OT** | Otro | Otros medios no especificados |

---

## Ejemplos de Códigos Reales

### Caso 1: Texto de WhatsApp
```
T-WA-20241014-001
```
Un mensaje de texto recibido por WhatsApp el 14 de octubre de 2024.

### Caso 2: Imagen de Facebook
```
I-FB-20241014-023
```
Una imagen compartida en Facebook el 14 de octubre de 2024.

### Caso 3: Video de TikTok
```
V-TK-20241015-145
```
Un video de TikTok analizado el 15 de octubre de 2024.

### Caso 4: Audio de Telegram
```
A-TL-20241013-089
```
Una nota de voz o audio compartido en Telegram el 13 de octubre de 2024.

### Caso 5: Artículo web
```
T-WB-20241012-567
```
Un artículo o noticia de un sitio web analizado el 12 de octubre de 2024.

---

## Implementación Técnica

### Generar un Código de Caso

```typescript
import { generateCaseCode } from '../utils/caseCodeGenerator';

// Ejemplo 1: Texto de WhatsApp
const codigo1 = generateCaseCode('texto', 'WhatsApp');
// Resultado: T-WA-20241014-XXX

// Ejemplo 2: Imagen de Instagram
const codigo2 = generateCaseCode('imagen', 'Instagram');
// Resultado: I-IG-20241014-XXX

// Ejemplo 3: Video de TikTok
const codigo3 = generateCaseCode('video', 'TikTok');
// Resultado: V-TK-20241014-XXX
```

### Parsear un Código de Caso

```typescript
import { parseCaseCode, getCaseCodeDescription } from '../utils/caseCodeGenerator';

const codigo = 'T-WA-20241014-001';

// Obtener información estructurada
const info = parseCaseCode(codigo);
// {
//   contentType: 'texto',
//   transmissionVector: 'WhatsApp',
//   date: '20241014',
//   sequence: '001'
// }

// Obtener descripción legible
const descripcion = getCaseCodeDescription(codigo);
// "Texto vía WhatsApp • 14/10/2024 • #001"
```

---

## Beneficios del Sistema

### 1. Trazabilidad Epidemiológica
Los códigos permiten rastrear patrones de propagación:
- Identificar qué plataformas son más propensas a ciertos tipos de desinformación
- Analizar tendencias por tipo de contenido
- Correlacionar vectores de transmisión con niveles de virulencia

### 2. Organización y Búsqueda
Facilita la búsqueda y filtrado de casos:
- Buscar todos los casos de WhatsApp: `*-WA-*`
- Buscar todos los videos: `V-*`
- Buscar casos de una fecha específica: `*-20241014-*`

### 3. Análisis Estadístico
Permite generar métricas precisas:
- Casos por plataforma
- Casos por tipo de contenido
- Evolución temporal de la desinformación
- Identificación de brotes epidémicos

### 4. Interoperabilidad
El formato estándar facilita:
- Integración con sistemas externos
- Exportación de datos
- Creación de informes automatizados
- Compartir casos entre instituciones

---

## Migrando Códigos Antiguos

Si tienes códigos en el formato antiguo `CASO-TIMESTAMP-XXX`, puedes usar la función de compatibilidad:

```typescript
import { generateLegacyCaseCode } from '../utils/caseCodeGenerator';

// Generar código legacy para compatibilidad
const codigoLegacy = generateLegacyCaseCode();
// Resultado: CASO-1729012345678-123
```

**Nota:** Se recomienda migrar todos los sistemas al nuevo formato lo antes posible.

---

## Preguntas Frecuentes

### ¿Qué pasa si no sé el vector de transmisión?
Usa el código **OT** (Otro) como fallback: `T-OT-20241014-001`

### ¿Cómo manejo URLs?
Las URLs se consideran **texto** y usan el código **T**. El vector debería ser **WB** (Web): `T-WB-20241014-001`

### ¿Puedo tener el mismo número de secuencia dos veces?
Sí, porque la combinación completa siempre será única (tipo + vector + fecha + secuencia). Por ejemplo:
- `T-WA-20241014-001` (Texto de WhatsApp)
- `I-FB-20241014-001` (Imagen de Facebook)

Son códigos diferentes aunque compartan el número 001.

### ¿Cómo saber qué significa un código sin consultar la documentación?
El código está diseñado para ser autodescriptivo:
- Los primeros caracteres indican el tipo
- Los siguientes indican la plataforma
- La fecha es legible en formato YYYYMMDD
- El número final es solo identificación

---

## Mantenimiento del Sistema

### Agregar Nuevos Tipos de Contenido
Edita `/utils/caseCodeGenerator.ts` y agrega el nuevo tipo al mapa:

```typescript
const contentTypeMap: Record<ContentType, string> = {
  'texto': 'T',
  'imagen': 'I',
  'video': 'V',
  'audio': 'A',
  'documento': 'D' // Nuevo tipo
};
```

### Agregar Nuevas Plataformas
Edita `/utils/caseCodeGenerator.ts` y agrega la nueva plataforma al mapa:

```typescript
const transmissionVectorMap: Record<TransmissionVector, string> = {
  'WhatsApp': 'WA',
  'Facebook': 'FB',
  // ... otros
  'Threads': 'TH' // Nueva plataforma
};
```

---

## Conclusión

El sistema de codificación unificado de Botilito está diseñado para ser:
- **Intuitivo**: Fácil de entender y usar
- **Flexible**: Se adapta a nuevos tipos y plataformas
- **Consistente**: Mismo formato en toda la aplicación
- **Epidemiológico**: Permite análisis de propagación como si fuera un virus

¡Úsalo en todos los componentes que generen o muestren casos!
