/**
 * Unit tests for rate limiting functionality
 * 
 * Tests the in-memory rate limiter implementation
 * 
 * Requirements: 1.6
 * Property: 5 - Rate Limiting
 */

import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', () => {
      const identifier = 'test-user-1';
      const config = { maxAttempts: 5, windowMs: 60000 };

      // First request should be allowed
      const result1 = checkRateLimit(identifier, config);
      expect(result1.isLimited).toBe(false);
      expect(result1.remaining).toBe(4);

      // Second request should be allowed
      const result2 = checkRateLimit(identifier, config);
      expect(result2.isLimited).toBe(false);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding the limit', () => {
      const identifier = 'test-user-2';
      const config = { maxAttempts: 3, windowMs: 60000 };

      // Make 3 requests (at the limit)
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // 4th request should be blocked
      const result = checkRateLimit(identifier, config);
      expect(result.isLimited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should reset after the time window expires', () => {
      const identifier = 'test-user-3';
      const config = { maxAttempts: 2, windowMs: 100 }; // 100ms window

      // Make 2 requests (at the limit)
      checkRateLimit(identifier, config);
      const result1 = checkRateLimit(identifier, config);
      expect(result1.isLimited).toBe(false);

      // 3rd request should be blocked
      const result2 = checkRateLimit(identifier, config);
      expect(result2.isLimited).toBe(true);

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // After window expires, should be allowed again
          const result3 = checkRateLimit(identifier, config);
          expect(result3.isLimited).toBe(false);
          expect(result3.remaining).toBe(1);
          resolve();
        }, 150);
      });
    });

    it('should track different identifiers separately', () => {
      const config = { maxAttempts: 2, windowMs: 60000 };

      // User 1 makes 2 requests
      checkRateLimit('user-1', config);
      checkRateLimit('user-1', config);

      // User 1 should be at limit (3rd request should be blocked)
      const result1 = checkRateLimit('user-1', config);
      expect(result1.isLimited).toBe(true);
      expect(result1.remaining).toBe(0);

      // User 2 should still have full quota
      const result2 = checkRateLimit('user-2', config);
      expect(result2.isLimited).toBe(false);
      expect(result2.remaining).toBe(1);
    });

    it('should return correct resetTime', () => {
      const identifier = 'test-user-4';
      const config = { maxAttempts: 5, windowMs: 60000 };
      const beforeTime = Date.now();

      const result = checkRateLimit(identifier, config);

      const afterTime = Date.now();
      const expectedResetTime = beforeTime + config.windowMs;

      expect(result.resetTime).toBeGreaterThanOrEqual(expectedResetTime);
      expect(result.resetTime).toBeLessThanOrEqual(afterTime + config.windowMs);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for a specific identifier', () => {
      const identifier = 'test-user-5';
      const config = { maxAttempts: 2, windowMs: 60000 };

      // Make 2 requests (at the limit)
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // 3rd request should be blocked
      const result1 = checkRateLimit(identifier, config);
      expect(result1.isLimited).toBe(true);
      expect(result1.remaining).toBe(0);

      // Reset the limit
      resetRateLimit(identifier);

      // Should be allowed again
      const result2 = checkRateLimit(identifier, config);
      expect(result2.isLimited).toBe(false);
      expect(result2.remaining).toBe(1);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return status without incrementing counter', () => {
      const identifier = 'test-user-6';
      const config = { maxAttempts: 5, windowMs: 60000 };

      // Check status (should not increment)
      const status1 = getRateLimitStatus(identifier, config);
      expect(status1.count).toBe(0);
      expect(status1.remaining).toBe(5);

      // Make an actual request
      checkRateLimit(identifier, config);

      // Check status again
      const status2 = getRateLimitStatus(identifier, config);
      expect(status2.count).toBe(1);
      expect(status2.remaining).toBe(4);

      // Check status again (should still be 1)
      const status3 = getRateLimitStatus(identifier, config);
      expect(status3.count).toBe(1);
      expect(status3.remaining).toBe(4);
    });
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
            return null;
          },
        },
      } as Request;

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-real-ip') return '192.168.1.2';
            return null;
          },
        },
      } as Request;

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.2');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'cf-connecting-ip') return '192.168.1.3';
            return null;
          },
        },
      } as Request;

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.3');
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1';
            if (name === 'x-real-ip') return '192.168.1.2';
            if (name === 'cf-connecting-ip') return '192.168.1.3';
            return null;
          },
        },
      } as Request;

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should return "unknown" when no IP headers are present', () => {
      const request = {
        headers: {
          get: () => null,
        },
      } as Request;

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe('unknown');
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('should have login configuration', () => {
      expect(RATE_LIMIT_CONFIGS.login).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.login.maxAttempts).toBe(5);
      expect(RATE_LIMIT_CONFIGS.login.windowMs).toBe(15 * 60 * 1000);
    });

    it('should have register configuration', () => {
      expect(RATE_LIMIT_CONFIGS.register).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.register.maxAttempts).toBe(3);
      expect(RATE_LIMIT_CONFIGS.register.windowMs).toBe(60 * 60 * 1000);
    });
  });
});
