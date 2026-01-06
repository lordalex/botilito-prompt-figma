import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ResetPassword } from './components/ResetPassword';
import { CompleteDashboard } from './components/CompleteDashboard';
import { ContentUpload } from './components/ContentUpload';
import { ContentReview } from './components/ContentReview';
import { UnifiedAnalysisView } from './components/UnifiedAnalysisView';
import { HumanVerification } from './components/HumanVerification';
import { CaseDetailView } from './components/CaseDetailView';
import { UserProfile } from './components/UserProfile';
import { Navigation } from './components/Navigation';
import { ExtensionApp } from './components/extension/ExtensionApp';
import { MapaDesinfodemico } from './components/MapaDesinfodemico';
import { DocumentacionIndicadores } from './components/DocumentacionIndicadores';
import AdminDashboard from './components/AdminDashboard'; // Default export
import { NotificationsView } from './components/NotificationsView';
import { useAnalysisPolling } from './hooks/useAnalysisPolling';
import { transformTextAnalysisToUI } from './services/analysisPresentationService';
import { useAuth } from './providers/AuthProvider'; // Import the hook

type ViewState = 'upload' | 'verification' | 'review' | 'caseDetail' | 'mapa' | 'docs' | 'profile' | 'extension' | 'admin' | 'notifications';

export default function App() {
  const { isAuthenticated, isLoading, signOut, profileComplete, profileChecked, checkUserProfile, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewState>('upload');
  const [currentJobId, setCurrentJobId] = useState<string | undefined>();
  const [currentJobType, setCurrentJobType] = useState<string | undefined>();
  const [analysisInput, setAnalysisInput] = useState('');

  // Analysis Polling State
  const analysisPolling = useAnalysisPolling();

  // Watch for input change to trigger analysis
  useEffect(() => {
    if (analysisInput && !analysisPolling.isLoading && !analysisPolling.analysisResult) {
      analysisPolling.startNewAnalysis(analysisInput);
    }
  }, [analysisInput]);

  const handleNavigate = (view: ViewState) => {
    setActiveTab(view);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowRegister(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Authentication & Loading Handling
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isPasswordRecovery) {
      return <ResetPassword onBack={clearPasswordRecovery} />;
    }
    if (showRegister) {
      return <Register onLoginClick={() => setShowRegister(false)} />;
    }
    return <Login onRegisterClick={() => setShowRegister(true)} />;
  }

  // Profile Completion Check
  if (!profileChecked) {
    checkUserProfile();
    // Don't block render here, let auth provider handle state or use effect
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        // If we have an analysis result or are loading, show Unified View
        if (analysisPolling.analysisResult || analysisPolling.isLoading) {
          return (
            <div className="container mx-auto px-4 py-8">
              <UnifiedAnalysisView
                isLoading={analysisPolling.isLoading}
                progress={analysisPolling.progress}
                data={analysisPolling.analysisResult ? transformTextAnalysisToUI(analysisPolling.analysisResult.result) : null}
                contentType="text"
                mode="ai"
                onReset={() => {
                  analysisPolling.resetAnalysis();
                  setAnalysisInput('');
                }}
                onSubmitDiagnosis={() => { }}
                title={analysisPolling.analysisResult?.result?.title}
                timestamp={analysisPolling.analysisResult?.result?.created_at}
                caseNumber={analysisPolling.analysisResult?.result?.id?.slice(0, 8)}
                reportedBy="Botilito IA"
              />
            </div>
          );
        }
        // Otherwise show Input View
        return <ContentUpload
          jobId={currentJobId}
          jobType={currentJobType}
          onReset={() => {
            setCurrentJobId(undefined);
            setCurrentJobType(undefined);
            setAnalysisInput('');
          }}
          onAnalyze={(content) => setAnalysisInput(content)} // Assuming ContentUpload has this prop now or we need to adapt
        />;

      case 'verification':
        return <HumanVerification />;

      case 'review':
        return <ContentReview onViewTask={handleViewTask} />;

      case 'caseDetail':
        // Case detail view from Historial - uses UnifiedAnalysisView via CaseDetailView
        if (currentJobId) {
          return (
            <div className="container mx-auto px-4 py-8">
              <CaseDetailView
                caseId={currentJobId}
                mode="ai"
                onBackToList={() => {
                  setCurrentJobId(undefined);
                  setCurrentJobType(undefined);
                  setActiveTab('review');
                }}
                onVerificationSuccess={() => {
                  setCurrentJobId(undefined);
                  setActiveTab('review');
                }}
              />
            </div>
          );
        }
        // Fallback to review if no case selected
        return <ContentReview onViewTask={handleViewTask} />;

      case 'mapa':
        return <MapaDesinfodemico />;

      case 'docs':
        return <DocumentacionIndicadores />;

      case 'profile':
        return <UserProfile />;

      case 'extension':
        return <ExtensionApp />;

      case 'admin':
        return <AdminDashboard />;

      case 'notifications':
        return <NotificationsView onViewTask={handleViewTask} />;

      default:
        return null;
    }
  };

  const handleViewTask = (jobId: string, type: string, status?: string) => {
    setCurrentJobId(jobId);
    setCurrentJobType(type);

    // If task is completed (status 'completed' or 'success'), go to Case Detail (Historial style)
    if (status === 'completed' || status === 'success') {
      setActiveTab('caseDetail');
    } else {
      // Otherwise (pending, processing, etc), go to Upload View (Tracking style)
      setActiveTab('upload');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab as ViewState);
          // Only clear context if switching to non-analysis tabs
          if (!['upload', 'verification'].includes(tab)) {
            setCurrentJobId(undefined);
            setCurrentJobType(undefined);
          }
        }}
        onLogout={handleLogout}
        onViewTask={handleViewTask}
        onViewAllNotifications={() => setActiveTab('notifications')}
      />
      <main className="max-w-[1600px] mx-auto px-4 py-6 relative min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-muted/20">
        {/* Div separador superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>

        {profileChecked && !profileComplete && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6" role="alert">
            <p className="font-bold">¡Casi listo!</p>
            <p>Por favor, completa tu perfil para continuar. <strong>Falta: Nombre Completo</strong></p>
          </div>
        )}

        <div className="transition-all duration-500 ease-in-out mx-auto p-[0px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}