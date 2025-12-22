import { useState, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { defaultAvatars, type DefaultAvatar } from '../assets/avatars';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from 'motion/react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { 
    Shield, Zap, User, Edit, Save, Trophy, Edit3, Camera, CheckCircle, Lock, 
    UserPlus, Copy, Share2, HeartPulse, Stethoscope, Crosshair, Siren, 
    TrendingDown, BarChart3, FileText, Users, Globe, Bot, Coffee, Gift, 
    Sparkles, Medal, Crown, Brain, Upload, Eye, Microscope, Syringe, Target, Flame, Clock
} from 'lucide-react';


// Define levels inside the component or import from a shared config
const levels = [
    { level: 1, title: 'VIGILANTE CENTINELA', subtitle: 'Primera Línea de Defensa', minXP: 0, maxXP: 500, color: 'bg-blue-500', badge: '👁️' },
    { level: 2, title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', subtitle: 'Analista de Contagio', minXP: 500, maxXP: 2000, color: 'bg-purple-500', badge: '🔬' },
    { level: 3, title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', subtitle: 'Educomunicador Estratégico', minXP: 2000, maxXP: 999999, color: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500', badge: '💉' }
];

export function UserProfile() {
    const {
        profile,
        challenges,
        isLoading,
        error,
        isEditing,
        setIsEditing,
        handleInputChange,
        handleFileChange,
        handleUploadClick,
        handleAvatarSelect,
        handleSaveProfile,
        fileInputRef
    } = useUserProfile();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [loadedAvatars, setLoadedAvatars] = useState<Array<{ avatar: DefaultAvatar, url: string }>>([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

    // Cargar avatares desde assets/avatars
    useEffect(() => {
        const loadAvatars = async () => {
            // Usar import.meta.glob para pre-cargar todos los SVG
            const avatarModules = import.meta.glob('../assets/avatars/*.svg', { eager: true, import: 'default' }) as Record<string, string>;

            const avatarPromises = defaultAvatars.map(async (avatar) => {
                const modulePath = `../assets/avatars/${avatar.filename}`;
                const url = avatarModules[modulePath];

                if (url) {
                    return { avatar, url };
                }

                return null;
            });

            const loaded = (await Promise.all(avatarPromises)).filter((item): item is { avatar: DefaultAvatar, url: string } => item !== null);

            setLoadedAvatars(loaded);
        };

        loadAvatars();
    }, []);

    if (isLoading) {
        return <div>Loading profile...</div>;
    }

    if (error && !profile) {
        return <div className="text-red-500">Error: {error}</div>;
    }
    
    if (!profile) {
        return <div>No profile data available.</div>;
    }

    const currentXP = profile.xp;
    const currentLevel = levels.find(l => currentXP >= l.minXP && currentXP < l.maxXP) || levels[0];
    const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
    const progressToNext = nextLevel ? ((currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 : 100;

    const getChallengeProgress = (challenge: any) => {
        const requirement = challenge.requirements.xp || challenge.requirements.reputation || 1;
        const current = challenge.current.xp || challenge.current.reputation || 0;
        return (current / requirement) * 100;
    };

    const avatarSrc = profile.photo || profile.avatar;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 relative"
        >
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                    >
                        <Card className="border-4 border-primary bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 shadow-2xl">
                            <CardContent className="p-8 text-center">
                                <div className="text-6xl mb-4">🎉🔬</div>
                                <h2 className="mb-2">¡OMBE, SUBISTE DE NIVEL PARCE!</h2>
                                <p className="text-lg mb-2">Ahora sos un/a:</p>
                                <Badge className="bg-purple-500 text-white text-lg px-4 py-2 mb-3">
                                    🔬 EPIDEMIÓLOGO DIGITAL VOLUNTARIO
                                </Badge>
                                <p className="text-sm text-muted-foreground mb-4">Ya puedes hacer diagnósticos completos y participar en misiones especiales</p>
                                <Badge className="bg-primary text-primary-foreground">+20 XP por análisis</Badge>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-4">
                    <img 
                        src={botilitoImage} 
                        alt="Botilito" 
                        className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
                    />
                    <div className="flex-1">
                        <p className="text-xl">
                            ¡Qué más parce! Este es tu espacio personal 👤✨
                        </p>
                        <p className="text-sm mt-1 opacity-80">
                            Acá está tu nivel, XP, insignias y misiones. Mientras más analices, más subes de nivel. ¡A darle con toda! 💪🏆
                        </p>
                    </div>
                </div>
            </div>

            <Card className="relative overflow-hidden border-2 border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent" />
                <CardContent className="pt-8 relative">
                    <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="relative"
                                >
                                    <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                                        <AvatarImage src={avatarSrc} alt={profile.full_name || ''} />
                                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                            {(profile.full_name || 'A').split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                        <Button 
                                            size="icon" 
                                            variant="outline" 
                                            className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-all"
                                            onClick={() => setShowAvatarModal(true)}
                                            title="Cambiar foto de perfil"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                                
                                <motion.div 
                                    className="absolute -top-2 -left-2"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <div className={`${currentLevel.color} text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg border-2 border-white`}>
                                        <div className="text-2xl">{currentLevel.badge}</div>
                                        <div className="text-xs">Nv.{currentLevel.level}</div>
                                    </div>
                                </motion.div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <h1 className="text-3xl">{profile.full_name}</h1>
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                                    <div className="flex items-center space-x-2 mt-3">
                                        <Badge className={`${currentLevel.color} text-white`}>
                                            {currentLevel.title}
                                        </Badge>
                                        {profile.city && <Badge variant="outline" className="text-xs">{profile.city}</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 italic">"{currentLevel.subtitle}"</p>
                                </div>
                                
                                <div className="w-80">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Experiencia (XP)</span>
                                        <span>{currentXP.toLocaleString()} / {nextLevel?.minXP.toLocaleString() || 'MAX'} XP</span>
                                    </div>
                                    <div className="relative">
                                        <Progress value={progressToNext} className="h-3" />
                                    </div>
                                    {nextLevel && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ¡Te faltan {(nextLevel.minXP - currentXP).toLocaleString()} XP para ser {nextLevel.title}!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Target className="h-5 w-5 text-primary" />
                                <span>Misiones y Desafíos Activos</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {challenges.map(challenge => (
                                    <li key={challenge.id} className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-gray-500'}`}>
                                            <Trophy className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{challenge.title}</p>
                                            <p className="text-xs text-muted-foreground">Requisito: {challenge.requirements.xp ? `${challenge.requirements.xp} XP` : `${challenge.requirements.reputation} Rep`}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Progress value={getChallengeProgress(challenge)} className="w-full" />
                                                <span className="text-xs">{challenge.current.xp || challenge.current.reputation}/{challenge.requirements.xp || challenge.requirements.reputation}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Información Personal</CardTitle>
                            {!isEditing && (
                                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                {error && <p className="text-red-500">{error}</p>}
                                <div className="space-y-1">
                                    <label htmlFor="full_name" className={`text-sm font-medium ${!profile.full_name ? 'text-red-600' : ''}`}>
                                        Nombre Completo {!profile.full_name && <span className="text-red-600">* (Requerido)</span>}
                                    </label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        placeholder="Nombre Completo"
                                        value={profile.full_name || ''}
                                        onChange={handleInputChange}
                                        className={!profile.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                                        autoFocus={!profile.full_name}
                                    />
                                </div>
                                <Input id="phone_number" name="phone_number" placeholder="Número de Teléfono" value={profile.phone_number || ''} onChange={handleInputChange} />
                                <Input id="state_province" name="state_province" placeholder="Departamento" value={profile.state_province || ''} onChange={handleInputChange} />
                                <Input id="city" name="city" placeholder="Ciudad" value={profile.city || ''} onChange={handleInputChange} />
                                <Input id="birth_date" name="birth_date" type="date" value={profile.birth_date || ''} onChange={handleInputChange} />
                                <Input id="email" name="email" value={profile.email || ''} disabled />
                                <div className="flex gap-2">
                                    <Button type="submit">Guardar Cambios</Button>
                                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4 text-sm">
                                <div className={`flex justify-between items-center ${!profile.full_name ? 'bg-red-50 p-2 rounded-md border border-red-200' : ''}`}>
                                    <strong className={!profile.full_name ? 'text-red-600' : ''}>
                                        Nombre: {!profile.full_name && <span className="text-red-600 text-xs">(Requerido)</span>}
                                    </strong>
                                    <span className={!profile.full_name ? 'text-red-600 font-medium' : ''}>
                                        {profile.full_name || '⚠️ Falta completar'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center"><strong>Email:</strong> <span>{profile.email}</span></div>
                                <Separator />
                                <div className="flex justify-between items-center"><strong>Teléfono:</strong> <span>{profile.phone_number || 'No especificado'}</span></div>
                                <Separator />
                                <div className="flex justify-between items-center"><strong>Ubicación:</strong> <span>{`${profile.city || ''}, ${profile.state_province || 'No especificado'}`}</span></div>
                                <Separator />
                                <div className="flex justify-between items-center"><strong>Fecha de Nacimiento:</strong> <span>{profile.birth_date || 'No especificado'}</span></div>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reputación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary">{profile.reputation}</div>
                                <p className="text-xs text-muted-foreground">Puntos de Reputación</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Insignias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {profile.badges.map(badge => <Badge key={badge} variant="secondary">{badge}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <AnimatePresence>
                {showAvatarModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAvatarModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-md w-full"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Camera className="h-5 w-5 text-primary" />
                                        <span>Cambiar Foto de Perfil</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Personaliza tu avatar epidemiológico
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Avatar Actual */}
                                    <div className="flex flex-col items-center space-y-3">
                                        <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                                            <AvatarImage src={avatarSrc} alt={profile.full_name || ''} />
                                            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                                {(profile.full_name || 'A').split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm text-muted-foreground text-center">
                                            {profile.full_name}
                                        </p>
                                    </div>

                                    <Separator />

                                    {/* Opciones de Cambio */}
                                    <div className="space-y-4">
                                        <Button 
                                            className="w-full" 
                                            variant="outline"
                                            onClick={handleUploadClick}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Subir nueva foto
                                        </Button>
                                        
                                        {loadedAvatars.length === 0 ? (
                                            <div className="text-center text-sm text-muted-foreground py-4">
                                                Cargando avatares...
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-6 px-4 py-2">
                                                {loadedAvatars.slice(0, 8).map(({ avatar, url }) => (
                                                    <motion.button
                                                        key={avatar.id}
                                                        onClick={() => {
                                                            setSelectedAvatarId(avatar.id);
                                                            handleAvatarSelect(url);
                                                        }}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="relative flex justify-center items-center w-24 h-24"
                                                        title={avatar.description}
                                                    >
                                                        {/* Fondo amarillo circular detrás */}
                                                        {selectedAvatarId === avatar.id && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute w-20 h-20 bg-[#ffda00] rounded-full"
                                                            />
                                                        )}
                                                        <Avatar className="h-16 w-16 border-0 shadow-lg relative z-10">
                                                            <AvatarImage src={url} alt={avatar.name} />
                                                            <AvatarFallback>
                                                                {avatar.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Botones de Acción */}
                                    <div className="flex space-x-2">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => {
                                                setShowAvatarModal(false);
                                                setSelectedAvatarId(null);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            className="flex-1 bg-primary hover:bg-primary/90"
                                            onClick={async (e) => {
                                                await handleSaveProfile(e);
                                                setShowAvatarModal(false);
                                                setSelectedAvatarId(null);
                                            }}
                                            disabled={!selectedAvatarId && !profile?.photo}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Guardar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/webp"
            />
        </motion.div>
    );
}