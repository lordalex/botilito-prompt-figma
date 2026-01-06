import React from 'react';
import { AnalysisResult } from '@/types/imageAnalysis';
import { AnalysisSummary } from './image-analysis/AnalysisSummary';
import { TestResults } from './image-analysis/TestResults';
import { MarkersList } from './image-analysis/MarkersList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisualizationsTab } from './image-analysis/VisualizationsTab';


import { useImageAnalysisLogic } from '@/hooks/useImageAnalysisLogic';


interface ImageAIAnalysisProps {
    data: AnalysisResult;
}

export function ImageAIAnalysis({ data }: ImageAIAnalysisProps) {
    const {
        testsCount,
        markersCount,
        humanReport
    } = useImageAnalysisLogic(data);

    if (!data || !humanReport) return null;

    const { level_1_analysis, level_2_integration, level_3_verdict } = humanReport;


    return (
        <div className="space-y-8">
            <AnalysisSummary verdict={level_3_verdict} />

            <Tabs defaultValue="tests" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 mb-8 overflow-x-auto scroller-hidden">
                    <TabsTrigger
                        value="tests"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-4 h-auto text-sm font-bold uppercase tracking-widest outline-none transition-all text-slate-400 data-[state=active]:text-primary"
                    >
                        Pruebas ({testsCount})
                    </TabsTrigger>
                    <TabsTrigger
                        value="markers"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-4 h-auto text-sm font-bold uppercase tracking-widest outline-none transition-all text-slate-400 data-[state=active]:text-primary"
                    >
                        Marcadores ({markersCount})
                    </TabsTrigger>
                    <TabsTrigger
                        value="visualizations"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-4 h-auto text-sm font-bold uppercase tracking-widest outline-none transition-all text-slate-400 data-[state=active]:text-primary"
                    >
                        Visualizaciones
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tests" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <TestResults tests={level_1_analysis} />
                </TabsContent>

                <TabsContent value="markers" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <MarkersList level1={level_1_analysis} level2={level_2_integration} />
                </TabsContent>

                <TabsContent value="visualizations" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <VisualizationsTab data={data} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

