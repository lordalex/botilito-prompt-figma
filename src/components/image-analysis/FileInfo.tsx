import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInfo as IFileInfo } from '@/types/imageAnalysis';
import { FileIcon, FileImage } from 'lucide-react';

interface Props {
    info: IFileInfo;
}

export function FileInfo({ info }: Props) {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="border border-yellow-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <span className="text-amber-500"><FileImage className="w-5 h-5" /></span>
                    Detalles del Archivo
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-6">

                {/* File Basic Info */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-amber-500"><FileIcon className="w-4 h-4" /></span>
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">{info.name}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tipo</span>
                        <span className="font-bold text-gray-900 uppercase">IMAGE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tamaño</span>
                        <span className="font-bold text-gray-900">{formatBytes(info.size_bytes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Resolución</span>
                        <span className="font-bold text-gray-900">{info.dimensions.width}x{info.dimensions.height}</span>
                    </div>
                </div>

                {/* EXIF Data */}
                <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-3">Metadatos EXIF</h5>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Cámara/Dispositivo</span>
                            <span className="font-bold text-gray-900 text-xs">{info.exif_data?.Model || info.exif_data?.Make || 'No disponible'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Software</span>
                            <span className="font-bold text-gray-900 text-xs">{info.exif_data?.Software || 'No disponible'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Fecha de creación</span>
                            <span className="font-bold text-gray-900 text-xs">{info.exif_data?.DateTime || info.created_at || 'No disponible'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">GPS</span>
                            <span className="font-bold text-gray-400 text-xs">No disponible</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
