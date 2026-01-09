import React, { useState } from 'react';
import { Bot, UserCheck, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { submitVote } from '@/services/votingService';
import { useToast } from '@/hooks/use-toast';

interface HumanValidationFormProps {
  caseId: string;
  aiVerdictLabel: string;
  aiRiskScore: number;
  onVoteSuccess?: () => void;
}

export function HumanValidationForm({
  caseId,
  aiVerdictLabel,
  aiRiskScore,
  onVoteSuccess
}: HumanValidationFormProps) {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const OPTIONS = [
    {
      id: 'desarrolla-ami',
      value: 'Desarrolla las premisas AMI',
      label: 'Desarrolla las premisas AMI',
      description: 'El contenido cumple con los criterios de Alfabetización Mediática'
    },
    {
      id: 'requiere-ami',
      value: 'Requiere un enfoque AMI',
      label: 'Requiere un enfoque AMI',
      description: 'El contenido requiere aplicar premisas de Alfabetización Mediática'
    }
  ];

  const handleSubmit = async () => {
    setError(null);
    if (!selectedOption) {
      setError('Debes seleccionar un diagnóstico antes de enviar');
      return;
    }
    if (!justification.trim()) {
      setError('Por favor añade una justificación para tu validación');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitVote({
        case_id: caseId,
        classification: selectedOption,
        reason: justification
      });
      toast({
        title: '¡Validación enviada!',
        description: 'Tu opinión ha sido registrada correctamente.',
      });
      if (onVoteSuccess) onVoteSuccess();
      setSelectedOption('');
      setJustification('');
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Error al enviar la validación. Intenta nuevamente.',
        variant: 'destructive',
      });
      setError('Ocurrió un error al procesar tu voto. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confidence = aiRiskScore > 0 ? (100 - aiRiskScore) : 0;

  return (
    <Card className="shadow-sm border-2 mt-8" style={{ borderColor: '#FFDA00' }}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-[#FFDA00]" /> Validación Humana
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-6">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: AI Context */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-full min-h-[180px]">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-gray-900" />
              <h4 className="font-bold text-gray-900">Diagnóstico de IA</h4>
            </div>
            
            <Badge className="bg-[#FFE97A] hover:bg-[#FFDA00] text-gray-900 border-[#FFDA00] px-4 py-1.5 text-sm font-medium mb-3">
              {aiVerdictLabel || "Análisis Pendiente"}
            </Badge>
            
            <p className="text-gray-500 font-medium">
              Confianza: <span className="text-gray-900">{confidence}%</span>
            </p>
          </div>

          {/* Right: Selection */}
          <div className="space-y-4">
            <Label className="text-base font-bold text-gray-900 block mb-2">
              ¿Cuál es tu consideración como especialista sobre este caso?
            </Label>
            
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
              {OPTIONS.map((option) => (
                <div key={option.id}>
                  <RadioGroupItem value={option.value} id={option.id} className="peer sr-only" />
                  <Label
                    htmlFor={option.id}
                    className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-[#FFE97A] hover:bg-[#FFFCE8]/50 peer-data-[state=checked]:border-[#FFDA00] peer-data-[state=checked]:bg-[#FFFCE8] cursor-pointer transition-all w-full"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedOption === option.value ? 'border-[#FFDA00]' : 'border-gray-300'}`}>
                      {selectedOption === option.value && <div className="w-2.5 h-2.5 rounded-full bg-[#FFDA00]" />}
                    </div>
                    <span className="font-bold text-gray-900">{option.label}</span>
                    <span className="text-sm text-gray-500 font-normal">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Justification */}
        <div className="space-y-2">
          <Label className="font-bold text-gray-900">Justificación</Label>
          <Textarea 
            placeholder="Añade un comentario que explique tu validación" 
            className="min-h-[100px] resize-none border-gray-200 focus:border-[#FFDA00] focus:ring-[#FFDA00] bg-white"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            maxLength={500}
          />
          <div className="text-left"><span className="text-xs text-gray-400">{justification.length}/500 caracteres</span></div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex justify-center gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-gray-900 font-bold h-10 px-6 border border-[#E6C400]"
              style={{ backgroundColor: '#FFDA00' }}
            >
              {isSubmitting ? <>Enviando...</> : <><Send className="w-4 h-4 mr-2" />Enviar Validación</>}
            </Button>
            <Button variant="outline" onClick={() => {setSelectedOption(''); setJustification('');}} disabled={isSubmitting} className="border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-6">Limpiar</Button>
          </div>
          {error && <div className="bg-[#FFFCE8] border border-[#FFDA00] text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium"><AlertTriangle className="h-4 w-4" />{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
