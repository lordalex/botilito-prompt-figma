// src/components/AvatarUploader.tsx
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { resizeAndEncodeImage } from '../utils/imageUtils';
import { Loader2, Upload } from 'lucide-react';

interface AvatarUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (base64Image: string) => Promise<void>;
  currentAvatar: string | null | undefined;
  userName: string | null | undefined;
}

export function AvatarUploader({ isOpen, onClose, onSave, currentAvatar, userName }: AvatarUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    try {
      const base64String = await resizeAndEncodeImage(file);
      setPreview(base64String);
      setSelectedFile(file);
    } catch (err: any) {
      setError(err.message || 'Failed to process image.');
      setPreview(null);
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onSave(preview);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save avatar.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setPreview(null);
        setSelectedFile(null);
        setError(null);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Avatar</DialogTitle>
          <DialogDescription>Sube una nueva imagen para tu perfil. La imagen será redimensionada.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
              <AvatarImage src={preview || currentAvatar || ''} alt={userName || ''} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {(userName || 'A').split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div>
            <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo (PNG, GIF, SVG)
            </label>
            <div className="flex items-center space-x-2">
                <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/png, image/gif, image/svg+xml"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="flex-grow"
                />
                {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!preview || isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Avatar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
