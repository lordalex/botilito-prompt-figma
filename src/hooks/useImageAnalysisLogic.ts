import { useMemo } from 'react';
import { AnalysisResult } from '@/types/imageAnalysis';

export function useImageAnalysisLogic(data: AnalysisResult) {
    const testsCount = useMemo(() =>
        data?.human_report?.level_1_analysis?.length || 0,
        [data]);

    const markersCount = useMemo(() => {
        if (!data?.human_report) return 0;
        const { level_1_analysis, level_2_integration } = data.human_report;
        return (level_1_analysis?.filter(i => i.significance_score > 0.4).length || 0) +
            (level_2_integration?.tampering_type !== 'Inexistente' ? 1 : 0);
    }, [data]);

    const derivedRecommendations = useMemo(() => {
        if (!data) return [];
        const level_3_verdict = data.human_report?.level_3_verdict;
        return data.recommendations || (level_3_verdict?.final_label !== 'Auténtico'
            ? ['Verificar cadena de custodia física', 'Revisar metadatos exif avanzados', 'Comparar con la fuente original']
            : ['La imagen parece confiable']);
    }, [data]);

    return {
        testsCount,
        markersCount,
        derivedRecommendations,
        humanReport: data?.human_report
    };
}
