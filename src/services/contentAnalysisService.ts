import { analyzeContent, TransmissionVector as APITransmissionVector, FullAnalysisResponse, Consensus } from '../utils/aiAnalysis';
import type { TransmissionVector } from '../utils/caseCodeGenerator';

function mapTransmissionVector(uiVector: TransmissionVector): APITransmissionVector {
  const mapping: Record<string, APITransmissionVector> = {
    'WhatsApp': 'WhatsApp',
    'Facebook': 'Facebook',
    'Instagram': 'Otro',
    'Twitter/X': 'Twitter',
    'TikTok': 'Otro',
    'Telegram': 'Telegram',
    'YouTube': 'Otro',
    'Email': 'Email',
    'SMS': 'Otro',
    'Web': 'Otro',
    'Otro': 'Otro'
  };
  return mapping[uiVector] || 'Otro';
}

import { analysisPipeline } from '../lib/analysisPipeline';

export const performAnalysisWithPipeline = async (
  content: string,
  onProgress: (progress: { step: string; status: string }) => void
) => {
  try {
    const result = await analysisPipeline(content, onProgress);
    // The result from the pipeline might not have the same structure as the old API.
    // For now, we'll return the result directly.
    // If needed, a new transformation function can be created.
    return result;
  } catch (error) {
    console.error('Error in the new analysis pipeline service:', error);
    throw error;
  }
};

function transformAPIResponse(apiResponse: FullAnalysisResponse) {
  let labels: Record<string, string> = {};
  let consensusState: Consensus['state'] | null = null;

  if (apiResponse.consensus) {
    consensusState = apiResponse.consensus.state;
    const aiLabels = apiResponse.metadata?.classification_labels || apiResponse.case_study?.metadata?.ai_labels || {};
    apiResponse.consensus.final_labels.forEach(label => {
      labels[label] = aiLabels[label] || 'Verificado por consenso';
    });
  } else {
    labels = apiResponse.metadata?.classification_labels || apiResponse.case_study?.metadata?.ai_labels || {};
  }

  const markersDetected = Object.entries(labels).map(([type, explanation]) => ({
    type,
    explanation,
  }));

  // Extract source from various possible locations
  const extractSource = () => {
    const source = apiResponse.metadata?.source ||
                   apiResponse.case_study?.metadata?.source ||
                   apiResponse.source;

    // Debug logging
    console.log('🔍 Source extraction debug:', {
      'metadata.source': apiResponse.metadata?.source,
      'case_study.metadata.source': apiResponse.case_study?.metadata?.source,
      'apiResponse.source': apiResponse.source,
      'extracted': source
    });

    return source;
  };

  return {
    title: apiResponse.title,
    summary: apiResponse.summary,
    theme: apiResponse.metadata?.theme,
    region: apiResponse.metadata?.region,
    caseNumber: apiResponse.case_study?.case_id || apiResponse.case_study?.case_number,
    consensusState,
    consensus: apiResponse.consensus,
    markersDetected,
    summaryBotilito: apiResponse.metadata.summaryBotilito,
    judgementBotilito: apiResponse.metadata.judgementBotilito,
    vectores: apiResponse.metadata?.vectores_de_transmision || [],
    relatedDocuments: apiResponse.case_study?.metadata?.related_documents || [],
    webSearchResults: apiResponse.case_study?.metadata?.web_search_results || [],
    finalVerdict: apiResponse.metadata?.judgementBotilito.summary || 'Análisis en proceso',
    fullResult: {
      ...apiResponse,
      metadata: {
        ...apiResponse.metadata,
        reported_by: apiResponse.metadata?.reported_by || apiResponse.case_study?.metadata?.reported_by,
        source: extractSource(),
      }
    }
  };
}

export const performAnalysis = async (
  content: string,
  transmissionMedium: TransmissionVector,
  onProgress: (progress: number, status: string) => void
) => {
  try {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    const isUrl = urls && urls.length > 0;

    const analysisContent = isUrl ? { url: urls[0] } : { text: content };
    const apiVector = mapTransmissionVector(transmissionMedium);

    const result = await analyzeContent(analysisContent, apiVector, onProgress);
    return transformAPIResponse(result);
  } catch (error) {
    console.error('Error en el servicio de análisis de contenido:', error);
    throw error;
  }
};
