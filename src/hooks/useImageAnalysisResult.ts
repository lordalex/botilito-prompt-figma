import { useMemo } from 'react';
import type { AnalysisResult, Insight } from '../services/imageAnalysisTypes';

export const useImageAnalysisResult = (result: AnalysisResult) => {
  const { summary, details } = result;

  const isTampered = useMemo(() => summary.global_verdict === 'TAMPERED', [summary.global_verdict]);
  const confidencePercent = useMemo(() => (summary.confidence_score * 100).toFixed(1), [summary.confidence_score]);

  const verdictCardProps = useMemo(() => {
    if (isTampered) {
      return {
        title: 'Veredicto: Imagen Posiblemente Manipulada',
        description: `Nuestros análisis sugieren que esta imagen puede haber sido alterada digitalmente con una confianza del ${confidencePercent}%.`,
        variant: 'destructive' as const,
      };
    }
    return {
      title: 'Veredicto: Imagen Aparentemente Limpia',
      description: `No se encontraron señales evidentes de manipulación en esta imagen. La puntuación de manipulación es baja (${confidencePercent}%).`,
      variant: 'primary' as const,
    };
  }, [isTampered, confidencePercent]);

  const metadataInsight = useMemo(() => {
    if (!details || !details[0] || !details[0].insights) {
      return undefined;
    }
    return details[0].insights.find((insight: Insight) => insight.algo === 'Metadatos' && insight.type === 'metadata');
  }, [details]);

  return {
    ...result,
    isTampered,
    confidencePercent,
    verdictCardProps,
    metadataInsight,
  };
};
