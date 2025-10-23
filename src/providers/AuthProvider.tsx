import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, onAuthStateChange, signOut as supabaseSignOut, AuthUser } from '../utils/supabase/auth';
import { supabase } from '../utils/supabase/client'; // Import the client

/**
 * Defines the shape of the authentication context provided to the app.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  signOut: () => Promise<void>;
  // We expose the raw Supabase client for other hooks/components that might need it.
  supabase: typeof supabase; 
}

// Create the context with an undefined default value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * The AuthProvider component manages the authentication state.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const session = await getSession();
        if (isMounted) {
          const currentUser = session?.user as AuthUser | null;
          setIsAuthenticated(!!session);
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = onAuthStateChange((user) => {
      if (isMounted) {
        setIsAuthenticated(!!user);
        setUser(user);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabaseSignOut();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
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
