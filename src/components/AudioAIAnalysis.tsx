import React from 'react';
import { AudioAnalysisResult } from '@/types/audioAnalysis';
import { AudioAnalysisSummary } from './audio-analysis/AudioAnalysisSummary';
import { AudioTestResults } from './audio-analysis/AudioTestResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio } from 'lucide-react';


import { useAudioAnalysisLogic } from '@/hooks/useAudioAnalysisLogic';


interface AudioAIAnalysisProps {
    data: AudioAnalysisResult;
}

export function AudioAIAnalysis({ data }: AudioAIAnalysisProps) {
    const {
        humanReport,
        verdict,
        testsExecuted,
        localAudioUrl
    } = useAudioAnalysisLogic(data);

    if (!data || !humanReport) return null;

    const { transcription, audio_forensics } = humanReport;


    return (
        <div className="space-y-8">
            <AudioAnalysisSummary
                verdict={verdict}
                authenticityScore={audio_forensics?.authenticity_score}
                manipulationDetected={audio_forensics?.manipulation_detected}
            />

            <Tabs defaultValue="tests" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 mb-8 overflow-x-auto scroller-hidden">
                    <TabsTrigger
                        value="tests"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-4 h-auto text-sm font-bold uppercase tracking-widest outline-none transition-all text-slate-400 data-[state=active]:text-primary"
                    >
                        Pruebas ({testsExecuted})
                    </TabsTrigger>
                    <TabsTrigger
                        value="transcription"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-4 h-auto text-sm font-bold uppercase tracking-widest outline-none transition-all text-slate-400 data-[state=active]:text-primary"
                    >
                        Transcripción
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tests" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <AudioTestResults humanReport={humanReport} />
                </TabsContent>

                <TabsContent value="transcription" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-6">
                            {transcription && transcription.text ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 italic">
                                            "{transcription.text}"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-8">No hay transcripción disponible.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>

    );
}

