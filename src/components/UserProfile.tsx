import { useState, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { defaultAvatars, type DefaultAvatar } from '../assets/avatars';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from 'motion/react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Target, Edit, Camera, CheckCircle, Upload, Bell, Flame } from 'lucide-react';
import { useNotifications } from '@/providers/NotificationProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Role display mapping
const roleDisplay: Record<string, string> = {
    cibernauta: 'CIBERNAUTA',
    epidemiologo: 'EPIDEMIÓLOGO',
    director: 'DIRECTOR'
};

// Level tiers based on XP
const getLevelInfo = (xp: number) => {
    if (xp >= 2000) return { level: 3, title: 'ESPECIALISTA', nextXP: 999999, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' };
    if (xp >= 500) return { level: 2, title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', nextXP: 2000, color: 'bg-purple-500' };
    return { level: 1, title: 'VIGILANTE CENTINELA', nextXP: 500, color: 'bg-blue-500' };
};

export function UserProfile() {
    const {
        profile, challenges, isLoading, error, isEditing, setIsEditing,
        handleInputChange, handleFileChange, handleUploadClick, handleAvatarSelect,
        handleSaveProfile, fileInputRef
    } = useUserProfile();
    const { pollingInterval, setPollingInterval } = useNotifications();
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [loadedAvatars, setLoadedAvatars] = useState<Array<{ avatar: DefaultAvatar, url: string }>>([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

    useEffect(() => {
        const loadAvatars = async () => {
            const avatarModules = import.meta.glob('../assets/avatars/*.svg', { eager: true, import: 'default' }) as Record<string, string>;
            const loaded = defaultAvatars.map(avatar => {
                const url = avatarModules[`../assets/avatars/${avatar.filename}`];
                return url ? { avatar, url } : null;
            }).filter((item): item is { avatar: DefaultAvatar, url: string } => item !== null);
            setLoadedAvatars(loaded);
        };
        loadAvatars();
    }, []);

    if (isLoading) return <div className="flex items-center justify-center h-64">Cargando perfil...</div>;
    if (error && !profile) return <div className="text-red-500 p-4">Error: {error}</div>;
    if (!profile) return <div className="p-4">No hay datos de perfil.</div>;

    const levelInfo = getLevelInfo(profile.xp || 0);
    const xpProgress = levelInfo.nextXP < 999999 ? ((profile.xp || 0) / levelInfo.nextXP) * 100 : 100;
    const xpRemaining = levelInfo.nextXP - (profile.xp || 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Yellow Banner */}
            <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <img src={botilitoImage} alt="Botilito" className="w-16 h-16 object-contain" />
                    <div>
                        <p className="text-lg font-semibold">¡Qué más parce! Este es tu espacio personal 👤✨</p>
                        <p className="text-sm opacity-80">Acá está tu nivel, XP, insignias y misiones. Mientras más analices, más subes de nivel. ¡A darle con toda! 💪🏆</p>
                    </div>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card className="border-2 border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar with Level Badge */}
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-gray-100">
                                <AvatarImage src={profile.avatar_url || ''} />
                                <AvatarFallback className="bg-yellow-400 text-xl">
                                    {(profile.nombre_completo || 'U')[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -left-1 ${levelInfo.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                                Nv.{levelInfo.level}
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white"
                                onClick={() => setShowAvatarModal(true)}
                            >
                                <Camera className="h-3 w-3" />
                            </Button>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 space-y-2">
                            <h2 className="text-2xl font-bold">{profile.nombre_completo || 'Usuario'}</h2>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                            <div className="flex items-center gap-2">
                                <Badge className={`${levelInfo.color} text-white`}>{roleDisplay[profile.role] || 'CIBERNAUTA'}</Badge>
                                {profile.ciudad && <Badge variant="outline">{profile.ciudad}</Badge>}
                            </div>
                            <p className="text-xs text-gray-400 italic">"Primera Línea de Defensa"</p>

                            {/* XP Progress */}
                            <div className="max-w-sm pt-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Experiencia (XP)</span>
                                    <span>{profile.xp || 0} / {levelInfo.nextXP} XP</span>
                                </div>
                                <Progress value={xpProgress} className="h-2" />
                                {xpRemaining > 0 && xpRemaining < 999999 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        ¡Te faltan {xpRemaining} XP para ser {levelInfo.title}!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Missions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-4 w-4 text-yellow-500" />
                                Misiones y Desafíos Activos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {challenges && challenges.length > 0 ? (
                                <ul className="space-y-3">
                                    {challenges.map((c: any) => (
                                        <li key={c.id} className="text-sm">{c.title}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400">No hay misiones activas.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Personal Info */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Información Personal</CardTitle>
                            {!isEditing && (
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    <div>
                                        <label className="text-sm font-medium">Nombre Completo</label>
                                        <Input name="nombre_completo" value={profile.nombre_completo || ''} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Departamento</label>
                                        <Input name="departamento" value={profile.departamento || ''} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Ciudad</label>
                                        <Input name="ciudad" value={profile.ciudad || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit">Guardar</Button>
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
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
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Reputation */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Reputación</CardTitle></CardHeader>
                        <CardContent className="text-center">
                            <div className="text-4xl font-bold text-yellow-500">{profile.reputation || 0}</div>
                            <p className="text-xs text-gray-500">Puntos de Reputación</p>
                        </CardContent>
                    </Card>

                    {/* Insignias */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Insignias</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400">Sin insignias aún.</p>
                        </CardContent>
                    </Card>

                    {/* Notifications Config */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bell className="h-4 w-4" />
                                Configuración de Notificaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Frecuencia de Actualización</p>
                                    <p className="text-xs text-gray-500">Cada cuánto buscamos nuevas alertas.</p>
                                </div>
                                <Select value={pollingInterval.toString()} onValueChange={(v) => setPollingInterval(parseInt(v))}>
                                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30000">Normal (30s)</SelectItem>
                                        <SelectItem value="60000">Lento (1m)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Avatar Modal */}
            <AnimatePresence>
                {showAvatarModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAvatarModal(false)}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()} className="max-w-md w-full">
                            <Card>
                                <CardHeader><CardTitle>Cambiar Avatar</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <Button variant="outline" className="w-full" onClick={handleUploadClick}>
                                        <Upload className="h-4 w-4 mr-2" />Subir foto
                                    </Button>
                                    <div className="grid grid-cols-4 gap-4">
                                        {loadedAvatars.map(({ avatar, url }) => (
                                            <button key={avatar.id} onClick={() => { setSelectedAvatarId(avatar.id); handleAvatarSelect(url); }}
                                                className={`p-1 rounded-full ${selectedAvatarId === avatar.id ? 'ring-2 ring-yellow-400' : ''}`}>
                                                <Avatar className="h-12 w-12"><AvatarImage src={url} /></Avatar>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setShowAvatarModal(false)}>Cancelar</Button>
                                        <Button className="flex-1" onClick={async (e) => { await handleSaveProfile(e); setShowAvatarModal(false); }}>
                                            <CheckCircle className="h-4 w-4 mr-2" />Guardar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
        </motion.div>
    );
}