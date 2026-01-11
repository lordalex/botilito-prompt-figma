import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Upload, CheckCircle } from 'lucide-react';

interface AvatarSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadClick: () => void;
    loadedAvatars: Array<{ avatar: any, url: string }>;
    selectedAvatarId: string | null;
    onAvatarSelect: (url: string, id: string) => void;
    onSave: () => Promise<void>;
}

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
    isOpen,
    onClose,
    onUploadClick,
    loadedAvatars,
    selectedAvatarId,
    onAvatarSelect,
    onSave
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()} className="max-w-md w-full">
                        <Card>
                            <CardHeader><CardTitle>Cambiar Avatar</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" className="w-full" onClick={onUploadClick}>
                                    <Upload className="h-4 w-4 mr-2" />Subir foto
                                </Button>
                                <div className="grid grid-cols-4 gap-4">
                                    {loadedAvatars.map(({ avatar, url }) => (
                                        <button key={avatar.id} onClick={() => onAvatarSelect(url, avatar.id)}
                                            className={`p-1 rounded-full ${selectedAvatarId === avatar.id ? 'ring-2 ring-yellow-400' : ''}`}>
                                            <Avatar className="h-12 w-12"><AvatarImage src={url} /></Avatar>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                                    <Button className="flex-1" onClick={async () => { await onSave(); onClose(); }}>
                                        <CheckCircle className="h-4 w-4 mr-2" />Guardar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
