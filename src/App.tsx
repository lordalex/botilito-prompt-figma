import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { CompleteDashboard } from './components/CompleteDashboard';
import { ContentUpload } from './components/ContentUpload';
import { ContentReview } from './components/ContentReview';
import { ContentAnalysisView } from './components/ContentAnalysisView';
import { HumanVerification } from './components/HumanVerification';
import { UserProfile } from './components/UserProfile';
import { Navigation } from './components/Navigation';
import { ExtensionApp } from './components/extension/ExtensionApp';
import { MapaDesinfodemico } from './components/MapaDesinfodemico';
import { DocumentacionIndicadores } from './components/DocumentacionIndicadores';
import { ImmunizationStudio } from './components/ImmunizationStudio';
import { getSession, onAuthStateChange, signOut } from './utils/supabase/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setShowRegister(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const goToRegister = () => {
    setShowRegister(true);
  };

  const goToLogin = () => {
    setShowRegister(false);
  };

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-black text-lg font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar la pantalla de login o registro
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onRegister={handleRegister} 
          onBackToLogin={goToLogin}
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onGoToRegister={goToRegister}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <ContentUpload />;
      case 'review':
        return <ContentReview />;
      case 'analysis':
        return <ContentAnalysisView />;
      case 'verification':
        return <HumanVerification />;
      case 'immunization':
        return <ImmunizationStudio />;
      case 'mapa':
        return <MapaDesinfodemico />;
      case 'docs':
        return <DocumentacionIndicadores />;
      case 'profile':
        return <UserProfile />;
      case 'extension':
        return <ExtensionApp />;
      default:
        return <ContentUpload />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="max-w-[1600px] mx-auto px-4 py-6 relative min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-muted/20">
        {/* Div separador superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        
        <div className="transition-all duration-500 ease-in-out mx-auto p-[0px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}