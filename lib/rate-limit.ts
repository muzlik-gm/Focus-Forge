/**
 * Rate Limiting Middleware
 * 
 * Implements in-memory rate limiting for authentication endpoints
 * to prevent brute force attacks.
 * 
 * Requirements: 1.6
 * Property: 5 - Rate Limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limiting
 * Maps IP addresses to their rate limit entries
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the time window
   */
  maxAttempts: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

/**
 * Default rate limit configurations for different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Clean up expired entries from the rate limit store
 * This prevents memory leaks by removing old entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get the client identifier (IP address) from the request
 * 
 * Checks multiple headers to support various proxy configurations:
 * - x-forwarded-for (most common proxy header)
 * - x-real-ip (nginx proxy)
 * - cf-connecting-ip (Cloudflare)
 * - Falls back to direct connection IP
 */
export function getClientIdentifier(request: any): string {
  // Extract headers handling both Request and NextAuth RequestInternal objects
  const headers = request?.headers;

  const getHeader = (name: string): string | null => {
    if (!headers) return null;
    if (typeof headers.get === 'function') {
      return headers.get(name);
    }
    // Handle plain object format (like NextAuth's RequestInternal)
    return headers[name] || headers[name.toLowerCase()] || null;
  };

  // Try to get IP from headers (for proxied requests)
  const forwardedFor = getHeader('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = getHeader('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = getHeader('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to 'unknown' if no IP can be determined
  // In production with proper proxy setup, this should rarely happen
  return 'unknown';
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Client identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Object with isLimited flag and remaining attempts
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  // If no entry exists or the window has expired, create a new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      isLimited: false,
      remaining: config.maxAttempts - 1,
      resetTime,
    };
  }

  // Increment the count
  entry.count += 1;

  // Check if limit is exceeded
  const isLimited = entry.count > config.maxAttempts;
  const remaining = Math.max(0, config.maxAttempts - entry.count);

  return {
    isLimited,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual intervention
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clear all rate limit entries
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get current rate limit status without incrementing
 * Useful for checking status without affecting the counter
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): {
  count: number;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    return {
      count: 0,
      remaining: config.maxAttempts,
      resetTime: now + config.windowMs,
    };
  }

  return {
    count: entry.count,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetTime: entry.resetTime,
  };
}
