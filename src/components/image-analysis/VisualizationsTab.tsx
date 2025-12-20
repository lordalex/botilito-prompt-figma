import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ImageIcon, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '@/types/imageAnalysis';

interface VisualizationsTabProps {
    data: AnalysisResult;
}

export function VisualizationsTab({ data }: VisualizationsTabProps) {
    const { raw_forensics, human_report, file_info } = data;

    // We assume the first forensics item usually corresponds to the main image
    const forensics = raw_forensics && raw_forensics.length > 0 ? raw_forensics[0] : null;

    // Collect all visualizations
    const visualizations = [
        // Tampered Region (Best evidence first)
        ...(forensics?.summary?.tampered_region ? [{
            type: 'composite',
            title: 'Región Manipulada (Detectada)',
            description: 'Zonas identificadas como anómalas por el análisis combinado.',
            image: forensics.summary.tampered_region,
            isBase64: true,
            alert: true
        }] : []),

        // Global Heatmap
        ...(forensics?.summary?.heatmap ? [{
            type: 'heatmap',
            title: 'Mapa de Calor Global',
            description: 'Fusión de todos los algoritmos forenses.',
            image: forensics.summary.heatmap,
            isBase64: true
        }] : []),

        // Individual Algorithms
        ...(forensics?.algorithms?.filter(algo => algo.heatmap).map(algo => ({
            type: 'test_heatmap',
            title: `Algoritmo: ${algo.name}`,
            description: `Puntaje técnico: ${(algo.score * 100).toFixed(1)}%`,
            image: algo.heatmap!,
            isBase64: true
        })) || []),

        // Original Image (Last fallback)
        {
            type: 'original',
            title: 'Imagen Original',
            description: `Original • ${file_info?.dimensions?.width || '?'}x${file_info?.dimensions?.height || '?'}`,
            image: data.local_image_url || 'https://placehold.co/600x400?text=Original+Not+Available',
            isBase64: false
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? visualizations.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === visualizations.length - 1 ? 0 : prev + 1));
    };

    const currentViz = visualizations[currentIndex];

    if (!forensics && visualizations.length <= 1) { // Only placeholder
        return (
            <div className="p-8 text-center border rounded-lg bg-muted/20">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No hay visualizaciones forenses disponibles.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Evidencia Visual</h3>
                    <div className="text-sm text-muted-foreground">
                        {currentIndex + 1} / {visualizations.length}
                    </div>
                </div>

                <Card className="overflow-hidden border-2 border-primary/20">
                    <CardHeader className="bg-muted/50 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {currentViz.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{currentViz.description}</p>
                            </div>
                            {(currentViz as any).alert && (
                                <Badge variant="destructive" className="bg-red-500">
                                    ALERTA
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 relative bg-black flex items-center justify-center min-h-[400px]">
                        <button
                            className="absolute left-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 flex items-center justify-center transition-colors"
                            onClick={handlePrev}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        <img
                            src={currentViz.isBase64 && !currentViz.image.startsWith('http') ? `data:image/jpeg;base64,${currentViz.image}` : currentViz.image}
                            alt={currentViz.title}
                            className="max-h-[600px] w-full h-full object-contain"
                        />

                        <button
                            className="absolute right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 flex items-center justify-center transition-colors"
                            onClick={handleNext}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </CardContent>
                </Card>

                {/* Thumbs / Indicators */}
                <div className="flex gap-2 justify-center overflow-x-auto p-2">
                    {visualizations.map((viz, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-primary scale-125' : 'bg-gray-400 hover:bg-gray-600'
                                }`}
                            aria-label={`View ${viz.title}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
