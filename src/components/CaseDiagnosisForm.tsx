import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Bot, AlertTriangle, Send, Users } from 'lucide-react';
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
        <div className="w-full border-2 border-primary rounded-lg overflow-hidden bg-[#fffbeb] shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-black">Validación Humana</h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

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
                    <div className="lg:col-span-1 space-y-4">
                        <Label className="text-sm font-semibold text-black">
                            ¿Cuál es tu consideración como especialista sobre este caso?
                        </Label>

                        <div className="space-y-3">
                            {/* Option 1: Desarrolla */}
                            <label className={`
                                flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-white
                                ${selectedVerdict === 'desarrolla' ? 'border-primary bg-white' : 'border-gray-200 bg-white'}
                            `}>
                                <input
                                    type="radio"
                                    name="verdict"
                                    value="desarrolla"
                                    checked={selectedVerdict === 'desarrolla'}
                                    onChange={() => { setSelectedVerdict('desarrolla'); setError(null); }}
                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary flex-shrink-0"
                                />
                                <div className="space-y-1">
                                    <span className="font-medium text-black block">Desarrolla las premisas AMI</span>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        El contenido cumple con los criterios de Alfabetización Mediática e Informacional
                                    </p>
                                </div>
                            </label>

                            {/* Option 2: Requiere */}
                            <label className={`
                                flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-white
                                ${selectedVerdict === 'requiere' ? 'border-primary bg-white' : 'border-gray-200 bg-white'}
                            `}>
                                <input
                                    type="radio"
                                    name="verdict"
                                    value="requiere"
                                    checked={selectedVerdict === 'requiere'}
                                    onChange={() => { setSelectedVerdict('requiere'); setError(null); }}
                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary flex-shrink-0"
                                />
                                <div className="space-y-1">
                                    <span className="font-medium text-black block">Requiere un enfoque AMI</span>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        El contenido necesita ser analizado bajo el enfoque de Alfabetización Mediática
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                    {/* Comments */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-black">Comentarios adicionales</Label>
                        <Textarea
                            placeholder="Añade cualquier observación relevante sobre tu validación..."
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
                                <AlertTriangle className="h-4 w-4" />
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
