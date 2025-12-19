import { useMemo } from 'react';
import type { AnalysisResult } from '../services/imageAnalysisTypes';

export const useImageAnalysisResult = (result: AnalysisResult) => {
  const { summary } = result;

  const isTampered = useMemo(() => summary.verdict === 'TAMPERED', [summary.verdict]);
  const confidencePercent = useMemo(() => (summary.score * 100).toFixed(1), [summary.score]);

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

  return {
    ...result,
    isTampered,
    confidencePercent,
    verdictCardProps,
  };
};
