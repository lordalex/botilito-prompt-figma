import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '../../lib/apiService';
import { UserProfileData } from '../types';

// Import UI Components
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  User, Mail, Calendar, Shield, Trophy, Target, Activity, TrendingUp, Eye,
  CheckCircle, XCircle, AlertTriangle, Clock, Microscope, Skull, Ban, Flame,
  Award, Star, Lock, Camera, Edit3, Settings, Zap, Brain, Crown, Medal,
  Sparkles, Gift, Coffee, Bot, Globe, Users, FileText, BarChart3,
  TrendingDown, Siren, Crosshair, Stethoscope, HeartPulse, Syringe, Copy,
  Share2, UserPlus, Send, Upload, Save, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

// --- Hardcoded Gamification Data (can be moved to a separate config file later) ---
// NOTE: This data remains hardcoded for now as it's not part of the user profile schema.
// A future step could be to fetch this configuration from a CMS or a database table.

const levels = [
  { level: 1, title: 'VIGILANTE CENTINELA', subtitle: 'Primera Línea de Defensa', minXP: 0, maxXP: 500, color: 'bg-blue-500', badge: '👁️' },
  { level: 2, title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', subtitle: 'Analista de Contagio', minXP: 500, maxXP: 2000, color: 'bg-purple-500', badge: '🔬' },
  { level: 3, title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', subtitle: 'Educomunicador Estratégico', minXP: 2000, maxXP: 999999, color: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500', badge: '💉' }
];

const missions = [
  { id: 'escuadron-anti-panico', title: 'Misión: Escuadrón Anti-Pánico', description: 'Desmentir los 3 fakes más virales sobre la economía esta semana', xpReward: 150, progress: 1, target: 3, type: 'weekly', deadline: '2025-10-19', icon: <Shield className="h-5 w-5" />, color: 'bg-red-500', completed: false },
  { id: 'diagnostico-rapido', title: 'Desafío: Diagnóstico Rápido', description: 'Realiza 10 análisis esta semana', xpReward: 100, progress: 7, target: 10, type: 'weekly', deadline: '2025-10-19', icon: <Zap className="h-5 w-5" />, color: 'bg-yellow-500', completed: false },
];

// --- Component ---

export function UserProfile() {
  const { user, supabase, checkUserProfile } = useAuth(); // Get user and session from AuthProvider
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Start in editing mode if the profile is incomplete.
  const [isEditing, setIsEditing] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) throw new Error("Not authenticated");

        const data = await api.profile.get(session);
        setProfile(data);
        // If the full name is missing, automatically enter editing mode.
        if (!data.nombre_completo) {
          setIsEditing(true);
        }
      } catch (err: any) {
        // If profile doesn't exist (404), initialize a default one for editing
        if (err.message.includes('404') || err.message.includes('Profile not found')) {
          setError(null); // Clear error for 404 - this is expected for new users
          setIsEditing(true); // Force editing mode for new profiles
          setProfile({
            id: user.id,
            email: user.email,
            nombre_completo: '', // Start with an empty name to encourage completion
          });
        } else {
          // For other errors, show the error message
          setError(err.message || "Failed to fetch profile.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  // --- Event Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !profile.nombre_completo) {
      setError("Por favor, ingresa tu nombre completo.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("Not authenticated");

      const updatedProfile = await api.profile.update(session, profile);
      setProfile(updatedProfile);
      setIsEditing(false); // Exit editing mode on successful save
      await checkUserProfile(); // Re-check profile to update global state
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Cargando perfil...</p>
      </div>
    );
  }

  if (error && !profile) { // Only show full-page error if profile couldn't be initialized
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="mr-2" /> Error al Cargar Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Intentar de Nuevo</Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return <p>No profile data available.</p>; // Should not happen if logic is correct
  }

  // Gamification calculations (using placeholder values for now)
  const currentXP = 150; // Placeholder
  const currentLevel = levels.find(l => currentXP >= l.minXP && currentXP < l.maxXP) || levels[0];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const progressToNext = nextLevel ? ((currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Botilito Welcome Message */}
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg flex items-center space-x-4">
        <img src={botilitoImage} alt="Botilito" className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]" />
        <div>
          <p className="text-xl">¡Qué más parce! Este es tu espacio personal 👤✨</p>
          <p className="text-sm mt-1 opacity-80">Acá podés ver y actualizar tus datos. ¡Mantené tu perfil al día!</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="relative overflow-hidden border-2 border-primary/20">
        <CardContent className="pt-8">
          <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}&backgroundColor=ffda00`} alt={profile.nombre_completo || ''} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {(profile.nombre_completo || 'A').split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl">{profile.nombre_completo}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex items-center space-x-2 mt-3">
                <Badge className={`${currentLevel.color} text-white`}>{currentLevel.title}</Badge>
                {profile.ciudad && <Badge variant="outline" className="text-xs">{profile.ciudad}</Badge>}
              </div>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Form or Display */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información del Perfil</CardTitle>
              <CardDescription>Aquí están tus datos personales. Mantenlos actualizados.</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre_completo">Nombre Completo</Label>
                      <Input id="nombre_completo" name="nombre_completo" value={profile.nombre_completo || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero_telefono">Número de Teléfono</Label>
                      <Input id="numero_telefono" name="numero_telefono" value={profile.numero_telefono || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input id="departamento" name="departamento" value={profile.departamento || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input id="ciudad" name="ciudad" value={profile.ciudad || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                      <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={profile.fecha_nacimiento || ''} onChange={handleInputChange} />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={profile.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex flex-col md:flex-row md:justify-end gap-3 md:gap-4">
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="w-full md:w-auto">Cancelar</Button>
                    <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><strong>Nombre:</strong> <span>{profile.nombre_completo || 'No especificado'}</span></div>
                  <Separator />
                  <div className="flex justify-between items-center"><strong>Email:</strong> <span>{profile.email}</span></div>
                  <Separator />
                  <div className="flex justify-between items-center"><strong>Teléfono:</strong> <span>{profile.numero_telefono || 'No especificado'}</span></div>
                  <Separator />
                  <div className="flex justify-between items-center"><strong>Ubicación:</strong> <span>{`${profile.ciudad || ''}, ${profile.departamento || 'No especificado'}`}</span></div>
                  <Separator />
                  <div className="flex justify-between items-center"><strong>Fecha de Nacimiento:</strong> <span>{profile.fecha_nacimiento || 'No especificado'}</span></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gamification: Missions (Static for now) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Misiones y Desafíos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {missions.map((mission) => (
                <div key={mission.id} className="p-4 rounded-lg border-2 border-primary/20">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`p-2 rounded-full ${mission.color} text-white`}>{mission.icon}</div>
                    <div>
                      <h4 className="font-medium text-sm">{mission.title}</h4>
                      <p className="text-xs text-muted-foreground">{mission.description}</p>
                    </div>
                  </div>
                  <Progress value={(mission.progress / mission.target) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Gamification Stats (Static for now) */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Nivel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Experiencia (XP)</span>
                  <span>{currentXP} / {nextLevel?.minXP || 'MAX'}</span>
                </div>
                <Progress value={progressToNext} className="h-3" />
                {nextLevel && <p className="text-xs text-muted-foreground mt-1">Faltan {nextLevel.minXP - currentXP} XP para el siguiente nivel.</p>}
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-2xl">#{'87'}</div>
                <div className="text-sm text-muted-foreground">de {'1250'} vigilantes</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Insignias</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Trophy className="h-10 w-10 text-yellow-500" />
              <Shield className="h-10 w-10 text-blue-500" />
              <Star className="h-10 w-10 text-green-500" />
              <Lock className="h-10 w-10 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}