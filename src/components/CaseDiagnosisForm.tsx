import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, Microscope, Target, MessageSquare, Link2, Send,
  CheckCircle, XCircle, AlertTriangle, Smile, Image as ImageIcon,
  HelpCircle, Eye, Skull, Ban, DollarSign, Shield, Flame, User, Bot, Clock, Megaphone,
  AlertCircle
} from 'lucide-react';

// Centralized list of diagnostic markers
const ETIQUETAS_CATEGORIAS = [
    { id: 'verdadero', label: 'Verdadero', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', virulencia: 0, descripcion: 'Información verificada y respaldada por fuentes confiables' },
    { id: 'falso', label: 'Falso', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', virulencia: 90, descripcion: 'Información completamente falsa sin sustento verificable' },
    { id: 'enganoso', label: 'Engañoso', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', virulencia: 75, descripcion: 'Mezcla hechos reales con interpretaciones falsas o exageradas' },
    { id: 'satirico', label: 'Satírico/Humorístico', icon: Smile, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', virulencia: 20, descripcion: 'Contenido humorístico o satírico que puede confundirse con noticias reales' },
    { id: 'manipulado', label: 'Manipulado', icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', virulencia: 85, descripcion: 'Contenido editado o alterado para cambiar su significado original' },
    { id: 'sin_contexto', label: 'Sin contexto', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', virulencia: 60, descripcion: 'Contenido real usado fuera de su contexto temporal o situacional' },
    { id: 'no_verificable', label: 'No verificable', icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', virulencia: 35, descripcion: 'Información que no puede confirmarse con fuentes disponibles' },
    { id: 'teoria_conspirativa', label: 'Teoría conspirativa', icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', virulencia: 80, descripcion: 'Narrativas que sugieren conspiraciones sin evidencia sólida' },
    { id: 'discurso_odio_racismo', label: 'Racismo/Xenofobia', icon: Skull, color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300', virulencia: 95, descripcion: 'Contenido que promueve odio contra grupos raciales o étnicos' },
    { id: 'discurso_odio_sexismo', label: 'Sexismo/LGBTQ+fobia', icon: Ban, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 95, descripcion: 'Contenido discriminatorio por género u orientación sexual' },
    { id: 'discurso_odio_clasismo', label: 'Clasismo/Aporofobia', icon: DollarSign, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 90, descripcion: 'Discriminación basada en clase social o condición económica' },
    { id: 'discurso_odio_ableismo', label: 'Ableismo', icon: Shield, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', virulencia: 90, descripcion: 'Discriminación contra personas con discapacidades' },
    { id: 'incitacion_violencia', label: 'Incitación a la violencia', icon: Flame, color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-400', virulencia: 98, descripcion: 'Contenido que promueve o incita actos violentos' },
    { id: 'acoso_ciberbullying', label: 'Acoso/Ciberbullying', icon: Target, color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300', virulencia: 85, descripcion: 'Ataques sistemáticos contra individuos específicos en línea' },
    { id: 'contenido_prejuicioso', label: 'Contenido prejuicioso', icon: AlertTriangle, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', virulencia: 70, descripcion: 'Presenta sesgos evidentes sin considerar otras perspectivas' },
    { id: 'bot_coordinado', label: 'Bot/Coordinado', icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', virulencia: 65, descripcion: 'Contenido generado o amplificado por cuentas automatizadas' },
    { id: 'suplantacion_identidad', label: 'Suplantación de identidad', icon: User, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300', virulencia: 88, descripcion: 'Se hace pasar por otra persona, organización o medio legítimo' },
    { id: 'sensacionalista', label: 'Sensacionalista', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', virulencia: 55, descripcion: 'Exagera o dramatiza para generar clics o emociones fuertes' },
    { id: 'en_revision', label: 'En revisión', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', virulencia: 40, descripcion: 'Contenido pendiente de verificación adicional' }
];

interface CaseDiagnosisFormProps {
  caseId: string;
  initialMarkers: string[];
  onBack: () => void;
  onSubmit: (diagnosis: any) => void;
  isSubmitting: boolean;
}

export function CaseDiagnosisForm({ caseId, initialMarkers, onBack, onSubmit, isSubmitting }: CaseDiagnosisFormProps) {
    const [marcadoresDiagnostico, setMarcadoresDiagnostico] = useState<string[]>(initialMarkers);
    const [marcadoresJustificaciones, setMarcadoresJustificaciones] = useState<{ [key: string]: string }>({});
    const [marcadoresEnlaces, setMarcadoresEnlaces] = useState<{ [key: string]: string }>({});
    const [verificationNotes, setVerificationNotes] = useState('');

    const toggleMarcadorDiagnostico = (marcadorId: string) => {
        setMarcadoresDiagnostico(prev => {
            if (prev.includes(marcadorId)) {
                const newJustificaciones = { ...marcadoresJustificaciones };
                const newEnlaces = { ...marcadoresEnlaces };
                delete newJustificaciones[marcadorId];
                delete newEnlaces[marcadorId];
                setMarcadoresJustificaciones(newJustificaciones);
                setMarcadoresEnlaces(newEnlaces);
                return prev.filter(m => m !== marcadorId);
            } else {
                return [...prev, marcadorId];
            }
        });
    };

    const handleInternalSubmit = () => {
        const diagnosis = {
            caseId: caseId,
            marcadores: marcadoresDiagnostico,
            justificaciones: marcadoresJustificaciones,
            enlaces: marcadoresEnlaces,
            notas: verificationNotes,
        };
        onSubmit(diagnosis);
    };

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                        <Microscope className="h-6 w-6 text-primary" />
                        <span>Laboratorio de Diagnóstico Humano</span>
                    </CardTitle>
                    <CardDescription>Caso: {caseId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    <div>
                        <Label className="mb-4 flex items-center space-x-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span>Marcadores de Diagnóstico Desinfodémico</span>
                        </Label>
                        <p className="text-xs text-muted-foreground mb-4">Selecciona, justifica y respalda tu diagnóstico.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {ETIQUETAS_CATEGORIAS.map((marcador) => {
                                const Icon = marcador.icon;
                                const isSelected = marcadoresDiagnostico.includes(marcador.id);
                                return (
                                    <div key={marcador.id} className={`border-2 rounded-lg transition-all ${isSelected ? `${marcador.border} ${marcador.bg} shadow-sm` : 'border-gray-200 hover:border-primary/30 hover:bg-accent/30'}`}>
                                        <div className="flex items-start space-x-3 p-4 cursor-pointer" onClick={() => toggleMarcadorDiagnostico(marcador.id)}>
                                            <Checkbox checked={isSelected} onCheckedChange={() => toggleMarcadorDiagnostico(marcador.id)} className="mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <Icon className={`h-5 w-5 ${marcador.color}`} />
                                                    <Label className="cursor-pointer font-medium">{marcador.label}</Label>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{marcador.descripcion}</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="px-4 pb-4 space-y-3 border-t pt-3 mt-2">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground mb-1 flex items-center space-x-1"><MessageSquare className="h-3 w-3" /><span>Justificación:</span></Label>
                                                    <Textarea placeholder={`Explica por qué aplica "${marcador.label}"...`} value={marcadoresJustificaciones[marcador.id] || ''} onChange={(e) => setMarcadoresJustificaciones(prev => ({...prev, [marcador.id]: e.target.value}))} className="text-sm resize-none" rows={3} />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground mb-1 flex items-center space-x-1"><Link2 className="h-3 w-3" /><span>Enlace de soporte (opcional):</span></Label>
                                                    <Input type="url" placeholder="https://ejemplo.com/fuente" value={marcadoresEnlaces[marcador.id] || ''} onChange={(e) => setMarcadoresEnlaces(prev => ({...prev, [marcador.id]: e.target.value}))} className="text-sm" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <Label htmlFor="notes" className="mb-2 flex items-center space-x-2"><MessageSquare className="h-4 w-4 text-primary" /><span>Notas Adicionales del Diagnóstico</span></Label>
                        <Textarea id="notes" placeholder="Agrega observaciones generales..." value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} rows={4} className="resize-none" />
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                        <Button onClick={handleInternalSubmit} disabled={marcadoresDiagnostico.length === 0 || isSubmitting} size="lg">
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Enviando...' : 'Enviar Diagnóstico'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
