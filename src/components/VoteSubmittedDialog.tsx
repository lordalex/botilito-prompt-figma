import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface VoteSubmittedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoteSubmittedDialog({ isOpen, onClose }: VoteSubmittedDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md border-4 border-primary shadow-2xl" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="relative z-10">
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="relative">
                <img src={botilitoImage} alt="Botilito" className="w-32 h-32 object-contain"/>
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 animate-pulse-glow">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </div>
              <DialogTitle className="text-center text-3xl">¡Gracias por tu voto!</DialogTitle>
              <DialogDescription className="text-center text-lg">Tu diagnóstico ha sido enviado y se está procesando. ¡Tu contribución es muy importante!</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4 relative z-10">
            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6">
              <CheckCircle className="mr-2 h-5 w-5" />
              Continuar
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
