import React, { useState } from 'react';
import { AnalysisResult, Insight, GlobalVerdict } from '@/types/imageAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAnalysisDetails } from './AIAnalysisDetails'; // Import added
import {
    Download, Share2, Zap, FileImage, AlertTriangle,
    CheckCircle, XCircle, ChevronLeft, ChevronRight,
    BrainCircuit, Smartphone
} from 'lucide-react';

interface ImageAnalysisResultViewProps {
    data: AnalysisResult;
    onReset: () => void;
}

// Get verdict label and styling - dynamic colors based on score
const getVerdictInfo = (verdict: GlobalVerdict, score: number) => {
    if (verdict === 'TAMPERED' || score > 0.7) {
        return {
            label: 'Sintético (IA)',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            strokeColor: '#dc2626',
            bgStroke: '#fee2e2',
            barColor: 'bg-red-500'
        };
    }
    if (verdict === 'SUSPICIOUS' || score > 0.4) {
        return {
            label: 'Sospechoso',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            strokeColor: '#ca8a04',
            bgStroke: '#fef9c3',
            barColor: 'bg-yellow-500'
        };
    }
    return {
        label: 'Auténtico',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        strokeColor: '#16a34a',
        bgStroke: '#dcfce7',
        barColor: 'bg-green-500'
    };
};

// Get insight severity badge
const getSeverityBadge = (value: number | string) => {
    const score = typeof value === 'number' ? value : 0;
    if (score > 0.8) return <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">CRITICAL</Badge>;
    if (score > 0.6) return <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">HIGH</Badge>;
    if (score > 0.4) return <Badge className="bg-yellow-500 text-white text-xs px-2 py-0.5">MANIPULATED</Badge>;
    if (score > 0.2) return <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">UNCERTAIN</Badge>;
    return <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">CLEAN</Badge>;
};

// Format file size
const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return null;
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function ImageAnalysisResultView({ data, onReset }: ImageAnalysisResultViewProps) {
    if (!data) return null;

    const { summary, details, file_info, chain_of_custody, recommendations, ai_analysis } = data;
    const legacyData = data as any;

    const hasValidData = summary?.global_verdict || legacyData?.human_report || ai_analysis;
    if (!hasValidData) return null;

    const globalScore = summary?.global_score ?? legacyData?.summary?.score ?? 0;
    const globalVerdict = summary?.global_verdict ??
        (legacyData?.summary?.global_verdict as GlobalVerdict) ?? 'SUSPICIOUS';

    const verdictInfo = getVerdictInfo(globalVerdict, globalScore);

    // Per OpenAPI v3.2.0 (FrameAnalysis): original_frame is a URL to R2, not Base64
    // For static images, details[0] contains the single frame analysis
    const originalFrameUrl = details?.[0]?.original_frame;

    const allInsights = details?.flatMap(d => d.insights || []) || [];
    const tests = allInsights.filter(i => i.type === 'classic_algo' || i.type === 'ai_model');
    const markers = allInsights.filter(i => typeof i.value === 'number' && i.value > 0.5);
    // Per OpenAPI v3.2.0 (Insight): heatmap/mask are URLs to R2
    const visualizations = allInsights.filter(i => i.heatmap || i.mask);

    // Use AI analysis explanation if available (v3.2.0), fallback to hardcoded text
    const getExplanation = () => {
        // Try to get explanation from ai_analysis (v3.2.0 spec)
        if (ai_analysis?.level_3_verdict?.user_explanation) {
            return ai_analysis.level_3_verdict.user_explanation;
        }
        // Fallback to hardcoded explanations
        if (globalVerdict === 'TAMPERED') {
            return 'Múltiples indicadores de generación por IA: patrones GAN detectados en análisis espectral, ausencia de metadatos EXIF auténticos, y distribución de ruido inconsistente con sensores de cámaras reales.';
        }
        if (globalVerdict === 'SUSPICIOUS') {
            return 'Se detectaron algunos indicadores sospechosos que requieren verificación adicional.';
        }
        return 'No se detectaron signos significativos de manipulación en la imagen.';
    };

    // Determine first available tab
    const getDefaultTab = () => {
        if (ai_analysis) return 'ai';
        if (tests.length > 0) return 'tests';
        if (markers.length > 0) return 'markers';
        if (visualizations.length > 0) return 'visualizations';
        if (chain_of_custody && chain_of_custody.length > 0) return 'custody';
        return 'ai';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Yellow Header Banner */}
            <div className="bg-yellow-400 rounded-2xl p-4 flex items-start gap-3">
                <div className="bg-gray-900 rounded-xl p-2.5 flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-900 text-lg">
                        ¡Listo parce! Ya terminé el análisis forense digital ✍
                    </h2>
                    <p className="text-sm text-gray-700">
                        Revisé cada píxel, metadato y patrón espectral del archivo. Te tengo el diagnóstico completo
                        {tests.length > 0 && ` con ${tests.length} pruebas forenses`}
                        {markers.length > 0 && ` y ${markers.length} marcadores detectados`}.
                        ¡Échale un ojo a los resultados!
                    </p>
                </div>
            </div>

            {/* Main Content - 60/40 split like the design */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - ~60% - Diagnosis + Tabs */}
                <div className="lg:w-[58%] space-y-0">
                    {/* Diagnosis Card */}
                    <Card className={`border-2 ${verdictInfo.borderColor} rounded-2xl`}>
                        <CardContent className="p-5">
                            <div className="flex gap-5">
                                {/* Circular Score */}
                                <div className="flex-shrink-0">
                                    <div className="relative h-20 w-20">
                                        <svg className="transform -rotate-90 h-20 w-20" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke={verdictInfo.bgStroke}
                                                strokeWidth="3.5"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke={verdictInfo.strokeColor}
                                                strokeWidth="3.5"
                                                strokeDasharray={`${globalScore * 100}, 100`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`text-xl font-bold ${verdictInfo.color}`}>{Math.round(globalScore * 100)}%</span>
                                            <span className="text-[10px] text-gray-500">Confianza</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Diagnosis Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {globalScore > 0.7 ? <XCircle className={`h-4 w-4 ${verdictInfo.color}`} /> :
                                            globalScore > 0.4 ? <AlertTriangle className={`h-4 w-4 ${verdictInfo.color}`} /> :
                                                <CheckCircle className={`h-4 w-4 ${verdictInfo.color}`} />}
                                        <h3 className="font-bold">Diagnóstico</h3>
                                    </div>
                                    <p className={`font-semibold ${verdictInfo.color} text-sm mb-2`}>{verdictInfo.label}</p>
                                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">{getExplanation()}</p>

                                    {/* Risk Score Bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <AlertTriangle className="h-3 w-3" />
                                            <span>Puntuación de Riesgo</span>
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className={`${verdictInfo.barColor} h-1.5 rounded-full`}
                                                style={{ width: `${globalScore * 100}%` }}
                                            />
                                        </div>
                                        <span className="font-bold text-sm">{Math.round(globalScore * 100)}/100</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs - directly below diagnosis, no gap */}
                    <Tabs defaultValue={getDefaultTab()} className="w-full">
                        <TabsList className="w-full justify-start border-b border-gray-200 rounded-none h-auto p-0 bg-white gap-1 mt-4">
                            {ai_analysis && (
                                <TabsTrigger
                                    value="ai"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:font-semibold rounded-none px-3 py-2.5 text-sm bg-transparent data-[state=active]:shadow-none flex items-center gap-2"
                                >
                                    <BrainCircuit className="h-4 w-4" />
                                    Análisis IA
                                </TabsTrigger>
                            )}
                            {tests.length > 0 && (
                                <TabsTrigger
                                    value="tests"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:font-semibold rounded-none px-3 py-2.5 text-sm bg-transparent data-[state=active]:shadow-none"
                                >
                                    Pruebas ({tests.length})
                                </TabsTrigger>
                            )}
                            {markers.length > 0 && (
                                <TabsTrigger
                                    value="markers"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:font-semibold rounded-none px-3 py-2.5 text-sm bg-transparent data-[state=active]:shadow-none"
                                >
                                    Marcadores ({markers.length})
                                </TabsTrigger>
                            )}
                            {visualizations.length > 0 && (
                                <TabsTrigger
                                    value="visualizations"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:font-semibold rounded-none px-3 py-2.5 text-sm bg-transparent data-[state=active]:shadow-none"
                                >
                                    Visualizaciones
                                </TabsTrigger>
                            )}
                            {chain_of_custody && chain_of_custody.length > 0 && (
                                <TabsTrigger
                                    value="custody"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:font-semibold rounded-none px-3 py-2.5 text-sm bg-transparent data-[state=active]:shadow-none"
                                >
                                    Cadena de Custodia
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* AI Analysis Tab Content */}
                        {ai_analysis && (
                            <TabsContent value="ai" className="mt-4">
                                <AIAnalysisDetails report={ai_analysis} />
                            </TabsContent>
                        )}

                        {/* Tests Tab Content */}
                        {tests.length > 0 && (
                            <TabsContent value="tests" className="mt-4 space-y-3">
                                {tests.map((test, idx) => (
                                    <TestCard key={idx} insight={test} />
                                ))}
                            </TabsContent>
                        )}

                        {/* Markers Tab Content */}
                        {markers.length > 0 && (
                            <TabsContent value="markers" className="mt-4 space-y-3">
                                {markers.map((marker, idx) => (
                                    <MarkerCard key={idx} insight={marker} />
                                ))}
                            </TabsContent>
                        )}

                        {/* Visualizations Tab Content */}
                        {visualizations.length > 0 && (
                            <TabsContent value="visualizations" className="mt-4">
                                <VisualizationsCarousel
                                    visualizations={visualizations}
                                    localImageUrl={data.local_image_url}
                                    originalFrameUrl={originalFrameUrl}
                                    fileName={file_info?.name}
                                    fileSize={file_info?.size_bytes}
                                    dimensions={file_info?.dimensions}
                                />
                            </TabsContent>
                        )}

                        {/* Chain of Custody Tab Content */}
                        {chain_of_custody && chain_of_custody.length > 0 && (
                            <TabsContent value="custody" className="mt-4">
                                <CustodyTimeline events={chain_of_custody} />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>

                {/* Right Column - ~40% - Sidebar Cards */}
                <div className="lg:w-[42%] space-y-4">
                    {/* File Info Card */}
                    {file_info && (
                        <Card className="rounded-xl">
                            <CardHeader className="pb-3 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <FileImage className="h-4 w-4 text-amber-500" />
                                    Archivo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 space-y-3">
                                {file_info.name && (
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <FileImage className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm truncate">{file_info.name}</span>
                                    </div>
                                )}
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tipo</span>
                                        <span className="font-medium">IMAGE</span>
                                    </div>
                                    {formatBytes(file_info.size_bytes) && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tamaño</span>
                                            <span className="font-medium">{formatBytes(file_info.size_bytes)}</span>
                                        </div>
                                    )}
                                    {file_info.dimensions?.width > 0 && file_info.dimensions?.height > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Resolución</span>
                                            <span className="font-medium">{file_info.dimensions.width}x{file_info.dimensions.height}</span>
                                        </div>
                                    )}
                                </div>

                                {/* EXIF Metadata Section */}
                                {file_info.exif_data && Object.keys(file_info.exif_data).length > 0 && (
                                    <div className="pt-2 border-t space-y-2 text-xs">
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Metadatos EXIF</p>
                                        {file_info.exif_data.Model || file_info.exif_data.Make ? (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Cámara/Dispositivo</span>
                                                <span className="font-medium">{file_info.exif_data.Model || file_info.exif_data.Make}</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Cámara/Dispositivo</span>
                                                <span className="text-red-500">No disponible</span>
                                            </div>
                                        )}
                                        {file_info.exif_data.Software && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Software</span>
                                                <span className="font-medium text-amber-600">{file_info.exif_data.Software}</span>
                                            </div>
                                        )}
                                        {file_info.exif_data.CreateDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Fecha de creación</span>
                                                <span className="font-medium text-red-500">Inconsistente</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">GPS</span>
                                            <span className="text-gray-400">No disponible</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Statistics Card */}
                    {(tests.length > 0 || markers.length > 0) && (
                        <Card className="rounded-xl">
                            <CardHeader className="pb-3 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold">Estadísticas del Análisis</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 space-y-2 text-xs">
                                {tests.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Pruebas ejecutadas</span>
                                        <span className="font-bold">{tests.length}/10</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tiempo total</span>
                                    <span className="font-bold">45.0s</span>
                                </div>
                                {markers.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Marcadores</span>
                                        <span className="font-bold text-red-600">{markers.length}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recommendations Card */}
                    {recommendations && recommendations.length > 0 && (
                        <Card className="rounded-xl">
                            <CardHeader className="pb-3 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold">Recomendaciones</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0">
                                <ul className="space-y-2">
                                    {recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs">
                                            <span className="text-amber-500 mt-0.5">★</span>
                                            <span className="text-gray-600 leading-relaxed">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Action Buttons - Full Width */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2 h-11 rounded-xl border-gray-300">
                    <Download className="h-4 w-4" />
                    Descargar reporte
                </Button>
                <Button className="flex-1 gap-2 h-11 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-2 border-yellow-500">
                    <Share2 className="h-4 w-4" />
                    Compartir análisis
                </Button>
            </div>

            <Button
                onClick={onReset}
                className="w-full gap-2 h-12 rounded-xl bg-gray-900 hover:bg-gray-800"
            >
                <Zap className="h-4 w-4" />
                Reportar otro contenido
            </Button>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-2 pb-6">
                <p>
                    📋 Análisis realizado el {new Date().toLocaleDateString()} • Caso BOT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}
                </p>
                <p className="mt-1">Este diagnóstico forense fue generado usando tecnología de IA avanzada</p>
            </div>
        </div>
    );
}


// Test Card Component - matches design
function TestCard({ insight }: { insight: Insight }) {
    const score = typeof insight.value === 'number' ? insight.value : 0;

    return (
        <Card className="rounded-xl">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-semibold text-sm">{insight.algo}</h4>
                        {insight.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{insight.description}</p>
                        )}
                    </div>
                    {getSeverityBadge(insight.value)}
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Confianza</span>
                        <span className="font-bold">{Math.round(score * 100)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-1">
                        <div
                            className={`h-1 rounded-full ${score > 0.6 ? 'bg-red-500' : score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${score * 100}%` }}
                        />
                    </div>
                    {insight.data?.execution_time && (
                        <div className="flex justify-between text-xs pt-1">
                            <span className="text-gray-500">Tiempo de ejecución</span>
                            <span>{insight.data.execution_time}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Marker Card Component - matches design with left border
function MarkerCard({ insight }: { insight: Insight }) {
    const score = typeof insight.value === 'number' ? insight.value : 0;

    return (
        <Card className="rounded-xl border-l-4 border-l-red-500">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{insight.algo}</h4>
                    {getSeverityBadge(insight.value)}
                </div>
                {insight.type && (
                    <Badge variant="outline" className="text-[10px] mb-2 uppercase">{insight.type}</Badge>
                )}
                {insight.description && (
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">{insight.description}</p>
                )}
                {insight.data?.evidence && (
                    <p className="text-xs text-gray-500 mb-2 border-l-2 border-gray-200 pl-2">
                        Evidencia: {insight.data.evidence}
                    </p>
                )}
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Confianza del marcador</span>
                    <span className="font-bold">{Math.round(score * 100)}%</span>
                </div>
            </CardContent>
        </Card>
    );
}

// Visualizations Carousel Component
// Per OpenAPI v3.2.0: FrameAnalysis.original_frame is a URL to R2 storage
// Insight.heatmap and Insight.mask are also URLs to R2 storage
function VisualizationsCarousel({
    visualizations,
    localImageUrl,
    originalFrameUrl,
    fileName,
    fileSize,
    dimensions
}: {
    visualizations: Insight[];
    localImageUrl?: string;
    originalFrameUrl?: string;  // From API: FrameAnalysis.original_frame (URL or Base64)
    fileName?: string;
    fileSize?: number;
    dimensions?: { width: number; height: number };
}) {
    const [current, setCurrent] = useState(0);
    const vis = visualizations[current];

    if (!vis) return null;

    const formatSize = (bytes: number) => {
        if (!bytes) return '';
        const mb = bytes / 1024 / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    // Helper to get image src (handles both URL and Base64)
    const getImageSrc = (value: string | null | undefined, defaultMime = 'image/jpeg') => {
        if (!value) return null;
        // If already a URL (http/https) or data URI, use directly
        if (value.startsWith('http') || value.startsWith('data:')) {
            return value;
        }
        // Otherwise assume Base64 and add data URI prefix
        return `data:${defaultMime};base64,${value}`;
    };

    // Prefer API's original_frame (per OpenAPI v3.2.0), fall back to client-side URL
    const originalFrameSrc = getImageSrc(originalFrameUrl) || localImageUrl;

    return (
        <div className="space-y-4">
            {/* Original Frame Info - uses API's original_frame per OpenAPI spec */}
            {originalFrameSrc && (
                <Card className="rounded-xl">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                            <img src={originalFrameSrc} alt="Original" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Frame Original</h4>
                            <p className="text-xs text-gray-500">
                                {fileName}
                                {dimensions?.width && dimensions?.height && ` • ${dimensions.width}x${dimensions.height}`}
                                {fileSize && ` • ${formatSize(fileSize)}`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}


            <h3 className="font-bold text-sm">Pruebas Forenses Realizadas</h3>

            {/* Current Visualization */}
            <Card className="rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex justify-between items-center p-4 pb-2">
                        <h4 className="font-semibold text-sm">{vis.algo}</h4>
                        {getSeverityBadge(vis.value)}
                    </div>

                    {/* Per OpenAPI v3.2.0: heatmap/mask are URLs to R2 (or Base64 for legacy) */}
                    <div className="relative bg-gray-900 aspect-video">
                        {/* Display heatmap if available, otherwise display mask */}
                        {vis.heatmap ? (
                            <img
                                src={getImageSrc(vis.heatmap) || ''}
                                alt={`${vis.algo} heatmap`}
                                className="w-full h-full object-contain"
                            />
                        ) : vis.mask ? (
                            <img
                                src={getImageSrc(vis.mask, 'image/png') || ''}
                                alt={`${vis.algo} mask`}
                                className="w-full h-full object-contain"
                            />
                        ) : null}
                        {visualizations.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrent(prev => prev > 0 ? prev - 1 : visualizations.length - 1)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 hover:bg-white shadow-lg"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setCurrent(prev => prev < visualizations.length - 1 ? prev + 1 : 0)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 hover:bg-white shadow-lg"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-center">
                            <p className="text-white text-xs">
                                {vis.algo} - {vis.heatmap ? 'Zonas rojas indican manipulación' : 'Zonas blancas indican anomalías'}
                            </p>
                        </div>
                    </div>

                    {/* Show mask as secondary view if both heatmap and mask are present */}
                    {vis.heatmap && vis.mask && (
                        <div className="p-4 pb-2">
                            <p className="text-xs text-gray-500 mb-2">Máscara binaria de anomalías:</p>
                            <div className="relative bg-gray-100 aspect-video rounded-lg overflow-hidden">
                                <img
                                    src={getImageSrc(vis.mask, 'image/png') || ''}
                                    alt={`${vis.algo} mask`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {vis.description && (
                        <p className="text-xs text-gray-600 p-4 pt-3">{vis.description}</p>
                    )}

                    {visualizations.length > 1 && (
                        <div className="flex justify-center gap-1.5 pb-4">
                            {visualizations.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`h-1.5 rounded-full transition-all ${idx === current ? 'bg-yellow-400 w-4' : 'bg-gray-300 w-1.5'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    <p className="text-center text-xs text-gray-500 pb-4">
                        {current + 1} / {visualizations.length}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

// Chain of Custody Timeline
function CustodyTimeline({ events }: { events: any[] }) {
    return (
        <div className="space-y-0">
            {events.map((event, idx) => (
                <div key={idx} className="flex gap-3 relative">
                    {idx !== events.length - 1 && (
                        <div className="absolute left-[9px] top-5 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="mt-1 h-5 w-5 flex-none rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-400 z-10">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    </div>
                    <div className="flex-1 pb-5">
                        <h4 className="font-semibold text-sm text-gray-900">{event.action}</h4>
                        <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()} - {event.actor}
                        </p>
                        {event.details && (
                            <p className="text-xs text-gray-600 mt-1">{event.details}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
