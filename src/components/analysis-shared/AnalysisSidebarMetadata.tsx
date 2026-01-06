import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon, FileImage, FileAudio, FileText, Disc, Clock } from 'lucide-react';

interface MetadataItem {
    label: string;
    value: string | number | React.ReactNode;
}

interface AnalysisSidebarMetadataProps {
    type: 'text' | 'image' | 'audio';
    fileName?: string;
    fileSize?: number;
    basicMetadata: MetadataItem[];
    technicalMetadata: MetadataItem[];
}

export function AnalysisSidebarMetadata({
    type,
    fileName,
    fileSize,
    basicMetadata,
    technicalMetadata
}: AnalysisSidebarMetadataProps) {
    const formatBytes = (bytes?: number) => {
        if (!bytes || bytes === 0) return '---';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getIcon = () => {
        switch (type) {
            case 'image': return <FileImage className="w-5 h-5" />;
            case 'audio': return <FileAudio className="w-5 h-5" />;
            case 'text': return <FileText className="w-5 h-5" />;
            default: return <FileIcon className="w-5 h-5" />;
        }
    };

    return (
        <Card className="border-2 border-[#FFF9C4] shadow-none overflow-hidden bg-white rounded-2xl">
            <CardHeader className="pb-4 pt-6 px-6 bg-white border-b-0">
                <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-[0.2em] text-slate-800">
                    <span className="text-slate-800">{getIcon()}</span>
                    Detalles del Archivo
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
                {/* File Name Card */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-slate-800"><FileIcon className="h-5 w-5" /></span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                        {fileName || 'Archivo Desconocido'}
                    </span>
                </div>

                {/* Metadata List */}
                <div className="space-y-4">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-slate-900 font-extrabold uppercase tracking-tight">TIPO</span>
                        <span className="font-bold text-slate-600 uppercase text-right">{type === 'text' ? 'Texto / Noticia' : type}</span>
                    </div>

                    {fileSize !== undefined && (
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-900 font-extrabold uppercase tracking-tight">TAMAÑO</span>
                            <span className="font-bold text-slate-600 text-right">{formatBytes(fileSize)}</span>
                        </div>
                    )}

                    {basicMetadata.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-900 font-extrabold uppercase tracking-tight">{item.label}</span>
                            <span className="font-bold text-slate-600 text-right">{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Technical Metadata */}
                {technicalMetadata.length > 0 && (
                    <div className="pt-2">
                        <h5 className="text-[9px] font-bold text-slate-400 uppercase mb-4 tracking-[0.1em] border-b border-slate-100 pb-2">
                            Metadatos Técnicos
                        </h5>
                        <div className="space-y-4">
                            {technicalMetadata.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[11px]">
                                    <span className="text-slate-900 font-bold">{item.label}</span>
                                    <span className="font-bold text-slate-900 text-right truncate max-w-[140px]" title={String(item.value)}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
