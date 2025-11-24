import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, onAuthStateChange, signOut as supabaseSignOut, AuthUser } from '../utils/supabase/auth';
import { supabase } from '../utils/supabase/client'; // Import the client
import { api } from '../../lib/apiService'; // Import the API service

/**
 * Defines the shape of the authentication context provided to the app.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  profileComplete: boolean;
  checkUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  // We expose the raw Supabase client for other hooks/components that might need it.
  supabase: typeof supabase;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  const checkUserProfile = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (session?.user) {
      try {
        const profile = await api.profile.get(session);
        if (profile && profile.nombre_completo) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }
      } catch (error: any) {
        // A 404 or similar error means the profile doesn't exist, so it's incomplete.
        if (error.message.includes('404') || error.message.includes('Profile not found')) {
          console.log('ℹ️ Profile not found - user needs to complete onboarding');
          setProfileComplete(false);
        } else {
          console.error("An unexpected error occurred fetching profile:", error);
          setProfileComplete(false); // Default to incomplete on other errors
        }
      }
    } else {
      setProfileComplete(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async (event: string, session: any) => {
      if (!isMounted) return;

      const currentUser = session?.user as AuthUser | null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);

      if (currentUser) {
        await checkUserProfile();
      } else {
        setProfileComplete(false);
      }
      setIsLoading(false);
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange('INITIAL_SESSION', session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthChange(event, session);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabaseSignOut();
      // Clear local state immediately
      setUser(null);
      setIsAuthenticated(false);
      setProfileComplete(false);

      // Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();
      deleteAllCookies();

      // Reload the page to ensure a clean state
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    profileComplete,
    checkUserProfile,
    signOut,
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
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