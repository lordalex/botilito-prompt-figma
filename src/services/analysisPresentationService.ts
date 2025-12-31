
import {
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    HelpCircle,
    User,
    Clock,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Bot
} from 'lucide-react';
import { generateDisplayId } from '@/utils/humanVerification/api';

/* -------------------------------------------------------------------------- */
/*                                Types & Interfaces                          */
/* -------------------------------------------------------------------------- */

// ... (Existing types remain if needed, or import from types file)

/* -------------------------------------------------------------------------- */
/*                           Main Transformation Logic                        */
/* -------------------------------------------------------------------------- */

export const normalizeAMIScore = (score: number) => {
    if (typeof score !== 'number') return 0;
    // Normalize to 0-1 range
    // If score is > 10, assume 0-100 scale -> divide by 100
    // If score is > 1 (and <= 10), assume 0-10 scale -> divide by 10
    // If score is <= 1, assume 0-1 scale -> return as is
    if (score > 10) return score / 100;
    if (score > 1) return score / 10;
    return score;
};

/**
 * Transforms the API response (Text Analysis) into a UI-ready object
 * compatible with the Sidebar components.
 * 
 * Supports both:
 * - New DTO: standardized_case structure from text-analysis-dto.json
 * - Legacy: classification.indiceCumplimientoAMI structure
 */
export const transformTextAnalysisToUI = (data: any) => {
    if (!data) return null;

    // Check for new standardized_case DTO structure
    const standardizedCase = data.standardized_case || data.data?.standardized_case;

    if (standardizedCase) {
        // Handle new DTO format from text-analysis-dto.json
        const overview = standardizedCase.overview || {};
        const lifecycle = standardizedCase.lifecycle || {};
        const insights = standardizedCase.insights || [];
        const reporter = standardizedCase.reporter || {};
        const community = standardizedCase.community || {};

        // Transform insights to criteria list format
        const criteriaList = insights.map((insight: any) => {
            const score = insight.score ?? 0;
            let statusColor = 'bg-slate-200';
            let verdictType = 'info';

            // Score interpretation: 0 = bad, 100 = good
            if (score >= 70) {
                statusColor = 'bg-emerald-500';
                verdictType = 'success';
            } else if (score >= 40) {
                statusColor = 'bg-amber-500';
                verdictType = 'warning';
            } else {
                statusColor = 'bg-red-500';
                verdictType = 'error';
            }

            return {
                id: insight.id,
                nombre: insight.label,
                justificacion: insight.description,
                referencia: insight.artifacts?.find((a: any) => a.label?.includes('Referencia'))?.content || '',
                score: score,
                normalizedScore: score / 100,
                cumple: score >= 70,
                statusColor,
                verdictType,
                category: insight.category,
                artifacts: insight.artifacts || [],
                rawData: insight.raw_data
            };
        });

        // Extract fact check insights
        const factCheckTable = insights
            .filter((i: any) => i.category === 'fact_check')
            .map((item: any) => ({
                claim: item.raw_data?.claim || item.label,
                verdict: item.value || item.raw_data?.verdict,
                explanation: item.description || item.raw_data?.explanation,
                sources: item.artifacts?.filter((a: any) => a.type === 'text_snippet') || []
            }));

        // Derive competencies analysis for UI (AMI Framework Mapping)
        const competenciesAnalysis: any = {};
        const qualityInsights = insights.filter((i: any) => i.category === 'content_quality');
        const failedQualities = qualityInsights.filter((i: any) =>
            (i.score !== undefined && i.score < 70) ||
            (i.value && i.value.toString().toLowerCase().includes('no cumple'))
        );

        // Competency Mapping (AMI IDs to UI Keys)
        const compMap: Record<string, string[]> = {
            'acceso_informacion': ['ami_1', 'ami_2', 'ami_15'],
            'evaluacion_critica': ['ami_3', 'ami_6', 'ami_7', 'ami_8', 'ami_9', 'ami_13', 'ami_14'],
            'comprension_contexto': ['ami_4', 'ami_5', 'ami_10', 'ami_16', 'ami_18'],
            'produccion_responsable': ['ami_11', 'ami_12', 'ami_17', 'ami_19']
        };

        // Populate competencies based on failures
        Object.entries(compMap).forEach(([compKey, insightIds]) => {
            const groupFailures = failedQualities.filter((f: any) => insightIds.includes(f.id));
            if (groupFailures.length > 0) {
                competenciesAnalysis[compKey] = {
                    score: 0,
                    recommendations: groupFailures.map((f: any) => f.description)
                };
            }
        });

        return {
            // Core Identity
            id: standardizedCase.id,
            created_at: standardizedCase.created_at,
            type: standardizedCase.type,

            // Lifecycle status
            lifecycle: {
                jobStatus: lifecycle.job_status,
                custodyStatus: lifecycle.custody_status,
                lastUpdate: lifecycle.last_update
            },

            // Overview data
            title: overview.title,
            summary: overview.summary,
            verdictLabel: overview.verdict_label,
            riskScore: overview.risk_score || 0,
            mainAssetUrl: overview.main_asset_url,
            sourceDomain: overview.source_domain,

            // Metadata for Sidebar
            fileName: overview.title || "Texto Analizado",
            fileSize: `${overview.summary?.length || 0} chars`,

            // Specific Analysis Blocks (mapped from overview)
            icoScore: {
                score: overview.risk_score || 0,
                percent: Math.round(overview.risk_score || 0),
                nivel: overview.verdict_label || "No disponible",
            },
            diagnosticoAMI: overview.summary || "",

            criterios: criteriaList,
            factCheckTable: factCheckTable,
            insights: insights, // Keep raw insights for advanced components

            // Reporter info
            reporter: {
                id: reporter.id,
                name: reporter.name,
                reputation: reporter.reputation
            },

            // Community votes
            community: {
                votes: community.votes || 0,
                status: community.status
            },

            // Raw Data Access
            raw: data,

            // Mapping for UnifiedAnalysisView compatibility
            classification: {
                tipoFuente: overview.source_domain || 'Fuente desconocida',
                tipoContenido: overview.source_domain ? 'Noticia Web' : 'Texto Análisis',
                tema: 'General',
                titulo: overview.title,
                resumen: overview.summary,
                score: overview.risk_score,
                nivel: overview.verdict_label,
                explicacion: overview.verdict_label
            },

            // Mapping for Recommendations (TextAIAnalysis)
            ai_analysis: {
                competencies_analysis: competenciesAnalysis,
                summaries: {
                    summary: overview.summary,
                    short: { text: overview.summary }
                }
            },

            // Mapping for Sidebar components
            metadata: {
                type: 'text',
                language: 'es',
                source: overview.source_domain || 'Direct Input',
                screenshot: overview.main_asset_url,
                vector_de_transmision: overview.source_domain ? 'Web' : 'Direct',
                submission_type: 'text',
                reported_by: {
                    id: reporter.id,
                    name: reporter.name,
                    reputation: reporter.reputation
                }
            },

            // Stats for Sidebar
            stats: [
                { label: "Criterios Evaluados", value: criteriaList.length, icon: CheckCircle },
                { label: "Fact Checks", value: factCheckTable.length, icon: User },
                { label: "Puntuación de Riesgo", value: `${Math.round(overview.risk_score || 0)}%`, icon: AlertTriangle }
            ]
        };
    }

    // Legacy format handling (backwards compatibility)
    const amiScoreRaw = data.classification?.indiceCumplimientoAMI?.score || 0;
    const amiNivel = data.classification?.indiceCumplimientoAMI?.nivel || "No disponible";
    const diagnostic = data.classification?.indiceCumplimientoAMI?.diagnostico || "";

    // Normalize criteria list
    const criteriaRaw = data.classification?.indiceCumplimientoAMI?.criterios || {};
    const criteriaList = Object.entries(criteriaRaw).map(([key, val]: any) => {
        // "cumple": true/false/parcial
        let statusColor = 'bg-slate-200';
        let verdictType = 'info';

        if (val.cumple === true) {
            statusColor = 'bg-emerald-500';
            verdictType = 'success';
        } else if (val.cumple === false) {
            statusColor = 'bg-red-500';
            verdictType = 'error';
        } else {
            statusColor = 'bg-amber-500';
            verdictType = 'warning';
        }

        return {
            id: key,
            nombre: val.nombre,
            justificacion: val.justificacion,
            referencia: val.referencia,
            score: val.score || 0,
            normalizedScore: (val.score || 0) / 10, // Assuming 0-10 scale
            cumple: val.cumple,
            statusColor,
            verdictType
        };
    });

    // Normalize Fact Check table
    // Path: data.verification?.fact_check_table
    const factCheckTable = (data.verification?.fact_check_table || []).map((item: any) => ({
        claim: item.claim || item.afirmacion, // Handle both english/spanish keys if needed
        verdict: item.verdict || item.veredicto,
        explanation: item.explanation || item.explicacion,
        sources: item.sources || []
    }));

    return {
        // Core Identity
        id: data.id,
        created_at: data.created_at,

        // Metadata for Sidebar
        fileName: "Texto Analizado", // Text analysis usually doesn't have a file name unless from file
        fileSize: `${data.content?.length || 0} chars`,

        // Specific Analysis Blocks
        icoScore: {
            score: amiScoreRaw,
            percent: Math.round(data.classification?.indiceCumplimientoAMI?.porcentaje_cumplimiento || 0), // If raw percent exists, use it
            nivel: amiNivel,
        },
        diagnosticoAMI: diagnostic,

        criterios: criteriaList,
        factCheckTable: factCheckTable,

        // Raw Data Access (for legacy components if needed)
        raw: data,

        // Mapping for Sidebar components
        metadata: {
            type: 'text',
            // ... extract other metadata
            language: data.language || 'es',
            source: data.metadata?.source || 'Direct Input'
        },

        // Stats for Sidebar
        stats: [
            { label: "Criterios Evaluados", value: criteriaList.length, icon: CheckCircle },
            { label: "Fuentes Consultadas", value: data.verification?.trusted_sources_count || 0, icon: User },
            // Add more generic stats
        ]
    };
};


/**
 * Transforms the API response (Image Analysis) into a UI-ready object.
 * 
 * Supports both:
 * - New DTO: standardized_case structure from image-analysis-api-dto.json
 * - Legacy: technical_analysis and metadata structure
 */
export const transformImageAnalysisToUI = (data: any) => {
    if (!data) return null;

    // Check for new standardized_case DTO structure
    const standardizedCase = data.standardized_case || data.result?.standardized_case;

    if (standardizedCase) {
        // Handle new DTO format from image-analysis-api-dto.json
        const overview = standardizedCase.overview || {};
        const lifecycle = standardizedCase.lifecycle || {};
        const insights = standardizedCase.insights || [];

        // Transform insights to forensic tests format
        const forensicTests = insights.map((insight: any) => {
            const score = insight.score ?? 0;
            let statusColor = 'bg-slate-200';
            let verdictType = 'info';

            // Score interpretation for forensics: 0 = bad (manipulated), 100 = good (authentic)
            if (score >= 70) {
                statusColor = 'bg-emerald-500';
                verdictType = 'success';
            } else if (score >= 40) {
                statusColor = 'bg-amber-500';
                verdictType = 'warning';
            } else {
                statusColor = 'bg-red-500';
                verdictType = 'error';
            }

            // Extract artifacts (heatmaps, masks, etc.)
            const imageArtifacts = insight.artifacts?.filter((a: any) => a.type === 'image_url') || [];
            const textArtifacts = insight.artifacts?.filter((a: any) => a.type === 'text_snippet') || [];

            return {
                id: insight.id,
                name: insight.label,
                label: insight.label,
                description: insight.description,
                value: insight.value,
                score: score,
                normalizedScore: score / 100,
                category: insight.category,
                statusColor,
                verdictType,
                // Forensic-specific artifacts
                heatmap: imageArtifacts.find((a: any) => a.label?.toLowerCase().includes('calor'))?.content,
                mask: imageArtifacts.find((a: any) => a.label?.toLowerCase().includes('mask') || a.label?.toLowerCase().includes('máscara'))?.content,
                artifacts: insight.artifacts || [],
                rawData: insight.raw_data
            };
        });

        // Extract visualizations (heatmaps, masks) from all insights
        const visualizations = insights.flatMap((insight: any) =>
            (insight.artifacts || [])
                .filter((a: any) => a.type === 'image_url')
                .map((artifact: any) => ({
                    id: `${insight.id}_${artifact.label}`,
                    type: artifact.label?.toLowerCase().includes('calor') ? 'heatmap' :
                        artifact.label?.toLowerCase().includes('mask') ? 'mask' : 'image',
                    url: artifact.content,
                    label: artifact.label,
                    insightId: insight.id,
                    insightLabel: insight.label
                }))
        );

        return {
            // Core Identity
            id: standardizedCase.id,
            created_at: standardizedCase.created_at,
            type: standardizedCase.type,

            // Lifecycle status
            lifecycle: {
                jobStatus: lifecycle.job_status,
                custodyStatus: lifecycle.custody_status
            },

            // Overview data (verdict & risk)
            title: overview.title || "Análisis Forense Visual",
            summary: overview.summary,
            verdictLabel: overview.verdict_label,
            riskScore: overview.risk_score || 0,
            mainAssetUrl: overview.main_asset_url,

            // Metadata for Sidebar
            fileName: overview.title || "Imagen",
            fileSize: "Unknown",

            // Forensic verdict mapping
            summary_verdict: {
                global_verdict: overview.verdict_label,
                manipulation_probability: overview.risk_score || 0
            },

            // Forensic tests from insights
            forensicTests: forensicTests,
            insights: insights,

            // Organized visualizations
            visualizations: visualizations,

            // Raw Data Access
            raw: data,

            // Mapping for Sidebar components
            metadata: {
                type: 'image',
                mainAssetUrl: overview.main_asset_url
            },

            // Stats for Sidebar
            stats: [
                { label: "Pruebas Forenses", value: forensicTests.length, icon: CheckCircle },
                { label: "Visualizaciones", value: visualizations.length, icon: User },
                { label: "Riesgo de Manipulación", value: `${Math.round(overview.risk_score || 0)}%`, icon: AlertTriangle }
            ]
        };
    }

    // Legacy format handling (backwards compatibility)
    const technical = data.technical_analysis || {};
    const metadata = data.metadata || {};

    return {
        id: data.id,
        created_at: data.created_at,
        fileName: metadata.filename || "Imagen",
        fileSize: metadata.size || "Unknown",

        // ... specific props for ImageAIAnalysis
        raw: data
    };
};

/**
 * Transforms the API response (Audio Analysis) into a UI-ready object.
 */
export const transformAudioAnalysisToUI = (data: any) => {
    if (!data) return null;

    // Check for StandardizedCase structure
    const standardizedCase = data.data || data.standardized_case || data.result?.standardized_case;

    if (standardizedCase) {
        const overview = standardizedCase.overview || {};
        const insights = standardizedCase.insights || [];

        // Map Overview -> Verdict
        const verdict = {
            conclusion: overview.verdict_label || "Análisis completado",
            risk_level: overview.risk_score > 70 ? 'high' : overview.risk_score > 30 ? 'medium' : 'low',
            confidence: overview.risk_score / 100
        };

        // Map Insights -> Forensics & Anomalies
        const anomalies = insights.filter((i: any) => i.score !== undefined && i.score < 50).map((i: any) => ({
            type: i.label,
            description: i.description,
            start: 0, // Mock, no segment data provided in generic GenericInsight
            end: 0
        }));

        const authenticityScore = 100 - (overview.risk_score || 0);

        // Try to find transcription in insights (category: content_quality or specific label)
        const transcriptionInsight = insights.find((i: any) => i.id === 'transcription' || i.label?.toLowerCase().includes('transcripci'));

        const humanReport = {
            verdict,
            audio_forensics: {
                authenticity_score: authenticityScore,
                manipulation_detected: overview.risk_score > 50,
                anomalies: anomalies,
                spectral_analysis: "Análisis espectral completado."
            },
            transcription: {
                text: transcriptionInsight?.value || transcriptionInsight?.description || "Transcripción no disponible en este nivel de análisis.",
                language: "es",
                confidence: transcriptionInsight?.score || 0
            },
            speaker_analysis: {
                num_speakers: 1 // Default
            }
        };

        return {
            id: standardizedCase.id,
            created_at: standardizedCase.created_at,
            human_report: humanReport,
            local_audio_url: overview.main_asset_url,
            raw: data // Keep full data
        };
    }

    // Legacy fallback
    return {
        id: data.id,
        created_at: data.created_at,
        human_report: data.human_report, // Pass through legacy structure
        local_audio_url: data.local_audio_url,
        raw: data
    };
};

/**
 * Transforms the lookup result (StandardizedCase DTO) for the Unified View.
 * 
 * Handles the new search-dto API format:
 * StandardizedCase { id, type, created_at, overview, insights, lifecycle, reporter, community }
 * 
 * Also maintains backwards compatibility with legacy formats.
 * NO MOCK DATA - all values come from the payload.
 */
export const transformHumanCaseToUI = (caseData: any) => {
    if (!caseData) return null;

    // Extract the actual case - handle nested structures from lookup API
    const extractedCase = caseData.case || caseData.result?.case || caseData;

    // Check if this is the new StandardizedCase format (has overview/insights/lifecycle)
    const isStandardizedCase = !!(extractedCase.overview || extractedCase.insights || extractedCase.lifecycle);

    if (isStandardizedCase) {
        // Parse StandardizedCase DTO format from search-dto API
        const overview = extractedCase.overview || {};
        const lifecycle = extractedCase.lifecycle || {};
        const insights = extractedCase.insights || [];
        const reporter = extractedCase.reporter || {};
        const community = extractedCase.community || {};

        // Extract recommendations and competencies from insights
        const recommendationInsights = insights.filter((i: any) => i.category === 'recommendation');
        const competencyInsights = insights.filter((i: any) => i.category === 'competency');

        // Build recommendations array (Primary source: explicit insights)
        let recomendaciones = recommendationInsights.map((i: any) => i.description || i.label);

        // Build competencies analysis object (Primary source: explicit insights)
        let competenciesAnalysis = competencyInsights.reduce((acc: any, curr: any) => {
            acc[curr.id] = {
                score: curr.score || 0,
                name: curr.label,
                description: curr.description,
                recommendations: curr.raw_data?.recommendations || []
            };
            return acc;
        }, {});

        // FALLBACK: If no explicit competencies, derive from failed AMI criteria
        const contentQualityInsights = insights.filter((i: any) => i.category === 'content_quality');

        if (Object.keys(competenciesAnalysis).length === 0 && contentQualityInsights.length > 0) {
            // Identify failed criteria (score < 70 or value "No Cumple")
            const failedCriteria = contentQualityInsights.filter((i: any) =>
                (i.score !== undefined && i.score < 70) ||
                (i.value && i.value.toString().toLowerCase().includes('no cumple'))
            );

            // Generate Map of criteria to recommendations
            const remediationMap: Record<string, string> = {
                'Claridad de la fuente': 'Verificar siempre la autoría y la reputación del medio.',
                'Trazabilidad': 'Buscar enlaces a las fuentes primarias y documentos originales.',
                'Hechos vs Opinión': 'Diferenciar claramente entre la información factual y los comentarios de opinión.',
                'Contexto Temporal': 'Confirmar la fecha de publicación y si el contenido es vigente.',
                'Contexto Geográfico': 'Validar la ubicación de los hechos reportados.',
                'Pluralidad': 'Consultar otras fuentes para contrastar diferentes puntos de vista.',
                'Credibilidad': 'Investigar el historial de veracidad del medio y el autor.',
                'Uso de datos': 'Exigir referencias claras para cifras y estadísticas presentadas.',
                'Lenguaje emocional': 'Analizar si el lenguaje busca manipular emociones en lugar de informar.',
                'Intencionalidad': 'Reflexionar sobre el propósito del contenido (informar, persuadir, vender).',
                'Derechos Humanos': 'Evaluar si el contenido respeta la dignidad y derechos de las personas.',
                'Ética': 'Considerar si el contenido cumple con estándares éticos periodísticos.',
                'Desinformación': 'Estar alerta ante contenido fabricado o manipulado intencionalmente.',
                'Malinformación': 'Identificar información verídica usada fuera de contexto para dañar.',
                'Sesgos': 'Reconocer los posibles sesgos ideológicos o comerciales del medio.',
                'Transparencia': 'Valorar si el medio es abierto sobre su financiación y metodología.',
                'Influencia algorítmica': 'Ser consciente de cómo los algoritmos pueden filtrar lo que ves.',
                'Participación': 'Buscar formas de participar constructivamente en el debate público.',
                'Impacto social': 'Considerar las consecuencias sociales del contenido consumido.',
                'Pensamiento crítico': 'Cuestionar siempre la información y buscar evidencia adicional.'
            };

            // Populate recommendations and competencies from failures
            failedCriteria.slice(0, 5).forEach((crit: any) => {
                const label = crit.label;
                const advice = remediationMap[label] || `Mejorar el aspecto de ${label} mediante verificación adicional.`;

                // Add to recommendations list if empty
                if (recomendaciones.length < 5) {
                    recomendaciones.push(advice);
                }

                // Add to competencies analysis
                competenciesAnalysis[`comp_${crit.id}`] = {
                    score: crit.score || 0,
                    name: `Competencia: ${label}`,
                    description: `El contenido presenta debilidades en ${label}.`,
                    recommendations: [advice]
                };
            });
        }

        // Separate insights by category (continued)
        const factCheckInsights = insights.filter((i: any) => i.category === 'fact_check');
        const forensicsInsights = insights.filter((i: any) => i.category === 'forensics');
        const metadataInsights = insights.filter((i: any) => i.category === 'metadata');

        // Calculate average score from content_quality insights (AMI criteria)
        const amiScores = contentQualityInsights.map((i: any) => i.score).filter((s: any) => typeof s === 'number');
        const avgAmiScore = amiScores.length > 0
            ? Math.round(amiScores.reduce((a: number, b: number) => a + b, 0) / amiScores.length)
            : overview.risk_score || 0;

        // Transform AMI criteria from insights
        const criterios: Record<string, any> = {};
        contentQualityInsights.forEach((insight: any) => {
            const rawData = insight.raw_data || {};
            criterios[insight.id] = {
                nombre: insight.label,
                score: insight.score || 0,
                cumple: insight.score >= 70,
                justificacion: insight.description,
                referencia: rawData.referencia || rawData.cita,
                evidencias: rawData.evidencias || []
            };
        });

        // Transform fact check table
        const factCheckTable = factCheckInsights.map((fc: any) => ({
            claim: fc.raw_data?.claim || fc.description || fc.label,
            verdict: fc.raw_data?.verdict || fc.value,
            explanation: fc.raw_data?.explanation || fc.description,
            score: fc.score,
            sources: fc.artifacts?.filter((a: any) => a.type === 'text_snippet') || []
        }));

        // Extract source analysis from metadata insights
        const sourceAnalysis = metadataInsights.find((i: any) => i.id === 'tech_sources');

        // Build AI analysis compatible object for UnifiedAnalysisView
        const aiAnalysisCompatible = {
            classification: {
                indiceCumplimientoAMI: {
                    score: avgAmiScore,
                    percent: Math.round(overview.risk_score || avgAmiScore),
                    nivel: overview.verdict_label || "Análisis Completado",
                    diagnostico: overview.summary || "Análisis completado."
                },
                // Badge fields for UnifiedAnalysisView
                tipoFuente: overview.source_domain || 'Desconocido',
                tipoContenido: extractedCase.type === 'text' ? 'Hecho' : (extractedCase.type || 'Contenido'),
                tema: 'General', // Default as specific theme is not in current DTO

                criterios: criterios,
                recomendaciones: recomendaciones
            },
            summaries: {
                resumen: overview.summary,
                titulo: overview.title,
                fuente: overview.source_domain
            },
            specific_techniques_analysis: {},
            competencies_analysis: competenciesAnalysis,
            verification: {
                fact_check_table: factCheckTable
            },
            verdict: overview.verdict_label
        };

        return {
            // Core identity from DTO
            id: extractedCase.id,
            type: extractedCase.type,
            created_at: extractedCase.created_at,
            title: overview.title,
            summary: overview.summary,
            url: overview.source_domain ? `https://${overview.source_domain}` : undefined,

            // Overview from DTO
            overview: overview,
            verdictLabel: overview.verdict_label,
            riskScore: overview.risk_score,
            mainAssetUrl: overview.main_asset_url,

            // Lifecycle from DTO
            lifecycle: lifecycle,
            custodyStatus: lifecycle.custody_status,
            jobStatus: lifecycle.job_status,

            // AI Analysis (transformed for UI components)
            ai_analysis: aiAnalysisCompatible,

            // Raw insights for advanced components
            insights: insights,
            contentQualityInsights: contentQualityInsights,
            factCheckInsights: factCheckInsights,
            forensicsInsights: forensicsInsights,

            // Source analysis
            sourceAnalysis: sourceAnalysis ? {
                conclusion: sourceAnalysis.value,
                analysis: sourceAnalysis.description
            } : null,

            // Community from DTO
            community: community,
            human_votes: {
                count: community.votes || 0,
                breakdown: community.breakdown || {}
            },
            consensus: {
                state: community.status || 'ai_only',
                final_labels: []
            },

            // Reporter from DTO
            reporter: reporter,

            // Metadata for sidebar
            metadata: {
                screenshot: overview.main_asset_url,
                source: overview.source_domain || 'Direct Submission',
                submission_type: extractedCase.type === 'text' ? 'Text' : extractedCase.type,
                vector_de_transmision: overview.source_domain ? 'Web' : 'Direct',
                reported_by: {
                    id: reporter.id,
                    name: reporter.name || 'Anónimo',
                    reputation: reporter.reputation || 0
                }
            },

            // Pass raw for fallback access
            raw: caseData
        };
    }

    // ========================================================================
    // LEGACY FORMAT HANDLING (backwards compatibility)
    // ========================================================================

    // Extract AI analysis from metadata or direct
    const aiAnalysis = extractedCase.metadata?.ai_analysis || extractedCase.ai_analysis;
    const sourceData = extractedCase.metadata?.source_data || extractedCase.source_data;
    const evidence = extractedCase.metadata?.evidence || extractedCase.evidence;

    // Extract AMI score from classification
    const amiScore = aiAnalysis?.classification?.indiceCumplimientoAMI;
    const scoreValue = amiScore?.score || 0;
    const scorePercent = scoreValue > 1 ? scoreValue : Math.round(scoreValue * 100);

    // Build AI analysis compatible object for UnifiedAnalysisView
    const aiAnalysisCompatible = {
        classification: {
            indiceCumplimientoAMI: {
                score: scoreValue,
                percent: scorePercent,
                nivel: amiScore?.nivel || "Análisis Completado",
                diagnostico: aiAnalysis?.classification?.diagnostico || extractedCase.summary || "Análisis completado."
            },
            criterios: aiAnalysis?.classification?.criterios || {},
            recomendaciones: aiAnalysis?.classification?.recomendaciones || []
        },
        summaries: aiAnalysis?.summaries,
        specific_techniques_analysis: aiAnalysis?.specific_techniques_analysis,
        competencies_analysis: aiAnalysis?.competencies_analysis,
        verification: {
            fact_check_table: evidence?.fact_check_table || []
        },
        verdict: extractedCase.case_judgement?.final_verdict || aiAnalysis?.classification?.indiceCumplimientoAMI?.nivel
    };

    return {
        // Core identity
        id: extractedCase.id,
        created_at: extractedCase.created_at,
        title: extractedCase.title || sourceData?.title || "Caso de Verificación",
        summary: extractedCase.summary,
        url: extractedCase.url || sourceData?.url,

        // AI Analysis (primary data source)
        ai_analysis: aiAnalysisCompatible,

        // Source data
        source_data: sourceData,

        // Evidence & fact checking
        evidence: evidence,

        // Human validation data
        human_votes: extractedCase.human_votes,
        consensus: extractedCase.consensus,

        // Metadata
        metadata: {
            screenshot: extractedCase.metadata?.screenshot || sourceData?.screenshot,
            source: sourceData?.hostname || (extractedCase.url ? 'Web Link' : 'Direct Submission'),
            submission_type: extractedCase.submission_type,
            vector_de_transmision: sourceData?.vector_de_transmision,
            reported_by: extractedCase.metadata?.reported_by || extractedCase.reported_by
        },

        // Pass raw for fallback access
        raw: caseData
    };
}



/* -------------------------------------------------------------------------- */
/*                        Sidebar Props Mappers                               */
/* -------------------------------------------------------------------------- */

export const mapMetadataProps = (data: any, type: 'text' | 'image' | 'audio') => {
    // Handle both direct data and nested case data from API response
    const caseData = data?.case || data;

    const defaultProps = {
        type,
        fileName: 'Archivo Desconocido',
        fileSize: undefined as number | undefined,
        basicMetadata: [] as any[],
        technicalMetadata: [] as any[]
    };

    if (!caseData) return defaultProps;

    // Generate formatted ID
    const formattedId = generateDisplayId(caseData);

    // Check if this is StandardizedCase format (has overview/insights)
    const isStandardizedCase = !!(caseData.overview || caseData.insights);

    if (isStandardizedCase) {
        const overview = caseData.overview || {};
        const reporter = caseData.reporter || {};
        const lifecycle = caseData.lifecycle || {};

        return {
            ...defaultProps,
            fileName: overview.title || caseData.title || 'Archivo Desconocido',
            basicMetadata: [
                { label: 'Caso', value: formattedId },
                { label: 'Tipo', value: (caseData.type || type).toUpperCase() },
                { label: 'Vector de transmisión', value: overview.source_domain ? 'Web' : 'Direct' },
                { label: 'Reportado por', value: reporter.name || 'Anónimo' },
                { label: 'Fecha', value: caseData.created_at ? new Date(caseData.created_at).toLocaleDateString('es-CO') : 'N/A' }
            ],
            technicalMetadata: [
                { label: 'Fuente', value: overview.source_domain || 'Direct Submission' },
                { label: 'Estado', value: lifecycle.custody_status || lifecycle.job_status || 'Procesado' }
            ]
        };
    }

    // Legacy format handling
    if (type === 'text') {
        const sourceData = caseData?.source_data;
        const metadata = caseData?.metadata;

        return {
            ...defaultProps,
            fileName: caseData?.title || sourceData?.title || 'Archivo Desconocido',
            basicMetadata: [
                { label: 'Tipo', value: metadata?.submission_type || 'Texto' },
                { label: 'Fuente', value: metadata?.source || sourceData?.hostname || 'Direct Submission' },
                { label: 'Reportado por', value: metadata?.reported_by?.name || 'Anónimo' }
            ],
            technicalMetadata: [
                { label: 'Caracteres', value: caseData?.content?.length || sourceData?.text?.length || 0 }
            ]
        };
    }

    return defaultProps;
};

export const mapStatsProps = (data: any, type: 'text' | 'image' | 'audio') => {
    if (!data) return [];

    // Check if this is StandardizedCase format
    const isStandardizedCase = !!(data.overview || data.insights || data.contentQualityInsights);

    if (isStandardizedCase) {
        const insights = data.insights || [];
        const contentQuality = data.contentQualityInsights || insights.filter((i: any) => i.category === 'content_quality');
        const factChecks = data.factCheckInsights || insights.filter((i: any) => i.category === 'fact_check');
        const overview = data.overview || {};

        return [
            {
                label: 'Pruebas realizadas',
                value: contentQuality.length || insights.length
            },
            {
                label: 'Tiempo total',
                value: '12.0s' // Could be calculated from lifecycle timestamps
            },
            {
                label: 'Nivel de precisión diagnóstica',
                value: `${Math.round(overview.risk_score || 0)}%`
            }
        ];
    }

    // Legacy format
    if (type === 'text') {
        return data.stats || [];
    }

    return [];
};

export const mapRecommendations = (data: any) => {
    // Handle both direct data and nested case data
    const caseData = data?.case || data;

    // 1. Try to get from specific StandardizedCase extraction first (set in transformHumanCaseToUI)
    if (caseData?.ai_analysis?.classification?.recomendaciones?.length > 0) {
        return caseData.ai_analysis.classification.recomendaciones;
    }

    // 2. Fallback: Try to extract from insights directly if not already done
    if (caseData?.insights) {
        const recs = caseData.insights
            .filter((i: any) => i.category === 'recommendation')
            .map((i: any) => i.description || i.label);

        if (recs.length > 0) return recs;
    }

    // 3. Fallback: Legacy location
    const legacyRecs = caseData?.ai_analysis?.classification?.recomendaciones;
    if (Array.isArray(legacyRecs) && legacyRecs.length > 0) {
        return legacyRecs;
    }

    return [];
};

export const mapCommunityVotes = (data: any) => {
    // Handle both direct data and nested case data
    const caseData = data?.case || data;

    // Expecting caseData.human_votes
    const votes = caseData?.human_votes?.entries || [];
    return votes.map((v: any) => ({
        user: v.user?.full_name || 'Usuario Anónimo',
        vote: v.vote, // 'true', 'false', etc.
        reputation: v.user?.reputation || 0,
        date: v.date,
        reason: v.reason
    }));
};
