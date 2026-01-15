import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, Trophy, Medal, Award, Star } from 'lucide-react';
import { Profile } from '@/types/profile';

// Role display mapping
const roleDisplay: Record<string, string> = {
    cibernauta: 'CIBERNAUTA',
    epidemiologo: 'EPIDEMIÓLOGO',
    director: 'DIRECTOR'
};

interface ProfileHeaderProps {
    profile: Profile;
    levelInfo: {
        level: number;
        title: string;
        nextXP: number;
        color: string;
    };
    onAvatarClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, levelInfo, onAvatarClick }) => {
    // Prefer data from API v3 stats if available, else fallback to local calculation
    const currentXP = profile.stats?.next_rank_progress?.current ?? profile.xp ?? 0;
    const targetXP = profile.stats?.next_rank_progress?.target ?? levelInfo.nextXP;
    const nextRankLabel = profile.stats?.next_rank_progress?.label ?? levelInfo.title;

    const xpProgress = targetXP > 0 ? (currentXP / targetXP) * 100 : 100;
    const xpRemaining = targetXP - currentXP;

    // Stats for the yellow card
    const immunizationPoints = profile.xp; // OR profile.stats?.total_immunization_points if that existed, but XP is PI.
    const globalRank = profile.stats?.global_ranking ?? '-';
    const totalUsers = profile.stats?.total_users ?? '-';

    return (
        <Card className="border-2 border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Left Section: User Info (Grow to fill) */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                        <div className="flex items-start gap-6">
                            {/* Avatar with Level Badge */}
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-24 w-24 border-4 border-gray-100 ring-2 ring-white shadow-sm">
                                    <AvatarImage src={profile.avatar_url || ''} />
                                    <AvatarFallback className="bg-yellow-400 text-xl font-bold text-white">
                                        {(profile.nombre_completo || 'U')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-2 -left-2 ${levelInfo.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}>
                                    Nv.{levelInfo.level}
                                </div>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
                                    onClick={onAvatarClick}
                                >
                                    <Camera className="h-3 w-3 text-gray-500" />
                                </Button>
                            </div>

                            {/* User Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">{profile.nombre_completo || 'Usuario'}</h2>
                                <p className="text-sm text-gray-500 font-medium">{profile.email}</p>

                                <div className="flex items-center gap-2 pt-1 pb-2">
                                    <Badge className={`${levelInfo.color} text-white hover:${levelInfo.color} px-3 py-0.5 text-xs font-semibold uppercase tracking-wide`}>
                                        {roleDisplay[profile.role] || 'CIBERNAUTA'}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 px-3 py-0.5 text-xs">
                                        {profile.created_at ? `Desde ${new Date(profile.created_at).getFullYear()}` : '2024'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400 italic">"Primera Línea de Defensa"</p>

                                {/* XP Progress */}
                                <div className="max-w-md pt-3">
                                    <div className="flex justify-between text-xs font-bold mb-1.5 ">
                                        <span className="text-gray-700">Experiencia (XP)</span>
                                        <div className="flex items-end gap-1">
                                            <span className="text-gray-900 text-sm">{currentXP}</span>
                                            <span className="text-gray-400 font-normal">/ {targetXP} XP</span>
                                        </div>
                                    </div>
                                    <Progress value={xpProgress} className="h-2 bg-gray-100 [&>div]:bg-yellow-400" />
                                    {xpRemaining > 0 && (
                                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                            ¡Te faltan <span className="text-gray-600">{xpRemaining} XP</span> para ser {nextRankLabel}!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Immunization Points (Yellow Box) */}
                    <div className="w-full md:w-64 bg-yellow-400 p-6 flex flex-col items-center justify-center text-center text-gray-900 relative">
                        {/* Decorative Icon Background */}
                        <Trophy className="absolute text-yellow-500/30 w-32 h-32 -top-6 -right-6 rotate-12" />

                        <div className="relative z-10 flex flex-col items-center">
                            <Trophy className="h-8 w-8 mb-2 text-gray-900" />
                            <div className="text-4xl font-black tracking-tight">{Number(immunizationPoints).toLocaleString()}</div>
                            <div className="text-xs font-bold uppercase tracking-wider mt-1 opacity-80">Puntos de<br />Inmunización</div>
                            <div className="mt-4 text-[10px] font-medium bg-yellow-500/20 px-2 py-1 rounded">
                                Ranking #{globalRank} / {totalUsers}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section: Badges (Insignias) */}
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center gap-4">
                    <div className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        <span className="text-yellow-500">⚡</span> Insignias Ganadas ({profile.badges?.length || 0}/12)
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Render real badges loop or placeholder if array empty? 
                            Ideally map ID to icon. For now, we can render placeholders based on count.
                        */}
                        {profile.badges && profile.badges.length > 0 ? (
                            profile.badges.slice(0, 5).map((badgeId, idx) => (
                                <div key={badgeId + idx} className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200" title={badgeId}>
                                    <Medal className="w-3 h-3" />
                                </div>
                            ))
                        ) : (
                            <span className="text-[10px] text-gray-400">Sin insignias aún</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
