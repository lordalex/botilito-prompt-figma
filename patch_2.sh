#!/bin/bash

# --- Stage 2: Integrating the "Ingest" Flow & Dynamic Navigation ---

echo "🚀 Stage 2: Integrating analysis flow and dynamic navigation..."

# 1. Refactor ContentUpload.tsx
echo "📄 Updating src/components/ContentUpload.tsx..."
cat > ./src/components/ContentUpload.tsx << 'EOF'
import React, { useState } from 'react';
import { useJobTracker } from '../providers/JobTrackerProvider';

/**
 * A view for users to submit new content (URL or text) for analysis.
 * It uses the JobTrackerProvider to initiate the analysis process.
 */
export const ContentUpload = () => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startNewAnalysis } = useJobTracker();

  // Basic URL validation regex
  const isUrl = (text: string) => /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(text);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const analysisType = isUrl(content) ? 'URL' : 'Text';

    try {
      // The startNewAnalysis function returns the new job ID.
      // The App component will automatically switch views because
      // the activeJobId is set within the provider.
      await startNewAnalysis({ type: analysisType, content });
      // Clear the input on successful submission start
      setContent('');
    } catch (apiError: any) {
      setError(apiError.message || 'An unexpected error occurred.');
      console.error("Failed to start analysis:", apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Analizador de Contenido</h1>
      <p className="text-muted-foreground mb-8">
        Pega un enlace o un texto para iniciar un análisis desinfodémico completo.
      </p>

      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-md border">
        <div className="space-y-4">
          <label htmlFor="content-input" className="sr-only">Contenido a analizar</label>
          <textarea
            id="content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pega aquí un enlace o el texto que quieres analizar..."
            className="w-full h-32 p-4 border rounded-md resize-none bg-input-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                Iniciando...
              </>
            ) : (
              'Analizar Contenido'
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
      </form>
    </div>
  );
};
EOF

# 2. Refactor ContentAnalysisView.tsx
echo "📄 Updating src/components/ContentAnalysisView.tsx..."
cat > ./src/components/ContentAnalysisView.tsx << 'EOF'
import React from 'react';
import { useJobTracker } from '../providers/JobTrackerProvider';
// The detailed result display component will be built in Stage 3.
// import { SchemaDisplayer } from './display/SchemaDisplayer';

interface ContentAnalysisViewProps {
  jobId: string;
}

/**
 * Displays the state of a single analysis job.
 * It shows loading, error, or completed states.
 */
export const ContentAnalysisView = ({ jobId }: ContentAnalysisViewProps) => {
  const { jobs } = useJobTracker();
  const job = jobs[jobId];

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Trabajo no encontrado</h2>
        <p className="text-muted-foreground">El ID del trabajo no existe en el historial.</p>
      </div>
    );
  }

  // Render loading state
  if (job.status === 'pending' || job.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
        <h2 className="text-3xl font-bold mb-2">Analizando...</h2>
        <p className="text-muted-foreground max-w-md mb-4">
          Tu resultado estará listo en breve. Puedes navegar a otras pestañas, tu análisis continuará en segundo plano.
        </p>
        <p className="text-xs text-muted-foreground/50 font-mono">Job ID: {job.id}</p>
      </div>
    );
  }

  // Render error state
  if (job.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 flex items-center justify-center bg-destructive/10 rounded-full mb-6">
          <span className="text-5xl">⚠️</span>
        </div>
        <h2 className="text-3xl font-bold text-destructive mb-2">Error en el Análisis</h2>
        <p className="text-muted-foreground mb-4">
          No pudimos completar el análisis del contenido.
        </p>
        <div className="w-full max-w-lg p-4 bg-muted text-destructive-foreground rounded-md border border-destructive/20 font-mono text-sm text-left">
          {job.error || 'Ocurrió un error desconocido.'}
        </div>
      </div>
    );
  }

  // Render completed state (placeholder for Stage 3)
  if (job.status === 'completed' && job.result) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Análisis Completado</h1>
        {/*
          STAGE 3 PREVIEW:
          This is where the SchemaDisplayer will go. For now, we'll just show the raw JSON.
        */}
        <div className="bg-card border rounded-lg p-4">
            <h3 className="font-bold mb-2">Resultado (JSON Crudo):</h3>
            <pre className="text-sm bg-muted p-4 rounded custom-scrollbar overflow-x-auto">
              {JSON.stringify(job.result, null, 2)}
            </pre>
        </div>
      </div>
    );
  }

  return <div className="text-center py-20">Estado del trabajo desconocido.</div>;
};
EOF

# 3. Refactor App.tsx
echo "📄 Updating src/App.tsx..."
cat > ./src/App.tsx << 'EOF'
import React, { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ContentUpload } from './components/ContentUpload';
import { CaseListView } from './components/CaseListView';
import { DashboardSummaryView } from './components/DashboardSummaryView';
import { ContentAnalysisView } from './components/ContentAnalysisView';
import { HumanVerification } from './components/HumanVerification';
import { UserProfile } from './components/UserProfile';
import { Navigation } from './components/Navigation';
import { ExtensionApp } from './components/extension/ExtensionApp';
import { MapaDesinfodemico } from './components/MapaDesinfodemico';
import { DocumentacionIndicadores } from './components/DocumentacionIndicadores';
import { ImmunizationStudio } from './components/ImmunizationStudio';
import { useAuth } from './providers/AuthProvider';
import { useJobTracker } from './providers/JobTrackerProvider'; // Import the new hook

export default function App() {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const { activeJobId, setActiveJobId } = useJobTracker(); // Use the job tracker
  const [showRegister, setShowRegister] = useState(false);
  // This state now controls secondary tabs, while the main view is controlled by activeJobId
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('upload');

  // Determine what the primary active "tab" or view is.
  // If a job is active, that takes precedence. Otherwise, it's the upload view or a secondary tab.
  const activeView = activeJobId ? 'analysis' : (activeSecondaryTab === 'upload' ? 'upload' : activeSecondaryTab);

  const navigateTo = (view: string) => {
    if (view === 'upload') {
      setActiveJobId(null); // This is how we return to the upload screen
      setActiveSecondaryTab('upload');
    } else if (view === 'analysis' && activeJobId) {
       // This case is handled by activeJobId, but we can set the tab for nav highlight
       setActiveSecondaryTab('upload'); 
    }
    else {
      setActiveJobId(null);
      setActiveSecondaryTab(view);
    }
  };

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

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onRegister={goToLogin} onBackToLogin={goToLogin} />
    ) : (
      <Login onLogin={goToLogin} onGoToRegister={goToRegister} />
    );
  }

  const renderContent = () => {
    if (activeJobId) {
      return <ContentAnalysisView jobId={activeJobId} />;
    }

    switch (activeSecondaryTab) {
      case 'upload':
        return <ContentUpload />;
      case 'summary':
        return <DashboardSummaryView />;
      case 'review':
        return <CaseListView />;
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
        return <ContentUpload />; // Default to upload view
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeTab={activeView} 
        onTabChange={navigateTo}
        onLogout={handleLogout}
      />
      <main className="max-w-[1600px] mx-auto px-4 py-6 relative min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="transition-all duration-500 ease-in-out mx-auto p-[0px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
EOF

echo "✅ Stage 2 complete."
echo "------------------------------------------------"
echo "👉 NEXT STEP: The application is now wired up to handle the analysis flow. When you submit content, the view will change to the analysis screen and show the job status. The final piece is to render the completed results beautifully."
echo ""
echo "We are ready to proceed to Stage 3 to build the schema-driven result displayer."

