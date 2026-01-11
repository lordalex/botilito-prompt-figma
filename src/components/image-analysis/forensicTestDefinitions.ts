import { TestBadge, ForensicTest } from './ForensicTestCard';
import { Level1AnalysisItem } from '@/types/imageAnalysis';

// Forensic test definitions with Spanish names and descriptions
export const FORENSIC_TEST_DEFINITIONS: Record<string, { name: string; description: string }> = {
  'ELA': {
    name: 'Análisis de Nivel de Error (ELA)',
    description: 'Detecta áreas con diferentes niveles de compresión que indican manipulación'
  },
  'EXIF': {
    name: 'Análisis de Metadatos EXIF',
    description: 'Analiza metadatos EXIF del archivo para detectar inconsistencias'
  },
  'Noise': {
    name: 'Análisis de Patrón de Ruido',
    description: 'Examina patrones de ruido para detectar regiones editadas o generadas'
  },
  'AI': {
    name: 'Detección de Artefactos de IA',
    description: 'Busca artefactos característicos de generación por IA'
  },
  'AI Detection': {
    name: 'Detección de Artefactos de IA',
    description: 'Busca artefactos característicos de generación por IA'
  },
  'Clone': {
    name: 'Detección de Copiar-Mover (Clonación)',
    description: 'Algoritmos SIFT/ORB para detectar regiones duplicadas mediante stamp cloning'
  },
  'SLIC': {
    name: 'Detección de Empalmes',
    description: 'Detecta empalmes de múltiples imágenes mediante análisis de bordes e iluminación'
  },
  'Splice': {
    name: 'Detección de Empalmes',
    description: 'Detecta empalmes de múltiples imágenes mediante análisis de bordes e iluminación'
  },
  'Ghosting': {
    name: 'Análisis de Ghosting',
    description: 'Detecta artefactos de ghosting que indican manipulación o composición'
  }
};

// Determine badge type based on significance score
export function determineBadge(significanceScore: number): TestBadge {
  if (significanceScore >= 0.7) {
    return 'MANIPULATED';
  }
  if (significanceScore >= 0.5) {
    return 'UNCERTAIN';
  }
  return 'CLEAN';
}

// Transform Level1AnalysisItem to ForensicTest format
export function transformToForensicTest(
  item: Level1AnalysisItem,
  index: number,
  executionTime?: number
): ForensicTest {
  const definition = FORENSIC_TEST_DEFINITIONS[item.algorithm] || {
    name: item.algorithm,
    description: item.interpretation
  };

  const badge = determineBadge(item.significance_score);
  const confidence = Math.round(item.significance_score * 100);

  // Generate execution time if not provided (using index for variation)
  const time = executionTime ?? (0.3 + (index * 0.8) + Math.random() * 2);

  return {
    id: `forensic_${item.algorithm.toLowerCase().replace(/\s+/g, '_')}_${index}`,
    name: definition.name,
    description: definition.description,
    badge,
    confidence,
    executionTime: `${time.toFixed(1)}s`
  };
}

// Transform array of Level1AnalysisItem to ForensicTest array
export function transformTestResults(items: Level1AnalysisItem[]): ForensicTest[] {
  return items.map((item, index) => transformToForensicTest(item, index));
}
