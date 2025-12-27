import { useMemo } from 'react';
import {
    analysisPresentationService,
    AnalysisSidebarMetadataProps,
    AnalysisSidebarStatsProps
} from '@/services/analysisPresentationService';

interface UseAnalysisSidebarDataProps {
    data: any;
    contentType: 'text' | 'image' | 'audio';
    mode: 'ai' | 'human';
}

export function useAnalysisSidebarData({ data, contentType, mode }: UseAnalysisSidebarDataProps) {
    const metadataProps = useMemo(() =>
        analysisPresentationService.mapMetadataProps(contentType, data),
        [contentType, data]
    );

    const statsProps = useMemo(() =>
        analysisPresentationService.mapStatsProps(contentType, data),
        [contentType, data]
    );

    const recommendations = useMemo(() =>
        analysisPresentationService.getRecommendations(data),
        [data]
    );

    const communityVotes = useMemo(() =>
        analysisPresentationService.getCommunityVotes(data),
        [data]
    );

    const showVotes = mode === 'human' && communityVotes.length > 0;

    return {
        metadataProps,
        statsProps: statsProps.stats,
        recommendations,
        communityVotes,
        showVotes
    };
}
