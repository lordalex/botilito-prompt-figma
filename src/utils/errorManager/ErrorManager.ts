/**
 * Error Manager
 * Centralized error handling, retry logic, and circuit breaker management
 */

import type {
  BotilitoError,
  ErrorContext,
  ErrorCategory,
  ErrorSeverity,
  RecoveryStrategy,
  RetryConfig,
  WrappedFunction,
  ErrorMetrics,
} from './types';
import { ERROR_CODES, getErrorCodeDefinition } from './ErrorCodes';
import { getErrorMessage, formatErrorMessage } from './ErrorMessages';
import { withRetry, DEFAULT_RETRY_CONFIG } from './RetryStrategy';
import { circuitBreakerRegistry } from './CircuitBreaker';

/**
 * Error creation options
 */
interface CreateErrorOptions {
  code: string;
  message?: string;
  context?: ErrorContext;
  originalError?: Error | unknown;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  recoverable?: boolean;
  suggestedAction?: RecoveryStrategy;
}

/**
 * ErrorManager class
 */
export class ErrorManager {
  private static errorMetrics = new Map<string, ErrorMetrics>();

  /**
   * Create a structured Botilito error
   */
  static createError(options: CreateErrorOptions): BotilitoError {
    const { code, message, context, originalError } = options;

    // Get error code definition
    const definition = getErrorCodeDefinition(code);

    // Get error messages
    const errorMessages = getErrorMessage(code);

    // Build the error object
    const error: BotilitoError = {
      code,
      category: options.category || definition?.category || 'UNKNOWN',
      severity: options.severity || definition?.severity || 'MEDIUM',
      message:
        message || errorMessages.technicalMessage || 'An error occurred',
      userMessage: errorMessages.userMessage,
      context: context || {},
      timestamp: new Date().toISOString(),
      recoverable: options.recoverable ?? definition?.recoverable ?? true,
      suggestedAction:
        options.suggestedAction || definition?.suggestedAction || 'FAIL',
      httpStatus: definition?.httpStatus || 500,
    };

    // Include original error information
    if (originalError) {
      error.originalError = originalError;
      if (originalError instanceof Error) {
        error.stack = originalError.stack;
      }
    }

    // Track error metrics
    this.trackError(error);

    return error;
  }

  /**
   * Wrap an error with additional context
   */
  static wrapError(
    originalError: Error | unknown,
    code: string,
    context?: ErrorContext
  ): BotilitoError {
    // If already a BotilitoError, enhance it with new context
    if (this.isBotilitoError(originalError)) {
      return {
        ...originalError,
        context: { ...originalError.context, ...context },
      };
    }

    // Create new BotilitoError from generic error
    return this.createError({
      code,
      context,
      originalError,
      message:
        originalError instanceof Error
          ? originalError.message
          : String(originalError),
    });
  }

  /**
   * Check if error is a BotilitoError
   */
  static isBotilitoError(error: unknown): error is BotilitoError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'category' in error &&
      'severity' in error
    );
  }

  /**
   * Execute function with retry logic
   */
  static async withRetry<T extends unknown[], R>(
    fn: WrappedFunction<T, R>,
    config?: Partial<RetryConfig>,
    ...args: T
  ): Promise<R> {
    return withRetry(fn, config, ...args);
  }

  /**
   * Execute function with circuit breaker protection
   */
  static async withCircuitBreaker<T extends unknown[], R>(
    serviceName: string,
    fn: WrappedFunction<T, R>,
    ...args: T
  ): Promise<R> {
    const breaker = circuitBreakerRegistry.get(serviceName);

    if (!breaker) {
      throw this.createError({
        code: 'ERR_UNKNOWN',
        message: `Circuit breaker not found for service: ${serviceName}`,
        context: { serviceName },
      });
    }

    return breaker.execute(fn, ...args);
  }

  /**
   * Execute function with both retry and circuit breaker
   */
  static async withRetryAndCircuitBreaker<T extends unknown[], R>(
    serviceName: string,
    fn: WrappedFunction<T, R>,
    config?: Partial<RetryConfig>,
    ...args: T
  ): Promise<R> {
    return this.withRetry(
      async (...innerArgs: T) => {
        return this.withCircuitBreaker(serviceName, fn, ...innerArgs);
      },
      config,
      ...args
    );
  }

  /**
   * Handle an error (log, track, and potentially recover)
   */
  static async handleError(
    error: Error | BotilitoError | unknown,
    context?: ErrorContext
  ): Promise<void> {
    // Convert to BotilitoError if needed
    let botilitoError: BotilitoError;

    if (this.isBotilitoError(error)) {
      botilitoError = error;
      if (context) {
        botilitoError.context = { ...botilitoError.context, ...context };
      }
    } else {
      botilitoError = this.wrapError(error, 'ERR_UNKNOWN', context);
    }

    // Log the error
    this.logError(botilitoError);

    // Track metrics
    this.trackError(botilitoError);

    // Store in database (if applicable)
    await this.storeError(botilitoError);
  }

  /**
   * Log an error
   */
  private static logError(error: BotilitoError): void {
    const logLevel =
      error.severity === 'CRITICAL' || error.severity === 'HIGH'
        ? 'error'
        : error.severity === 'MEDIUM'
        ? 'warn'
        : 'info';

    const logMessage = `[${error.code}] ${error.message}`;

    const logData = {
      code: error.code,
      category: error.category,
      severity: error.severity,
      userMessage: error.userMessage,
      context: error.context,
      timestamp: error.timestamp,
      recoverable: error.recoverable,
      suggestedAction: error.suggestedAction,
      stack: error.stack,
    };

    console[logLevel](logMessage, logData);
  }

  /**
   * Track error metrics
   */
  private static trackError(error: BotilitoError): void {
    const existing = this.errorMetrics.get(error.code);

    if (existing) {
      existing.count++;
      existing.lastSeen = error.timestamp;
    } else {
      this.errorMetrics.set(error.code, {
        code: error.code,
        category: error.category,
        count: 1,
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
      });
    }
  }

  /**
   * Get error metrics
   */
  static getMetrics(): ErrorMetrics[] {
    return Array.from(this.errorMetrics.values());
  }

  /**
   * Get metrics for a specific error code
   */
  static getMetricsForCode(code: string): ErrorMetrics | undefined {
    return this.errorMetrics.get(code);
  }

  /**
   * Reset error metrics
   */
  static resetMetrics(): void {
    this.errorMetrics.clear();
  }

  /**
   * Store error in database (placeholder for future implementation)
   */
  private static async storeError(error: BotilitoError): Promise<void> {
    // TODO: Implement database storage
    // This would insert error into a Supabase error_logs table
    // For now, just return
    return Promise.resolve();
  }

  /**
   * Format error for API response
   */
  static formatForResponse(error: BotilitoError): {
    error: string;
    message: string;
    code: string;
    timestamp: string;
    context?: ErrorContext;
  } {
    return {
      error: error.userMessage,
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      ...(error.context && { context: error.context }),
    };
  }

  /**
   * Create error response with proper HTTP status
   */
  static createErrorResponse(error: BotilitoError): Response {
    const body = this.formatForResponse(error);

    return new Response(JSON.stringify(body), {
      status: error.httpStatus || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  /**
   * Get circuit breaker status for all services
   */
  static getCircuitBreakerStatus(): Record<string, string> {
    return circuitBreakerRegistry.getStatus();
  }

  /**
   * Reset a specific circuit breaker
   */
  static resetCircuitBreaker(serviceName: string): void {
    circuitBreakerRegistry.reset(serviceName);
  }

  /**
   * Reset all circuit breakers
   */
  static resetAllCircuitBreakers(): void {
    circuitBreakerRegistry.resetAll();
  }

  /**
   * Get all error codes
   */
  static getAllErrorCodes(): typeof ERROR_CODES {
    return ERROR_CODES;
  }
}

/**
 * Export singleton instance
 */
export const errorManager = ErrorManager;
