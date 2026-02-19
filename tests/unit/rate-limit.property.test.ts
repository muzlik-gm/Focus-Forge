/**
 * Rate Limiting Property Tests
 *
 * Property-based tests for rate limiting using fast-check
 *
 * Requirements: 1.6
 * Property: 5 - Rate Limiting
 * Validates: Requirements 1.6
 */

import * as fc from 'fast-check';
import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
  RateLimitConfig,
} from '@/lib/rate-limit';

describe('Rate Limiting Property Tests', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  afterAll(() => {
    clearAllRateLimits();
  });

  describe('Property 5: Rate Limiting', () => {
    /**
     * Property: For any sequence of authentication attempts from the same IP address,
     * if the count exceeds the rate limit threshold within the time window,
     * subsequent attempts should be rejected with a 429 error.
     *
     * Validates: Requirements 1.6
     */
    it('should reject requests exceeding rate limit threshold within time window', async () => {
      const property = fc.asyncProperty(
        // Generate identifiers (IP addresses)
        fc.ipV4(),
        // Generate max attempts between 1 and 10
        fc.nat({ max: 10 }).map((n) => Math.max(1, n)),
        // Generate window size between 100ms and 60000ms
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        // Generate number of attempts to make (can exceed limit)
        fc.nat({ max: 20 }),
        async (identifier, maxAttempts, windowMs, numAttempts) => {
          const config: RateLimitConfig = { maxAttempts, windowMs };

          // Make the specified number of attempts
          const results: Array<{ isLimited: boolean; remaining: number }> = [];
          for (let i = 0; i < numAttempts; i++) {
            const result = checkRateLimit(identifier, config);
            results.push(result);
          }

          // After maxAttempts, all subsequent requests should be limited
          const limitedCount = results.filter((r) => r.isLimited).length;
          const expectedLimitedCount = Math.max(0, numAttempts - maxAttempts);

          // The number of limited requests should match expectations
          if (numAttempts > maxAttempts) {
            expect(limitedCount).toBe(expectedLimitedCount);
          }

          // All limited requests should have 0 remaining
          const limitedResults = results.filter((r) => r.isLimited);
          for (const result of limitedResults) {
            expect(result.remaining).toBe(0);
          }

          // All non-limited requests should have positive remaining
          const nonLimitedResults = results.filter((r) => !r.isLimited);
          for (const result of nonLimitedResults) {
            expect(result.remaining).toBeGreaterThanOrEqual(0);
          }
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should allow requests within rate limit threshold', async () => {
      const property = fc.asyncProperty(
        fc.ipV4(),
        fc.nat({ max: 10 }).map((n) => Math.max(1, n)),
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        fc.nat({ max: 10 }),
        async (identifier, maxAttempts, windowMs, numAttempts) => {
          // Ensure we don't exceed the limit
          const actualAttempts = Math.min(numAttempts, maxAttempts);
          const config: RateLimitConfig = { maxAttempts, windowMs };

          const results: Array<{ isLimited: boolean; remaining: number }> = [];
          for (let i = 0; i < actualAttempts; i++) {
            const result = checkRateLimit(identifier, config);
            results.push(result);
          }

          // All requests should be allowed
          for (const result of results) {
            expect(result.isLimited).toBe(false);
          }

          // Remaining should decrease with each request
          for (let i = 0; i < results.length; i++) {
            const expectedRemaining = maxAttempts - (i + 1);
            expect(results[i].remaining).toBe(expectedRemaining);
          }
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should track different identifiers separately', async () => {
      const property = fc.asyncProperty(
        // Generate two different identifiers
        fc.tuple(fc.ipV4(), fc.ipV4()).filter(([a, b]) => a !== b),
        fc.nat({ max: 10 }).map((n) => Math.max(1, n)),
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        async ([identifier1, identifier2], maxAttempts, windowMs) => {
          const config: RateLimitConfig = { maxAttempts, windowMs };

          // Exhaust rate limit for identifier1
          for (let i = 0; i <= maxAttempts; i++) {
            checkRateLimit(identifier1, config);
          }

          // identifier1 should be limited
          const result1 = checkRateLimit(identifier1, config);
          expect(result1.isLimited).toBe(true);
          expect(result1.remaining).toBe(0);

          // identifier2 should still have full quota
          const result2 = checkRateLimit(identifier2, config);
          expect(result2.isLimited).toBe(false);
          expect(result2.remaining).toBe(maxAttempts - 1);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should reset rate limit after time window expires', async () => {
      // Use a single deterministic test for timing-based test to avoid timeout issues
      const identifier = '192.168.1.1';
      const maxAttempts = 3;
      const config: RateLimitConfig = { maxAttempts, windowMs: 50 };

      // Exhaust the rate limit
      for (let i = 0; i <= maxAttempts; i++) {
        checkRateLimit(identifier, config);
      }

      // Should be limited
      const resultBefore = checkRateLimit(identifier, config);
      expect(resultBefore.isLimited).toBe(true);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should be allowed again after window expires
      const resultAfter = checkRateLimit(identifier, config);
      expect(resultAfter.isLimited).toBe(false);
      expect(resultAfter.remaining).toBe(maxAttempts - 1);
    }, 10000); // 10 second timeout for this test

    it('should return correct resetTime in response', async () => {
      const property = fc.asyncProperty(
        fc.ipV4(),
        fc.nat({ max: 10 }).map((n) => Math.max(1, n)),
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        async (identifier, maxAttempts, windowMs) => {
          const config: RateLimitConfig = { maxAttempts, windowMs };
          const beforeTime = Date.now();

          const result = checkRateLimit(identifier, config);

          const afterTime = Date.now();
          const expectedResetTime = beforeTime + windowMs;

          // resetTime should be within the expected window
          expect(result.resetTime).toBeGreaterThanOrEqual(expectedResetTime - 1);
          expect(result.resetTime).toBeLessThanOrEqual(afterTime + windowMs);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('getRateLimitStatus should not increment counter', async () => {
      const property = fc.asyncProperty(
        fc.ipV4(),
        fc.nat({ max: 10 }).map((n) => Math.max(1, n)),
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        async (identifier, maxAttempts, windowMs) => {
          const config: RateLimitConfig = { maxAttempts, windowMs };

          // Check status multiple times
          const status1 = getRateLimitStatus(identifier, config);
          const status2 = getRateLimitStatus(identifier, config);
          const status3 = getRateLimitStatus(identifier, config);

          // Count should remain 0
          expect(status1.count).toBe(0);
          expect(status2.count).toBe(0);
          expect(status3.count).toBe(0);

          // Remaining should be maxAttempts
          expect(status1.remaining).toBe(maxAttempts);
          expect(status2.remaining).toBe(maxAttempts);
          expect(status3.remaining).toBe(maxAttempts);

          // Now make an actual request
          const result = checkRateLimit(identifier, config);

          // Status should now reflect the request
          const status4 = getRateLimitStatus(identifier, config);
          expect(status4.count).toBe(1);
          expect(status4.remaining).toBe(maxAttempts - 1);

          // Status should not increment
          const status5 = getRateLimitStatus(identifier, config);
          expect(status5.count).toBe(1);
          expect(status5.remaining).toBe(maxAttempts - 1);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('resetRateLimit should allow new requests after reset', async () => {
      const property = fc.asyncProperty(
        fc.ipV4(),
        fc.nat({ max: 10 }).map((n) => Math.max(1, n)),
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        async (identifier, maxAttempts, windowMs) => {
          const config: RateLimitConfig = { maxAttempts, windowMs };

          // Exhaust the rate limit
          for (let i = 0; i <= maxAttempts; i++) {
            checkRateLimit(identifier, config);
          }

          // Should be limited
          const resultBefore = checkRateLimit(identifier, config);
          expect(resultBefore.isLimited).toBe(true);

          // Reset the rate limit
          resetRateLimit(identifier);

          // Should be allowed again
          const resultAfter = checkRateLimit(identifier, config);
          expect(resultAfter.isLimited).toBe(false);
          expect(resultAfter.remaining).toBe(maxAttempts - 1);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should handle rapid successive requests correctly', async () => {
      const property = fc.asyncProperty(
        fc.ipV4(),
        fc.nat({ max: 10 }).map((n) => Math.max(1, n)),
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        async (identifier, maxAttempts, windowMs) => {
          const config: RateLimitConfig = { maxAttempts, windowMs };

          // Make many rapid requests
          const numRequests = maxAttempts + 5;
          const results: Array<{ isLimited: boolean; remaining: number }> = [];

          for (let i = 0; i < numRequests; i++) {
            const result = checkRateLimit(identifier, config);
            results.push(result);
          }

          // First maxAttempts should not be limited
          for (let i = 0; i < maxAttempts; i++) {
            expect(results[i].isLimited).toBe(false);
          }

          // Remaining should be 0 after maxAttempts
          expect(results[maxAttempts - 1].remaining).toBe(0);

          // All subsequent requests should be limited
          for (let i = maxAttempts; i < numRequests; i++) {
            expect(results[i].isLimited).toBe(true);
            expect(results[i].remaining).toBe(0);
          }
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should handle edge case of maxAttempts = 1', async () => {
      const property = fc.asyncProperty(
        fc.ipV4(),
        fc.nat({ max: 60000 }).map((n) => Math.max(100, n)),
        async (identifier, windowMs) => {
          const config: RateLimitConfig = { maxAttempts: 1, windowMs };

          // First request should be allowed
          const result1 = checkRateLimit(identifier, config);
          expect(result1.isLimited).toBe(false);
          expect(result1.remaining).toBe(0);

          // Second request should be blocked
          const result2 = checkRateLimit(identifier, config);
          expect(result2.isLimited).toBe(true);
          expect(result2.remaining).toBe(0);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('should handle edge case of large number of attempts', async () => {
      const property = fc.asyncProperty(
        fc.ipV4(),
        fc.nat({ min: 5, max: 10 }),
        async (identifier, maxAttempts) => {
          const config: RateLimitConfig = { maxAttempts, windowMs: 60000 };

          // Make many more requests than the limit
          const numRequests = maxAttempts * 3;
          let limitedCount = 0;
          let allowedCount = 0;

          for (let i = 0; i < numRequests; i++) {
            const result = checkRateLimit(identifier, config);
            if (result.isLimited) {
              limitedCount++;
            } else {
              allowedCount++;
            }
          }

          // Should have exactly maxAttempts allowed requests
          expect(allowedCount).toBe(maxAttempts);

          // Should have remaining requests limited
          expect(limitedCount).toBe(numRequests - maxAttempts);
        }
      );

      await fc.assert(property, { numRuns: 50 });
    });
  });

  describe('Rate Limit Configurations', () => {
    it('should have consistent login configuration', async () => {
      const { RATE_LIMIT_CONFIGS } = await import('@/lib/rate-limit');

      // Login should allow 5 attempts per 15 minutes
      expect(RATE_LIMIT_CONFIGS.login.maxAttempts).toBe(5);
      expect(RATE_LIMIT_CONFIGS.login.windowMs).toBe(15 * 60 * 1000);
    });

    it('should have consistent register configuration', async () => {
      const { RATE_LIMIT_CONFIGS } = await import('@/lib/rate-limit');

      // Register should allow 3 attempts per hour
      expect(RATE_LIMIT_CONFIGS.register.maxAttempts).toBe(3);
      expect(RATE_LIMIT_CONFIGS.register.windowMs).toBe(60 * 60 * 1000);
    });
  });
});