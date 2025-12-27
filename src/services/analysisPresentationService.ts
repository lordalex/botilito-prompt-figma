/**
 * Analysis Presentation Service
 * Handles data transformation and mapping for analysis UI components.
 * Enforces separation of concerns by moving mapping logic out of UI components.
 */

export interface AnalysisSidebarMetadataProps {
    type: 'text' | 'image' | 'audio';
    fileName?: string;
    fileSize?: number;
    basicMetadata: { label: string; value: string | number }[];
    technicalMetadata: { label: string; value: string | number }[];
}

export interface AnalysisSidebarStatsProps {
    stats: { label: string; value: string | number; color?: string }[];
}

export const analysisPresentationService = {
    /**
     * Maps raw analysis data to props for AnalysisSidebarMetadata
     */
    mapMetadataProps(contentType: 'text' | 'image' | 'audio', data: any): AnalysisSidebarMetadataProps {
        if (contentType === 'text') {
            return {
                type: 'text',
                basicMetadata: [
                    { label: 'Formato', value: 'Texto Plano / Web' },
                    { label: 'Nivel Humano', value: data?.human_review_required ? 'Alta' : 'Baja' }
                ],
                technicalMetadata: [
                    { label: 'Longitud', value: `${data?.source_data?.text?.length || 0} caracteres` },
                    { label: 'URL Original', value: data?.source_data?.url || 'No disponible' }
                ]
            };
        }
        if (contentType === 'image') {
            const info = data?.file_info;
            return {
                type: 'image',
                fileName: info?.name,
                fileSize: info?.size_bytes,
                basicMetadata: [
                    { label: 'Resolución', value: info?.dimensions ? `${info.dimensions.width}x${info.dimensions.height}` : 'N/A' },
                    { label: 'Formato', value: info?.mime_type?.split('/')[1]?.toUpperCase() || 'IMAGE' }
                ],
                technicalMetadata: [
                    { label: 'Cámara', value: info?.exif_data?.Model || 'No disponible' },
                    { label: 'Software', value: info?.exif_data?.Software || 'No disponible' },
                    { label: 'Fecha Captura', value: info?.exif_data?.DateTime || 'No disponible' }
                ]
            };
        }
        if (contentType === 'audio') {
            const info = data?.file_info;
            return {
                type: 'audio',
                fileName: info?.name,
                fileSize: info?.size_bytes,
                basicMetadata: [
                    { label: 'Duración', value: info?.duration_seconds ? `${Math.floor(info.duration_seconds / 60)}:${(info.duration_seconds % 60).toString().padStart(2, '0')}` : 'N/A' },
                    { label: 'Formato', value: info?.mime_type?.split('/')[1]?.toUpperCase() || 'AUDIO' }
                ],
                technicalMetadata: [
                    { label: 'Sample Rate', value: info?.metadata?.sample_rate ? `${(info.metadata.sample_rate / 1000).toFixed(1)} kHz` : 'N/A' },
                    { label: 'Canales', value: info?.metadata?.channels === 1 ? 'Mono' : 'Stereo' },
                    { label: 'Bitrate', value: info?.metadata?.bit_rate ? `${Math.round(info.metadata.bit_rate / 1000)} kbps` : 'N/A' }
                ]
            };
        }
        return { type: contentType, basicMetadata: [], technicalMetadata: [] };
    },

    /**
     * Maps raw analysis data to props for AnalysisSidebarStats
     */
    mapStatsProps(contentType: 'text' | 'image' | 'audio', data: any): AnalysisSidebarStatsProps {
        if (contentType === 'text') {
            const criterios = Object.keys(data?.ai_analysis?.classification?.criterios || {}).length;
            const hallazgos = data?.evidence?.fact_check_table?.length || 0;
            return {
                stats: [
                    { label: 'Criterios AMI', value: criterios },
                    { label: 'Hechos Verificados', value: hallazgos },
                    { label: 'Confianza IA', value: `${data?.ai_analysis?.classification?.nivel_confianza || 0}%`, color: 'text-primary' }
                ]
            };
        }
        if (contentType === 'image') {
            const reports = data?.human_report?.level_1_analysis?.length || 0;
            const markers = (data?.human_report?.level_1_analysis?.filter((i: any) => i.significance_score > 0.4).length || 0);
            return {
                stats: [
                    { label: 'Pruebas Forenses', value: reports },
                    { label: 'Marcadores', value: markers, color: 'text-red-500' },
                    { label: 'Confianza', value: `${Math.round((data?.human_report?.level_3_verdict?.confidence || 0) * 100)}%` }
                ]
            };
        }
        if (contentType === 'audio') {
            const anomalies = data?.human_report?.audio_forensics?.anomalies?.length || 0;
            return {
                stats: [
                    { label: 'Hablantes', value: data?.human_report?.speaker_analysis?.num_speakers || 0 },
                    { label: 'Anomalías', value: anomalies, color: anomalies > 0 ? 'text-red-500' : 'text-emerald-500' },
                    { label: 'Confianza', value: `${Math.round((data?.human_report?.verdict?.confidence || 0) * 100)}%` }
                ]
            };
        }
        return { stats: [] };
    },

    /**
     * Extracts recommendations from analysis data
     */
    getRecommendations(data: any): string[] {
        return data?.ai_analysis?.classification?.recomendaciones || data?.recommendations || [];
    },

    /**
     * Extracts community votes from analysis data
     */
    getCommunityVotes(data: any): any[] {
        return data?.human_votes?.entries || [];
    },

    /**
     * Normalizes AMI criteria scores to a 0-1 range
     */
    normalizeAMIScore(score: number): number {
        if (score > 5) return score / 100;
        if (score > 1.2) return score / 5;
        return score;
    }
};
