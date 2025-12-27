import { useMemo } from 'react';
import { analysisPresentationService } from '@/services/analysisPresentationService';

export function useTextAnalysisData(data: any) {
    const icoScore = useMemo(() => data?.ai_analysis?.classification?.indiceCumplimientoAMI, [data]);
    const criterios = useMemo(() => data?.ai_analysis?.classification?.criterios || {}, [data]);
    const factCheckTable = useMemo(() => data?.evidence?.fact_check_table || [], [data]);

    const mappedCriterios = useMemo(() => {
        return Object.entries(criterios).map(([id, crit]: [string, any]) => {
            const normalizedScore = analysisPresentationService.normalizeAMIScore(crit.score);

            const statusColor = normalizedScore >= 0.8 ? 'bg-emerald-500' :
                normalizedScore >= 0.3 ? 'bg-amber-400' :
                    'bg-red-500';

            const verdictType = normalizedScore >= 0.8 ? 'success' :
                normalizedScore >= 0.3 ? 'warning' :
                    'danger';

            return {
                id,
                ...crit,
                normalizedScore,
                statusColor,
                verdictType
            };
        });
    }, [criterios]);

    const normalizedICOScore = useMemo(() => {
        if (!icoScore) return null;
        return {
            ...icoScore,
            percent: Math.min(100, Math.round(icoScore.score > 1 ? icoScore.score : icoScore.score * 100))
        };
    }, [icoScore]);

    return {
        icoScore: normalizedICOScore,
        criterios: mappedCriterios,
        factCheckTable,
        diagnosticoAMI: data?.ai_analysis?.diagnosticoAMI
    };
}
