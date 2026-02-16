# Rate Limiting Implementation

## Overview

This module implements in-memory rate limiting for authentication endpoints to prevent brute force attacks and abuse. The rate limiter tracks requests by client identifier (IP address or email) and enforces configurable limits within time windows.

**Requirements:** 1.6 - Rate limit authentication attempts to prevent brute force attacks  
**Property:** 5 - Rate Limiting

## Features

- **In-memory storage**: Fast, simple rate limiting without external dependencies
- **Configurable limits**: Different limits for different endpoints (login, registration)
- **Multiple identifier strategies**: IP-based for registration, email-based for login
- **Automatic cleanup**: Expired entries are periodically removed to prevent memory leaks
- **Standard headers**: Returns `X-RateLimit-*` and `Retry-After` headers
- **Proxy support**: Extracts client IP from various proxy headers

## Configuration

### Default Rate Limits

```typescript
RATE_LIMIT_CONFIGS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
}
```

### Login Rate Limiting
- **Identifier**: Email address (lowercase)
- **Limit**: 5 attempts per 15 minutes
- **Rationale**: Prevents brute force attacks on specific accounts

### Registration Rate Limiting
- **Identifier**: IP address
- **Limit**: 3 attempts per hour
- **Rationale**: Prevents spam account creation from the same source

## Usage

### In API Routes

```typescript
import {
  checkRateLimit,
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Get client identifier
  const clientId = getClientIdentifier(request);
  
  // Check rate limit
  const rateLimitResult = checkRateLimit(
    clientId,
    RATE_LIMIT_CONFIGS.register
  );

  if (rateLimitResult.isLimited) {
    const retryAfter = Math.ceil(
      (rateLimitResult.resetTime - Date.now()) / 1000
    );

    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many attempts. Please try again later.',
          retryAfter,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.register.maxAttempts.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  }

  // Process request...
}
```

### In NextAuth Authorize Function

```typescript
async authorize(credentials, req) {
  // Rate limit by email
  const identifier = credentials.email.toLowerCase();
  const rateLimitResult = checkRateLimit(
    identifier,
    RATE_LIMIT_CONFIGS.login
  );

  if (rateLimitResult.isLimited) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  // Authenticate user...
}
```

## API Reference

### `checkRateLimit(identifier, config)`

Checks if a request should be rate limited and increments the counter.

**Parameters:**
- `identifier` (string): Client identifier (IP address or email)
- `config` (RateLimitConfig): Rate limit configuration

**Returns:**
```typescript
{
  isLimited: boolean;    // true if limit exceeded
  remaining: number;     // remaining attempts
  resetTime: number;     // timestamp when limit resets
}
```

### `getClientIdentifier(request)`

Extracts the client IP address from the request.

**Checks headers in order:**
1. `x-forwarded-for` (most common proxy header)
2. `x-real-ip` (nginx proxy)
3. `cf-connecting-ip` (Cloudflare)
4. Falls back to `'unknown'`

**Parameters:**
- `request` (Request): The incoming request

**Returns:** string - Client IP address or 'unknown'

### `getRateLimitStatus(identifier, config)`

Gets the current rate limit status without incrementing the counter.

**Parameters:**
- `identifier` (string): Client identifier
- `config` (RateLimitConfig): Rate limit configuration

**Returns:**
```typescript
{
  count: number;         // current request count
  remaining: number;     // remaining attempts
  resetTime: number;     // timestamp when limit resets
}
```

### `resetRateLimit(identifier)`

Resets the rate limit for a specific identifier. Useful for testing or manual intervention.

**Parameters:**
- `identifier` (string): Client identifier to reset

### `clearAllRateLimits()`

Clears all rate limit entries. Useful for testing.

## Response Headers

When rate limiting is active, the following headers are included in responses:

- **`X-RateLimit-Limit`**: Maximum number of requests allowed in the time window
- **`X-RateLimit-Remaining`**: Number of requests remaining in the current window
- **`X-RateLimit-Reset`**: ISO 8601 timestamp when the rate limit resets
- **`Retry-After`**: Number of seconds to wait before retrying (only on 429 responses)

## Error Response Format

When rate limited, the API returns a 429 status with this structure:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many registration attempts. Please try again later.",
    "retryAfter": 3600
  }
}
```

## Implementation Details

### In-Memory Store

The rate limiter uses a JavaScript `Map` to store rate limit entries:

```typescript
interface RateLimitEntry {
  count: number;      // Number of requests made
  resetTime: number;  // Timestamp when the window expires
}

const rateLimitStore = new Map<string, RateLimitEntry>();
```

### Automatic Cleanup

To prevent memory leaks, expired entries are periodically removed:
- Cleanup runs probabilistically (1% chance per check)
- Removes all entries where `now > resetTime`
- Keeps memory usage bounded over time

### Time Window Behavior

- First request creates a new entry with `resetTime = now + windowMs`
- Subsequent requests increment the counter
- When `count > maxAttempts`, requests are blocked
- After `resetTime` expires, the entry is reset on next request

## Testing

### Unit Tests

```bash
npm test -- tests/unit/rate-limit.test.ts
```

Tests cover:
- Basic rate limiting logic
- Time window expiration
- Multiple identifier tracking
- Client identifier extraction
- Status checking without incrementing

### Integration Tests

```bash
npm test -- tests/integration/auth-rate-limiting.test.ts
```

Tests cover:
- Rate limiting on registration endpoint
- Proper HTTP status codes and headers
- Per-IP tracking
- Error response format

## Production Considerations

### Limitations

1. **In-memory only**: Rate limits are not shared across multiple server instances
2. **Lost on restart**: Rate limit data is lost when the server restarts
3. **Memory usage**: Grows with the number of unique identifiers

### Scaling Solutions

For production deployments with multiple servers, consider:

1. **Redis-based rate limiting**: Share rate limit state across instances
2. **Edge rate limiting**: Use Cloudflare, AWS WAF, or similar services
3. **Database-backed**: Store rate limit data in PostgreSQL or similar

### Migration Path

The current implementation can be easily replaced with a Redis-based solution:

```typescript
// Replace in-memory Map with Redis
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(identifier: string, config: RateLimitConfig) {
  const key = `rate-limit:${identifier}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, Math.ceil(config.windowMs / 1000));
  }
  
  const ttl = await redis.ttl(key);
  const resetTime = Date.now() + (ttl * 1000);
  
  return {
    isLimited: count > config.maxAttempts,
    remaining: Math.max(0, config.maxAttempts - count),
    resetTime,
  };
}
```

## Security Notes

1. **IP spoofing**: The `x-forwarded-for` header can be spoofed. In production, ensure your reverse proxy is configured to set this header correctly.

2. **Distributed attacks**: IP-based rate limiting can be bypassed by distributed attacks from multiple IPs. Consider additional security measures like CAPTCHA for suspicious patterns.

3. **Account enumeration**: Login rate limiting by email prevents brute force but may reveal which emails are registered. Consider using the same error message for both invalid email and invalid password.

4. **Time-based attacks**: The rate limiter uses wall clock time. Ensure server time is synchronized via NTP.

## Related Files

- `lib/rate-limit.ts` - Main implementation
- `app/api/auth/register/route.ts` - Registration endpoint with rate limiting
- `lib/auth.ts` - Login authentication with rate limiting
- `tests/unit/rate-limit.test.ts` - Unit tests
- `tests/integration/auth-rate-limiting.test.ts` - Integration tests

## References

- [OWASP: Blocking Brute Force Attacks](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
- [RFC 6585: Additional HTTP Status Codes](https://tools.ietf.org/html/rfc6585#section-4)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
