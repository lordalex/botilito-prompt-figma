import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { lookupCase } from '@/services/vectorAsyncService';
import { ContentUploadResult } from './ContentUploadResult';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { ScrollArea } from './ui/scroll-area';

interface CaseDetailDialogProps {
  caseId: string | null;
  onClose: () => void;
}

export function CaseDetailDialog({ caseId, onClose }: CaseDetailDialogProps) {
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      setCaseData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const rawData = await lookupCase(caseId);
        if (!rawData) throw new Error("Caso no encontrado");
        setCaseData(rawData);
      } catch (err: any) {
        setError("No se pudo cargar la información del caso.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  if (!caseId) return null;

  return (
    <Dialog open={!!caseId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 gap-0 bg-[#F8F9FA] border-none shadow-2xl rounded-xl overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Detalle del Caso</DialogTitle>
        
        {/* Header - Matching Figma */}
        <div className="w-full bg-[#FFE97A] border-b border-[#FFDA00] px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full border-2 border-[#FFDA00] flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={botilitoImage} alt="Botilito" className="w-10 h-10 object-contain" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">¡Qué más parce! Este es el análisis AMI completo 🕵️‍♂️</h2>
                    <p className="text-xs text-gray-700 font-medium">Contenido analizado desde la perspectiva de Alfabetización Mediática e Informacional.</p>
                </div>
            </div>
            <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/10"><X className="h-4 w-4 text-gray-800" /></Button>
            </DialogClose>
        </div>
        
        <ScrollArea className="flex-1 w-full bg-[#F8F9FA]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full w-full py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDA00]"></div>
              <p className="mt-4 text-gray-500 font-medium">Cargando análisis unificado...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-full w-full py-20">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-gray-900 font-bold">{error}</p>
            </div>
          )}
          
          {!loading && !error && caseData && (
            <ContentUploadResult 
              result={caseData} 
              onReset={() => onClose()} 
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
