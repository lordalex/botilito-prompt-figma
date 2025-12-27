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
        if (!bytes || bytes === 0) return 'N/A';
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

    const getSubIcon = () => {
        switch (type) {
            case 'audio': return <Disc className="w-4 h-4" />;
            default: return <FileIcon className="w-4 h-4" />;
        }
    };

    return (
        <Card className="border border-yellow-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2 pt-4 px-4 bg-yellow-50/50 border-b border-yellow-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-800">
                    <span className="text-amber-500">{getIcon()}</span>
                    Detalles del {type === 'text' ? 'Contenido' : 'Archivo'}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-6">
                {/* Basic Info */}
                <div className="space-y-3 pt-4">
                    {(fileName || fileSize) && (
                        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-amber-500">{getSubIcon()}</span>
                            <span className="text-[11px] font-bold text-slate-600 truncate max-w-[180px]">
                                {fileName || (type === 'text' ? 'Contenido de Texto' : 'Archivo sin nombre')}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-tighter">Tipo</span>
                        <span className="font-black text-slate-900 uppercase">{type}</span>
                    </div>

                    {fileSize !== undefined && (
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Tamaño</span>
                            <span className="font-bold text-slate-700">{formatBytes(fileSize)}</span>
                        </div>
                    )}

                    {basicMetadata.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">{item.label}</span>
                            <span className="font-bold text-slate-700">{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Technical Metadata */}
                {technicalMetadata.length > 0 && (
                    <div className="pt-2">
                        <h5 className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-[0.2em] border-b pb-1">
                            Metadatos Técnicos
                        </h5>
                        <div className="space-y-3">
                            {technicalMetadata.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[11px]">
                                    <span className="text-slate-400 font-medium">{item.label}</span>
                                    <span className="font-bold text-slate-800 text-right truncate max-w-[140px]" title={String(item.value)}>
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
