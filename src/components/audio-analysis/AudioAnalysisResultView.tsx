import React from 'react';
import { AudioAnalysisResult } from '@/types/audioAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, FileAudio, Clock, Download } from 'lucide-react';

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

    const { human_report, file_info, local_audio_url } = data;
    const { verdict, transcription, speaker_analysis, audio_forensics } = human_report;

    // Risk level color mapping
    const getRiskColor = (level: string) => {
        const colors = {
            'low': 'bg-green-100 text-green-800 border-green-300',
            'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'high': 'bg-orange-100 text-orange-800 border-orange-300',
            'critical': 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Headphones className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Análisis de Audio Completado</h1>
                </div>
                <Button variant="outline" onClick={onReset}>Nuevo Análisis</Button>
            </div>

            {/* Audio Player Section */}
            {local_audio_url && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileAudio className="h-5 w-5" />
                            Reproducción de Audio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <audio controls className="w-full" src={local_audio_url}>
                            Tu navegador no soporta el elemento de audio.
                        </audio>
                        {file_info && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Archivo</p>
                                    <p className="font-medium">{file_info.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Duración</p>
                                    <p className="font-medium">{file_info.duration_seconds?.toFixed(1)}s</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tamaño</p>
                                    <p className="font-medium">{(file_info.size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Formato</p>
                                    <p className="font-medium">{file_info.mime_type || 'Unknown'}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Verdict Card */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle>Veredicto del Análisis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Conclusión</h3>
                            <p className="text-muted-foreground mt-1">{verdict.conclusion}</p>
                        </div>
                        <Badge className={`text-sm px-4 py-2 ${getRiskColor(verdict.risk_level)}`}>
                            Riesgo: {verdict.risk_level.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Confianza</span>
                            <span className="text-sm font-bold">{(verdict.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full transition-all"
                                style={{ width: `${verdict.confidence * 100}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transcription */}
            {transcription && transcription.text && (
                <Card>
                    <CardHeader>
                        <CardTitle>Transcripción</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="bg-secondary/30 p-4 rounded-lg">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{transcription.text}</p>
                            </div>
                            {transcription.language && (
                                <p className="text-xs text-muted-foreground">
                                    Idioma detectado: <span className="font-medium">{transcription.language}</span>
                                </p>
                            )}
                            {transcription.confidence && (
                                <p className="text-xs text-muted-foreground">
                                    Confianza de transcripción: <span className="font-medium">{(transcription.confidence * 100).toFixed(1)}%</span>
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Speaker Analysis */}
            {speaker_analysis && speaker_analysis.num_speakers > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Análisis de Hablantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            Se detectaron <span className="font-bold">{speaker_analysis.num_speakers}</span> hablante(s) en el audio.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Audio Forensics */}
            {audio_forensics && (
                <Card className={audio_forensics.manipulation_detected ? 'border-red-300' : 'border-green-300'}>
                    <CardHeader>
                        <CardTitle>Análisis Forense</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Estado de Autenticidad</span>
                            <Badge className={audio_forensics.manipulation_detected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                {audio_forensics.manipulation_detected ? 'Manipulación Detectada' : 'Auténtico'}
                            </Badge>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm">Puntuación de Autenticidad</span>
                                <span className="text-sm font-bold">{(audio_forensics.authenticity_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${audio_forensics.authenticity_score > 0.7 ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${audio_forensics.authenticity_score * 100}%` }}
                                />
                            </div>
                        </div>
                        {audio_forensics.anomalies && audio_forensics.anomalies.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Anomalías Detectadas:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {audio_forensics.anomalies.map((anomaly, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground">{anomaly}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Summary */}
            {human_report.summary && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen del Análisis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{human_report.summary}</p>
                    </CardContent>
                </Card>
            )}

            {/* Action Button */}
            <div className="flex">
                <Button onClick={onReset} className="bg-secondary hover:bg-primary text-primary-foreground">
                    Analizar Otro Audio
                </Button>
            </div>
        </div>
    );
}
