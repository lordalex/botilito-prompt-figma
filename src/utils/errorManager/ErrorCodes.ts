/**
 * Error Codes
 * Centralized error code constants for consistent error identification
 */

import type { ErrorCategory, ErrorSeverity, RecoveryStrategy } from './types';

/**
 * Error code definition
 */
export interface ErrorCodeDefinition {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoverable: boolean;
  suggestedAction: RecoveryStrategy;
  httpStatus?: number;
}

/**
 * Error code registry
 */
export const ERROR_CODES = {
  // ============================================================
  // CONFIGURATION ERRORS
  // ============================================================
  ERR_CONFIG_MISSING_SUPABASE_URL: {
    code: 'ERR_CONFIG_MISSING_SUPABASE_URL',
    category: 'CONFIGURATION' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_CONFIG_MISSING_SERVICE_KEY: {
    code: 'ERR_CONFIG_MISSING_SERVICE_KEY',
    category: 'CONFIGURATION' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_CONFIG_MISSING_OPENROUTER_KEY: {
    code: 'ERR_CONFIG_MISSING_OPENROUTER_KEY',
    category: 'CONFIGURATION' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_CONFIG_MISSING_GEMINI_KEY: {
    code: 'ERR_CONFIG_MISSING_GEMINI_KEY',
    category: 'CONFIGURATION' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_CONFIG_MISSING_BROWSERLESS_KEY: {
    code: 'ERR_CONFIG_MISSING_BROWSERLESS_KEY',
    category: 'CONFIGURATION' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_CONFIG_INVALID_AI_CONFIG: {
    code: 'ERR_CONFIG_INVALID_AI_CONFIG',
    category: 'CONFIGURATION' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 500,
  },

  // ============================================================
  // API ERRORS - OpenRouter
  // ============================================================
  ERR_API_OPENROUTER_TIMEOUT: {
    code: 'ERR_API_OPENROUTER_TIMEOUT',
    category: 'API' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 504,
  },
  ERR_API_OPENROUTER_RATE_LIMIT: {
    code: 'ERR_API_OPENROUTER_RATE_LIMIT',
    category: 'RATE_LIMIT' as ErrorCategory,
    severity: 'MEDIUM' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 429,
  },
  ERR_API_OPENROUTER_AUTH: {
    code: 'ERR_API_OPENROUTER_AUTH',
    category: 'AUTHENTICATION' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 401,
  },
  ERR_API_OPENROUTER_INVALID_RESPONSE: {
    code: 'ERR_API_OPENROUTER_INVALID_RESPONSE',
    category: 'API' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 502,
  },
  ERR_API_OPENROUTER_NO_CONTENT: {
    code: 'ERR_API_OPENROUTER_NO_CONTENT',
    category: 'API' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 502,
  },

  // ============================================================
  // API ERRORS - Google Gemini
  // ============================================================
  ERR_API_GEMINI_TIMEOUT: {
    code: 'ERR_API_GEMINI_TIMEOUT',
    category: 'API' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 504,
  },
  ERR_API_GEMINI_RATE_LIMIT: {
    code: 'ERR_API_GEMINI_RATE_LIMIT',
    category: 'RATE_LIMIT' as ErrorCategory,
    severity: 'MEDIUM' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 429,
  },
  ERR_API_GEMINI_INVALID_EMBEDDING: {
    code: 'ERR_API_GEMINI_INVALID_EMBEDDING',
    category: 'API' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 502,
  },

  // ============================================================
  // API ERRORS - Browserless
  // ============================================================
  ERR_API_BROWSERLESS_TIMEOUT: {
    code: 'ERR_API_BROWSERLESS_TIMEOUT',
    category: 'API' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 504,
  },
  ERR_API_BROWSERLESS_FETCH_FAILED: {
    code: 'ERR_API_BROWSERLESS_FETCH_FAILED',
    category: 'API' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 502,
  },
  ERR_API_BROWSERLESS_INVALID_URL: {
    code: 'ERR_API_BROWSERLESS_INVALID_URL',
    category: 'VALIDATION' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 400,
  },

  // ============================================================
  // DATABASE ERRORS
  // ============================================================
  ERR_DB_CONNECTION: {
    code: 'ERR_DB_CONNECTION',
    category: 'DATABASE' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 503,
  },
  ERR_DB_QUERY_FAILED: {
    code: 'ERR_DB_QUERY_FAILED',
    category: 'DATABASE' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_DB_INSERT_FAILED: {
    code: 'ERR_DB_INSERT_FAILED',
    category: 'DATABASE' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_DB_UPDATE_FAILED: {
    code: 'ERR_DB_UPDATE_FAILED',
    category: 'DATABASE' as ErrorCategory,
    severity: 'MEDIUM' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 500,
  },
  ERR_DB_JOB_NOT_FOUND: {
    code: 'ERR_DB_JOB_NOT_FOUND',
    category: 'DATABASE' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 404,
  },
  ERR_DB_RPC_FAILED: {
    code: 'ERR_DB_RPC_FAILED',
    category: 'DATABASE' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 500,
  },

  // ============================================================
  // TIMEOUT ERRORS
  // ============================================================
  ERR_TIMEOUT_JOB: {
    code: 'ERR_TIMEOUT_JOB',
    category: 'TIMEOUT' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 504,
  },
  ERR_TIMEOUT_STALE_JOB: {
    code: 'ERR_TIMEOUT_STALE_JOB',
    category: 'TIMEOUT' as ErrorCategory,
    severity: 'MEDIUM' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 504,
  },
  ERR_TIMEOUT_OPERATION: {
    code: 'ERR_TIMEOUT_OPERATION',
    category: 'TIMEOUT' as ErrorCategory,
    severity: 'MEDIUM' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 504,
  },

  // ============================================================
  // VALIDATION ERRORS
  // ============================================================
  ERR_VALIDATION_MISSING_URL_OR_TEXT: {
    code: 'ERR_VALIDATION_MISSING_URL_OR_TEXT',
    category: 'VALIDATION' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 400,
  },
  ERR_VALIDATION_TEXT_TOO_LONG: {
    code: 'ERR_VALIDATION_TEXT_TOO_LONG',
    category: 'VALIDATION' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 400,
  },
  ERR_VALIDATION_INVALID_VECTOR: {
    code: 'ERR_VALIDATION_INVALID_VECTOR',
    category: 'VALIDATION' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 400,
  },

  // ============================================================
  // PARSING ERRORS
  // ============================================================
  ERR_PARSING_JSON: {
    code: 'ERR_PARSING_JSON',
    category: 'PARSING' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 502,
  },
  ERR_PARSING_LLM_RESPONSE: {
    code: 'ERR_PARSING_LLM_RESPONSE',
    category: 'PARSING' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 502,
  },
  ERR_PARSING_AI_CONFIG: {
    code: 'ERR_PARSING_AI_CONFIG',
    category: 'PARSING' as ErrorCategory,
    severity: 'CRITICAL' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 500,
  },

  // ============================================================
  // AUTHENTICATION ERRORS
  // ============================================================
  ERR_AUTH_MISSING_TOKEN: {
    code: 'ERR_AUTH_MISSING_TOKEN',
    category: 'AUTHENTICATION' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 401,
  },
  ERR_AUTH_INVALID_TOKEN: {
    code: 'ERR_AUTH_INVALID_TOKEN',
    category: 'AUTHENTICATION' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 401,
  },
  ERR_AUTH_UNAUTHORIZED: {
    code: 'ERR_AUTH_UNAUTHORIZED',
    category: 'AUTHENTICATION' as ErrorCategory,
    severity: 'LOW' as ErrorSeverity,
    recoverable: false,
    suggestedAction: 'FAIL' as RecoveryStrategy,
    httpStatus: 403,
  },

  // ============================================================
  // NETWORK ERRORS
  // ============================================================
  ERR_NETWORK_CONNECTION: {
    code: 'ERR_NETWORK_CONNECTION',
    category: 'NETWORK' as ErrorCategory,
    severity: 'HIGH' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 503,
  },
  ERR_NETWORK_TIMEOUT: {
    code: 'ERR_NETWORK_TIMEOUT',
    category: 'NETWORK' as ErrorCategory,
    severity: 'MEDIUM' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 504,
  },

  // ============================================================
  // UNKNOWN ERRORS
  // ============================================================
  ERR_UNKNOWN: {
    code: 'ERR_UNKNOWN',
    category: 'UNKNOWN' as ErrorCategory,
    severity: 'MEDIUM' as ErrorSeverity,
    recoverable: true,
    suggestedAction: 'RETRY' as RecoveryStrategy,
    httpStatus: 500,
  },
} as const;

/**
 * Helper function to get error code definition
 */
export function getErrorCodeDefinition(code: string): ErrorCodeDefinition | undefined {
  return ERROR_CODES[code as keyof typeof ERROR_CODES];
}

/**
 * Export all error codes as array for iteration
 */
export const ALL_ERROR_CODES = Object.values(ERROR_CODES);
