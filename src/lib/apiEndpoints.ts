const SUPABASE_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co';

// Text & Media Analysis API (v1.2.0 - AMI UNESCO)
export const TEXT_ANALYSIS_BASE_URL = `${SUPABASE_URL}/functions/v1/text-analysis-DTO`;

// Search DTO API (v2.3.0 - Unified Search, Lookup, Dashboard)
// Replaces legacy vector-async API
export const SEARCH_DTO_BASE_URL = `${SUPABASE_URL}/functions/v1/search-dto`;
export const SEARCH_ENDPOINT = `${SEARCH_DTO_BASE_URL}/search`;
export const SUMMARY_ENDPOINT = `${SEARCH_DTO_BASE_URL}/summary`;
export const LOOKUP_ENDPOINT = `${SEARCH_DTO_BASE_URL}/lookup`;
export const STATUS_ENDPOINT = `${SEARCH_DTO_BASE_URL}/status`;

// Legacy alias (for backwards compatibility during migration)
export const VECTOR_ASYNC_BASE_URL = SEARCH_DTO_BASE_URL;

// Vote API (v2.4.0)
export const VOTE_API_URL = `${SUPABASE_URL}/functions/v1/vote-auth-async-verbose`;
export const VOTE_SUBMIT_ENDPOINT = VOTE_API_URL;

// Profile API
export const PROFILE_API_URL = `${SUPABASE_URL}/functions/v1/profileCRUD`;

// Image Analysis API
export const IMAGE_ANALYSIS_BASE_URL = `${SUPABASE_URL}/functions/v1/image-analysis`;

// Audio Analysis API
export const AUDIO_ANALYSIS_BASE_URL = `${SUPABASE_URL}/functions/v1/audio-analysis`;

// Legacy/Other APIs
export const WEB_SNAPSHOT_URL = `${SUPABASE_URL}/functions/v1/web-snapshot`;
export const ANALYSIS_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/analysis_function`;

// Immunization API
export const IMMUNIZATION_API_URL = `${SUPABASE_URL}/functions/v1/inmunizacion`;

// Admin Dashboard API
export const ADMIN_DASHBOARD_URL = `${SUPABASE_URL}/functions/v1/admin-dashboard`;

// User Roles API
export const UPDATE_USER_ROLE = `${SUPABASE_URL}/functions/v1/update-user-role`;
