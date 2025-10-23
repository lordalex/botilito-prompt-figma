# Error Manager 🛡️

Comprehensive error handling system for Botilito with retry logic, circuit breakers, and Spanish user-friendly messages.

## Features

✅ **Centralized Error Handling** - Single source of truth for all errors
✅ **Automatic Retry** - Exponential backoff with jitter
✅ **Circuit Breakers** - Prevent cascading failures
✅ **Spanish Messages** - User-friendly messages for Colombian users
✅ **Error Tracking** - Built-in metrics and analytics
✅ **TypeScript First** - Full type safety

---

## Quick Start

```typescript
import { ErrorManager, ERROR_CODES } from '@/utils/errorManager';

// Create an error
const error = ErrorManager.createError({
  code: 'ERR_API_OPENROUTER_TIMEOUT',
  context: { jobId: '123', attempt: 2 }
});

// Handle an error
await ErrorManager.handleError(error);

// Execute with retry
const result = await ErrorManager.withRetry(
  async () => await callApi(),
  { maxRetries: 3, baseDelay: 1000 }
);
```

---

## Core Concepts

### 1. Error Categories

Errors are classified into categories:

- **CONFIGURATION** - Missing or invalid environment variables
- **API** - External API failures (OpenRouter, Google, Browserless)
- **DATABASE** - Supabase database operations
- **TIMEOUT** - Operation exceeded time limit
- **VALIDATION** - Invalid input data
- **NETWORK** - Network connectivity issues
- **PARSING** - JSON/data parsing failures
- **AUTHENTICATION** - Auth token validation failures
- **RATE_LIMIT** - API rate limiting
- **UNKNOWN** - Unclassified errors

### 2. Error Severity

- **CRITICAL** - System cannot continue
- **HIGH** - Feature unavailable
- **MEDIUM** - Degraded functionality
- **LOW** - Minor issue

### 3. Recovery Strategies

- **RETRY** - Attempt operation again
- **FALLBACK** - Use alternative method
- **FAIL** - Stop and report error
- **CIRCUIT_BREAKER** - Disable service temporarily
- **SKIP** - Skip and continue

---

## Usage Examples

### Creating Errors

```typescript
// Simple error
const error = ErrorManager.createError({
  code: 'ERR_API_OPENROUTER_TIMEOUT'
});

// Error with context
const error = ErrorManager.createError({
  code: 'ERR_DB_QUERY_FAILED',
  context: {
    jobId: '123',
    userId: 'abc',
    query: 'SELECT * FROM documents'
  }
});

// Wrap existing error
try {
  await riskyOperation();
} catch (err) {
  throw ErrorManager.wrapError(
    err,
    'ERR_API_BROWSERLESS_FETCH_FAILED',
    { url: 'https://example.com' }
  );
}
```

### Retry Logic

```typescript
// Basic retry
const result = await ErrorManager.withRetry(
  async () => await callApi()
);

// Custom retry config
const result = await ErrorManager.withRetry(
  async () => await callApi(),
  {
    maxRetries: 5,
    baseDelay: 2000,
    backoff: 'EXPONENTIAL',
    jitter: true
  }
);

// With callback on each retry
const result = await ErrorManager.withRetry(
  async () => await callApi(),
  {
    maxRetries: 3,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    }
  }
);
```

### Circuit Breakers

```typescript
// Execute with circuit breaker protection
const result = await ErrorManager.withCircuitBreaker(
  'OpenRouter',
  async () => await callOpenRouter()
);

// Combined retry + circuit breaker
const result = await ErrorManager.withRetryAndCircuitBreaker(
  'OpenRouter',
  async () => await callOpenRouter(),
  { maxRetries: 3 }
);

// Check circuit breaker status
const status = ErrorManager.getCircuitBreakerStatus();
console.log(status); // { OpenRouter: 'CLOSED', Gemini: 'OPEN', ... }

// Manually reset a circuit breaker
ErrorManager.resetCircuitBreaker('OpenRouter');
```

### Error Handling

```typescript
// Handle error (logs, tracks, stores)
try {
  await operation();
} catch (err) {
  await ErrorManager.handleError(err, {
    jobId: '123',
    phase: 'API Call'
  });
}

// Create API error response
const error = ErrorManager.createError({
  code: 'ERR_VALIDATION_MISSING_URL_OR_TEXT'
});
return ErrorManager.createErrorResponse(error);
```

---

## Error Codes

All error codes are available in `ERROR_CODES` constant:

```typescript
import { ERROR_CODES } from '@/utils/errorManager';

// Access specific error code
const code = ERROR_CODES.ERR_API_OPENROUTER_TIMEOUT;
console.log(code);
// {
//   code: 'ERR_API_OPENROUTER_TIMEOUT',
//   category: 'API',
//   severity: 'HIGH',
//   recoverable: true,
//   suggestedAction: 'RETRY',
//   httpStatus: 504
// }
```

### Common Error Codes

**Configuration:**
- `ERR_CONFIG_MISSING_SUPABASE_URL`
- `ERR_CONFIG_MISSING_OPENROUTER_KEY`
- `ERR_CONFIG_MISSING_GEMINI_KEY`

**API - OpenRouter:**
- `ERR_API_OPENROUTER_TIMEOUT`
- `ERR_API_OPENROUTER_RATE_LIMIT`
- `ERR_API_OPENROUTER_NO_CONTENT`

**API - Gemini:**
- `ERR_API_GEMINI_TIMEOUT`
- `ERR_API_GEMINI_RATE_LIMIT`

**Database:**
- `ERR_DB_CONNECTION`
- `ERR_DB_QUERY_FAILED`
- `ERR_DB_INSERT_FAILED`

**Validation:**
- `ERR_VALIDATION_MISSING_URL_OR_TEXT`
- `ERR_VALIDATION_TEXT_TOO_LONG`

**Authentication:**
- `ERR_AUTH_MISSING_TOKEN`
- `ERR_AUTH_INVALID_TOKEN`

[See all error codes in ErrorCodes.ts](./ErrorCodes.ts)

---

## Spanish Error Messages

All user-facing messages are in Spanish (Colombian variant):

```typescript
import { getErrorMessage } from '@/utils/errorManager';

const message = getErrorMessage('ERR_API_OPENROUTER_TIMEOUT');
console.log(message.userMessage);
// "El análisis está tardando más de lo esperado. Por favor intenta de nuevo."

console.log(message.technicalMessage);
// "OpenRouter API request timed out"

console.log(message.userAction);
// "Intenta nuevamente. Si el problema persiste, verifica tu conexión."
```

---

## Metrics & Monitoring

```typescript
// Get all error metrics
const metrics = ErrorManager.getMetrics();
console.log(metrics);
// [
//   {
//     code: 'ERR_API_OPENROUTER_TIMEOUT',
//     category: 'API',
//     count: 12,
//     firstSeen: '2025-01-20T10:00:00Z',
//     lastSeen: '2025-01-20T14:30:00Z'
//   },
//   ...
// ]

// Get metrics for specific error code
const metric = ErrorManager.getMetricsForCode('ERR_DB_QUERY_FAILED');

// Reset metrics
ErrorManager.resetMetrics();
```

---

## Advanced Usage

### Batch Operations with Retry

```typescript
import { retryBatch } from '@/utils/errorManager';

const operations = [
  () => callApi1(),
  () => callApi2(),
  () => callApi3()
];

const results = await retryBatch(operations, {
  maxRetries: 3,
  baseDelay: 1000
});

// Results contain successes and failures
results.forEach((result, index) => {
  if (result instanceof Error) {
    console.error(`Operation ${index} failed:`, result);
  } else {
    console.log(`Operation ${index} succeeded:`, result);
  }
});
```

### Retry Decorator

```typescript
import { Retry } from '@/utils/errorManager';

class ApiService {
  @Retry({ maxRetries: 3, baseDelay: 1000 })
  async fetchData() {
    return await fetch('/api/data');
  }
}
```

### Manual Exponential Backoff

```typescript
import { exponentialBackoff } from '@/utils/errorManager';

const backoff = exponentialBackoff(1000, 30000, 5, true);

for (const delay of backoff) {
  try {
    await operation();
    break;
  } catch (err) {
    await sleep(delay);
  }
}
```

---

## Integration with Edge Functions

### Before (Old Pattern):

```typescript
try {
  const data = await callOpenRouterApi(endpoint, body);
  return data;
} catch (err) {
  throw new Error(`API failed: ${err.message}`);
}
```

### After (With Error Manager):

```typescript
import { ErrorManager } from '@/utils/errorManager';

try {
  const data = await ErrorManager.withRetryAndCircuitBreaker(
    'OpenRouter',
    async () => await callOpenRouterApi(endpoint, body),
    { maxRetries: 3, baseDelay: 1500 }
  );
  return data;
} catch (err) {
  throw ErrorManager.wrapError(err, 'ERR_API_OPENROUTER_TIMEOUT', {
    endpoint,
    jobId
  });
}
```

---

## Circuit Breaker Configuration

Default circuit breakers are configured for:

- **OpenRouter**: 5 failures/min → 30s cooldown
- **Gemini**: 5 failures/min → 30s cooldown
- **Browserless**: 3 failures/min → 20s cooldown
- **Supabase**: 10 failures/min → 10s cooldown

Configure custom circuit breaker:

```typescript
import { circuitBreakerRegistry } from '@/utils/errorManager';

const breaker = circuitBreakerRegistry.getOrCreate({
  serviceName: 'CustomAPI',
  failureThreshold: 5,
  failureWindow: 60000, // 1 minute
  cooldownPeriod: 30000, // 30 seconds
  successThreshold: 2,
  onStateChange: (state, name) => {
    console.log(`${name} circuit is now ${state}`);
  }
});
```

---

## TypeScript Support

Full TypeScript support with types:

```typescript
import type {
  BotilitoError,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  RetryConfig
} from '@/utils/errorManager';

function handleError(error: BotilitoError) {
  const category: ErrorCategory = error.category;
  const severity: ErrorSeverity = error.severity;
}
```

---

## Testing

```typescript
import { ErrorManager, ERROR_CODES } from '@/utils/errorManager';

describe('Error Manager', () => {
  it('should create error with correct properties', () => {
    const error = ErrorManager.createError({
      code: 'ERR_API_OPENROUTER_TIMEOUT',
      context: { jobId: '123' }
    });

    expect(error.code).toBe('ERR_API_OPENROUTER_TIMEOUT');
    expect(error.category).toBe('API');
    expect(error.severity).toBe('HIGH');
    expect(error.recoverable).toBe(true);
  });

  it('should retry on failure', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw new Error('Fail');
      return 'Success';
    };

    const result = await ErrorManager.withRetry(fn);
    expect(result).toBe('Success');
    expect(attempts).toBe(3);
  });
});
```

---

## Best Practices

1. **Always use error codes** - Don't create generic errors
2. **Provide context** - Include jobId, userId, phase, etc.
3. **Use retry strategically** - Not all operations should retry
4. **Monitor circuit breakers** - Check status regularly
5. **Log errors properly** - Use ErrorManager.handleError()
6. **Test error scenarios** - Write tests for error paths
7. **Use Spanish messages** - Keep user-facing text in Spanish

---

## Migration Guide

To migrate existing error handling to Error Manager:

1. Replace generic `throw new Error()` with `ErrorManager.createError()`
2. Wrap risky operations with `ErrorManager.withRetry()`
3. Add circuit breakers to external API calls
4. Use `ErrorManager.handleError()` instead of console.log
5. Replace custom retry logic with built-in retry strategy

---

## Contributing

To add a new error code:

1. Add to `ErrorCodes.ts`
2. Add Spanish message to `ErrorMessages.ts`
3. Update this README
4. Add tests

---

## License

Part of the Botilito project.

---

**Need help?** Contact the Botilito team or open an issue on GitHub.
