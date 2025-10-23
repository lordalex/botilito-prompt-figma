/**
 * Error Manager
 * Centralized error handling system for Botilito
 *
 * @example Basic usage
 * ```typescript
 * import { ErrorManager, ERROR_CODES } from '@/utils/errorManager';
 *
 * // Create an error
 * const error = ErrorManager.createError({
 *   code: 'ERR_API_OPENROUTER_TIMEOUT',
 *   context: { jobId: '123', attempt: 2 }
 * });
 *
 * // Execute with retry
 * const result = await ErrorManager.withRetry(
 *   () => callApi(),
 *   { maxRetries: 3 }
 * );
 *
 * // Execute with circuit breaker
 * const result = await ErrorManager.withCircuitBreaker(
 *   'OpenRouter',
 *   () => callApi()
 * );
 * ```
 */

// Core exports
export { ErrorManager, errorManager } from './ErrorManager';
export { ERROR_CODES, getErrorCodeDefinition, ALL_ERROR_CODES } from './ErrorCodes';
export { ERROR_MESSAGES, getErrorMessage, formatErrorMessage } from './ErrorMessages';

// Retry strategy exports
export {
  withRetry,
  withRetryAndTimeout,
  retryBatch,
  calculateRetryDelay,
  shouldRetry,
  sleep,
  exponentialBackoff,
  DEFAULT_RETRY_CONFIG,
  Retry,
} from './RetryStrategy';

// Circuit breaker exports
export {
  CircuitBreaker,
  CircuitBreakerRegistry,
  circuitBreakerRegistry,
  DEFAULT_CIRCUIT_BREAKER_CONFIGS,
} from './CircuitBreaker';

// Type exports
export type {
  BotilitoError,
  ErrorCategory,
  ErrorSeverity,
  RecoveryStrategy,
  ErrorContext,
  RetryConfig,
  CircuitBreakerConfig,
  CircuitBreakerState,
  BackoffStrategy,
  ErrorMetrics,
  ErrorLogEntry,
  ErrorHandler,
  WrappedFunction,
} from './types';
