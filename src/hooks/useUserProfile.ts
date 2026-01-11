import { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '@/services/api';
import { Profile, ChallengeProgress } from '../types/profile';

/**
 * useUserProfile Hook - Updated for API v3.0.0
 * 
 * Fetches strict v3 profile data:
 * - Profile data (stats, badges, detailed info)
 * - Challenges progress
 */
export const useUserProfile = () => {
    const { user, session, checkUserProfile } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [challenges, setChallenges] = useState<ChallengeProgress[]>([]);
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
                // v3 returns { data: Profile, challenges_progress: [] }
                if (response && response.data) {
                    setProfile(response.data);
                    if (response.challenges_progress) {
                        setChallenges(response.challenges_progress);
                    }
                } else {
                    // Fallback or Handle 404/Empty if needed (usually 404 throws)
                }
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                if (err.message?.includes('404')) {
                    // Handle new user case if API throws 404 for uninitialized profiles
                    setIsEditing(true);
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
                    // Ideally we send base64 to API, for now update local state
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

    const handleSaveProfile = async (e?: FormEvent) => {
        if (e) e.preventDefault();

        if (!profile || !profile.nombre_completo) {
            setError("El nombre completo es obligatorio.");
            return;
        }
        setError(null);

        try {
            // Map to v3.0 API update fields
            const updateData = {
                nombre_completo: profile.nombre_completo,
                ciudad: profile.ciudad || undefined,
                // If avatar_url is a base64 string (from file upload), send it as 'avatar'
                // If it's a URL (from presets), v3 might need adaptation or we assume backend handles it
                avatar: profile.avatar_url?.startsWith('data:') ? profile.avatar_url : undefined
            };

            const response = await api.profile.update(session, updateData);

            // Update local state with response data if returned
            if (response && response.data) {
                setProfile(prev => prev ? { ...prev, ...response.data } : response.data);
            }

            setIsEditing(false);
            await checkUserProfile();

        } catch (err: any) {
            setError(err.message || "Failed to save profile.");
        }
    };

    return {
        profile,
        challenges, // Now populated from API v3
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
