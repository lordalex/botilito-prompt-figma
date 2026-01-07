import { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '@/services/api';
import { Profile } from '../types/profile';

/**
 * useUserProfile Hook - Updated for profileCRUD v1.2.0
 * 
 * Uses ONLY v1.2.0 API fields:
 * - nombre_completo, departamento, ciudad, avatar_url
 * - xp, reputation, current_streak, profile_rewarded
 */
export const useUserProfile = () => {
    const { user, session, checkUserProfile } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await api.profile.get(session);
                if (response.data) {
                    setProfile(response.data);
                } else {
                    // Profile doesn't exist, create default
                    setProfile({
                        id: user.id,
                        email: user.email || '',
                        nombre_completo: null,
                        departamento: null,
                        ciudad: null,
                        role: 'cibernauta',
                        xp: 0,
                        reputation: 0,
                        current_streak: 0,
                        profile_rewarded: false,
                        avatar_url: null
                    });
                }
            } catch (err: any) {
                if (err.message.includes('404') || err.message.includes('Profile not found')) {
                    setIsEditing(true);
                    setProfile({
                        id: user.id,
                        email: user.email || '',
                        nombre_completo: null,
                        departamento: null,
                        ciudad: null,
                        role: 'cibernauta',
                        xp: 0,
                        reputation: 0,
                        current_streak: 0,
                        profile_rewarded: false,
                        avatar_url: null
                    });
                } else {
                    setError(err.message || "Failed to fetch profile.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user, session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (profile) {
            setProfile({ ...profile, [name]: value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    // Update avatar_url for v1.2.0 API
                    setProfile({ ...profile!, avatar_url: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        if (profile) {
            setProfile({ ...profile, avatar_url: avatarUrl });
        }
    };

    const handleSaveProfile = async (e: FormEvent) => {
        e.preventDefault();
        // Validate using v1.2.0 field name
        if (!profile || !profile.nombre_completo) {
            setError("El nombre completo es obligatorio.");
            return;
        }
        setError(null);

        try {
            // Map to v1.2.0 API fields
            const updateData = {
                full_name: profile.nombre_completo,
                state_province: profile.departamento,
                city: profile.ciudad,
                avatar: profile.avatar_url
            };

            const response = await api.profile.update(session, updateData);

            // Handle v1.2.0 response with gamification rewards
            setProfile(response.data);
            setIsEditing(false);

            // If profile completion bonus was awarded, show celebration
            if (response.reward_awarded) {
                console.log('🎉 +50 XP Awarded for completing profile!');
            }

            await checkUserProfile();
        } catch (err: any) {
            setError(err.message || "Failed to save profile.");
        }
    };

    return {
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
        fileInputRef,
        setProfile
    };
};
