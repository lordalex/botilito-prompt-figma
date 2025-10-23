import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Sparkles, Trophy, Microscope, Flame, TrendingUp, Award, CheckCircle } from 'lucide-react';

interface VerificationSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gamificationData: any;
}

export function VerificationSuccessDialog({ isOpen, onClose, gamificationData }: VerificationSuccessDialogProps) {
  if (!gamificationData) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md border-4 border-primary shadow-2xl" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="relative z-10">
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="relative"><img src={botilitoImage} alt="Botilito" className="w-32 h-32 object-contain animate-bounce-subtle"/><div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 animate-pulse-glow"><Trophy className="h-6 w-6" /></div></div>
              <DialogTitle className="text-center text-3xl">¡Berraquísimo, parcero! 🎉</DialogTitle>
              <DialogDescription className="text-center text-lg">Tu diagnóstico está más afilado que un bisturí. ¡Sos una chimba contribuyendo a la inmunización digital del país! 💉💛</DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4 relative z-10">
            <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-2 border-primary rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2"><Sparkles className="h-6 w-6 text-primary animate-pulse" /><p className="text-sm text-muted-foreground">¡Ganaste XP!</p></div>
              <p className="text-5xl font-bold text-primary mb-1">+{gamificationData.pointsEarned}</p>
              <p className="text-sm text-muted-foreground">puntos de experiencia</p>
            </div>
            {gamificationData.newBadge && (
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-lg p-4 text-center border-2 border-yellow-500 shadow-lg animate-pulse-glow">
                <div className="flex items-center justify-center space-x-2 mb-2"><Award className="h-6 w-6 text-yellow-800" /><p className="text-yellow-900">¡Insignia Desbloqueada!</p></div>
                <div className="flex items-center justify-center space-x-2 mb-1"><span className="text-2xl">{gamificationData.newBadgeIcon}</span><p className="text-lg text-yellow-900">{gamificationData.newBadge}</p></div>
                <p className="text-xs text-yellow-800">{gamificationData.newBadgeDescription}</p>
              </div>
            )}
            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"><CheckCircle className="mr-2 h-5 w-5" />¡A darle duro al siguiente caso!</Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
