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
import { useAuth } from './providers/AuthProvider'; // Import the hook

export default function App() {
  const { isAuthenticated, isLoading, signOut, profileComplete, profileChecked, checkUserProfile } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    if (isAuthenticated) {
      checkUserProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only redirect to profile if we've checked and confirmed the profile is incomplete
    if (profileChecked && !profileComplete) {
      setActiveTab('profile');
    }
  }, [profileChecked, profileComplete]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowRegister(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const goToRegister = () => setShowRegister(true);
  const goToLogin = () => setShowRegister(false);

  // Show loading spinner while the AuthProvider is checking the session
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

  // If not authenticated, show the login or register screen
  if (!isAuthenticated) {
    if (showRegister) {
      // The onRegister and onLogin handlers are no longer needed here,
      // as the AuthProvider handles state changes automatically.
      return <Register onRegister={() => setShowRegister(false)} onBackToLogin={goToLogin} />;
    }
    return <Login onGoToRegister={goToRegister} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <ContentUpload />;
      case 'review':
        return <ContentReview />;
      case 'analysis':
        return <ContentAnalysisView contentToAnalyze="https://www.semana.com/nacion/articulo/atencion-campeon-mundial-de-patinaje-luz-mery-tristan-fue-asesinada-en-cali/202320/" />;
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
        
        {!profileComplete && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6" role="alert">
            <p className="font-bold">¡Casi listo!</p>
            <p>Por favor, completa tu perfil para continuar.</p>
          </div>
        )}

        <div className="transition-all duration-500 ease-in-out mx-auto p-[0px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}