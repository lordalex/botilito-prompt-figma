import { useMemo } from 'react';
import {
    mapMetadataProps,
    mapStatsProps,
    mapRecommendations,
    mapCommunityVotes
} from '@/services/analysisPresentationService';
import { useTextAnalysisData } from './useTextAnalysisData';

interface UseAnalysisSidebarDataProps {
    data: any;
    contentType: 'text' | 'image' | 'audio';
    mode: 'ai' | 'human';
}

export function useAnalysisSidebarData({ data, contentType, mode }: UseAnalysisSidebarDataProps) {
    // Use useTextAnalysisData for consistent data extraction
    const {
        caseData,
        caseId,
        displayId,
        caseTitle,
        createdAt,
        reportedBy,
        sourceData,
        humanVotes,
        icoScore
    } = useTextAnalysisData(data);

    const metadataProps = useMemo(() =>
        mapMetadataProps(data, contentType),
        [contentType, data]
    );

    const statsProps = useMemo(() =>
        mapStatsProps(data, contentType),
        [contentType, data]
    );

    const recommendations = useMemo(() =>
        mapRecommendations(data),
        [data]
    );

    const communityVotes = useMemo(() =>
        mapCommunityVotes(data),
        [data]
    );

    // Case Info Props for new sidebar section
    const caseInfoProps = useMemo(() => ({
        caseNumber: displayId || caseId?.slice(0, 8)?.toUpperCase() || 'N/A',
        contentType: contentType?.toUpperCase() || 'TEXT',
        transmissionVector: sourceData?.vector_de_transmision || 'Web',
        reportedBy: reportedBy?.name || reportedBy?.email || 'Anónimo',
        date: createdAt ? new Date(createdAt).toLocaleDateString('es-CO') : 'N/A'
    }), [caseId, contentType, sourceData, reportedBy, createdAt]);

    // Chain of Custody Events
    const chainOfCustodyEvents = useMemo(() => {
        const events = [];

        // 1. Case Created
        events.push({
            id: 'created',
            title: 'Caso creado',
            description: createdAt ? new Date(createdAt).toLocaleString('es-CO') : 'Fecha desconocida',
            timestamp: createdAt,
            status: 'completed' as const,
            actor: 'system' as const
        });

        // 2. AI Analysis
        events.push({
            id: 'ai_analysis',
            title: 'Análisis desinformético ejecutado',
            description: icoScore ? `Score: ${icoScore.percent}%` : 'Procesado',
            status: 'completed' as const,
            actor: 'ai' as const
        });

        // 3. Human Diagnosis (if applicable)
        if (mode === 'human' || humanVotes?.count > 0) {
            events.push({
                id: 'human_diagnosis',
                title: 'Diagnóstico generado',
                description: humanVotes?.count > 0
                    ? `${humanVotes.count} votos registrados`
                    : 'Requiere un enfoque AMI',
                status: humanVotes?.count > 0 ? 'completed' as const : 'in_progress' as const,
                actor: 'human' as const
            });
        }

        return events;
    }, [createdAt, icoScore, mode, humanVotes]);

    const showVotes = mode === 'human';

    return {
        metadataProps,
        statsProps,
        recommendations,
        communityVotes,
        showVotes,
        // New props
        caseInfoProps,
        chainOfCustodyEvents
    };
}

