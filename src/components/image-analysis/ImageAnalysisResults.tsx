import React, { useRef } from 'react';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { AnalysisSummary } from './AnalysisSummary';
import { FileInfo } from './FileInfo';
import { TestResults } from './TestResults';
import { MarkersList } from './MarkersList';
import { Recommendations } from './Recommendations';
import { AnalysisStats } from './AnalysisStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Loader2 } from 'lucide-react';
import { ImageAnalysisResultView } from './ImageAnalysisResultView'; // Import added

export function ImageAnalysisResults() {
    const { analyzeImage, data, loading, error, reset } = useImageAnalysis();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            analyzeImage(e.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">Analizando imagen...</p>
                <p className="text-sm text-gray-400">Esto puede tomar hasta 2 minutos si el análisis es profundo.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
                <div className="text-red-500 text-5xl">⚠️</div>
                <h2 className="text-xl font-bold">Error en el análisis</h2>
                <p className="text-muted-foreground max-w-md">{error}</p>
                <Button onClick={reset}>Intentar de nuevo</Button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <UploadCloud className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Análisis Forense de Imágenes</h2>
                <p className="text-muted-foreground mb-6 text-center max-w-lg">
                    Sube una imagen para detectar manipulaciones, deepfakes, y anomalías en metadatos.
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <Button size="lg" onClick={handleUploadClick}>
                    Subir Imagen
                </Button>
            </div>
        );
    }

    return (
        <ImageAnalysisResultView data={data} onReset={reset} />
    );
}
