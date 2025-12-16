import { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '@/services/api';
import { Profile, ChallengeProgress } from '../types/profile';

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
                    if (response.data && response.data.nombre_completo) {
                        setProfile(response.data);
                        setChallenges(response.challenges_progress || []);
                    } else {
                        // Profile might exist but be incomplete
                        setProfile(response.data || {
                            id: user.id,
                            email: user.email,
                            nombre_completo: '',
                            departamento: '',
                            ciudad: '',
                            fecha_nacimiento: '',
                            reputation: 0,
                            xp: 0,
                            badges: [],
                            role: 'user',
                            photo: null,
                            avatar: null,
                            numero_telefono: null
                        });
                        setChallenges(response.challenges_progress || []);
                    }
            } catch (err: any) {
                 if (err.message.includes('404') || err.message.includes('Profile not found')) {
                    setIsEditing(true); 
                    setProfile({
                        id: user.id,
                        email: user.email!,
                        nombre_completo: '',
                        photo: null,
                        avatar: null,
                        numero_telefono: '',
                        departamento: '',
                        ciudad: '',
                        fecha_nacimiento: '',
                        reputation: 0,
                        xp: 0,
                        badges: [],
                        role: 'user'
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
                    setProfile({ ...profile!, photo: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSaveProfile = async (e: FormEvent) => {
        e.preventDefault();
        if (!profile || !profile.nombre_completo) {
            setError("El nombre completo es obligatorio.");
            return;
        }
        setError(null);

        try {
            const { xp, reputation, badges, email, id, role, ...updateData } = profile;
            const updated = await api.profile.update(session, updateData);
            setProfile(updated.data);
            setIsEditing(false);
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
        handleSaveProfile,
        fileInputRef
    };
};
