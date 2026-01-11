import { useState, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { defaultAvatars, type DefaultAvatar } from '../assets/avatars';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '@/providers/NotificationProvider';

// Import modular components
import { ProfileBanner } from './profile/ProfileBanner';
import { ProfileHeader } from './profile/ProfileHeader';
import { StatsOverview } from './profile/StatsOverview';
import { MissionsCard } from './profile/MissionsCard';
import { ReputationCard } from './profile/ReputationCard';
import { BadgesGallery } from './profile/BadgesGallery';
import { ActivitySummary } from './profile/ActivitySummary';
import { PersonalInfoCard } from './profile/PersonalInfoCard';
import { NotificationSettingsCard } from './profile/NotificationSettingsCard';
import { AvatarSelectionModal } from './profile/AvatarSelectionModal';
import { ProfileNavBar } from './profile/ProfileNavBar';
import { LatestBadges } from './profile/LatestBadges';
import { AchievementsProgress } from './profile/AchievementsProgress';

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

    // Notifications hook
    const { pollingInterval, setPollingInterval } = useNotifications();

    // UI State
    const [activeTab, setActiveTab] = useState('resumen');
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [loadedAvatars, setLoadedAvatars] = useState<Array<{ avatar: DefaultAvatar, url: string }>>([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

    // Load avatar assets
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px]">
            {/* 1. Yellow Banner */}
            <ProfileBanner />

            {/* 2. Main Profile Header */}
            <ProfileHeader
                profile={profile}
                levelInfo={levelInfo}
                onAvatarClick={() => setShowAvatarModal(true)}
            />

            {/* 3. Stats Overview (4 Cards) */}
            <StatsOverview
                casesRegistered={profile.stats?.cases_registered ?? 0}
                validations={profile.stats?.validations_performed ?? 0}
                currentStreak={profile.current_streak || 0}
                ranking={profile.stats?.global_ranking ?? 0}
            />

            {/* 4. Tab Navigation */}
            <ProfileNavBar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* 5. Tab Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'resumen' && (
                        <div className="space-y-6">
                            {/* Summary Banner */}
                            <ActivitySummary streak={profile.current_streak} />

                            {/* Badges and Achievements */}
                            <div className="space-y-8">
                                <LatestBadges />
                                <AchievementsProgress challenges={challenges} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'insignias' && (
                        <div className="space-y-6">
                            <BadgesGallery />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ReputationCard reputation={profile.reputation} />
                                <MissionsCard challenges={challenges} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'logros' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold">Todos los Logros</h3>
                            <AchievementsProgress challenges={challenges} />
                            {/* Can expand this view later */}
                        </div>
                    )}

                    {activeTab === 'estadisticas' && (
                        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p>Gráficas detalladas próximamente...</p>
                        </div>
                    )}

                    {activeTab === 'configuracion' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PersonalInfoCard
                                profile={profile}
                                isEditing={isEditing}
                                onEditStart={() => setIsEditing(true)}
                                onEditCancel={() => setIsEditing(false)}
                                onSave={handleSaveProfile}
                                onInputChange={handleInputChange}
                                error={error}
                            />
                            <NotificationSettingsCard
                                pollingInterval={pollingInterval}
                                onPollingChange={setPollingInterval}
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Avatar Selection Modal */}
            <AvatarSelectionModal
                isOpen={showAvatarModal}
                onClose={() => setShowAvatarModal(false)}
                onUploadClick={handleUploadClick}
                loadedAvatars={loadedAvatars}
                selectedAvatarId={selectedAvatarId}
                onAvatarSelect={(url, id) => {
                    setSelectedAvatarId(id);
                    handleAvatarSelect(url);
                }}
                onSave={async () => {
                    await handleSaveProfile();
                }}
            />

            {/* Hidden File Input for Avatar Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
            />
        </motion.div>
    );
}