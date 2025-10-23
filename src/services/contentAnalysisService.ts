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

  return {
    title: apiResponse.title,
    summary: apiResponse.summary,
    theme: apiResponse.metadata?.theme,
    region: apiResponse.metadata?.region,
    caseNumber: apiResponse.case_study?.case_number,
    consensusState,
    consensus: apiResponse.consensus,
    markersDetected,
    summaryBotilito: apiResponse.metadata.summaryBotilito,
    judgementBotilito: apiResponse.metadata.judgementBotilito,
    vectores: apiResponse.metadata?.vectores_de_transmision || [],
    relatedDocuments: apiResponse.case_study?.metadata?.related_documents || [],
    webSearchResults: apiResponse.case_study?.metadata?.web_search_results || [],
    finalVerdict: apiResponse.metadata?.judgementBotilito.summary || 'Análisis en proceso',
    fullResult: apiResponse
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
