import { jsPDF } from 'jspdf';
import { AnalysisResult, Level1AnalysisItem, Level2Integration, Level3Verdict } from '@/types/imageAnalysis';
import { AudioAnalysisResult, AudioHumanReport } from '@/types/audioAnalysis';

// Botilito brand colors
const COLORS = {
  primary: '#ffda00',
  secondary: '#ffe97a',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
  gray: '#6b7280',
  black: '#000000',
  white: '#ffffff',
};

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Get color based on risk/score
function getRiskColor(score: number): string {
  if (score < 30) return COLORS.green;
  if (score < 70) return COLORS.yellow;
  if (score < 90) return COLORS.orange;
  return COLORS.red;
}

function getVerdictColor(verdict: string): string {
  const lower = verdict.toLowerCase();
  if (lower.includes('auténtico') || lower.includes('authentic') || lower.includes('baja')) {
    return COLORS.green;
  }
  if (lower.includes('sospecha') || lower.includes('medium')) {
    return COLORS.yellow;
  }
  if (lower.includes('alta') || lower.includes('high')) {
    return COLORS.orange;
  }
  if (lower.includes('manipulado') || lower.includes('critical')) {
    return COLORS.red;
  }
  return COLORS.gray;
}

// Common PDF setup
function createPdfDocument(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  return doc;
}

// Add header to PDF
function addHeader(doc: jsPDF, title: string, caseNumber?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Yellow header bar
  const rgb = hexToRgb(COLORS.primary);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BOTILITO', 15, 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Análisis Forense', 15, 26);

  // Case number
  if (caseNumber) {
    doc.setFontSize(10);
    doc.text(`Caso: ${caseNumber}`, pageWidth - 15, 18, { align: 'right' });
  }

  // Date
  doc.text(new Date().toLocaleString('es-CO'), pageWidth - 15, 26, { align: 'right' });

  return 45; // Return Y position after header
}

// Add section title
function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  const rgb = hexToRgb(COLORS.secondary);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(10, y - 5, doc.internal.pageSize.getWidth() - 20, 10, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, y + 2);

  return y + 15;
}

// Add key-value pair
function addKeyValue(doc: jsPDF, key: string, value: string, y: number, maxWidth: number = 170): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text(key + ':', 15, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const splitValue = doc.splitTextToSize(value, maxWidth - 50);
  doc.text(splitValue, 55, y);

  return y + (splitValue.length * 5) + 3;
}

// Add verdict box
function addVerdictBox(doc: jsPDF, verdict: string, score: number, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 30;
  const boxHeight = 25;

  const color = getRiskColor(score);
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(15, y, boxWidth, boxHeight, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(verdict, pageWidth / 2, y + 10, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Probabilidad de manipulación: ${score}%`, pageWidth / 2, y + 18, { align: 'center' });

  return y + boxHeight + 10;
}

// Add footer
function addFooter(doc: jsPDF): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(
    'Verificado por Botilito - Plataforma Anti-Desinformación con Análisis IA',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  doc.text('https://digitalia.gov.co', pageWidth / 2, pageHeight - 5, { align: 'center' });
}

// Check if we need a new page
function checkNewPage(doc: jsPDF, y: number, neededSpace: number = 30): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + neededSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

// ============================================
// IMAGE ANALYSIS PDF GENERATOR
// ============================================
export function generateImageAnalysisPDF(
  data: AnalysisResult,
  caseNumber?: string,
  fileName?: string
): void {
  const doc = createPdfDocument();
  let y = addHeader(doc, 'Análisis de Imagen', caseNumber);

  const { human_report, raw_forensics, file_info, chain_of_custody, recommendations } = data;
  const { level_1_analysis, level_2_integration, level_3_verdict } = human_report;

  // Verdict Section
  y = addSectionTitle(doc, 'Veredicto Final', y);
  y = addVerdictBox(
    doc,
    level_3_verdict.final_label,
    level_3_verdict.manipulation_probability,
    y
  );

  // Explanation
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const explanation = doc.splitTextToSize(level_3_verdict.user_explanation, 170);
  doc.text(explanation, 15, y);
  y += explanation.length * 5 + 10;

  // File Info
  if (file_info) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Información del Archivo', y);
    y = addKeyValue(doc, 'Nombre', file_info.name || fileName || 'N/A', y);
    y = addKeyValue(doc, 'Tamaño', `${((file_info.size_bytes || 0) / 1024).toFixed(2)} KB`, y);
    y = addKeyValue(doc, 'Tipo', file_info.mime_type || 'N/A', y);
    if (file_info.dimensions) {
      y = addKeyValue(doc, 'Dimensiones', `${file_info.dimensions.width} x ${file_info.dimensions.height} px`, y);
    }
    y += 5;
  }

  // Level 2 Integration
  y = checkNewPage(doc, y, 50);
  y = addSectionTitle(doc, 'Análisis Integrado', y);
  y = addKeyValue(doc, 'Consistencia', `${(level_2_integration.consistency_score * 100).toFixed(0)}%`, y);
  y = addKeyValue(doc, 'Riesgo Metadata', `${(level_2_integration.metadata_risk_score * 100).toFixed(0)}%`, y);
  y = addKeyValue(doc, 'Tipo de Manipulación', level_2_integration.tampering_type, y);

  const synthNotes = doc.splitTextToSize(level_2_integration.synthesis_notes, 170);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('Notas:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  y += 5;
  doc.text(synthNotes, 15, y);
  y += synthNotes.length * 5 + 10;

  // Level 1 Analysis - Individual Tests
  y = checkNewPage(doc, y, 60);
  y = addSectionTitle(doc, 'Pruebas Forenses Individuales', y);

  level_1_analysis.forEach((test: Level1AnalysisItem) => {
    y = checkNewPage(doc, y, 25);

    // Test name with score
    const scoreColor = getRiskColor(test.significance_score * 100);
    const rgb = hexToRgb(scoreColor);

    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(15, y - 4, 50, 8, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(test.algorithm, 17, y + 1);

    doc.setTextColor(0, 0, 0);
    doc.text(`${(test.significance_score * 100).toFixed(0)}%`, 70, y + 1);

    y += 8;

    // Interpretation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const interpretation = doc.splitTextToSize(test.interpretation, 165);
    doc.text(interpretation, 17, y);
    y += interpretation.length * 4 + 8;
  });

  // Raw Forensics Summary
  if (raw_forensics && raw_forensics.length > 0) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Resultados de Algoritmos', y);

    raw_forensics.forEach((forensic) => {
      if (forensic.algorithms) {
        forensic.algorithms.forEach((algo) => {
          y = checkNewPage(doc, y, 15);
          y = addKeyValue(doc, algo.name, `Score: ${(algo.score * 100).toFixed(0)}%`, y);
        });
      }
    });
    y += 5;
  }

  // Recommendations
  if (recommendations && recommendations.length > 0) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Recomendaciones', y);

    recommendations.forEach((rec, index) => {
      y = checkNewPage(doc, y, 15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const recText = doc.splitTextToSize(`${index + 1}. ${rec}`, 165);
      doc.text(recText, 17, y);
      y += recText.length * 5 + 3;
    });
  }

  // Chain of Custody
  if (chain_of_custody && chain_of_custody.length > 0) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Cadena de Custodia', y);

    chain_of_custody.forEach((event) => {
      y = checkNewPage(doc, y, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${new Date(event.timestamp).toLocaleString('es-CO')} - ${event.action}`, 17, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      doc.text(`${event.actor}: ${event.details}`, 17, y);
      if (event.hash) {
        y += 4;
        doc.setFontSize(7);
        doc.text(`Hash: ${event.hash}`, 17, y);
      }
      y += 8;
    });
  }

  addFooter(doc);

  // Download
  const filename = `botilito-imagen-${caseNumber || 'reporte'}-${Date.now()}.pdf`;
  doc.save(filename);
}

// Audio test interface for PDF
interface AudioTest {
  name: string;
  description: string;
  confidence: number;
  result: 'authentic' | 'manipulated' | 'synthetic' | 'uncertain';
}

// Generate tests from human report (mirrors AudioTestResults.tsx logic)
function generateAudioTests(humanReport: AudioHumanReport): AudioTest[] {
  const tests: AudioTest[] = [];

  // Transcription analysis
  if (humanReport.transcription) {
    tests.push({
      name: 'Análisis de Transcripción',
      description: 'Transcripción automática del contenido de audio',
      confidence: humanReport.transcription.confidence || 0.8,
      result: 'authentic',
    });
  }

  // Audio forensics
  if (humanReport.audio_forensics) {
    const forensics = humanReport.audio_forensics;

    tests.push({
      name: 'Análisis Forense de Audio',
      description: 'Detección de manipulación y edición en el audio',
      confidence: forensics.authenticity_score || 0.5,
      result: forensics.manipulation_detected ? 'manipulated' : 'authentic',
    });

    // Add anomaly detection if anomalies exist
    if (forensics.anomalies && forensics.anomalies.length > 0) {
      tests.push({
        name: 'Detección de Anomalías',
        description: `Patrones irregulares detectados: ${forensics.anomalies.join(', ')}`,
        confidence: Math.max(0.6, 1 - forensics.authenticity_score),
        result: 'manipulated',
      });
    }
  }

  // Speaker analysis
  if (humanReport.speaker_analysis && humanReport.speaker_analysis.num_speakers > 0) {
    tests.push({
      name: 'Diarización de Hablantes',
      description: `Identificación de ${humanReport.speaker_analysis.num_speakers} hablante(s) en el audio`,
      confidence: 0.85,
      result: 'authentic',
    });
  }

  // Sentiment analysis
  if (humanReport.sentiment_analysis) {
    tests.push({
      name: 'Análisis de Sentimiento',
      description: `Tono detectado: ${humanReport.sentiment_analysis.overall_sentiment}`,
      confidence: humanReport.sentiment_analysis.confidence || 0.75,
      result: 'authentic',
    });
  }

  // Add deepfake detection if high risk
  if (humanReport.verdict?.risk_level === 'high' || humanReport.verdict?.risk_level === 'critical') {
    tests.push({
      name: 'Detección de IA Generativa',
      description: 'Análisis de patrones característicos de audio sintético',
      confidence: humanReport.verdict.confidence || 0.7,
      result: 'synthetic',
    });
  }

  // If no tests generated, add placeholder
  if (tests.length === 0) {
    tests.push({
      name: 'Análisis General',
      description: 'Análisis básico del archivo de audio',
      confidence: humanReport.verdict?.confidence || 0.5,
      result: humanReport.audio_forensics?.manipulation_detected ? 'manipulated' : 'authentic',
    });
  }

  return tests;
}

// Get result label in Spanish
function getResultLabel(result: string): string {
  switch (result) {
    case 'manipulated': return 'MANIPULADO';
    case 'synthetic': return 'SINTÉTICO';
    case 'uncertain': return 'INCIERTO';
    default: return 'AUTÉNTICO';
  }
}

// Get result color
function getResultColor(result: string): string {
  switch (result) {
    case 'manipulated': return COLORS.orange;
    case 'synthetic': return '#a855f7'; // purple-500
    case 'uncertain': return COLORS.yellow;
    default: return COLORS.green;
  }
}

// ============================================
// AUDIO ANALYSIS PDF GENERATOR
// ============================================
export function generateAudioAnalysisPDF(
  data: AudioAnalysisResult,
  caseNumber?: string,
  fileName?: string
): void {
  const doc = createPdfDocument();
  let y = addHeader(doc, 'Análisis de Audio', caseNumber);

  const { human_report, file_info, chain_of_custody, recommendations, raw_results_summary, assets } = data;
  const { verdict, transcription, speaker_analysis, audio_forensics, sentiment_analysis } = human_report;

  // Verdict Section
  y = addSectionTitle(doc, 'Veredicto Final', y);

  const riskScore = verdict.risk_level === 'critical' ? 95
    : verdict.risk_level === 'high' ? 75
    : verdict.risk_level === 'medium' ? 50
    : 25;

  y = addVerdictBox(doc, verdict.conclusion, riskScore, y);

  // Confidence
  y = addKeyValue(doc, 'Confianza', `${(verdict.confidence * 100).toFixed(0)}%`, y);
  y = addKeyValue(doc, 'Nivel de Riesgo', verdict.risk_level.toUpperCase(), y);
  y += 5;

  // File Info
  if (file_info) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Información del Archivo', y);
    y = addKeyValue(doc, 'Nombre', file_info.name || fileName || 'N/A', y);
    y = addKeyValue(doc, 'Tamaño', `${((file_info.size_bytes || 0) / 1024).toFixed(2)} KB`, y);
    y = addKeyValue(doc, 'Tipo', file_info.mime_type || 'N/A', y);
    y = addKeyValue(doc, 'Duración', `${(file_info.duration_seconds || 0).toFixed(2)} segundos`, y);
    y += 5;
  }

  // ============================================
  // PRUEBAS FORENSES INDIVIDUALES (Test Cards)
  // ============================================
  y = checkNewPage(doc, y, 60);
  y = addSectionTitle(doc, 'Pruebas Forenses Individuales', y);

  const tests = generateAudioTests(human_report);

  tests.forEach((test) => {
    y = checkNewPage(doc, y, 30);

    // Test name badge with color
    const resultColor = getResultColor(test.result);
    const rgb = hexToRgb(resultColor);

    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(15, y - 4, 55, 8, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(test.name.substring(0, 25), 17, y + 1);

    // Result label
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(getResultLabel(test.result), 75, y + 1);

    // Confidence
    doc.text(`${(test.confidence * 100).toFixed(0)}%`, 120, y + 1);

    y += 10;

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const descText = doc.splitTextToSize(test.description, 165);
    doc.text(descText, 17, y);
    y += descText.length * 4 + 8;
  });

  y += 5;

  // ============================================
  // ANÁLISIS DE TRANSCRIPCIÓN (Detailed)
  // ============================================
  if (transcription && transcription.text) {
    y = checkNewPage(doc, y, 50);
    y = addSectionTitle(doc, 'Análisis de Transcripción', y);

    if (transcription.language) {
      y = addKeyValue(doc, 'Idioma detectado', transcription.language, y);
    }
    if (transcription.confidence) {
      y = addKeyValue(doc, 'Confianza', `${(transcription.confidence * 100).toFixed(0)}%`, y);
    }

    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Texto transcrito:', 15, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const transcriptText = doc.splitTextToSize(transcription.text, 170);

    // Handle long transcriptions with page breaks
    transcriptText.forEach((line: string) => {
      y = checkNewPage(doc, y, 8);
      doc.text(line, 15, y);
      y += 5;
    });
    y += 5;

    // Segments if available
    if (transcription.segments && transcription.segments.length > 0) {
      y = checkNewPage(doc, y, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Segmentos por tiempo:', 15, y);
      y += 6;

      transcription.segments.slice(0, 10).forEach((seg) => {
        y = checkNewPage(doc, y, 10);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const startMin = Math.floor(seg.start_time / 60);
        const startSec = Math.floor(seg.start_time % 60);
        const endMin = Math.floor(seg.end_time / 60);
        const endSec = Math.floor(seg.end_time % 60);
        const timeStr = `[${startMin}:${startSec.toString().padStart(2, '0')} - ${endMin}:${endSec.toString().padStart(2, '0')}]`;
        const speaker = seg.speaker ? ` (${seg.speaker})` : '';
        const segText = doc.splitTextToSize(`${timeStr}${speaker}: ${seg.text}`, 165);
        doc.text(segText, 17, y);
        y += segText.length * 4 + 3;
      });

      if (transcription.segments.length > 10) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`... y ${transcription.segments.length - 10} segmentos más`, 17, y);
        y += 6;
      }
    }
  }

  // ============================================
  // ANÁLISIS FORENSE DE AUDIO (Detailed)
  // ============================================
  if (audio_forensics) {
    y = checkNewPage(doc, y, 50);
    y = addSectionTitle(doc, 'Análisis Forense de Audio', y);

    y = addKeyValue(doc, 'Score de Autenticidad', `${(audio_forensics.authenticity_score * 100).toFixed(0)}%`, y);
    y = addKeyValue(doc, 'Manipulación Detectada', audio_forensics.manipulation_detected ? 'SÍ - Se encontraron indicios de edición' : 'NO - Audio aparentemente original', y);

    // Anomalies detailed section
    if (audio_forensics.anomalies && audio_forensics.anomalies.length > 0) {
      y += 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Anomalías detectadas:', 15, y);
      y += 6;

      audio_forensics.anomalies.forEach((anomaly, idx) => {
        y = checkNewPage(doc, y, 10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const anomalyText = doc.splitTextToSize(`• ${anomaly}`, 165);
        doc.text(anomalyText, 17, y);
        y += anomalyText.length * 4 + 3;
      });
    }
    y += 5;
  }

  // ============================================
  // DETECCIÓN DE ANOMALÍAS (Separate section if many)
  // ============================================
  if (audio_forensics?.anomalies && audio_forensics.anomalies.length > 3) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Detección de Anomalías - Análisis Detallado', y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const anomalyIntro = 'Se detectaron patrones irregulares en el espectro de audio que podrían indicar manipulación o edición del contenido original:';
    const introText = doc.splitTextToSize(anomalyIntro, 170);
    doc.text(introText, 15, y);
    y += introText.length * 5 + 5;

    audio_forensics.anomalies.forEach((anomaly, idx) => {
      y = checkNewPage(doc, y, 12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}.`, 17, y);
      doc.setFont('helvetica', 'normal');
      const anomalyText = doc.splitTextToSize(anomaly, 155);
      doc.text(anomalyText, 25, y);
      y += anomalyText.length * 5 + 4;
    });
    y += 5;
  }

  // ============================================
  // VISUALIZACIONES (Note about available assets)
  // ============================================
  y = checkNewPage(doc, y, 40);
  y = addSectionTitle(doc, 'Visualizaciones', y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const vizItems = [
    '• Forma de Onda: Representación visual de la amplitud del audio a lo largo del tiempo',
    '• Espectrograma: Distribución de frecuencias mostrando patrones espectrales',
  ];

  if (assets?.spectrogram) {
    vizItems.push('  ✓ Espectrograma disponible en el análisis web');
  }

  vizItems.push('• Análisis de Frecuencia: Identificación de componentes armónicos y ruido');

  vizItems.forEach((item) => {
    y = checkNewPage(doc, y, 8);
    const itemText = doc.splitTextToSize(item, 165);
    doc.text(itemText, 15, y);
    y += itemText.length * 5 + 2;
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  y += 3;
  doc.text('Nota: Las visualizaciones interactivas están disponibles en la versión web del análisis.', 15, y);
  y += 10;

  // Speaker Analysis
  if (speaker_analysis && speaker_analysis.num_speakers > 0) {
    y = checkNewPage(doc, y, 30);
    y = addSectionTitle(doc, 'Diarización de Hablantes', y);
    y = addKeyValue(doc, 'Número de Hablantes', speaker_analysis.num_speakers.toString(), y);

    if (speaker_analysis.speakers && speaker_analysis.speakers.length > 0) {
      speaker_analysis.speakers.forEach((speaker, idx) => {
        y = checkNewPage(doc, y, 10);
        const segCount = speaker.segments?.length || 0;
        y = addKeyValue(doc, `Hablante ${idx + 1}`, `${segCount} intervenciones`, y);
      });
    }
    y += 5;
  }

  // Sentiment Analysis
  if (sentiment_analysis) {
    y = checkNewPage(doc, y, 30);
    y = addSectionTitle(doc, 'Análisis de Sentimiento', y);

    const sentimentLabel = sentiment_analysis.overall_sentiment === 'positive' ? 'Positivo'
      : sentiment_analysis.overall_sentiment === 'negative' ? 'Negativo'
      : 'Neutral';

    y = addKeyValue(doc, 'Sentimiento General', sentimentLabel, y);
    y = addKeyValue(doc, 'Confianza', `${(sentiment_analysis.confidence * 100).toFixed(0)}%`, y);
    y += 5;
  }

  // Raw Results Summary
  if (raw_results_summary) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Datos Técnicos', y);

    if (raw_results_summary.duration_seconds) {
      y = addKeyValue(doc, 'Duración', `${raw_results_summary.duration_seconds.toFixed(2)} seg`, y);
    }
    if (raw_results_summary.sample_rate) {
      y = addKeyValue(doc, 'Sample Rate', `${raw_results_summary.sample_rate} Hz`, y);
    }
    if (raw_results_summary.channels) {
      y = addKeyValue(doc, 'Canales', raw_results_summary.channels.toString(), y);
    }
    if (raw_results_summary.format) {
      y = addKeyValue(doc, 'Formato', raw_results_summary.format, y);
    }
    y += 5;
  }

  // Recommendations
  if (recommendations && recommendations.length > 0) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Recomendaciones', y);

    recommendations.forEach((rec, index) => {
      y = checkNewPage(doc, y, 15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const recText = doc.splitTextToSize(`${index + 1}. ${rec}`, 165);
      doc.text(recText, 17, y);
      y += recText.length * 5 + 3;
    });
  }

  // Chain of Custody
  if (chain_of_custody && chain_of_custody.length > 0) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Cadena de Custodia', y);

    chain_of_custody.forEach((event) => {
      y = checkNewPage(doc, y, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${new Date(event.timestamp).toLocaleString('es-CO')} - ${event.action}`, 17, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      doc.text(`${event.actor}: ${event.details}`, 17, y);
      if (event.hash) {
        y += 4;
        doc.setFontSize(7);
        doc.text(`Hash: ${event.hash}`, 17, y);
      }
      y += 8;
    });
  }

  addFooter(doc);

  // Download
  const filename = `botilito-audio-${caseNumber || 'reporte'}-${Date.now()}.pdf`;
  doc.save(filename);
}
