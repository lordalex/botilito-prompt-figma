import React, { useRef } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Share2, Download, Twitter, Facebook, MessageCircle, Linkedin, Bot, User,
  Newspaper, ExternalLink, Tag, XCircle, Skull, Ban, Flame, Target
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ContentUploadResultProps {
  result: any;
  onReset: () => void;
}

export function ContentUploadResult({ result, onReset }: ContentUploadResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    title, 
    summaryBotilito, 
    theme, 
    region, 
    caseNumber,
    consensusState,
    markersDetected,
    vectores,
    finalVerdict,
    fullResult
  } = result;

  const createdAt = fullResult.created_at;
  
  const handleDownloadImage = () => { alert("Función de descarga no implementada en este resumen."); };
  const shareOnTwitter = () => { alert("Función de compartir no implementada en este resumen."); };
  const shareOnFacebook = () => { alert("Función de compartir no implementada en este resumen."); };
  const shareOnWhatsApp = () => { alert("Función de compartir no implementada en este resumen."); };
  const shareOnLinkedIn = () => { alert("Función de compartir no implementada en este resumen."); };

  const getMarkerIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('falso')) return <XCircle className="h-4 w-4" />;
    if (lowerType.includes('odio') || lowerType.includes('xenofobia')) return <Skull className="h-4 w-4" />;
    if (lowerType.includes('violencia')) return <Ban className="h-4 w-4" />;
    if (lowerType.includes('sensacionalista')) return <Flame className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  const getMarkerColor = (type: string) => {
    // This function can be expanded with more colors based on all possible marker types
    const lowerType = type.toLowerCase();
    if (lowerType.includes('falso') || lowerType.includes('odio') || lowerType.includes('violencia')) return 'bg-red-500 hover:bg-red-600';
    if (lowerType.includes('sensacionalista') || lowerType.includes('engañoso')) return 'bg-orange-500 hover:bg-orange-600';
    if (lowerType.includes('manipulado')) return 'bg-purple-500 hover:bg-purple-600';
    return 'bg-gray-500 hover:bg-gray-600';
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 text-center md:text-left">
          <img src={botilitoImage} alt="Botilito" className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2 md:mb-[-18px] md:mr-[16px]"/>
          <div className="flex-1">
            <p className="text-lg md:text-xl font-semibold">¡Mis circuitos ya escanearon esto de arriba a abajo! 🔍⚡</p>
            <p className="text-sm mt-1 opacity-80">Ya le pasé este caso a mis parceros de carne y hueso de <span className="font-medium">Digital-IA</span> para que hagan su diagnóstico humano! 🤝</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="flex items-center space-x-2 text-xl md:text-2xl">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-bold">Diagnóstico Desinfodémico de Botilito</span>
            </CardTitle>
            <div className="flex flex-col items-start md:items-end space-y-1 w-full md:w-auto">
              <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                <Badge variant="outline" className="text-sm bg-[#ffe97a]">{`Caso: ${caseNumber}`}</Badge>
                {/* Other badges */}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString('es-CO')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/30 border-2 border-secondary/60 rounded-lg space-y-3">
            {title && (<div><Label>Titular de la noticia:</Label><div className="mt-1 p-3 bg-primary/20 border border-primary/40 rounded-lg"><p className="font-medium">{title}</p></div></div>)}
            {summaryBotilito?.summary && (<div><Label>Contenido analizado:</Label><p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{summaryBotilito.summary}</p></div>)}
          </div>
          <div><h4 className="text-lg md:text-xl font-semibold">Evaluación epidemiológica:</h4><p className="text-sm text-muted-foreground mt-1">{finalVerdict}</p></div>
          <div className="pt-6 border-t space-y-4">
            <Label className="flex items-center space-x-2 mb-3"><Share2 className="h-4 w-4 text-primary" /><span>¡Vamos a inmunizar a todo el país! Comparte este diagnóstico.</span></Label>
            <div className="flex flex-wrap items-center gap-3">
                <Button onClick={shareOnTwitter} size="icon" title="Compartir en Twitter/X" className="h-9 w-9 rounded-full bg-black hover:bg-gray-800 text-white no-hover-effect"><Twitter className="h-4 w-4" /></Button>
                <Button onClick={shareOnFacebook} size="icon" title="Compartir en Facebook" className="h-9 w-9 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white no-hover-effect"><Facebook className="h-4 w-4" /></Button>
                <Button onClick={shareOnWhatsApp} size="icon" title="Compartir en WhatsApp" className="h-9 w-9 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white no-hover-effect"><MessageCircle className="h-4 w-4" /></Button>
                <Button onClick={shareOnLinkedIn} size="icon" title="Compartir en LinkedIn" className="h-9 w-9 rounded-full bg-[#0A66C2] hover:bg-[#095bad] text-white no-hover-effect"><Linkedin className="h-4 w-4" /></Button>
                <div className="h-4 w-px bg-border mx-1"></div>
                <Button onClick={handleDownloadImage} size="sm" title="Descargar imagen resumen" className="rounded-[6px] bg-secondary hover:bg-primary text-primary-foreground px-4"><Download className="h-4 w-4 mr-2" /><span className="text-sm">Descargar</span></Button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
      <div className="flex">
        <Button onClick={onReset} className="bg-secondary hover:bg-primary text-primary-foreground transition-all duration-300">
          Quiero reportar otro contenido!
        </Button>
      </div>
    </div>
  );
}
