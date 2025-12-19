const SUPABASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co';

// Vector Async API (v2.4.0)
export const VECTOR_ASYNC_BASE_URL = `${SUPABASE_URL}/functions/v1/vector-async`;
export const SEARCH_ENDPOINT = `${VECTOR_ASYNC_BASE_URL}/search`;
export const SUMMARY_ENDPOINT = `${VECTOR_ASYNC_BASE_URL}/summary`;
export const LOOKUP_ENDPOINT = `${VECTOR_ASYNC_BASE_URL}/lookup`;
export const STATUS_ENDPOINT = `${VECTOR_ASYNC_BASE_URL}/status`;

// Vote API (v2.4.0)
export const VOTE_API_URL = `${SUPABASE_URL}/functions/v1/vote-auth-async-verbose`;
export const VOTE_SUBMIT_ENDPOINT = VOTE_API_URL;

// Profile API
export const PROFILE_API_URL = `${SUPABASE_URL}/functions/v1/profileCRUD`;

// Image Analysis API
export const IMAGE_ANALYSIS_BASE_URL = `${SUPABASE_URL}/functions/v1/image-analysis`;

// Legacy/Other APIs
export const WEB_SNAPSHOT_URL = `${SUPABASE_URL}/functions/v1/web-snapshot`;
export const ANALYSIS_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/analysis_function`;

// Immunization API
export const IMMUNIZATION_API_URL = `${SUPABASE_URL}/functions/v1/inmunizacion`;

// Admin Dashboard API
export const ADMIN_DASHBOARD_URL = `${SUPABASE_URL}/functions/v1/admin-dashboard`;
