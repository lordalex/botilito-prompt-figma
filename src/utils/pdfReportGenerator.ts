import { jsPDF } from 'jspdf';
import { AnalysisResult, Level1AnalysisItem, Level2Integration, Level3Verdict } from '@/types/imageAnalysis';
import { AudioAnalysisResult, AudioHumanReport } from '@/types/audioAnalysis';

// Helper to fetch image as base64 for embedding in PDF
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix to get just the base64
        resolve(base64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to fetch image for PDF:', error);
    return null;
  }
}

// Botilito brand colors
const COLORS = {
  primary: '#ffda00',
  secondary: '#ffe97a',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
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

  // Yellow header bar
  const rgb = hexToRgb(COLORS.primary);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BOTILITO', 15, 15);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de Análisis Forense', 15, 23);

  // Case number and date on the right
  doc.setFontSize(9);
  if (caseNumber) {
    doc.text(`Caso: ${caseNumber}`, pageWidth - 15, 15, { align: 'right' });
  }
  doc.text(new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }), pageWidth - 15, 22, { align: 'right' });

  return 42; // Return Y position after header
}

// Add section title with yellow background
function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  const rgb = hexToRgb(COLORS.secondary);
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(15, y - 2, pageWidth - 30, 9, 2, 2, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 18, y + 4);

  return y + 14;
}

// Add key-value pair with proper spacing
function addKeyValue(doc: jsPDF, key: string, value: string, y: number, keyWidth: number = 45): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxValueWidth = pageWidth - 35 - keyWidth;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text(key, 18, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const splitValue = doc.splitTextToSize(value, maxValueWidth);
  doc.text(splitValue, 18 + keyWidth, y);

  return y + (splitValue.length * 4.5) + 2;
}

// Add verdict box with proper text wrapping
function addVerdictBox(doc: jsPDF, verdict: string, score: number, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 30;

  // Truncate long verdicts for the main display
  const maxVerdictLength = 60;
  const displayVerdict = verdict.length > maxVerdictLength
    ? verdict.substring(0, maxVerdictLength) + '...'
    : verdict;

  const boxHeight = 22;

  const color = getRiskColor(score);
  const rgb = hexToRgb(color);
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.roundedRect(15, y, boxWidth, boxHeight, 3, 3, 'F');

  // Verdict label
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(displayVerdict, pageWidth / 2, y + 9, { align: 'center', maxWidth: boxWidth - 10 });

  // Score
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Probabilidad de manipulación: ${score}%`, pageWidth / 2, y + 17, { align: 'center' });

  return y + boxHeight + 8;
}

// Add footer to all pages
function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    const lineRgb = hexToRgb(COLORS.primary);
    doc.setDrawColor(lineRgb.r, lineRgb.g, lineRgb.b);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 18, pageWidth - 15, pageHeight - 18);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Verificado por Botilito - Plataforma Anti-Desinformación con Análisis IA',
      15,
      pageHeight - 12
    );
    doc.text('https://digitalia.gov.co', 15, pageHeight - 8);

    // Page number
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  }
}

// Check if we need a new page
function checkNewPage(doc: jsPDF, y: number, neededSpace: number = 30): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + neededSpace > pageHeight - 25) {
    doc.addPage();
    return 20;
  }
  return y;
}

// Draw a card/box with optional border
function drawCard(doc: jsPDF, y: number, height: number, bgColor?: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  if (bgColor) {
    const rgb = hexToRgb(bgColor);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(15, y, pageWidth - 30, height, 2, 2, 'F');
  }

  // Light border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y, pageWidth - 30, height, 2, 2, 'S');
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

  // Explanation in a card
  if (level_3_verdict.user_explanation) {
    const explanationLines = doc.splitTextToSize(level_3_verdict.user_explanation, 165);
    const cardHeight = explanationLines.length * 4 + 8;

    drawCard(doc, y, cardHeight, COLORS.lightGray);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(explanationLines, 18, y + 5);
    y += cardHeight + 8;
  }

  // File Info
  if (file_info) {
    y = checkNewPage(doc, y, 45);
    y = addSectionTitle(doc, 'Información del Archivo', y);
    y = addKeyValue(doc, 'Nombre:', file_info.name || fileName || 'N/A', y);
    y = addKeyValue(doc, 'Tamaño:', `${((file_info.size_bytes || 0) / 1024).toFixed(2)} KB`, y);
    y = addKeyValue(doc, 'Tipo:', file_info.mime_type || 'N/A', y);
    if (file_info.dimensions) {
      y = addKeyValue(doc, 'Dimensiones:', `${file_info.dimensions.width} x ${file_info.dimensions.height} px`, y);
    }
    y += 6;
  }

  // Level 2 Integration
  y = checkNewPage(doc, y, 55);
  y = addSectionTitle(doc, 'Análisis Integrado', y);
  y = addKeyValue(doc, 'Consistencia:', `${(level_2_integration.consistency_score * 100).toFixed(0)}%`, y);
  y = addKeyValue(doc, 'Riesgo Metadatos:', `${(level_2_integration.metadata_risk_score * 100).toFixed(0)}%`, y);
  y = addKeyValue(doc, 'Tipo de Manipulación:', level_2_integration.tampering_type, y);

  if (level_2_integration.synthesis_notes) {
    y += 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Notas:', 18, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const synthNotes = doc.splitTextToSize(level_2_integration.synthesis_notes, 165);
    doc.text(synthNotes, 18, y);
    y += synthNotes.length * 4 + 8;
  }

  // Level 1 Analysis - Individual Tests
  y = checkNewPage(doc, y, 60);
  y = addSectionTitle(doc, 'Pruebas Forenses Individuales', y);

  level_1_analysis.forEach((test: Level1AnalysisItem) => {
    y = checkNewPage(doc, y, 28);

    // Test card
    const scoreColor = getRiskColor(test.significance_score * 100);
    const rgb = hexToRgb(scoreColor);

    // Badge for algorithm name
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(18, y - 3, 45, 7, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(test.algorithm.substring(0, 18), 20, y + 1);

    // Score
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`${(test.significance_score * 100).toFixed(0)}%`, 70, y + 1);

    y += 8;

    // Interpretation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const interpretation = doc.splitTextToSize(test.interpretation, 160);
    doc.text(interpretation, 20, y);
    y += interpretation.length * 3.5 + 6;
  });

  // Recommendations
  if (recommendations && recommendations.length > 0) {
    y = checkNewPage(doc, y, 45);
    y = addSectionTitle(doc, 'Recomendaciones', y);

    recommendations.forEach((rec, index) => {
      y = checkNewPage(doc, y, 12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const recText = doc.splitTextToSize(`${index + 1}. ${rec}`, 160);
      doc.text(recText, 20, y);
      y += recText.length * 4 + 3;
    });
    y += 5;
  }

  // Chain of Custody
  if (chain_of_custody && chain_of_custody.length > 0) {
    y = checkNewPage(doc, y, 45);
    y = addSectionTitle(doc, 'Cadena de Custodia', y);

    chain_of_custody.forEach((event) => {
      y = checkNewPage(doc, y, 18);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${new Date(event.timestamp).toLocaleString('es-CO')} - ${event.action}`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      y += 4;
      doc.text(`${event.actor}: ${event.details}`, 20, y);
      if (event.hash) {
        y += 3;
        doc.setFontSize(6);
        doc.text(`Hash: ${event.hash}`, 20, y);
      }
      y += 6;
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
      name: 'Transcripción',
      description: 'Transcripción automática del contenido de audio',
      confidence: humanReport.transcription.confidence || 0.8,
      result: 'authentic',
    });
  }

  // Audio forensics
  if (humanReport.audio_forensics) {
    const forensics = humanReport.audio_forensics;

    tests.push({
      name: 'Forense de Audio',
      description: 'Detección de manipulación y edición en el audio',
      confidence: forensics.authenticity_score || 0.5,
      result: forensics.manipulation_detected ? 'manipulated' : 'authentic',
    });

    // Add anomaly detection if anomalies exist
    if (forensics.anomalies && forensics.anomalies.length > 0) {
      tests.push({
        name: 'Anomalías',
        description: 'Patrones irregulares detectados en el espectro de audio',
        confidence: Math.max(0.6, 1 - forensics.authenticity_score),
        result: 'manipulated',
      });
    }
  }

  // Speaker analysis
  if (humanReport.speaker_analysis && humanReport.speaker_analysis.num_speakers > 0) {
    tests.push({
      name: 'Hablantes',
      description: `Identificación de ${humanReport.speaker_analysis.num_speakers} hablante(s)`,
      confidence: 0.85,
      result: 'authentic',
    });
  }

  // Sentiment analysis
  if (humanReport.sentiment_analysis) {
    const sentimentLabel = humanReport.sentiment_analysis.overall_sentiment === 'positive' ? 'positivo'
      : humanReport.sentiment_analysis.overall_sentiment === 'negative' ? 'negativo' : 'neutral';
    tests.push({
      name: 'Sentimiento',
      description: `Tono detectado: ${sentimentLabel}`,
      confidence: humanReport.sentiment_analysis.confidence || 0.75,
      result: 'authentic',
    });
  }

  // Add deepfake detection if high risk
  if (humanReport.verdict?.risk_level === 'high' || humanReport.verdict?.risk_level === 'critical') {
    tests.push({
      name: 'IA Generativa',
      description: 'Análisis de patrones característicos de audio sintético',
      confidence: humanReport.verdict.confidence || 0.7,
      result: 'synthetic',
    });
  }

  // If no tests generated, add placeholder
  if (tests.length === 0) {
    tests.push({
      name: 'General',
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
export async function generateAudioAnalysisPDF(
  data: AudioAnalysisResult,
  caseNumber?: string,
  fileName?: string
): Promise<void> {
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

  // Confidence and Risk Level in a row
  const riskLabel = verdict.risk_level === 'critical' ? 'CRÍTICO'
    : verdict.risk_level === 'high' ? 'ALTO'
    : verdict.risk_level === 'medium' ? 'MEDIO'
    : 'BAJO';

  y = addKeyValue(doc, 'Confianza:', `${(verdict.confidence * 100).toFixed(0)}%`, y, 25);
  y = addKeyValue(doc, 'Nivel de Riesgo:', riskLabel, y, 35);
  y += 4;

  // File Info
  if (file_info) {
    y = checkNewPage(doc, y, 45);
    y = addSectionTitle(doc, 'Información del Archivo', y);
    y = addKeyValue(doc, 'Nombre:', file_info.name || fileName || 'N/A', y);
    y = addKeyValue(doc, 'Tamaño:', `${((file_info.size_bytes || 0) / 1024).toFixed(2)} KB`, y);
    y = addKeyValue(doc, 'Tipo:', file_info.mime_type || 'N/A', y);
    y = addKeyValue(doc, 'Duración:', `${(file_info.duration_seconds || 0).toFixed(2)} segundos`, y);
    y += 4;
  }

  // ============================================
  // PRUEBAS FORENSES INDIVIDUALES (Test Cards)
  // ============================================
  y = checkNewPage(doc, y, 60);
  y = addSectionTitle(doc, 'Pruebas Forenses', y);

  const tests = generateAudioTests(human_report);

  tests.forEach((test) => {
    y = checkNewPage(doc, y, 22);

    // Test card background
    const pageWidth = doc.internal.pageSize.getWidth();
    drawCard(doc, y - 2, 18, '#fafafa');

    // Test name badge with color
    const resultColor = getResultColor(test.result);
    const rgb = hexToRgb(resultColor);

    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(18, y, 38, 6, 1.5, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(test.name, 20, y + 4);

    // Result label
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(getResultLabel(test.result), 62, y + 4);

    // Confidence percentage
    doc.setTextColor(80, 80, 80);
    doc.text(`${(test.confidence * 100).toFixed(0)}%`, pageWidth - 25, y + 4);

    y += 9;

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const descText = doc.splitTextToSize(test.description, 155);
    doc.text(descText, 20, y);
    y += descText.length * 3.5 + 8;
  });

  // ============================================
  // ANÁLISIS DE TRANSCRIPCIÓN (Detailed)
  // ============================================
  if (transcription && transcription.text) {
    y = checkNewPage(doc, y, 50);
    y = addSectionTitle(doc, 'Transcripción', y);

    if (transcription.language) {
      y = addKeyValue(doc, 'Idioma:', transcription.language, y, 20);
    }
    if (transcription.confidence) {
      y = addKeyValue(doc, 'Confianza:', `${(transcription.confidence * 100).toFixed(0)}%`, y, 25);
    }

    y += 2;

    // Transcription text in a card
    const transcriptLines = doc.splitTextToSize(transcription.text, 160);
    const cardHeight = Math.min(transcriptLines.length * 4 + 8, 60);

    drawCard(doc, y, cardHeight, COLORS.lightGray);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Only show first portion if too long
    const linesToShow = transcriptLines.slice(0, 12);
    doc.text(linesToShow, 18, y + 5);

    if (transcriptLines.length > 12) {
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`[... ${transcriptLines.length - 12} líneas más]`, 18, y + cardHeight - 3);
    }

    y += cardHeight + 6;
  }

  // ============================================
  // ANÁLISIS FORENSE DE AUDIO (Detailed)
  // ============================================
  if (audio_forensics) {
    y = checkNewPage(doc, y, 50);
    y = addSectionTitle(doc, 'Análisis Forense de Audio', y);

    y = addKeyValue(doc, 'Autenticidad:', `${(audio_forensics.authenticity_score * 100).toFixed(0)}%`, y, 28);

    const manipLabel = audio_forensics.manipulation_detected
      ? 'SÍ - Se encontraron indicios de edición'
      : 'NO - Audio aparentemente original';
    y = addKeyValue(doc, 'Manipulación:', manipLabel, y, 28);

    // Anomalies detailed section
    if (audio_forensics.anomalies && audio_forensics.anomalies.length > 0) {
      y += 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Anomalías detectadas:', 18, y);
      y += 5;

      audio_forensics.anomalies.forEach((anomaly) => {
        y = checkNewPage(doc, y, 15);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const anomalyText = doc.splitTextToSize(`• ${anomaly}`, 160);
        doc.text(anomalyText, 20, y);
        y += anomalyText.length * 3.5 + 3;
      });
    }
    y += 4;
  }

  // ============================================
  // VISUALIZACIONES (with embedded spectrogram)
  // ============================================
  y = checkNewPage(doc, y, 80); // Need more space for image
  y = addSectionTitle(doc, 'Visualizaciones', y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const vizItems = [
    '• Forma de Onda: Representación visual de la amplitud del audio',
    '• Espectrograma: Distribución de frecuencias mostrando patrones espectrales',
    '• Análisis de Frecuencia: Identificación de componentes armónicos y ruido',
  ];

  vizItems.forEach((item) => {
    doc.text(item, 20, y);
    y += 4;
  });

  y += 4;

  // Try to embed the spectrogram image if available
  if (assets?.spectrogram) {
    try {
      const spectrogramBase64 = await fetchImageAsBase64(assets.spectrogram);
      if (spectrogramBase64) {
        // Check if we need a new page for the image
        y = checkNewPage(doc, y, 70);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Espectrograma:', 18, y);
        y += 5;

        // Add the image - spectrogram images are typically wide
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 36; // Leave margins
        const imgHeight = 50; // Fixed height, aspect ratio may vary

        doc.addImage(spectrogramBase64, 'PNG', 18, y, imgWidth, imgHeight);
        y += imgHeight + 8;

        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text('Espectrograma generado durante el análisis forense del audio.', 18, y);
        y += 6;
      } else {
        doc.setTextColor(200, 100, 100);
        doc.setFontSize(7);
        doc.text('[No se pudo cargar el espectrograma]', 20, y);
        y += 4;
      }
    } catch (error) {
      console.error('Error embedding spectrogram:', error);
      doc.setTextColor(200, 100, 100);
      doc.setFontSize(7);
      doc.text('[Error al cargar el espectrograma]', 20, y);
      y += 4;
    }
  } else {
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('Las visualizaciones interactivas están disponibles en la versión web del análisis.', 20, y);
    y += 4;
  }

  y += 4;

  // ============================================
  // DATOS TÉCNICOS (only if has data)
  // ============================================
  const hasTechData = raw_results_summary && (
    raw_results_summary.duration_seconds ||
    raw_results_summary.sample_rate ||
    raw_results_summary.channels ||
    raw_results_summary.format
  );

  if (hasTechData) {
    y = checkNewPage(doc, y, 35);
    y = addSectionTitle(doc, 'Datos Técnicos', y);

    if (raw_results_summary.duration_seconds) {
      y = addKeyValue(doc, 'Duración:', `${raw_results_summary.duration_seconds.toFixed(2)} seg`, y, 25);
    }
    if (raw_results_summary.sample_rate) {
      y = addKeyValue(doc, 'Frecuencia:', `${raw_results_summary.sample_rate} Hz`, y, 25);
    }
    if (raw_results_summary.channels) {
      y = addKeyValue(doc, 'Canales:', raw_results_summary.channels.toString(), y, 22);
    }
    if (raw_results_summary.format) {
      y = addKeyValue(doc, 'Formato:', raw_results_summary.format, y, 22);
    }
    y += 4;
  }

  // Recommendations
  if (recommendations && recommendations.length > 0) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Recomendaciones', y);

    recommendations.forEach((rec, index) => {
      y = checkNewPage(doc, y, 12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const recText = doc.splitTextToSize(`${index + 1}. ${rec}`, 160);
      doc.text(recText, 20, y);
      y += recText.length * 4 + 3;
    });
    y += 4;
  }

  // Chain of Custody
  if (chain_of_custody && chain_of_custody.length > 0) {
    y = checkNewPage(doc, y, 40);
    y = addSectionTitle(doc, 'Cadena de Custodia', y);

    chain_of_custody.forEach((event) => {
      y = checkNewPage(doc, y, 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${new Date(event.timestamp).toLocaleString('es-CO')} - ${event.action}`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      y += 4;
      doc.text(`${event.actor}: ${event.details}`, 20, y);
      if (event.hash) {
        y += 3;
        doc.setFontSize(6);
        doc.text(`Hash: ${event.hash}`, 20, y);
      }
      y += 6;
    });
  }

  addFooter(doc);

  // Download
  const filename = `botilito-audio-${caseNumber || 'reporte'}-${Date.now()}.pdf`;
  doc.save(filename);
}
