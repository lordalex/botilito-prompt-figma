import { useMemo } from 'react';
import { AudioAnalysisResult } from '@/types/audioAnalysis';

export function useAudioAnalysisLogic(data: AudioAnalysisResult) {
    const humanReport = useMemo(() => data?.human_report, [data]);

    const safeVerdict = useMemo(() => {
        if (!humanReport) return null;
        return humanReport.verdict || {
            conclusion: 'Análisis completado',
            risk_level: 'medium' as const,
            confidence: 0.5
        };
    }, [humanReport]);

    const testsExecuted = useMemo(() => {
        if (!humanReport) return 0;
        const { transcription, speaker_analysis, audio_forensics, sentiment_analysis } = humanReport;
        return [
            transcription,
            speaker_analysis,
            audio_forensics,
            sentiment_analysis
        ].filter(Boolean).length + 1;
    }, [humanReport]);

    const anomaliesFound = useMemo(() =>
        humanReport?.audio_forensics?.anomalies?.length || 0,
        [humanReport]);

    const speakersDetected = useMemo(() =>
        humanReport?.speaker_analysis?.num_speakers || 0,
        [humanReport]);

    return {
        humanReport,
        verdict: safeVerdict,
        testsExecuted,
        anomaliesFound,
        speakersDetected,
        localAudioUrl: data?.local_audio_url
    };
}
