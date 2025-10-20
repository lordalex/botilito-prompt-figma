/**
 * Utilidad para generar códigos de caso unificados en Botilito
 * 
 * Formato: TIPO-VECTOR-FECHA-SECUENCIA
 * 
 * TIPO (Tipo de contenido):
 * - T: Texto
 * - I: Imagen
 * - V: Video
 * - A: Audio
 * 
 * VECTOR (Plataforma/Vector de transmisión):
 * - WA: WhatsApp
 * - FB: Facebook
 * - TW: Twitter/X
 * - IG: Instagram
 * - TK: TikTok
 * - YT: YouTube
 * - TL: Telegram
 * - WB: Web/Sitio
 * - EM: Email
 * - SM: SMS
 * - OT: Otro
 * 
 * FECHA: YYYYMMDD
 * SECUENCIA: Número de 3 dígitos (001-999)
 * 
 * Ejemplo: T-WA-20241014-001 (Texto de WhatsApp del 14 de octubre de 2024, caso #001)
 */

export type ContentType = 'texto' | 'imagen' | 'video' | 'audio' | 'url';
export type TransmissionVector = 
  | 'WhatsApp' 
  | 'Facebook' 
  | 'Twitter/X' 
  | 'Instagram' 
  | 'TikTok' 
  | 'YouTube' 
  | 'Telegram' 
  | 'Web' 
  | 'Email' 
  | 'SMS' 
  | 'Otro';

// Mapeo de tipos de contenido a códigos
const contentTypeMap: Record<ContentType, string> = {
  'texto': 'T',
  'imagen': 'I',
  'video': 'V',
  'audio': 'A',
  'url': 'T' // Las URLs se consideran texto
};

// Mapeo de vectores de transmisión a códigos
const transmissionVectorMap: Record<TransmissionVector, string> = {
  'WhatsApp': 'WA',
  'Facebook': 'FB',
  'Twitter/X': 'TW',
  'Instagram': 'IG',
  'TikTok': 'TK',
  'YouTube': 'YT',
  'Telegram': 'TL',
  'Web': 'WB',
  'Email': 'EM',
  'SMS': 'SM',
  'Otro': 'OT'
};

/**
 * Genera un código de caso único basado en el tipo de contenido y vector de transmisión
 */
export function generateCaseCode(
  contentType: ContentType,
  transmissionVector: TransmissionVector = 'Otro'
): string {
  // Obtener código de tipo
  const typeCode = contentTypeMap[contentType] || 'T';
  
  // Obtener código de vector
  const vectorCode = transmissionVectorMap[transmissionVector] || 'OT';
  
  // Obtener fecha en formato YYYYMMDD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateCode = `${year}${month}${day}`;
  
  // Generar secuencia aleatoria de 3 dígitos
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Construir código completo
  return `${typeCode}-${vectorCode}-${dateCode}-${sequence}`;
}

/**
 * Extrae información de un código de caso
 */
export function parseCaseCode(caseCode: string): {
  contentType: string;
  transmissionVector: string;
  date: string;
  sequence: string;
} | null {
  // Formato esperado: X-XX-YYYYMMDD-XXX
  const parts = caseCode.split('-');
  
  if (parts.length !== 4) {
    return null;
  }
  
  const [typeCode, vectorCode, dateCode, sequence] = parts;
  
  // Buscar tipo de contenido
  const contentTypeEntry = Object.entries(contentTypeMap).find(
    ([_, code]) => code === typeCode
  );
  
  // Buscar vector de transmisión
  const vectorEntry = Object.entries(transmissionVectorMap).find(
    ([_, code]) => code === vectorCode
  );
  
  return {
    contentType: contentTypeEntry ? contentTypeEntry[0] : 'desconocido',
    transmissionVector: vectorEntry ? vectorEntry[0] : 'desconocido',
    date: dateCode,
    sequence: sequence
  };
}

/**
 * Obtiene una descripción legible del código de caso
 */
export function getCaseCodeDescription(caseCode: string): string {
  const parsed = parseCaseCode(caseCode);
  
  if (!parsed) {
    return 'Código inválido';
  }
  
  // Formatear fecha
  const year = parsed.date.substring(0, 4);
  const month = parsed.date.substring(4, 6);
  const day = parsed.date.substring(6, 8);
  const formattedDate = `${day}/${month}/${year}`;
  
  // Traducir tipo de contenido
  const contentTypeNames: Record<string, string> = {
    'texto': 'Texto',
    'imagen': 'Imagen',
    'video': 'Video',
    'audio': 'Audio',
    'url': 'URL'
  };
  
  const contentTypeName = contentTypeNames[parsed.contentType] || parsed.contentType;
  
  return `${contentTypeName} vía ${parsed.transmissionVector} • ${formattedDate} • #${parsed.sequence}`;
}

/**
 * Genera un código de caso legacy para compatibilidad
 * Formato antiguo: CASO-TIMESTAMP-XXX
 */
export function generateLegacyCaseCode(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CASO-${timestamp}-${randomSuffix}`;
}
