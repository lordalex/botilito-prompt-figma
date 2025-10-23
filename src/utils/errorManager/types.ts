/**
 * Error Manager Types
 * Comprehensive type definitions for centralized error handling
 */

// Error categories based on the origin of the error
export type ErrorCategory =
  | 'CONFIGURATION' // Missing or invalid environment variables
  | 'API' // External API failures (OpenRouter, Google, Browserless)
  | 'DATABASE' // Supabase database operations
  | 'TIMEOUT' // Operation exceeded time limit
  | 'VALIDATION' // Invalid input data
  | 'NETWORK' // Network connectivity issues
  | 'PARSING' // JSON/data parsing failures
  | 'AUTHENTICATION' // Auth token validation failures
  | 'RATE_LIMIT' // API rate limiting
  | 'UNKNOWN'; // Unclassified errors

// Error severity levels
export type ErrorSeverity =
  | 'CRITICAL' // System cannot continue, requires immediate attention
  | 'HIGH' // Feature unavailable, requires attention
  | 'MEDIUM' // Degraded functionality, can continue with fallback
  | 'LOW'; // Minor issue, logged for tracking

// Recovery strategies for different error types
export type RecoveryStrategy =
  | 'RETRY' // Attempt the operation again
  | 'FALLBACK' // Use alternative method/data
  | 'FAIL' // Stop execution and report error
  | 'CIRCUIT_BREAKER' // Temporarily disable service
  | 'SKIP'; // Skip this step and continue

// Retry backoff strategies
export type BackoffStrategy = 'LINEAR' | 'EXPONENTIAL' | 'FIXED';

/**
 * Core error interface
 */
export interface BotilitoError {
  // Unique error code (e.g., 'ERR_API_OPENROUTER_TIMEOUT')
  code: string;

  // Error category
  category: ErrorCategory;

  // Severity level
  severity: ErrorSeverity;

  // Technical error message (for logs)
  message: string;

  // User-friendly message in Spanish
  userMessage: string;

  // Additional context about the error
  context?: ErrorContext;

  // Timestamp when error occurred
  timestamp: string;

  // Stack trace (optional)
  stack?: string;

  // Original error object (if wrapped)
  originalError?: Error | unknown;

  // Whether this error can be recovered from
  recoverable: boolean;

  // Suggested recovery strategy
  suggestedAction: RecoveryStrategy;

  // HTTP status code (for API responses)
  httpStatus?: number;
}

/**
 * Context information for errors
 */
export interface ErrorContext {
  // Job ID if applicable
  jobId?: string;

  // User ID if applicable
  userId?: string;

  // Current processing phase
  phase?: string;

  // Retry attempt number
  attempt?: number;

  // URL being processed
  url?: string;

  // API endpoint
  endpoint?: string;

  // Service name (OpenRouter, Browserless, etc.)
  service?: string;

  // Request/response data
  requestData?: unknown;
  responseData?: unknown;

  // Additional custom context
  [key: string]: unknown;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  // Maximum number of retry attempts
  maxRetries: number;

  // Base delay in milliseconds
  baseDelay: number;

  // Maximum delay cap in milliseconds
  maxDelay: number;

  // Backoff strategy
  backoff: BackoffStrategy;

  // Whether to add jitter to prevent thundering herd
  jitter: boolean;

  // Specific error codes that should NOT be retried
  nonRetryableErrors?: string[];

  // Callback on each retry attempt
  onRetry?: (attempt: number, error: BotilitoError) => void;
}

/**
 * Circuit breaker state
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  // Service identifier
  serviceName: string;

  // Number of failures before opening circuit
  failureThreshold: number;

  // Time window for counting failures (ms)
  failureWindow: number;

  // Time to wait before attempting recovery (ms)
  cooldownPeriod: number;

  // Number of successful calls needed to close circuit
  successThreshold: number;

  // Callback when circuit state changes
  onStateChange?: (state: CircuitBreakerState, serviceName: string) => void;
}

/**
 * Error metrics tracking
 */
export interface ErrorMetrics {
  // Error code
  code: string;

  // Category
  category: ErrorCategory;

  // Count of occurrences
  count: number;

  // First occurrence timestamp
  firstSeen: string;

  // Last occurrence timestamp
  lastSeen: string;

  // Average resolution time (ms)
  avgResolutionTime?: number;

  // Success rate after retry
  retrySuccessRate?: number;
}

/**
 * Error log entry for database storage
 */
export interface ErrorLogEntry {
  id?: string;
  error_code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  user_message: string;
  context: ErrorContext;
  timestamp: string;
  stack?: string;
  job_id?: string;
  user_id?: string;
  resolved: boolean;
  resolution_time?: number;
}

/**
 * Error handler function type
 */
export type ErrorHandler<T = unknown> = (error: BotilitoError) => T | Promise<T>;

/**
 * Wrapped function with error handling
 */
export type WrappedFunction<T extends unknown[], R> = (...args: T) => Promise<R>;
