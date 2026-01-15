import React from 'react';
import { useAnalysisPolling } from '@/hooks/useAnalysisPolling';
import { UnifiedAnalysisView } from './UnifiedAnalysisView';
import { transformTextAnalysisToUI } from '@/services/analysisPresentationService';

interface JobStatusViewerProps {
  jobId: string;
  jobType: string;
  onComplete: (caseId: string, type: string) => void;
  onReset: () => void;
}

export function JobStatusViewer({ jobId, jobType, onComplete, onReset }: JobStatusViewerProps) {
  const polling = useAnalysisPolling(jobId);

  React.useEffect(() => {
    if (polling.analysisResult?.result?.id) {
      // When polling completes, call the onComplete callback
      // which will likely navigate to the final case detail view.
      onComplete(polling.analysisResult.result.id, jobType);
    }
  }, [polling.analysisResult, onComplete, jobType]);

  // UnifiedAnalysisView will show a loading/progress state
  // based on the props from the useAnalysisPolling hook.
  return (
    <div className="container mx-auto px-4 py-8">
      <UnifiedAnalysisView
        isLoading={polling.isLoading}
        progress={polling.progress}
        data={polling.analysisResult ? transformTextAnalysisToUI(polling.analysisResult.result) : null}
        contentType={jobType}
        mode="ai"
        onReset={onReset}
        onSubmitDiagnosis={() => {}}
        title={polling.analysisResult?.result?.title}
        timestamp={polling.analysisResult?.result?.created_at}
        caseNumber={polling.analysisResult?.result?.id?.slice(0, 8)}
        reportedBy="Botilito IA"
      />
    </div>
  );
}
