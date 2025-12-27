import React from 'react';
import { AnalysisResult } from '@/types/imageAnalysis';
import { AnalysisSummary } from './AnalysisSummary';
import { FileInfo } from './FileInfo';
import { TestResults } from './TestResults';
import { MarkersList } from './MarkersList';
import { Recommendations } from './Recommendations';
import { AnalysisStats } from './AnalysisStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisualizationsTab } from './VisualizationsTab';
import { Download, RefreshCw } from 'lucide-react';
import { generateImageAnalysisPDF } from '@/utils/pdfReportGenerator';

interface ImageAnalysisResultViewProps {
    data: AnalysisResult;
    onReset: () => void;
}

export function ImageAnalysisResultView({ data, onReset }: ImageAnalysisResultViewProps) {
    // The data is now pre-processed by the service layer to a consistent format.
    if (!data || !data.human_report) {
        // You might want a loading indicator or a more graceful empty state here
        return (
            <div className="max-w-7xl mx-auto p-4 space-y-6 text-center">
                <p className="text-muted-foreground">Cargando resultados del análisis...</p>
            </div>
        );
    }

    const { human_report, raw_forensics, file_info } = data;
    const { level_1_analysis, level_2_integration, level_3_verdict } = human_report;

    // Derived counts
    const testsCount = level_1_analysis?.length || 0;
    // Markers are significant findings
    const markersCount = (level_1_analysis?.filter(i => i.significance_score > 0.4).length || 0) + (level_2_integration?.tampering_type !== 'Inexistente' ? 1 : 0);

    // Recommendations - fake them if not present, or maybe derive them from verdict
    const derivedRecommendations = data.recommendations || (level_3_verdict.final_label !== 'Auténtico'
        ? ['Verificar cadena de custodia física', 'Revisar metadatos exif avanzados', 'Comparar con la fuente original']
        : ['La imagen parece confiable']);

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Resultados del Análisis Multi-Nivel</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => generateImageAnalysisPDF(data, data.meta?.job_id, file_info?.name)}
                        className="bg-white hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                    </Button>
                    <Button variant="outline" onClick={onReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Nuevo Análisis
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (Left/Center) spanning 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <AnalysisSummary verdict={level_3_verdict} />

                    <Tabs defaultValue="tests" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6 flex-wrap">
                            <TabsTrigger value="tests" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Pruebas Nivel 1 ({testsCount})
                            </TabsTrigger>
                            <TabsTrigger value="markers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Marcadores ({markersCount})
                            </TabsTrigger>
                            <TabsTrigger value="exif" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Metadatos EXIF
                            </TabsTrigger>
                            <TabsTrigger value="visualizations" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Visualizaciones
                            </TabsTrigger>
                            <TabsTrigger value="custody" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Cadena de Custodia
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tests" className="mt-6">
                            <TestResults tests={level_1_analysis} />
                        </TabsContent>

                        <TabsContent value="markers" className="mt-6">
                            <MarkersList level1={level_1_analysis} level2={level_2_integration} />
                        </TabsContent>

                        <TabsContent value="exif" className="mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Metadatos EXIF Extraídos</h3>
                                <div className="border rounded-lg bg-white p-6 shadow-sm">
                                    {file_info?.exif_data && Object.keys(file_info.exif_data).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(file_info.exif_data).map(([key, value]) => (
                                                <div key={key} className="flex flex-col border-b last:border-0 border-gray-100 pb-2 last:pb-0">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{key}</span>
                                                    <span className="text-sm font-mono text-slate-700 break-all">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No se encontraron datos EXIF en la imagen.</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="visualizations" className="mt-6">
                            <VisualizationsTab data={data} />
                        </TabsContent>

                        <TabsContent value="custody" className="mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Cadena de Custodia Digital</h3>
                                <div className="border rounded-lg bg-white p-6 shadow-sm">
                                    <div className="space-y-6">
                                        {data.chain_of_custody?.map((event, idx) => (
                                            <div key={idx} className="flex gap-4 relative">
                                                {/* Timeline Line */}
                                                {idx !== (data.chain_of_custody?.length || 0) - 1 && (
                                                    <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-200" />
                                                )}

                                                <div className="mt-1 h-10 w-10 flex-none rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-400 z-10">
                                                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-gray-900">{event.action}</h4>
                                                        <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                                                    {event.hash && (
                                                        <div className="mt-2 text-xs font-mono text-muted-foreground bg-gray-50 p-2 rounded break-all">
                                                            Hash: {event.hash}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(!data.chain_of_custody || data.chain_of_custody.length === 0) && (
                                            <p className="text-muted-foreground italic">No hay información de custodia disponible.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Column (Right) */}
                <div className="space-y-6">
                    {file_info && <FileInfo info={file_info} />}

                    <AnalysisStats
                        testsExecuted={testsCount}
                        markersFound={markersCount}
                    />

                    {derivedRecommendations && <Recommendations recommendations={derivedRecommendations} />}
                </div>
            </div >
        </div >
    );
}
