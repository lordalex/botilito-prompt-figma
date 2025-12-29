import { useMemo } from 'react';
import { useTextAnalysisData } from './useTextAnalysisData';
import { useAnalysisSidebarData } from './useAnalysisSidebarData';
import {
    transformTextAnalysisToUI,
    transformImageAnalysisToUI,
    transformHumanCaseToUI
} from '@/services/analysisPresentationService';

/**
 * Context types for the UnifiedAnalysisView
 * - 'text': Fresh text analysis results (from textAnalysisService)
 * - 'image': Fresh image analysis results (from imageAnalysisService)
 * - 'audio': Fresh audio analysis results (from audioAnalysisService)
 * - 'case': Case lookup results (from vectorAsyncService - used for human diagnosis & historial)
 */
export type AnalysisContext = 'text' | 'image' | 'audio' | 'case';

/**
 * Mode for the UnifiedAnalysisView
 * - 'ai': Show AI analysis results
 * - 'human': Show human diagnosis form
 */
export type ViewMode = 'ai' | 'human';

interface UseUnifiedAnalysisViewProps {
    /** Raw data from the API */
    data: any;
    /** Context determines which transformer to use */
    context: AnalysisContext;
    /** View mode (ai results vs human diagnosis) */
    mode?: ViewMode;
}

interface UnifiedViewData {
    // Normalized data for UnifiedAnalysisView
    normalizedData: any;

    // Content type derived from context
    contentType: 'text' | 'image' | 'audio';

    // Sidebar data
    sidebarProps: ReturnType<typeof useAnalysisSidebarData>;

    // Text-specific data (from useTextAnalysisData)
    textAnalysisData: ReturnType<typeof useTextAnalysisData> | null;

    // Loading/error states
    isReady: boolean;
}

/**
 * Orchestrator hook that normalizes different payload structures
 * for use with UnifiedAnalysisView.
 * 
 * Handles:
 * - Fresh text analysis: result.cases[0].metadata.ai_analysis
 * - Fresh image analysis: analysis.level_*.tests[]
 * - Case lookup: case.metadata.ai_analysis + human_votes
 */
export function useUnifiedAnalysisView({
    data,
    context,
    mode = 'ai'
}: UseUnifiedAnalysisViewProps): UnifiedViewData {

    // Determine content type from context
    const contentType = useMemo(() => {
        if (context === 'image') return 'image';
        if (context === 'audio') return 'audio';
        return 'text'; // 'text' and 'case' both render as text content type
    }, [context]);

    // Apply the appropriate transformer based on context
    const normalizedData = useMemo(() => {
        if (!data) return null;

        switch (context) {
            case 'text':
                // Fresh text analysis from textAnalysisService
                return transformTextAnalysisToUI(data);

            case 'image':
                // Fresh image analysis from imageAnalysisService
                return transformImageAnalysisToUI(data);

            case 'case':
                // Case lookup from vectorAsyncService (human diagnosis & historial)
                return transformHumanCaseToUI(data);

            case 'audio':
                // Audio analysis - pass through for now
                return data;

            default:
                return data;
        }
    }, [data, context]);

    // Get text analysis data (for text/case contexts that need AMI criteria)
    const textAnalysisData = useTextAnalysisData(
        context === 'text' || context === 'case' ? data : null
    );

    // Get sidebar props
    const sidebarProps = useAnalysisSidebarData({
        data,
        contentType,
        mode
    });

    // Determine if we have valid data to render
    const isReady = useMemo(() => {
        return data !== null && data !== undefined;
    }, [data]);

    return {
        normalizedData,
        contentType,
        sidebarProps,
        textAnalysisData: (context === 'text' || context === 'case') ? textAnalysisData : null,
        isReady
    };
}
