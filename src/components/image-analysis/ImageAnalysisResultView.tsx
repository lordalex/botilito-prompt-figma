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

interface ImageAnalysisResultViewProps {
    data: AnalysisResult;
    onReset: () => void;
}

export function ImageAnalysisResultView({ data, onReset }: ImageAnalysisResultViewProps) {
    if (!data) return null;

    // Flatten logic for tests
    const allAlgorithms = data.details ? data.details.flatMap(d => d.algorithms || []) : [];

    // Safely get counts
    const testsCount = data.stats?.tests_executed ?? allAlgorithms.length;
    const markersCount = data.stats?.markers_found ?? data.markers?.length ?? 0;

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Resultados del Análisis</h1>
                <Button variant="outline" onClick={onReset}>Nuevo Análisis</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (Left/Center) spanning 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <AnalysisSummary summary={data.summary} />

                    <Tabs defaultValue="tests" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                            <TabsTrigger value="tests" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Pruebas ({testsCount})
                            </TabsTrigger>
                            <TabsTrigger value="markers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Marcadores ({markersCount})
                            </TabsTrigger>
                            <TabsTrigger value="visualizations" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Visualizaciones
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tests" className="mt-6">
                            <TestResults tests={allAlgorithms} />
                        </TabsContent>

                        <TabsContent value="markers" className="mt-6">
                            <MarkersList markers={data.markers || []} />
                        </TabsContent>

                        <TabsContent value="visualizations" className="mt-6">
                            <VisualizationsTab data={data} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Column (Right) */}
                <div className="space-y-6">
                    {data.file_info && <FileInfo info={data.file_info} />}
                    {data.stats && <AnalysisStats stats={data.stats} />}
                    {data.recommendations && <Recommendations recommendations={data.recommendations} />}
                </div>
            </div>
        </div>
    );
}
