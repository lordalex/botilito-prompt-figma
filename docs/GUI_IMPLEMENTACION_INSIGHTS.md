 Estructura del Array insights

El backend normaliza todos los hallazgos en una lista plana. Cada elemento tiene esta estructura (TypeScript):
code TypeScript

    
interface Insight {
  id: string;          // Clave única (ej: "meta_context_type", "fc_0")
  category: string;    // "metadata", "fact_check", "content_quality"
  label: string;       // Título legible (ej. "Clasificación de Contexto")
  value: string | number; // El hallazgo principal (ej. "Hecho", "Refutado")
  description: string; // Explicación narrativa
  score?: number;      // 0-100 (opcional)
  artifacts?: {        // Evidencias de soporte
    type: "text_snippet" | "link_url";
    label: string;
    content: string;
  }[];
}

  

3. Mapeo de Componentes UI

A continuación, se explica cómo mapear cada tipo de Insight a un componente visual.
A. Clasificación de Contexto (NUEVO)

Este insight determina si el contenido es una noticia factual, una opinión o una investigación.

    Identificador (ID): meta_context_type

    Valores Posibles: "Hecho", "Opinión", "Periodismo de Investigación".

Lógica de Renderizado:

    Badge de Cabecera: Usa el campo value para mostrar una etiqueta de color junto al título.

        Hecho → Azul (Info)

        Opinión → Naranja (Subjetivo)

        Investigación → Violeta (Profundidad)

    Sección de Evidencia (Artifacts): Itera sobre el array artifacts para mostrar por qué se clasificó así.

Ejemplo de JSON recibido:
code JSON

    
{
  "id": "meta_context_type",
  "category": "metadata",
  "label": "Clasificación de Contexto",
  "value": "Hecho",
  "description": "El artículo reporta eventos actuales citando fuentes...",
  "artifacts": [
    { "label": "Fuentes Identificadas", "content": "Ministerio de Salud, OMS", "type": "text_snippet" },
    { "label": "Datos Contrastables", "content": "Cifras de vacunación 2024", "type": "text_snippet" }
  ]
}

  

Componente Sugerido (React/Pseudocódigo):
code Tsx

    
const ContextCard = ({ insights }) => {
  const context = insights.find(i => i.id === 'meta_context_type');
  if (!context) return null;

  return (
    <div className="card">
      <div className="header">
        <span className={`badge ${context.value.toLowerCase()}`}>
          {context.value} {/* Muestra "Hecho" */}
        </span>
      </div>
      <p>{context.description}</p>
      
      {/* Renderizar Evidencias */}
      <div className="evidence-list">
        {context.artifacts?.map(art => (
          <div key={art.label}>
            <strong>{art.label}:</strong> {art.content}
          </div>
        ))}
      </div>
    </div>
  );
};

  

B. Verificación de Hechos (Fact-Checking)

Lista de afirmaciones extraídas y su veredicto.

    Identificador (ID): Empieza con fc_ (ej. fc_0, fc_1).

    Categoría: fact_check.

Lógica de Renderizado:
Filtra el array de insights buscando category === 'fact_check'.

Mapeo de Colores:

    value === "Verificado" → ✅ Verde

    value === "Refutado" → ❌ Rojo

    value === "No Verificable" → ⚪ Gris

Ejemplo de Visualización:
code Tsx

    
const FactCheckList = ({ insights }) => {
  const facts = insights.filter(i => i.category === 'fact_check');

  return (
    <ul>
      {facts.map(fact => (
        <li key={fact.id} className={fact.value}> {/* Clase css por veredicto */}
          <span className="icon">{getIcon(fact.value)}</span>
          <span className="claim">"{fact.description}"</span>
          {/* El análisis interno viene en artifacts */}
          <p className="analysis">{fact.artifacts[0]?.content}</p>
        </li>
      ))}
    </ul>
  );
};

  

C. Criterios AMI (Calidad de Contenido)

Evaluación de los 20 puntos de alfabetización mediática.

    Identificador (ID): Empieza con ami_crit_.

    Score: 0 a 100.

Lógica de Renderizado:
Estos son ideales para Barras de Progreso o Indicadores Circulares.

    score >= 80 → Alto Cumplimiento (Verde)

    score < 50 → Bajo Cumplimiento (Rojo/Naranja)

Ejemplo de Uso:
Mostrar solo los criterios destacados (muy altos o muy bajos) para no saturar la vista principal.
code JavaScript

    
// Obtener los 3 mejores y 3 peores criterios
const amiMetrics = insights.filter(i => i.id.startsWith('ami_crit_'));
const sortedMetrics = amiMetrics.sort((a, b) => b.score - a.score);
const topMetrics = sortedMetrics.slice(0, 3);

  

4. Resumen de Implementación

Para integrar esto en tu aplicación (Validación o Historial):

    Llamada API: Usa /search con select_fields incluyendo "insights".

    Parser: Crea una función utilitaria que reciba el array insights completo y devuelva un objeto estructurado para tu vista:
    code TypeScript

    
function parseInsights(insights: GenericInsight[]) {
  return {
    context: insights.find(i => i.id === 'meta_context_type'),
    factChecks: insights.filter(i => i.category === 'fact_check'),
    qualityMetrics: insights.filter(i => i.category === 'content_quality'),
    forensics: insights.filter(i => i.category === 'forensics') // Clickbait, etc.
  };
}
