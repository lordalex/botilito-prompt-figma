import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Bot, AlertTriangle, Send, Users, CheckCircle, XCircle, AlertOctagon, HelpCircle, Laugh } from 'lucide-react';
import { Badge } from './ui/badge';

// Vote classification options from API v1.2.0
const VOTE_CLASSIFICATIONS = [
    {
        value: 'Verificado',
        label: 'Verificado',
        description: 'El contenido ha sido verificado como verdadero y preciso.',
        icon: CheckCircle,
        color: 'text-green-600',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-50'
    },
    {
        value: 'Falso',
        label: 'Falso',
        description: 'El contenido contiene información falsa o incorrecta.',
        icon: XCircle,
        color: 'text-red-600',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-50'
    },
    {
        value: 'Engañoso',
        label: 'Engañoso',
        description: 'El contenido es parcialmente cierto pero presentado de forma engañosa.',
        icon: AlertTriangle,
        color: 'text-orange-600',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-50'
    },
    {
        value: 'No Verificable',
        label: 'No Verificable',
        description: 'No es posible verificar la veracidad del contenido con las fuentes disponibles.',
        icon: HelpCircle,
        color: 'text-gray-600',
        borderColor: 'border-gray-400',
        bgColor: 'bg-gray-50'
    },
    {
        value: 'Sátira',
        label: 'Sátira',
        description: 'El contenido es de naturaleza satírica o humorística, no busca desinformar.',
        icon: Laugh,
        color: 'text-blue-600',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-50'
    }
] as const;

type VoteClassification = typeof VOTE_CLASSIFICATIONS[number]['value'];

interface CaseDiagnosisFormProps {
    caseId: string;
    aiAnalysis?: any;
    initialMarkers: string[];
    onBack: () => void;
    onSubmit: (diagnosis: any) => void;
    isSubmitting: boolean;
}

export function CaseDiagnosisForm({ caseId, aiAnalysis, onBack, onSubmit, isSubmitting }: CaseDiagnosisFormProps) {
    const [selectedVerdict, setSelectedVerdict] = useState<VoteClassification | null>(null);
    const [comments, setComments] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    // AI Data
    const amiData = aiAnalysis?.classification?.indiceCumplimientoAMI;
    const aiVerdict = amiData?.nivel || aiAnalysis?.overview?.verdict_label || "Análisis no disponible";
    const aiScore = amiData?.score || aiAnalysis?.overview?.risk_score || 0;

    const handleSubmit = () => {
        if (!selectedVerdict) {
            setError('Debes seleccionar un diagnóstico antes de enviar');
            return;
        }
        setError(null);

        onSubmit({
            caseId,
            classification: selectedVerdict,
            reason: comments,
            explanation: comments,
            evidence_url: evidenceUrl,
            // Legacy compatibility fields
            vote: selectedVerdict,
            notas: comments,
            marcadores: [selectedVerdict],
            justificaciones: { [selectedVerdict]: comments },
            enlaces: { [selectedVerdict]: evidenceUrl }
        });
    };

    const handleClear = () => {
        setSelectedVerdict(null);
        setComments('');
        setEvidenceUrl('');
        setError(null);
    };

    return (
        <div className="w-full border-2 border-primary rounded-lg overflow-hidden bg-[#fffbeb] shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-black">Validación Humana</h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Left Column: AI Diagnosis Recap */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center space-y-4 bg-white">
                            <div className="flex items-center gap-2 text-black font-semibold mb-2">
                                <Bot className="h-5 w-5" />
                                <h3 className="text-base">Diagnóstico de IA</h3>
                            </div>

                            <Badge
                                className="text-sm px-4 py-2 rounded-md font-medium bg-primary text-black hover:bg-primary"
                            >
                                {aiVerdict}
                            </Badge>

                            <p className="text-sm text-gray-600">
                                Confianza: <span className="text-black font-medium">{aiScore}%</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Human Input */}
                    <div className="lg:col-span-2 space-y-4">
                        <Label className="text-sm font-semibold text-black">
                            ¿Cuál es tu clasificación para este contenido?
                        </Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {VOTE_CLASSIFICATIONS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = selectedVerdict === option.value;
                                return (
                                    <label
                                        key={option.value}
                                        className={`
                                            flex flex-col items-start gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                                            ${isSelected ? `${option.borderColor} ${option.bgColor}` : 'border-gray-200 bg-white hover:bg-gray-50'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <input
                                                type="radio"
                                                name="verdict"
                                                value={option.value}
                                                checked={isSelected}
                                                onChange={() => { setSelectedVerdict(option.value); setError(null); }}
                                                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary flex-shrink-0"
                                            />
                                            <Icon className={`h-5 w-5 ${option.color} flex-shrink-0`} />
                                            <span className="font-medium text-black">{option.label}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed pl-6">
                                            {option.description}
                                        </p>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                    {/* Evidence URL */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-black">Enlace de evidencia (opcional)</Label>
                        <input
                            type="url"
                            placeholder="https://ejemplo.com/fuente-verificada"
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-gray-500">Proporciona un enlace a la fuente que respalda tu clasificación</p>
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-black">Justificación</Label>
                        <Textarea
                            placeholder="Explica brevemente el razonamiento detrás de tu clasificación..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="min-h-[100px] resize-none text-sm bg-white border-gray-300"
                            maxLength={500}
                        />
                        <div className="text-xs text-left text-gray-500">
                            {comments.length}/500 caracteres
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 justify-center">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-[#ffd000] text-black font-medium px-8 border-0"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Enviando...' : 'Enviar Validación'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                className="border-gray-300 bg-white text-black hover:bg-gray-50"
                            >
                                Limpiar
                            </Button>
                        </div>

                        {error && (
                            <div className="bg-[#fffbeb] text-amber-900 border border-primary py-3 px-4 rounded-lg flex items-center gap-2">
                                <AlertOctagon className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {error}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
