import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit } from 'lucide-react';
import { Profile } from '@/types/profile';

interface PersonalInfoCardProps {
    profile: Profile;
    isEditing: boolean;
    onEditStart: () => void;
    onEditCancel: () => void;
    onSave: (e: React.FormEvent) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error: string | null;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
    profile,
    isEditing,
    onEditStart,
    onEditCancel,
    onSave,
    onInputChange,
    error
}) => {
    return (
        <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Información Personal</CardTitle>
                {!isEditing && (
                    <Button variant="ghost" size="icon" onClick={onEditStart}>
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <form onSubmit={onSave} className="space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label className="text-sm font-medium">Nombre Completo</label>
                            <Input name="nombre_completo" value={profile.nombre_completo || ''} onChange={onInputChange} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Departamento</label>
                            <Input name="departamento" value={profile.departamento || ''} onChange={onInputChange} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Ciudad</label>
                            <Input name="ciudad" value={profile.ciudad || ''} onChange={onInputChange} />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Guardar</Button>
                            <Button variant="ghost" onClick={onEditCancel}>Cancelar</Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><strong>Nombre:</strong><span>{profile.nombre_completo || 'No especificado'}</span></div>
                        <Separator />
                        <div className="flex justify-between"><strong>Email:</strong><span>{profile.email}</span></div>
                        <Separator />
                        <div className="flex justify-between"><strong>Ubicación:</strong><span>{profile.ciudad || ''}{profile.departamento ? `, ${profile.departamento}` : ''}</span></div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
