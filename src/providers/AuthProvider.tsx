import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, signOut as supabaseSignOut, AuthUser } from '../utils/supabase/auth';
import { supabase } from '../utils/supabase/client'; // Import the client
import { api } from '@/services/api'; // Import the API service
import { jobManager } from '../lib/JobManager';

/**
 * Defines the shape of the authentication context provided to the app.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profileComplete: boolean;
  profileChecked: boolean;
  checkUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  // We expose the raw Supabase client for other hooks/components that might need it.
  supabase: typeof supabase;
  session: Session | null;
}

// Create the context with an undefined default value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to delete all cookies
const deleteAllCookies = () => {
  const cookies = document.cookie.split("; ");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
};

/**
 * The AuthProvider component manages the authentication state.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);
    const [profileChecked, setProfileChecked] = useState(false);

    useEffect(() => {
        jobManager.setSession(session);
    }, [session]);

    const checkUserProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setProfileComplete(false);
            setProfileChecked(true);
            return;
        }
        try {
            const profile = await api.profile.get(session);
            if (profile && profile.data.full_name) {
                setProfileComplete(true);
            } else {
                setProfileComplete(false);
            }
        } catch (error: any) {
            if (error.message.includes('404') || error.message.includes('Profile not found')) {
                console.log('ℹ️ Profile not found - user needs to complete onboarding');
                setProfileComplete(false);
            } else {
                console.error("An unexpected error occurred fetching profile:", error);
                setProfileComplete(false);
            }
        }
        setProfileChecked(true);
    };

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await checkUserProfile();
            }
            setIsLoading(false);
        };

        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        profileComplete,
        profileChecked,
        checkUserProfile,
        signOut: supabase.auth.signOut,
        supabase,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to easily access the authentication context.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};