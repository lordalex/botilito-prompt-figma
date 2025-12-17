import { supabase } from '@/utils/supabase/client';

const FUNCTION_NAME = 'image-analysis';

export interface AnalysisResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  result?: any;
  error?: string;
}

// Helper: Convertir File a Base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// 1. Enviar Imagen (Submit) - POST /submit
export async function submitImageAnalysis(imageBase64: string): Promise<AnalysisResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa.');

  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  // Construimos la URL manualmente para evitar errores de librerías
  const url = `${projectUrl}/functions/v1/${FUNCTION_NAME}/submit`;

  console.log('Enviando imagen a:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error del servidor: ${response.status}`);
  }

  return await response.json();
}

// 2. Consultar Estado (Poll) - GET /status/:jobId
export async function getJobStatus(jobId: string): Promise<AnalysisResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa.');

  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const url = `${projectUrl}/functions/v1/${FUNCTION_NAME}/status/${jobId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al consultar estado: ${response.status}`);
  }

  return await response.json();
}

