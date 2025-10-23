/**
 * Circuit Breaker
 * Prevents cascading failures by temporarily disabling failing services
 */

import type {
  CircuitBreakerConfig,
  CircuitBreakerState,
  WrappedFunction,
} from './types';

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get failure count in current window
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Get success count in current window
   */
  getSuccessCount(): number {
    return this.successCount;
  }

  /**
   * Check if circuit should allow request
   */
  canAttempt(): boolean {
    const now = Date.now();

    // CLOSED state: allow all requests
    if (this.state === 'CLOSED') {
      return true;
    }

    // OPEN state: check if cooldown period has passed
    if (this.state === 'OPEN') {
      if (this.nextAttemptTime && now >= this.nextAttemptTime) {
        // Transition to HALF_OPEN
        this.transitionTo('HALF_OPEN');
        return true;
      }
      return false; // Still cooling down
    }

    // HALF_OPEN state: allow limited requests
    if (this.state === 'HALF_OPEN') {
      return true;
    }

    return false;
  }

  /**
   * Record a successful call
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      // If enough successes, close the circuit
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo('CLOSED');
        this.successCount = 0;
      }
    }
  }

  /**
   * Record a failed call
   */
  recordFailure(): void {
    const now = Date.now();
    this.lastFailureTime = now;

    // Reset failure count if outside failure window
    if (
      this.lastFailureTime &&
      now - this.lastFailureTime > this.config.failureWindow
    ) {
      this.failureCount = 0;
    }

    this.failureCount++;

    if (this.state === 'HALF_OPEN') {
      // Any failure in HALF_OPEN goes back to OPEN
      this.transitionTo('OPEN');
      this.successCount = 0;
      this.nextAttemptTime = now + this.config.cooldownPeriod;
    } else if (
      this.state === 'CLOSED' &&
      this.failureCount >= this.config.failureThreshold
    ) {
      // Too many failures, open the circuit
      this.transitionTo('OPEN');
      this.nextAttemptTime = now + this.config.cooldownPeriod;
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;

    // Call state change callback if provided
    if (this.config.onStateChange) {
      this.config.onStateChange(newState, this.config.serviceName);
    }

    console.log(
      `[CircuitBreaker] ${this.config.serviceName}: ${oldState} → ${newState}`
    );
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T extends unknown[], R>(
    fn: WrappedFunction<T, R>,
    ...args: T
  ): Promise<R> {
    if (!this.canAttempt()) {
      throw new Error(
        `Circuit breaker is OPEN for service: ${this.config.serviceName}`
      );
    }

    try {
      const result = await fn(...args);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}

/**
 * Circuit breaker registry to manage multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker for a service
   */
  getOrCreate(config: CircuitBreakerConfig): CircuitBreaker {
    const existing = this.breakers.get(config.serviceName);
    if (existing) {
      return existing;
    }

    const breaker = new CircuitBreaker(config);
    this.breakers.set(config.serviceName, breaker);
    return breaker;
  }

  /**
   * Get an existing circuit breaker
   */
  get(serviceName: string): CircuitBreaker | undefined {
    return this.breakers.get(serviceName);
  }

  /**
   * Check if a service circuit is open
   */
  isOpen(serviceName: string): boolean {
    const breaker = this.breakers.get(serviceName);
    return breaker?.getState() === 'OPEN' || false;
  }

  /**
   * Reset a specific circuit breaker
   */
  reset(serviceName: string): void {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get status of all circuit breakers
   */
  getStatus(): Record<string, CircuitBreakerState> {
    const status: Record<string, CircuitBreakerState> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      status[name] = breaker.getState();
    }
    return status;
  }
}

/**
 * Default circuit breaker configurations for known services
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIGS: Record<
  string,
  CircuitBreakerConfig
> = {
  OpenRouter: {
    serviceName: 'OpenRouter',
    failureThreshold: 5,
    failureWindow: 60000, // 1 minute
    cooldownPeriod: 30000, // 30 seconds
    successThreshold: 2,
  },
  Gemini: {
    serviceName: 'Gemini',
    failureThreshold: 5,
    failureWindow: 60000,
    cooldownPeriod: 30000,
    successThreshold: 2,
  },
  Browserless: {
    serviceName: 'Browserless',
    failureThreshold: 3,
    failureWindow: 60000,
    cooldownPeriod: 20000,
    successThreshold: 2,
  },
  Supabase: {
    serviceName: 'Supabase',
    failureThreshold: 10,
    failureWindow: 60000,
    cooldownPeriod: 10000,
    successThreshold: 3,
  },
};

/**
 * Global circuit breaker registry instance
 */
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

// Initialize default circuit breakers
for (const config of Object.values(DEFAULT_CIRCUIT_BREAKER_CONFIGS)) {
  circuitBreakerRegistry.getOrCreate(config);
}
