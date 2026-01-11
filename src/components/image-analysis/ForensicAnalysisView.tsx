import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Info, Image as ImageIcon, Search } from 'lucide-react';
import { StandardizedCase, GenericInsight, InsightArtifact } from '@/types/standardizedCase';

interface ForensicAnalysisViewProps {
    standardizedCase: StandardizedCase;
}

export const ForensicAnalysisView: React.FC<ForensicAnalysisViewProps> = ({ standardizedCase }) => {
    const { overview, insights } = standardizedCase;

    // Filter insights by category
    const forensicInsights = insights.filter(i => i.category === 'forensics');
    const metadataInsights = insights.filter(i => i.category === 'metadata');

    // Determine verdict color
    const verdictColor = (score: number = 0) => {
        if (score < 30) return 'text-green-600 bg-green-50 border-green-200';
        if (score < 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Verdict Section */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {overview.title || 'Análisis Forense de Imagen'}
                    </h2>
                    <p className="text-gray-500 mb-4">{overview.summary}</p>

                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${verdictColor(overview.risk_score)}`}>
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-bold">{overview.verdict_label}</span>
                        <span className="text-sm opacity-80">({overview.risk_score}% Riesgo)</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main Image & Metadata */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Visual Asset */}
                    <Card className="overflow-hidden border-2 border-gray-100">
                        <div className="bg-gray-900 text-center relative group min-h-[400px] flex items-center justify-center">
                            {overview.main_asset_url ? (
                                <img
                                    src={overview.main_asset_url}
                                    alt="Evidencia Principal"
                                    className="max-h-[600px] w-auto mx-auto object-contain"
                                />
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <ImageIcon className="w-16 h-16 mb-4" />
                                    <span>No main asset available</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm">
                                    <Search className="w-3 h-3 mr-1" />
                                    Imagen Original
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Metadata Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metadataInsights.map((insight) => (
                            <Card key={insight.id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="py-3 px-4 bg-gray-50/50">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-semibold text-gray-700">
                                            {insight.label}
                                        </CardTitle>
                                        <Badge variant="outline">{insight.value}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-3 px-4 text-sm text-gray-600">
                                    <p>{insight.description}</p>
                                    {insight.raw_data && (
                                        <div className="mt-2 text-xs text-gray-400 font-mono bg-gray-100 p-2 rounded">
                                            {Object.entries(insight.raw_data).map(([k, v]) => (
                                                <div key={k}>{k}: {String(v)}</div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column: Forensics & Analysis */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-6 bg-yellow-400 rounded-full"></span>
                        Pruebas Forenses
                    </h3>

                    {forensicInsights.map((insight) => (
                        <Card key={insight.id} className="border-gray-200">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-800 text-sm">{insight.label}</h4>
                                    <Badge
                                        className={insight.score && insight.score > 50 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}
                                    >
                                        {insight.value}
                                    </Badge>
                                </div>

                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {insight.description}
                                </p>

                                {/* Diagnostic Precision Bar */}
                                {insight.score !== undefined && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                            <span>Precisión diagnóstica</span>
                                            <span>{insight.score}%</span>
                                        </div>
                                        <Progress value={insight.score} className={`h-1.5 ${insight.score > 50 ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`} />
                                    </div>
                                )}

                                {/* Artifacts (Heatmaps, etc) */}
                                {insight.artifacts && insight.artifacts.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {insight.artifacts.map((artifact, idx) => (
                                            <div key={idx} className="relative group rounded overflow-hidden border border-gray-100">
                                                {artifact.type === 'image_url' && (
                                                    <img src={artifact.content} alt={artifact.label} className="w-full h-20 object-cover" />
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                                                    {artifact.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {forensicInsights.length === 0 && (
                        <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-xl">
                            No se encontraron pruebas forenses.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
