import type { Session } from '@supabase/supabase-js';
import type { IngestRequest, JobStatusResponse } from '../types/botilito';

const CRUD_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/CRUD';
const INGEST_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/ingest-async-auth';
const VOTE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/vote-auth-async';

async function fetchWrapper(session: Session | null, url: string, options: RequestInit = {}): Promise<any> {
    if (!session) throw new Error("No hay sesión de usuario activa para realizar la llamada a la API.");
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}`, ...options.headers };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorBody.error || `Error de API: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {};
}

export const api = {
    crud: {
        search: async (session: Session | null, payload: { nombreTabla: string; criteriosBusqueda?: any; }) => 
            fetchWrapper(session, `${CRUD_URL}/buscar`, { method: 'POST', body: JSON.stringify({ documento: payload }) }),
        
        insert: async (session: Session | null, payload: { nombreTabla: string; datos: any; }) =>
            fetchWrapper(session, `${CRUD_URL}/insertar`, { method: 'POST', body: JSON.stringify({ documento: payload }) }),
    },
    ingestion: {
        submit: async (session: Session | null, payload: IngestRequest) =>
            fetchWrapper(session, `${INGEST_URL}/submit`, { method: 'POST', body: JSON.stringify(payload) }),
        
        getStatus: async (session: Session | null, jobId: string): Promise<JobStatusResponse> =>
            fetchWrapper(session, `${INGEST_URL}/status/${jobId}`),
    },
    voting: {
        submit: async (session: Session | null, payload: { case_id: string; classification: string; }) =>
            fetchWrapper(session, `${VOTE_URL}/submit`, { method: 'POST', body: JSON.stringify(payload) }),
        
        getStatus: async (session: Session | null, jobId: string): Promise<{ status: 'processing' | 'completed' | 'failed' }> =>
            fetchWrapper(session, `${VOTE_URL}/status/${jobId}`),
    }
};
