import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ResetPassword } from './components/ResetPassword';
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
import { JobStatusViewer } from './components/JobStatusViewer';
import { BannerExamples } from './components/BannerExamples';
import { useAnalysisPolling } from './hooks/useAnalysisPolling';
import { transformTextAnalysisToUI } from './services/analysisPresentationService';
import { searchService } from './services/searchService';
import { useAuth } from './providers/AuthProvider'; // Import the hook
import ProfilePage from './components/profile/ProfilePage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Map } from 'lucide-react';


type ViewState = 'upload' | 'verification' | 'review' | 'caseDetail' | 'mapa' | 'docs' | 'profile' | 'extension' | 'admin' | 'notifications' | 'status';

export default function App() {
  const { isAuthenticated, isLoading, signOut, profileComplete, profileChecked, checkUserProfile, isPasswordRecovery, clearPasswordRecovery, profile } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewState>('upload');
  const [uploadTab, setUploadTab] = useState('analysis');
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
      return <Register onRegister={() => setShowRegister(false)} onBackToLogin={() => setShowRegister(false)} />;
    }
    return <Login onGoToRegister={() => setShowRegister(true)} />;
  }

  // Profile Completion Check
  if (!profileChecked) {
    checkUserProfile();
    // Don't block render here, let auth provider handle state or use effect
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <Tabs value={uploadTab} onValueChange={setUploadTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="analysis">
                <Upload className="mr-2 h-4 w-4" />
                Análisis de Contenido
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="mr-2 h-4 w-4" />
                Mapa Desinfodémico
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
              {analysisPolling.analysisResult || analysisPolling.isLoading ? (
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
              ) : (
                <ContentUpload
                  jobId={currentJobId}
                  jobType={currentJobType}
                  onReset={() => {
                    setCurrentJobId(undefined);
                    setCurrentJobType(undefined);
                    setAnalysisInput('');
                  }}
                  onAnalyze={(content) => setAnalysisInput(content)}
                />
              )}
            </TabsContent>
            <TabsContent value="map">
              <MapaDesinfodemico />
            </TabsContent>
          </Tabs>
        );

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
        // Integración mínima: usar ProfilePage (estructura base)
        // Fase 9: Componente orquestador según plan
        return <ProfilePage />;

      case 'extension':
        return <ExtensionApp />;

      case 'admin':
        return <AdminDashboard />;

      case 'notifications':
        return <NotificationsView onViewTask={handleViewTask} />;

      case 'status':
        if (currentJobId && currentJobType) {
          return (
            <JobStatusViewer
              jobId={currentJobId}
              jobType={currentJobType}
              onComplete={(caseId, type) => {
                setCurrentJobId(caseId);
                setCurrentJobType(type);
                setActiveTab('caseDetail');
              }}
              onReset={() => {
                setCurrentJobId(undefined);
                setCurrentJobType(undefined);
                setActiveTab('review');
              }}
            />
          );
        }
        // Fallback to review if no job selected
        return <ContentReview onViewTask={handleViewTask} />;


      default:
        return null;
    }
  };

  const handleViewTask = async (jobId: string, type: string, status?: string) => {
    console.log('[handleViewTask] ===== NAVIGATION START =====');
    console.log('[handleViewTask] Input:', { jobId, type, status });
    console.log('[handleViewTask] Profile:', profile);
    console.log('[handleViewTask] User Role:', profile?.role);

    setCurrentJobId(jobId);
    setCurrentJobType(type);

    const userRole = profile?.role;
    const isCibernauta = userRole === 'Cibernauta';
    console.log('[handleViewTask] isCibernauta:', isCibernauta);

    if (status === 'completed' || status === 'success') {
      console.log('[handleViewTask] Status is COMPLETED/SUCCESS');
      if (isCibernauta) {
        try {
          // For Cibernauta, we need to check if the case has votes
          const caseData = await searchService.lookupCase(jobId, ['community']);
          if (caseData?.community?.votes > 0) {
            console.log('[handleViewTask] Cibernauta & votes > 0 -> caseDetail');
            setActiveTab('caseDetail');
          } else {
            console.log('[handleViewTask] Cibernauta & no votes -> upload (loading frame)');
            setActiveTab('upload');
          }
        } catch (error) {
          console.error('[handleViewTask] Case lookup failed for Cibernauta, falling back to upload view:', error);
          setActiveTab('upload');
        }
      } else {
        // For other roles, always go to the detailed view for validation.
        console.log('[handleViewTask] Non-Cibernauta -> caseDetail');
        setActiveTab('caseDetail');
      }
    } else if (status === 'failed') {
      console.log('[handleViewTask] Status is FAILED -> upload');
      setActiveTab('upload');
    } else if (status === 'processing') {
      console.log('[handleViewTask] Status is PROCESSING -> status');
      setActiveTab('status');
    } else {
      console.log('[handleViewTask] Status is UNKNOWN/PENDING -> upload');
      setActiveTab('upload');
    }
    console.log('[handleViewTask] ===== NAVIGATION END =====');
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