import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Bot, User, AlertTriangle, Send, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
// Using standard inputs for Radio to avoid missing component issues
// import { RadioGroup, RadioGroupItem } from './ui/radio-group';
// import { Alert, AlertDescription } from './ui/alert';

interface CaseDiagnosisFormProps {
    caseId: string;
    aiAnalysis?: any;
    initialMarkers: string[];
    onBack: () => void;
    onSubmit: (diagnosis: any) => void;
    isSubmitting: boolean;
}

export function CaseDiagnosisForm({ caseId, aiAnalysis, onBack, onSubmit, isSubmitting }: CaseDiagnosisFormProps) {
    const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null);
    const [comments, setComments] = useState('');
    const [error, setError] = useState<string | null>(null);

    // AI Data
    const amiData = aiAnalysis?.classification?.indiceCumplimientoAMI;
    const aiVerdict = amiData?.nivel || "Análisis no disponible";
    const aiScore = amiData?.score || 0;

    // Determine AI styling based on score/verdict
    // Assuming < 70 is 'Requiere enfoque' (Warning/Yellow) and >= 70 is 'Desarrolla' (Success/Green/Blue)
    // Actually the design shows "Requiere un enfoque AMI" in Yellow.
    const isAiWarning = aiScore < 70;

    const handleSubmit = () => {
        if (!selectedVerdict) {
            setError('Debes seleccionar un diagnóstico antes de enviar');
            return;
        }
        setError(null);

        onSubmit({
            caseId,
            vote: selectedVerdict, // 'desarrolla' | 'requiere'
            notas: comments
        });
    };

    const handleClear = () => {
        setSelectedVerdict(null);
        setComments('');
        setError(null);
    };

    return (
        <div className="w-full border-2 border-[#FFD740] rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
            {/* Header */}
            <div className="bg-[#FFF9C4] px-6 py-4 flex items-center gap-3 border-b border-[#FFD740]/30">
                <User className="h-5 w-5 text-amber-900" />
                <h2 className="text-lg font-bold text-amber-950">Validación Humana</h2>
            </div>

            <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: AI Diagnosis Recap */}
                    <div className="lg:col-span-5">
                        <div className="border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-6 bg-slate-50/50">
                            <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                                <Bot className="h-6 w-6" />
                                <h3>Diagnóstico de IA</h3>
                            </div>

                            <Badge
                                variant={isAiWarning ? "default" : "secondary"}
                                className={`
                                    text-base px-6 py-3 rounded-xl font-bold tracking-wide shadow-none
                                    ${isAiWarning ? 'bg-[#FFD740] text-amber-900 hover:bg-[#FFC107]' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}
                                `}
                            >
                                {aiVerdict}
                            </Badge>

                            <p className="font-bold text-slate-500">
                                Confianza: <span className="text-slate-900">{aiScore}%</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Human Input */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-base font-bold text-slate-800">
                                ¿Estás de acuerdo con el diagnóstico de IA?
                            </Label>

                            <div className="space-y-3">
                                {/* Option 1: Desarrolla */}
                                <label className={`
                                    flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50
                                    ${selectedVerdict === 'desarrolla' ? 'border-primary bg-primary/5' : 'border-slate-200'}
                                `}>
                                    <input
                                        type="radio"
                                        name="verdict"
                                        value="desarrolla"
                                        checked={selectedVerdict === 'desarrolla'}
                                        onChange={() => { setSelectedVerdict('desarrolla'); setError(null); }}
                                        className="mt-1 w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <div className="space-y-1">
                                        <span className="font-bold text-slate-900 block">Desarrolla las premisas AMI</span>
                                        <p className="text-xs text-slate-500 font-medium leading-normal">
                                            El contenido cumple con los criterios de Alfabetización Mediática e Informacional
                                        </p>
                                    </div>
                                </label>

                                {/* Option 2: Requiere */}
                                <label className={`
                                    flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50
                                    ${selectedVerdict === 'requiere' ? 'border-primary bg-primary/5' : 'border-slate-200'}
                                `}>
                                    <input
                                        type="radio"
                                        name="verdict"
                                        value="requiere"
                                        checked={selectedVerdict === 'requiere'}
                                        onChange={() => { setSelectedVerdict('requiere'); setError(null); }}
                                        className="mt-1 w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <div className="space-y-1">
                                        <span className="font-bold text-slate-900 block">Requiere un enfoque AMI</span>
                                        <p className="text-xs text-slate-500 font-medium leading-normal">
                                            El contenido necesita ser analizado bajo el enfoque de Alfabetización Mediática
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-8">
                    {/* Comments */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">Comentarios adicionales (opcional)</Label>
                        <Textarea
                            placeholder="Añade cualquier observación relevante sobre tu validación..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="min-h-[100px] resize-none text-sm"
                            maxLength={500}
                        />
                        <div className="text-[10px] text-right text-slate-400 font-mono">
                            {comments.length}/500 caracteres
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="w-full md:w-auto">
                            {error && (
                                <div className="bg-orange-50 text-orange-800 border-2 border-orange-200/50 py-2 px-4 rounded-lg flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-xs font-bold">
                                        {error}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleClear}
                                className="border-slate-200 text-slate-600 hover:text-slate-900"
                            >
                                Limpiar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#FFD740] hover:bg-[#FFC107] text-amber-950 font-bold px-8"
                            >
                                <Send className="mr-2 h-4 w-4 opacity-50" />
                                {isSubmitting ? 'Enviando...' : 'Enviar Validación'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
