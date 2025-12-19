import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ImageIcon, AlertTriangle } from 'lucide-react';
import { AnalysisResult, AlgorithmResult } from '@/types/imageAnalysis';

interface VisualizationsTabProps {
    data: AnalysisResult;
}

export function VisualizationsTab({ data }: VisualizationsTabProps) {
    const { summary, details, file_info } = data;

    // Flatten algorithms from all details to find heatmaps
    const allAlgorithms: AlgorithmResult[] = details ? details.flatMap(d => d.algorithms || []) : [];

    // Collect all visualizations
    const visualizations = [
        // Original Image
        {
            type: 'original',
            title: 'Frame Original',
            description: `Original Image • ${file_info?.dimensions?.width || '?'}x${file_info?.dimensions?.height || '?'} • ${(file_info?.size_bytes ? (file_info.size_bytes / 1024 / 1024).toFixed(2) : '?')} MB`,
            image: summary.original_image || 'https://placehold.co/600x400?text=Original+Not+Available', // Fallback or placeholder
            isBase64: !!summary.original_image
        },
        // Composite / Tampered Region
        ...(summary.tampered_region ? [{
            type: 'composite',
            title: 'Región Manipulada (Composite)',
            description: 'Zonas detectadas como manipuladas (Composite Mask)',
            image: summary.tampered_region,
            isBase64: true
        }] : []),
        // Main Heatmap
        ...(summary.heatmap ? [{
            type: 'heatmap',
            title: 'Mapa de Calor Global',
            description: 'Mapa de calor combinado de todas las pruebas',
            image: summary.heatmap,
            isBase64: true
        }] : []),
        // Individual Test Heatmaps
        ...allAlgorithms.filter(algo => algo.heatmap).map(algo => ({
            type: 'test_heatmap',
            title: algo.name,
            description: `Análisis: ${algo.description || algo.name}`,
            image: algo.heatmap!,
            isBase64: true,
            verdict: algo.verdict
        }))
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? visualizations.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === visualizations.length - 1 ? 0 : prev + 1));
    };

    const currentViz = visualizations[currentIndex];

    return (
        <div className="space-y-8">
            {/* Visualizations Carousel Area */}
            {visualizations.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Pruebas Forenses Realizadas</h3>
                        <div className="text-sm text-muted-foreground">
                            {currentIndex + 1} / {visualizations.length}
                        </div>
                    </div>

                    <Card className="overflow-hidden border-2 border-primary/20">
                        <CardHeader className="bg-muted/50 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        {currentViz.type === 'original' && <ImageIcon className="h-5 w-5" />}
                                        {currentViz.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{currentViz.description}</p>
                                </div>
                                {(currentViz as any).verdict && (
                                    <Badge variant={(currentViz as any).verdict === 'TAMPERED' ? 'destructive' : 'default'}
                                        className={(currentViz as any).verdict === 'TAMPERED' ? 'bg-red-500' : 'bg-green-500'}
                                    >
                                        {(currentViz as any).verdict}
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
                                src={currentViz.isBase64 && !currentViz.image.startsWith('http') && !currentViz.image.startsWith('blob:') ? `data:image/jpeg;base64,${currentViz.image}` : currentViz.image}
                                alt={currentViz.title}
                                className="max-h-[600px] w-full h-full object-contain"
                            />

                            <button
                                className="absolute right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 flex items-center justify-center transition-colors"
                                onClick={handleNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>

                            {currentViz.type !== 'original' && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/80 bg-black/50 px-4 py-2 rounded-full whitespace-nowrap">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-xs">Zonas rojas/brillantes indican posible manipulación</span>
                                </div>
                            )}
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
            ) : (
                <div className="p-8 text-center border rounded-lg bg-muted/20">
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No hay visualizaciones disponibles para este análisis.</p>
                </div>
            )}


        </div>
    );
}
