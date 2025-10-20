# 📊 Indicadores Epidemiológicos del Mapa Desinfodémico - Botilito

## Introducción

Este documento explica cada indicador epidemiológico usado en Botilito para rastrear y medir la desinformación desde un enfoque epidemiológico, tratándola como un virus que se puede contagiar, propagar y medir.

---

## 🦠 **MÉTRICAS EPIDEMIOLÓGICAS PRINCIPALES**

### 1. **R₀ (Tasa de Reproducción Básica)**

**¿Qué es?**
El R₀ (pronunciado "R-cero") es el número promedio de nuevos casos que genera cada caso de desinformación. Es el indicador más importante para entender si la desinformación está creciendo o controlándose.

**¿Cómo se calcula?**
```javascript
R₀ = (Nuevos casos en período T) / (Casos activos en período T-1)

// Ejemplo:
// Si en la semana 1 había 100 casos activos
// Y en la semana 2 aparecen 230 nuevos casos
R₀ = 230 / 100 = 2.3
```

**Interpretación:**
- **R₀ < 1.0**: La desinformación está controlándose (cada caso genera menos de 1 nuevo caso)
- **R₀ = 1.0**: Estable (cada caso genera exactamente 1 nuevo caso)
- **R₀ > 1.0**: Crecimiento (cada caso genera más de 1 nuevo caso)
- **R₀ ≥ 2.5**: CRÍTICO - Propagación exponencial

**Datos necesarios:**
- Total de nuevos casos reportados en el período actual
- Total de casos activos en el período anterior

**Fuente de datos en Botilito:**
- `nuevosCasos`: Casos reportados en los últimos 7 días
- `casosActivos`: Casos que aún están en circulación/verificación

---

### 2. **Velocidad de Transmisión**

**¿Qué es?**
Mide qué tan rápido se propaga la desinformación una vez que comienza a circular. Es un porcentaje que indica la rapidez de propagación.

**¿Cómo se calcula?**
```javascript
VelocidadTransmision = (
  (Casos nuevos últimas 24h / Casos nuevos últimas 72h) * 100
) * Factor de aceleración

// Con suavizado exponencial:
VelocidadTransmision = (
  ((NuevosCasos_Hoy * 3) / NuevosCasos_Ultimos3Dias) * 100
)

// Factor de aceleración basado en plataformas:
// WhatsApp/Telegram: 1.5x
// Twitter/X: 1.3x  
// Facebook: 1.2x
// Instagram: 1.0x
```

**Interpretación:**
- **0-30%**: Propagación lenta
- **31-60%**: Propagación moderada
- **61-85%**: Propagación rápida
- **86-100%**: Propagación viral

**Datos necesarios:**
- Casos nuevos en las últimas 24 horas
- Casos nuevos en las últimas 72 horas
- Plataforma principal de transmisión

**Fuente de datos en Botilito:**
- Timestamp de cada caso: `submittedAt`
- Plataforma de origen: `sources` en `aiAnalysis`

---

### 3. **Infectividad**

**¿Qué es?**
Probabilidad de que un usuario que ve la desinformación la comparta o la crea. Mide qué tan "contagiosa" es la desinformación.

**¿Cómo se calcula?**
```javascript
Infectividad = (
  (Número de compartidos / Número de visualizaciones) * 100
) * Factor de contenido

// Factores de contenido (basados en marcadores):
const factores = {
  emocional: 1.3,        // Contenido que genera emociones fuertes
  urgente: 1.4,          // "URGENTE", "COMPARTIR YA"
  autoridad: 1.2,        // Cita fuentes "autorizadas" falsas
  sensacionalista: 1.5,  // Titulares exagerados
  teoria_conspirativa: 1.3
};

// Cálculo simplificado sin datos de compartidos:
Infectividad = (
  VirulenciaPromedio * 0.6 + 
  VelocidadTransmision * 0.4
)
```

**Interpretación:**
- **0-30%**: Baja infectividad - poca gente lo comparte
- **31-60%**: Infectividad moderada
- **61-80%**: Alta infectividad
- **81-100%**: Extremadamente contagioso

**Datos necesarios:**
- Número de veces que se compartió el contenido (si está disponible)
- Número de visualizaciones (si está disponible)
- Marcadores de diagnóstico detectados
- Virulencia de los marcadores

**Fuente de datos en Botilito:**
- `detectedMarkers` en `aiAnalysis`
- `virulencia` de cada marcador en `ETIQUETAS_CATEGORIAS`
- Estimación basada en tipo de contenido y urgencia

---

### 4. **Virulencia Promedio**

**¿Qué es?**
Nivel de peligrosidad o daño potencial de la desinformación circulante en una región. No mide qué tan rápido se propaga, sino qué tan dañina es.

**¿Cómo se calcula?**
```javascript
// Cada marcador tiene un nivel de virulencia predefinido (0-100):
const virulencias = {
  'incitacion_violencia': 98,
  'discurso_odio_racismo': 95,
  'falso': 90,
  'manipulado': 85,
  'teoria_conspirativa': 80,
  'enganoso': 75,
  'sin_contexto': 60,
  'sensacionalista': 55,
  'no_verificable': 35,
  'satirico': 20,
  'verdadero': 0
};

// Virulencia promedio de una región:
VirulenciaPromedio = (
  Suma(virulencia_marcador_i * casos_marcador_i) / 
  Total_casos_region
)

// Ejemplo:
// Falso: 90 virulencia × 456 casos = 41,040
// Engañoso: 75 virulencia × 389 casos = 29,175
// Sensacionalista: 55 virulencia × 312 casos = 17,160
// Total: 87,375 / 1,157 casos = 75.5% virulencia promedio
```

**Interpretación:**
- **0-30%**: Desinformación leve (mayormente satírico o no verificable)
- **31-60%**: Virulencia moderada
- **61-80%**: Alta virulencia - contenido peligroso
- **81-100%**: Extremadamente peligroso - riesgo social crítico

**Datos necesarios:**
- Marcadores detectados en cada caso
- Virulencia asignada a cada marcador (constante)
- Cantidad de casos por marcador

**Fuente de datos en Botilito:**
- `detectedMarkers` en cada caso
- Array `ETIQUETAS_CATEGORIAS` con virulencia de cada marcador
- Conteo de casos por marcador en la región

---

## 📈 **MÉTRICAS DE PREVALENCIA Y DETECCIÓN**

### 5. **Casos Activos**

**¿Qué es?**
Número de casos de desinformación que están actualmente en circulación, siendo verificados o bajo seguimiento.

**¿Cómo se calcula?**
```javascript
CasosActivos = casos.filter(caso => 
  caso.status === 'en_verificacion' || 
  caso.status === 'pendiente' ||
  (Date.now() - new Date(caso.submittedAt)) < 30_dias
).length
```

**Interpretación:**
- Un número alto indica que hay mucha desinformación activa circulando
- Si aumenta rápidamente, indica un brote desinfodémico

**Datos necesarios:**
- Lista de todos los casos
- Estado de cada caso
- Fecha de reporte de cada caso

---

### 6. **Casos Totales (Acumulados)**

**¿Qué es?**
Total histórico de casos de desinformación reportados y analizados desde el inicio.

**¿Cómo se calcula?**
```javascript
CasosTotales = casos.length
// O desde base de datos:
CasosTotales = COUNT(*) FROM casos WHERE region = 'andina'
```

**Interpretación:**
- Muestra la magnitud histórica del problema
- Útil para tendencias a largo plazo

---

### 7. **Nuevos Casos**

**¿Qué es?**
Casos reportados en el período más reciente (última semana/día).

**¿Cómo se calcula?**
```javascript
const hace7dias = Date.now() - (7 * 24 * 60 * 60 * 1000);

NuevosCasos = casos.filter(caso => 
  new Date(caso.submittedAt) >= hace7dias
).length
```

**Interpretación:**
- Indica la incidencia actual
- Útil para detectar brotes emergentes

---

### 8. **Densidad de Casos (por 100k habitantes)**

**¿Qué es?**
Normaliza los casos según la población de la región, permitiendo comparar regiones de diferentes tamaños.

**¿Cómo se calcula?**
```javascript
DensidadCasos = (CasosActivos / PoblacionRegion) * 100000

// Ejemplo Región Andina:
// 456 casos activos / 34,140,778 habitantes * 100,000
// = 1.34 casos por cada 100k habitantes
```

**Interpretación:**
- Permite comparar regiones de diferente tamaño poblacional
- Una densidad alta indica mayor exposición per cápita

**Datos necesarios:**
- Casos activos en la región
- Población total de la región

---

### 9. **Tiempo Promedio de Detección**

**¿Qué es?**
Tiempo promedio que transcurre desde que la desinformación empieza a circular hasta que es reportada en Botilito.

**¿Cómo se calcula?**
```javascript
// Para cada caso:
TiempoDeteccion = caso.submittedAt - caso.originalPublishDate

// Promedio:
TiempoPromedioDeteccion = (
  Suma(TiempoDeteccion_i) / TotalCasos
) / (1000 * 60 * 60) // Convertir a horas

// Si no se tiene fecha original, estimar basado en:
TiempoEstimado = (
  TiempoPrimerReporte + TiempoSegundoReporte + ...
) / NumeroReportes
```

**Interpretación:**
- **< 4 horas**: Detección muy rápida - sistema eficiente
- **4-8 horas**: Detección rápida
- **8-24 horas**: Detección moderada
- **> 24 horas**: Detección lenta - necesita mejorar

**Datos necesarios:**
- Fecha de publicación original del contenido
- Fecha de reporte en Botilito
- O timestamps múltiples reportes del mismo contenido

---

### 10. **Tasa de Reporte Ciudadano**

**¿Qué es?**
Porcentaje de participación activa de la población en reportar desinformación.

**¿Cómo se calcula?**
```javascript
TasaReporte = (
  (UsuariosQueReportaron / TotalUsuariosRegistrados) * 100
) * FactorActividad

// O basado en población:
TasaReporte = (
  (TotalReportes / PoblacionRegion) * 100000
) normalizado a escala 0-100

// Alternativa con engagement:
TasaReporte = (
  CasosReportados / (CasosReportados + CasosNoReportados)
) * 100
```

**Interpretación:**
- **< 40%**: Baja participación - necesita incentivos
- **40-70%**: Participación moderada
- **> 70%**: Alta participación ciudadana - comunidad activa

**Datos necesarios:**
- Número de usuarios únicos que han reportado contenido
- Total de usuarios registrados o población estimada
- Total de reportes realizados

---

### 11. **Consenso Humano + IA**

**¿Qué es?**
Porcentaje de coincidencia entre los diagnósticos de verificadores humanos y el diagnóstico de Botilito (IA).

**¿Cómo se calcula?**
```javascript
// Para cada caso individual:
const humanMarkers = caso.consensusMarkers || [];
const aiMarkers = caso.aiAnalysis.detectedMarkers || [];

// Marcadores en común:
const common = humanMarkers.filter(m => aiMarkers.includes(m));

// Total de marcadores únicos:
const totalUnique = new Set([...humanMarkers, ...aiMarkers]).size;

// Porcentaje de coincidencia:
ConsensoIndividual = (common.length / totalUnique) * 100;

// Para una región (promedio):
ConsensoRegion = (
  Suma(ConsensoIndividual_i) / TotalCasosConConsensus
)

// Método alternativo (Jaccard Similarity):
Consenso = (
  |HumanMarkers ∩ AIMarkers| / |HumanMarkers ∪ AIMarkers|
) * 100
```

**Interpretación:**
- **< 40%**: Bajo consenso - discrepancia significativa
- **40-69%**: Consenso moderado - necesita más verificación
- **70-89%**: Alto consenso - confiable
- **≥ 90%**: Consenso excelente - muy confiable

**Datos necesarios:**
- `consensusMarkers`: Marcadores acordados por verificadores humanos
- `aiAnalysis.detectedMarkers`: Marcadores detectados por Botilito
- Para cada caso verificado

---

### 12. **Cobertura de Verificación**

**¿Qué es?**
Porcentaje de casos reportados que han sido verificados por humanos.

**¿Cómo se calcula?**
```javascript
CoberturaVerificacion = (
  CasosConVerificacionHumana / TotalCasosReportados
) * 100

// Alternativa más precisa:
CoberturaVerificacion = (
  CasosConConsensus / CasosActivos
) * 100
```

**Interpretación:**
- **< 30%**: Baja cobertura - necesita más verificadores
- **30-60%**: Cobertura moderada
- **> 60%**: Buena cobertura de verificación

**Datos necesarios:**
- Casos con `consensusMarkers` no vacío
- Total de casos activos o reportados

---

## 🎯 **INDICADORES DERIVADOS Y COMPUESTOS**

### 13. **Índice de Gravedad Combinada (IGC)**

**¿Qué es?**
Indicador compuesto que combina virulencia, alcance y velocidad para determinar el nivel de amenaza global.

**¿Cómo se calcula?**
```javascript
IGC = (
  (Virulencia * 0.4) + 
  (VelocidadTransmision * 0.35) + 
  (R₀_normalizado * 0.25)
)

// R₀ normalizado a escala 0-100:
R₀_normalizado = Math.min((R₀ / 5) * 100, 100)

// Ejemplo:
// Virulencia: 75% × 0.4 = 30
// Velocidad: 85% × 0.35 = 29.75
// R₀: 2.7 → (2.7/5)*100 = 54 × 0.25 = 13.5
// IGC = 30 + 29.75 + 13.5 = 73.25
```

**Interpretación:**
- **0-40**: Bajo riesgo
- **41-65**: Riesgo moderado
- **66-85**: Alto riesgo
- **86-100**: Riesgo crítico - requiere intervención inmediata

---

### 14. **Nivel de Riesgo Epidémico**

**¿Qué es?**
Clasificación categórica del riesgo basada principalmente en R₀.

**¿Cómo se calcula?**
```javascript
function getNivelRiesgo(r0) {
  if (r0 >= 2.5) return { nivel: 'Crítico', color: 'red' };
  if (r0 >= 1.5) return { nivel: 'Alto', color: 'orange' };
  if (r0 >= 1.0) return { nivel: 'Moderado', color: 'yellow' };
  return { nivel: 'Bajo', color: 'green' };
}
```

---

### 15. **Tasa de Viralización**

**¿Qué es?**
Combinación de velocidad de transmisión e infectividad para medir capacidad viral total.

**¿Cómo se calcula?**
```javascript
TasaViralizacion = (
  (VelocidadTransmision * 0.6) + 
  (Infectividad * 0.4)
)
```

---

## 🌐 **INDICADORES DE FUENTES Y TRANSMISIÓN**

### 16. **Vector Principal de Transmisión**

**¿Qué es?**
Plataforma desde la cual se origina o propaga más desinformación.

**¿Cómo se calcula?**
```javascript
// Contar casos por plataforma:
const casosPorPlataforma = {};
casos.forEach(caso => {
  caso.aiAnalysis.sources.forEach(source => {
    casosPorPlataforma[source] = (casosPorPlataforma[source] || 0) + 1;
  });
});

// Vector principal:
const vectorPrincipal = Object.entries(casosPorPlataforma)
  .sort((a, b) => b[1] - a[1])[0];

// Porcentaje:
const porcentaje = (
  vectorPrincipal[1] / casos.length
) * 100;
```

**Interpretación:**
- Identifica dónde concentrar esfuerzos de monitoreo
- Permite estrategias específicas por plataforma

---

## 📊 **CÁLCULOS DE EJEMPLO COMPLETOS**

### Caso de Estudio: Región Andina

**Datos de entrada:**
- Población: 34,140,778 habitantes
- Casos activos: 456
- Casos totales históricos: 3,456
- Nuevos casos (última semana): 89
- Casos semana anterior: 67
- Casos con verificación humana: 312
- Casos con consenso humano-IA alto: 259

**Cálculos:**

```javascript
// 1. R₀
R₀ = 89 / 67 = 1.33
// Interpretación: Cada caso genera 1.33 nuevos casos (crecimiento)

// 2. Densidad
Densidad = (456 / 34140778) * 100000 = 1.34 casos/100k hab

// 3. Virulencia (con datos de marcadores):
// Falso: 892 casos × 90 = 80,280
// Engañoso: 756 casos × 75 = 56,700
// Sensacionalista: 645 casos × 55 = 35,475
// etc...
// Total: 259,380 / 3456 casos = 75% virulencia promedio

// 4. Consenso
Consenso = (259 / 312) * 100 = 83%
// Interpretación: Alto nivel de acuerdo humano-IA

// 5. Cobertura
Cobertura = (312 / 456) * 100 = 68%
// Interpretación: Buena cobertura de verificación

// 6. Velocidad de transmisión
// Casos últimas 24h: 15
// Casos últimas 72h: 38
Velocidad = (15 * 3 / 38) * 100 = 118% → normalizado a 85%

// 7. IGC
IGC = (75 * 0.4) + (85 * 0.35) + ((1.33/5)*100 * 0.25)
    = 30 + 29.75 + 6.65 = 66.4
// Interpretación: Alto riesgo (66/100)
```

---

## 🔄 **ACTUALIZACIÓN Y FRECUENCIA**

### Frecuencias recomendadas:

- **R₀, Velocidad, Infectividad**: Actualizar diariamente
- **Virulencia promedio**: Actualizar cada 6 horas
- **Casos activos/nuevos**: Tiempo real
- **Densidad**: Diariamente
- **Consenso**: Por caso verificado
- **Tiempo de detección**: Semanalmente (promedio móvil)
- **Tasa de reporte**: Semanalmente

---

## 💾 **ESTRUCTURA DE DATOS NECESARIA**

### Base de datos de casos:
```typescript
interface Caso {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  title: string;
  content: string;
  submittedBy: string;
  submittedAt: string; // ISO timestamp
  region: string;
  aiAnalysis: {
    veracity: string;
    confidence: number;
    detectedMarkers: string[];
    sources: string[]; // Plataformas
  };
  consensusMarkers: string[];
  votesCount: number; // Verificadores humanos
  status: 'pendiente' | 'en_verificacion' | 'verificado';
  priority: 'high' | 'medium' | 'low';
}
```

### Constantes necesarias:
```typescript
const VIRULENCIA_MARCADORES = {
  'incitacion_violencia': 98,
  'discurso_odio_racismo': 95,
  'falso': 90,
  // ... etc
};

const POBLACION_REGIONES = {
  'caribe': 10654876,
  'pacifica': 9773228,
  'andina': 34140778,
  'orinoquia': 1664489,
  'amazonia': 1206080,
  'insular': 77701
};
```

---

## 🎯 **RECOMENDACIONES DE IMPLEMENTACIÓN**

1. **Cachear cálculos pesados**: R₀, virulencia promedio
2. **Usar agregaciones en BD**: Para conteos y promedios
3. **Índices en timestamps**: Para filtros por fecha
4. **Precalcular métricas**: En jobs programados
5. **Ventanas temporales**: Usar rolling windows para tendencias
6. **Normalización**: Escalar todos los indicadores a 0-100 para comparabilidad

---

## 📚 **GLOSARIO EPIDEMIOLÓGICO**

- **Caso**: Instancia de desinformación reportada
- **Marcador de diagnóstico**: Tipo/categoría de desinformación (antes "patógeno")
- **Vector**: Plataforma/medio de transmisión
- **Incidencia**: Nuevos casos en un período
- **Prevalencia**: Casos totales existentes
- **Virulencia**: Nivel de peligrosidad/daño
- **R₀**: Tasa de reproducción básica
- **Consenso**: Acuerdo entre diagnósticos

---

**Última actualización**: Enero 2025
**Versión**: 1.0
**Autor**: Equipo Botilito 🔬💛
