/**
 * Integration tests for rate limiting on authentication endpoints
 * 
 * Tests that rate limiting is properly enforced on registration and login
 * 
 * Requirements: 1.6
 * Property: 5 - Rate Limiting
 */

import { clearAllRateLimits } from '@/lib/rate-limit';

describe('Authentication Rate Limiting', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
  });

  describe('POST /api/auth/register - Rate Limiting', () => {
    it('should allow requests within the rate limit', async () => {
      const testEmail1 = `test1-${Date.now()}@example.com`;
      const testEmail2 = `test2-${Date.now()}@example.com`;

      // First request should succeed
      const response1 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.100',
        },
        body: JSON.stringify({
          email: testEmail1,
          password: 'Test1234',
          name: 'Test User 1',
        }),
      });

      expect(response1.status).toBe(201);
      expect(response1.headers.get('X-RateLimit-Limit')).toBe('3');
      expect(response1.headers.get('X-RateLimit-Remaining')).toBe('2');

      // Second request should succeed
      const response2 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.100',
        },
        body: JSON.stringify({
          email: testEmail2,
          password: 'Test1234',
          name: 'Test User 2',
        }),
      });

      expect(response2.status).toBe(201);
      expect(response2.headers.get('X-RateLimit-Remaining')).toBe('1');
    });

    it('should block requests exceeding the rate limit', async () => {
      const clientIp = '192.168.1.101';

      // Make 3 requests (at the limit)
      for (let i = 0; i < 3; i++) {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': clientIp,
          },
          body: JSON.stringify({
            email: `test${i}-${Date.now()}@example.com`,
            password: 'Test1234',
            name: `Test User ${i}`,
          }),
        });

        if (i < 3) {
          expect(response.status).toBe(201);
        }
      }

      // 4th request should be rate limited
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': clientIp,
        },
        body: JSON.stringify({
          email: `test-blocked-${Date.now()}@example.com`,
          password: 'Test1234',
          name: 'Test User Blocked',
        }),
      });

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');

      const data = await response.json();
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(data.error.message).toContain('Too many registration attempts');
    });

    it('should track rate limits per IP address', async () => {
      const ip1 = '192.168.1.102';
      const ip2 = '192.168.1.103';

      // IP1 makes 3 requests (at limit)
      for (let i = 0; i < 3; i++) {
        await fetch(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': ip1,
          },
          body: JSON.stringify({
            email: `test-ip1-${i}-${Date.now()}@example.com`,
            password: 'Test1234',
            name: `Test User IP1 ${i}`,
          }),
        });
      }

      // IP1 should be rate limited
      const response1 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': ip1,
        },
        body: JSON.stringify({
          email: `test-ip1-blocked-${Date.now()}@example.com`,
          password: 'Test1234',
          name: 'Test User IP1 Blocked',
        }),
      });

      expect(response1.status).toBe(429);

      // IP2 should still be allowed
      const response2 = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': ip2,
        },
        body: JSON.stringify({
          email: `test-ip2-${Date.now()}@example.com`,
          password: 'Test1234',
          name: 'Test User IP2',
        }),
      });

      expect(response2.status).toBe(201);
    });

    it('should include rate limit headers in responses', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.104',
        },
        body: JSON.stringify({
          email: `test-headers-${Date.now()}@example.com`,
          password: 'Test1234',
          name: 'Test User Headers',
        }),
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('3');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();

      // Verify reset time is in the future
      const resetTime = new Date(response.headers.get('X-RateLimit-Reset')!);
      expect(resetTime.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Rate Limiting - Error Responses', () => {
    it('should return proper error structure when rate limited', async () => {
      const clientIp = '192.168.1.105';

      // Exhaust the rate limit
      for (let i = 0; i < 3; i++) {
        await fetch(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': clientIp,
          },
          body: JSON.stringify({
            email: `test${i}-${Date.now()}@example.com`,
            password: 'Test1234',
            name: `Test User ${i}`,
          }),
        });
      }

      // Next request should be rate limited
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': clientIp,
        },
        body: JSON.stringify({
          email: `test-error-${Date.now()}@example.com`,
          password: 'Test1234',
          name: 'Test User Error',
        }),
      });

      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(data.error).toHaveProperty('retryAfter');
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(typeof data.error.retryAfter).toBe('number');
      expect(data.error.retryAfter).toBeGreaterThan(0);
    });
  });
});
