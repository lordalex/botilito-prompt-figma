import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Upload, CheckCircle } from 'lucide-react';
import { defaultAvatars } from '../../assets/avatars';

const avatarSvgs = import.meta.glob('../../assets/avatars/*.svg', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

interface AvatarSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;

    // Legacy API (profile-legacy)
    onUploadClick?: () => void;
    loadedAvatars?: Array<{ avatar: any; url: string }>;
    selectedAvatarId?: string | null;
    onAvatarSelect?: (url: string, id: string) => void;
    onSave: (() => Promise<void>) | ((newAvatarUrl: string) => Promise<void>);

    // New API (profile)
    currentAvatarUrl?: string;
    onAvatarChange?: (newAvatarUrl: string) => void;
}

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
    isOpen,
    onClose,
    onUploadClick,
    loadedAvatars,
    selectedAvatarId,
    onAvatarSelect,
    onSave,
    currentAvatarUrl,
    onAvatarChange,
}) => {
    const safeLoadedAvatars = useMemo(
        () => (Array.isArray(loadedAvatars) ? loadedAvatars : []),
        [loadedAvatars]
    );

    const [internalAvatars, setInternalAvatars] = useState<Array<{ avatar: any; url: string }>>([]);
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const [internalSelectedUrl, setInternalSelectedUrl] = useState<string>(currentAvatarUrl ?? '');

    // If no avatars are provided (new ProfileHeader path), load defaults.
    useEffect(() => {
        if (!isOpen) return;
        if (safeLoadedAvatars.length > 0) return;

        const results = defaultAvatars
            .map((a) => {
                const key = `../../assets/avatars/${a.filename}`;
                const url = avatarSvgs[key] ?? '';
                return { avatar: a, url };
            })
            .filter((r) => typeof r.url === 'string' && r.url !== '');

        setInternalAvatars(results);
    }, [isOpen, safeLoadedAvatars.length]);

    useEffect(() => {
        if (!isOpen) return;
        if (typeof currentAvatarUrl === 'string') {
            setInternalSelectedUrl(currentAvatarUrl);
        }
    }, [isOpen, currentAvatarUrl]);

    const avatarsToRender = safeLoadedAvatars.length > 0 ? safeLoadedAvatars : internalAvatars;
    const effectiveSelectedId = selectedAvatarId ?? internalSelectedId;

    const handleSelect = (url: string, id: string) => {
        if (onAvatarSelect) {
            onAvatarSelect(url, id);
            return;
        }
        setInternalSelectedId(id);
        setInternalSelectedUrl(url);

        // Actualizar avatar inmediatamente en ProfileHeader (optimistic update)
        if (onAvatarChange) {
            onAvatarChange(url);
        }
    };

    const handleSave = async () => {
        // Legacy onSave() vs new onSave(url)
        if (typeof currentAvatarUrl === 'string' || (onSave as any).length >= 1) {
            await (onSave as (newAvatarUrl: string) => Promise<void>)(internalSelectedUrl);
            return;
        }
        await (onSave as () => Promise<void>)();
    };

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
                                <Button variant="outline" className="w-full" onClick={onUploadClick} disabled={!onUploadClick}>
                                    <Upload className="h-4 w-4 mr-2" />Subir foto
                                </Button>
                                <div className="grid grid-cols-4 gap-4">
                                    {avatarsToRender.map(({ avatar, url }) => (
                                        <button key={avatar.id} onClick={() => handleSelect(url, avatar.id)}
                                            className={`p-1 rounded-full ${effectiveSelectedId === avatar.id ? 'ring-2 ring-yellow-400' : ''}`}>
                                            <Avatar className="h-12 w-12"><AvatarImage src={url} /></Avatar>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
                                    <Button className="flex-1" onClick={async () => { await handleSave(); onClose(); }}>
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
