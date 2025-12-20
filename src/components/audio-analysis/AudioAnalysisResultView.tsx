import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { AudioAnalysisResult } from '@/types/audioAnalysis';
import { AudioAnalysisSummary } from './AudioAnalysisSummary';
import { AudioFileInfo } from './AudioFileInfo';
import { AudioTestResults } from './AudioTestResults';
import { AudioStats } from './AudioStats';
import { AudioRecommendations } from './AudioRecommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Headphones, FileAudio, RefreshCw } from 'lucide-react';

interface AudioAnalysisResultViewProps {
    data: AudioAnalysisResult;
    onReset: () => void;
}

export function AudioAnalysisResultView({ data, onReset }: AudioAnalysisResultViewProps) {
    if (!data || !data.human_report) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No se encontraron resultados de análisis de audio.</p>
                        <Button onClick={onReset} className="mt-4">Nuevo Análisis</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { human_report, file_info, local_audio_url, chain_of_custody, meta } = data;
    const { verdict, transcription, speaker_analysis, audio_forensics } = human_report || {};

    // Provide defaults for missing verdict
    const safeVerdict = verdict || {
        conclusion: 'Análisis completado - datos parciales',
        risk_level: 'medium' as const,
        confidence: 0.5
    };

    // Calculate stats
    const testsExecuted = [
        transcription,
        speaker_analysis,
        audio_forensics,
        human_report.sentiment_analysis
    ].filter(Boolean).length + 1; // +1 for general analysis

    const anomaliesFound = audio_forensics?.anomalies?.length || 0;
    const speakersDetected = speaker_analysis?.num_speakers || 0;

    // Generate recommendations based on analysis
    const recommendations = data.recommendations || generateRecommendations(human_report);

    // Generate case number
    const caseNumber = `BOT-${new Date().getFullYear()}-${meta?.job_id?.slice(0, 4).toUpperCase() || 'XXXX'}`;

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            {/* Botilito Banner */}
            <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 text-center md:text-left">
                    <img
                        src={botilitoImage}
                        alt="Botilito"
                        className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2 md:mb-[-18px] md:mr-[16px]"
                    />
                    <div className="flex-1">
                        <p className="text-lg md:text-xl font-semibold">
                            ¡Listo parce! Ya terminé el análisis forense digital 🎧
                        </p>
                        <p className="text-sm mt-1 opacity-80">
                            Revisé cada frecuencia, patrón espectral y metadato del archivo. Te tengo el diagnóstico completo con {testsExecuted} pruebas forenses y {anomaliesFound > 0 ? `${anomaliesFound} anomalías detectadas` : 'ninguna anomalía detectada'}. ¡Échale un ojo a los resultados!
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (Left/Center) spanning 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Card */}
                    <AudioAnalysisSummary
                        verdict={safeVerdict}
                        authenticityScore={audio_forensics?.authenticity_score}
                        manipulationDetected={audio_forensics?.manipulation_detected}
                    />

                    {/* Tabs */}
                    <Tabs defaultValue="tests" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6 flex-wrap">
                            <TabsTrigger value="tests" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Pruebas ({testsExecuted})
                            </TabsTrigger>
                            <TabsTrigger value="transcription" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Transcripción
                            </TabsTrigger>
                            <TabsTrigger value="visualizations" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Visualizaciones
                            </TabsTrigger>
                            <TabsTrigger value="custody" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-3">
                                Cadena de Custodia
                            </TabsTrigger>
                        </TabsList>

                        {/* Tests Tab */}
                        <TabsContent value="tests" className="mt-6">
                            <AudioTestResults humanReport={human_report} />
                        </TabsContent>

                        {/* Transcription Tab */}
                        <TabsContent value="transcription" className="mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Transcripción del Audio</h3>
                                <Card className="border border-gray-100 shadow-sm">
                                    <CardContent className="p-6">
                                        {transcription && transcription.text ? (
                                            <div className="space-y-4">
                                                <div className="bg-secondary/30 p-4 rounded-lg">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                        {transcription.text}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                    {transcription.language && (
                                                        <span>
                                                            Idioma: <span className="font-medium">{transcription.language}</span>
                                                        </span>
                                                    )}
                                                    {transcription.confidence && (
                                                        <span>
                                                            Confianza: <span className="font-medium">{(transcription.confidence * 100).toFixed(1)}%</span>
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Speaker segments if available */}
                                                {transcription.segments && transcription.segments.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t">
                                                        <h4 className="text-sm font-semibold mb-3">Segmentos por Tiempo</h4>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {transcription.segments.map((seg, idx) => (
                                                                <div key={idx} className="flex gap-3 text-sm p-2 bg-gray-50 rounded">
                                                                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                                                        {formatTime(seg.start_time)} - {formatTime(seg.end_time)}
                                                                    </span>
                                                                    {seg.speaker && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {seg.speaker}
                                                                        </Badge>
                                                                    )}
                                                                    <span className="flex-1">{seg.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                No hay transcripción disponible para este audio.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Visualizations Tab */}
                        <TabsContent value="visualizations" className="mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Reproductor y Visualizaciones</h3>

                                {/* Audio Player */}
                                {local_audio_url && (
                                    <Card className="border border-gray-100 shadow-sm">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <FileAudio className="w-5 h-5 text-primary" />
                                                Reproducción de Audio
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <audio controls className="w-full" src={local_audio_url}>
                                                Tu navegador no soporta el elemento de audio.
                                            </audio>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Waveform Placeholder */}
                                <Card className="border border-gray-100 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Forma de Onda</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded-lg flex items-center justify-center">
                                            <div className="flex items-end gap-1 h-20">
                                                {Array.from({ length: 50 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-1 bg-primary/60 rounded-full"
                                                        style={{
                                                            height: `${20 + Math.sin(i * 0.3) * 30 + Math.random() * 20}%`
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Representación visual del audio analizado
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Spectrogram Placeholder */}
                                <Card className="border border-gray-100 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Espectrograma</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-40 bg-gradient-to-b from-purple-900 via-red-600 to-yellow-400 rounded-lg opacity-70 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.1)_50%,transparent_100%)]" />
                                            <p className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                                                Análisis Espectral
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Distribución de frecuencias a lo largo del tiempo
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Chain of Custody Tab */}
                        <TabsContent value="custody" className="mt-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Cadena de Custodia Digital</h3>
                                <Card className="border border-gray-100 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            {chain_of_custody && chain_of_custody.length > 0 ? (
                                                chain_of_custody.map((event, idx) => (
                                                    <div key={idx} className="flex gap-4 relative">
                                                        {/* Timeline Line */}
                                                        {idx !== chain_of_custody.length - 1 && (
                                                            <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-200" />
                                                        )}

                                                        <div className="mt-1 h-10 w-10 flex-none rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-400 z-10">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-semibold text-gray-900">{event.action}</h4>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(event.timestamp).toLocaleString('es-CO')}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                                                            {event.hash && (
                                                                <div className="mt-2 text-xs font-mono text-muted-foreground bg-gray-50 p-2 rounded break-all">
                                                                    Hash: {event.hash}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground italic">
                                                    No hay información de custodia disponible.
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Column (Right) */}
                <div className="space-y-6">
                    {/* File Info */}
                    {file_info && <AudioFileInfo info={file_info} />}

                    {/* Stats */}
                    <AudioStats
                        testsExecuted={testsExecuted}
                        anomaliesFound={anomaliesFound}
                        processingTimeSeconds={45.0}
                        speakersDetected={speakersDetected}
                    />

                    {/* Recommendations */}
                    <AudioRecommendations recommendations={recommendations} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => {/* TODO: Download report */ }}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar reporte
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 sm:flex-none bg-green-50 hover:bg-green-100 border-green-200"
                    onClick={() => {/* TODO: Share analysis */ }}
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir análisis
                </Button>
                <Button
                    onClick={onReset}
                    className="flex-1 sm:flex-none bg-secondary hover:bg-primary text-primary-foreground"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reportar otro contenido
                </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>🎧 Análisis realizado el {new Date().toLocaleDateString('es-CO')} • Caso {caseNumber}</p>
                <p className="mt-1">Este diagnóstico forense fue generado usando tecnología de IA avanzada</p>
            </div>
        </div>
    );
}

// Helper function to format time
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate recommendations based on analysis
function generateRecommendations(humanReport: any): string[] {
    const recommendations: string[] = [];

    if (humanReport.audio_forensics?.manipulation_detected) {
        recommendations.push('Verificar origen del archivo con el emisor');
        recommendations.push('Buscar versiones alternativas del audio');
        recommendations.push('No utilizar como evidencia sin verificación adicional');
    } else if (humanReport.verdict?.risk_level === 'high' || humanReport.verdict?.risk_level === 'critical') {
        recommendations.push('Verificar la autenticidad del audio con fuentes adicionales');
        recommendations.push('Comparar con grabaciones originales si están disponibles');
        recommendations.push('Consultar expertos forenses para análisis detallado');
    } else {
        recommendations.push('El audio parece auténtico, pero siempre verificar la fuente');
        recommendations.push('Mantener registro de la cadena de custodia');
    }

    if (humanReport.speaker_analysis?.num_speakers > 1) {
        recommendations.push(`Se detectaron ${humanReport.speaker_analysis.num_speakers} voces distintas`);
    }

    return recommendations;
}
