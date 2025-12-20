import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioFileInfo as IAudioFileInfo } from '@/types/audioAnalysis';
import { FileAudio, Clock, FileIcon, Disc } from 'lucide-react';

interface Props {
    info: IAudioFileInfo;
}

export function AudioFileInfo({ info }: Props) {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds === 0) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get format from mime type
    const getFormat = (mimeType: string) => {
        if (!mimeType) return 'Desconocido';
        const formatMap: Record<string, string> = {
            'audio/wav': 'WAV',
            'audio/x-wav': 'WAV',
            'audio/mpeg': 'MP3',
            'audio/mp3': 'MP3',
            'audio/ogg': 'OGG',
            'audio/opus': 'OPUS',
            'audio/flac': 'FLAC',
            'audio/m4a': 'M4A',
            'audio/mp4': 'M4A',
            'audio/webm': 'WebM'
        };
        return formatMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'Audio';
    };

    return (
        <Card className="border border-yellow-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="text-amber-500"><FileAudio className="w-5 h-5" /></span>
                    Archivo
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-6">

                {/* File Basic Info */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-amber-500"><Disc className="w-4 h-4" /></span>
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">{info.name || 'audio_sample.wav'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tipo</span>
                        <span className="font-bold text-gray-900 uppercase">AUDIO</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tamaño</span>
                        <span className="font-bold text-gray-900">{formatBytes(info.size_bytes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Duración</span>
                        <span className="font-bold text-gray-900">{formatDuration(info.duration_seconds)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Formato</span>
                        <span className="font-bold text-gray-900">{getFormat(info.mime_type)}</span>
                    </div>
                </div>

                {/* Audio Metadata */}
                <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-3">Metadatos de Audio</h5>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Sample Rate</span>
                            <span className="font-bold text-gray-900 text-xs">
                                {info.metadata?.sample_rate ? `${(info.metadata.sample_rate / 1000).toFixed(1)} kHz` : 'No disponible'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Canales</span>
                            <span className="font-bold text-gray-900 text-xs">
                                {info.metadata?.channels === 1 ? 'Mono' : info.metadata?.channels === 2 ? 'Stereo' : 'No disponible'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Bit Rate</span>
                            <span className="font-bold text-gray-900 text-xs">
                                {info.metadata?.bit_rate ? `${Math.round(info.metadata.bit_rate / 1000)} kbps` : 'No disponible'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Fecha de creación</span>
                            <span className="font-bold text-gray-900 text-xs">
                                {info.created_at ? new Date(info.created_at).toLocaleDateString('es-CO') : 'No disponible'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
