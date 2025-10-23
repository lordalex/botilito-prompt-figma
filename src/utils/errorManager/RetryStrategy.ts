/**
 * Retry Strategy
 * Implements retry logic with exponential backoff and jitter
 */

import type { RetryConfig, BotilitoError, WrappedFunction } from './types';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoff: 'EXPONENTIAL',
  jitter: true,
  nonRetryableErrors: [
    'ERR_VALIDATION_MISSING_URL_OR_TEXT',
    'ERR_VALIDATION_TEXT_TOO_LONG',
    'ERR_VALIDATION_INVALID_VECTOR',
    'ERR_AUTH_MISSING_TOKEN',
    'ERR_AUTH_INVALID_TOKEN',
    'ERR_AUTH_UNAUTHORIZED',
    'ERR_CONFIG_MISSING_SUPABASE_URL',
    'ERR_CONFIG_MISSING_SERVICE_KEY',
    'ERR_CONFIG_INVALID_AI_CONFIG',
  ],
};

/**
 * Calculate delay for next retry attempt
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  let delay: number;

  switch (config.backoff) {
    case 'LINEAR':
      delay = config.baseDelay * attempt;
      break;
    case 'EXPONENTIAL':
      delay = config.baseDelay * Math.pow(2, attempt - 1);
      break;
    case 'FIXED':
      delay = config.baseDelay;
      break;
    default:
      delay = config.baseDelay;
  }

  // Cap at maxDelay
  delay = Math.min(delay, config.maxDelay);

  // Add jitter to prevent thundering herd
  if (config.jitter) {
    const jitter = Math.random() * 0.3 * delay; // ±30% jitter
    delay = delay + jitter - (0.15 * delay);
  }

  return Math.floor(delay);
}

/**
 * Check if an error should be retried
 */
export function shouldRetry(
  error: BotilitoError,
  attempt: number,
  config: RetryConfig
): boolean {
  // Check if max retries exceeded
  if (attempt >= config.maxRetries) {
    return false;
  }

  // Check if error is non-retryable
  if (config.nonRetryableErrors?.includes(error.code)) {
    return false;
  }

  // Check if error is explicitly marked as non-recoverable
  if (!error.recoverable) {
    return false;
  }

  // Check if error suggests retry
  if (error.suggestedAction === 'RETRY') {
    return true;
  }

  return false;
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for async functions
 */
export async function withRetry<T extends unknown[], R>(
  fn: WrappedFunction<T, R>,
  config: Partial<RetryConfig> = {},
  ...args: T
): Promise<R> {
  const finalConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: BotilitoError | null = null;
  let attempt = 0;

  while (attempt < finalConfig.maxRetries) {
    attempt++;

    try {
      // Attempt the operation
      const result = await fn(...args);

      // Success! Reset any circuit breaker state if needed
      return result;
    } catch (error) {
      // Convert to BotilitoError if it isn't already
      lastError = error as BotilitoError;

      // Check if we should retry
      if (!shouldRetry(lastError, attempt, finalConfig)) {
        throw lastError;
      }

      // Call retry callback if provided
      if (finalConfig.onRetry) {
        finalConfig.onRetry(attempt, lastError);
      }

      // Calculate delay and wait before next attempt
      if (attempt < finalConfig.maxRetries) {
        const delay = calculateRetryDelay(attempt, finalConfig);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Retry decorator for class methods
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return withRetry(
        async () => originalMethod.apply(this, args),
        config
      );
    };

    return descriptor;
  };
}

/**
 * Batch retry for multiple operations
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  config: Partial<RetryConfig> = {}
): Promise<Array<T | Error>> {
  const results = await Promise.allSettled(
    operations.map((op) => withRetry(op, config))
  );

  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : result.reason
  );
}

/**
 * Retry with timeout
 */
export async function withRetryAndTimeout<T extends unknown[], R>(
  fn: WrappedFunction<T, R>,
  timeoutMs: number,
  config: Partial<RetryConfig> = {},
  ...args: T
): Promise<R> {
  return Promise.race([
    withRetry(fn, config, ...args),
    new Promise<R>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Exponential backoff generator (for manual retry loops)
 */
export function* exponentialBackoff(
  baseDelay: number,
  maxDelay: number,
  maxRetries: number,
  jitter = true
): Generator<number, void, unknown> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let delay = baseDelay * Math.pow(2, attempt - 1);
    delay = Math.min(delay, maxDelay);

    if (jitter) {
      const jitterAmount = Math.random() * 0.3 * delay;
      delay = delay + jitterAmount - (0.15 * delay);
    }

    yield Math.floor(delay);
  }
}
