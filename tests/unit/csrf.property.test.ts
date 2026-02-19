/**
 * CSRF Protection Property Tests
 * 
 * Property-based tests for CSRF token validation using fast-check
 * 
 * Requirements: 1.5
 * Property: 4 - CSRF Protection
 * Validates: Requirements 1.5
 */

// Mock next-auth/jwt BEFORE importing the CSRF module
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(async ({ req, secret }) => {
    // Check if the request has a session cookie
    const cookies = req.cookies || {};
    const sessionCookie = cookies['next-auth.session-token'];
    
    if (sessionCookie) {
      // Return a mock token if session cookie exists
      return {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    
    return null;
  }),
}));

// Mock next/server AFTER setting up the jwt mock
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      body,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    })),
  },
}));

import * as fc from 'fast-check';
import { CSRF_HEADER_NAME, withCsrfProtection } from '@/lib/csrf';
import { NextRequest, NextResponse } from 'next/server';

// Helper to create a mock NextRequest
function createMockRequest(options: {
  method: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  csrfToken?: string | null;
}): NextRequest {
  const headers = new Headers(options.headers || {});
  
  if (options.csrfToken !== undefined) {
    headers.set(CSRF_HEADER_NAME, options.csrfToken);
  }

  const cookieHeader = Object.entries(options.cookies || {})
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  // Create a mock request with the necessary properties
  const mockRequest = {
    method: options.method,
    headers: headers,
    cookies: {
      get: (name: string) => {
        const cookies = options.cookies || {};
        return cookies[name] ? { name, value: cookies[name] } : undefined;
      },
    },
  } as unknown as NextRequest;

  return mockRequest;
}

// Helper to create a mock authenticated session token
function createMockSessionToken(): string {
  return Buffer.from(JSON.stringify({
    sub: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64');
}

describe('CSRF Protection Property Tests', () => {
  describe('Property 4: CSRF Protection', () => {
    /**
     * Property: For any authenticated POST/PUT/DELETE request without a valid CSRF token,
     * the system should reject the request with a 403 error.
     * 
     * Validates: Requirements 1.5
     */
    it('authenticated requests with invalid CSRF token should be rejected with 403', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Valid CSRF token
        fc.string({ minLength: 1, maxLength: 50 }),   // Invalid CSRF token
        async (method, validToken, invalidToken) => {
          // Create a mock request with an invalid CSRF token
          const request = createMockRequest({
            method,
            csrfToken: invalidToken,
            cookies: {
              'next-auth.csrf-token': `${validToken}|mock-hash`,
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          // Create a handler that would normally succeed
          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          // Apply CSRF protection
          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          // Verify the request was rejected with 403
          expect(response.status).toBe(403);
          
          // Verify the handler was not called
          expect(handler).not.toHaveBeenCalled();
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('authenticated requests without CSRF token header should be rejected with 403', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Valid CSRF token
        async (method, validToken) => {
          // Create a mock request without CSRF token header
          const request = createMockRequest({
            method,
            csrfToken: undefined, // No CSRF token
            cookies: {
              'next-auth.csrf-token': `${validToken}|mock-hash`,
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          expect(response.status).toBe(403);
          expect(handler).not.toHaveBeenCalled();
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('authenticated requests with valid CSRF token should be allowed', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Valid CSRF token
        async (method, validToken) => {
          // Create a mock request with a valid CSRF token
          const request = createMockRequest({
            method,
            csrfToken: validToken,
            cookies: {
              'next-auth.csrf-token': `${validToken}|mock-hash`,
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          // The handler should be called and return success
          expect(handler).toHaveBeenCalled();
          expect(response.status).toBe(200);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('safe methods (GET, HEAD, OPTIONS) should not require CSRF token', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('GET'),
          fc.constant('HEAD'),
          fc.constant('OPTIONS')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Any token
        async (method, _token) => {
          // Create a mock request without CSRF token for safe methods
          const request = createMockRequest({
            method,
            csrfToken: undefined,
            cookies: {
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          // Safe methods should not require CSRF, handler should be called
          expect(handler).toHaveBeenCalled();
          expect(response.status).toBe(200);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('requests with mismatched CSRF tokens should be rejected', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Valid CSRF token
        fc.string({ minLength: 1, maxLength: 50 }),  // Different invalid token
        async (method, validToken, differentToken) => {
          // Ensure the tokens are actually different
          if (validToken === differentToken) return;

          const request = createMockRequest({
            method,
            csrfToken: differentToken, // Use a different token
            cookies: {
              'next-auth.csrf-token': `${validToken}|mock-hash`,
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          expect(response.status).toBe(403);
          expect(handler).not.toHaveBeenCalled();
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('requests with empty or whitespace CSRF token should be rejected', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Valid token
        fc.string({ minLength: 0, maxLength: 200 }),  // Empty or whitespace token
        async (method, validToken, emptyToken) => {
          // Skip if emptyToken is not actually empty or whitespace
          if (emptyToken.trim().length > 0) return;

          const request = createMockRequest({
            method,
            csrfToken: emptyToken,
            cookies: {
              'next-auth.csrf-token': `${validToken}|mock-hash`,
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          expect(response.status).toBe(403);
          expect(handler).not.toHaveBeenCalled();
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('unauthenticated requests should not be blocked by CSRF middleware', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Valid token
        async (method, validToken) => {
          // Create a mock request without session (unauthenticated)
          const request = createMockRequest({
            method,
            csrfToken: validToken,
            cookies: {
              'next-auth.csrf-token': `${validToken}|mock-hash`,
              // No session token - user is not authenticated
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          // Unauthenticated requests should pass through CSRF check
          // (they'll be rejected by auth check later)
          expect(handler).toHaveBeenCalled();
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('CSRF token format should be preserved in validation', async () => {
      const property = fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }), // CSRF token
        async (token) => {
          // Test that various token formats are handled correctly
          const request = createMockRequest({
            method: 'POST',
            csrfToken: token,
            cookies: {
              'next-auth.csrf-token': `${token}|mock-hash`,
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          // Valid token should be accepted
          expect(handler).toHaveBeenCalled();
          expect(response.status).toBe(200);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });

    it('CSRF cookie format token parsing should work correctly', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        fc.string({ minLength: 10, maxLength: 100 }), // Valid token
        async (method, validToken) => {
          // Test with the actual cookie format: token|hash
          const request = createMockRequest({
            method,
            csrfToken: validToken,
            cookies: {
              'next-auth.csrf-token': `${validToken}|a1b2c3d4e5f6g7h8i9j0`,
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          expect(handler).toHaveBeenCalled();
          expect(response.status).toBe(200);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });
  });

  describe('CSRF Header Name Constant', () => {
    it('CSRF header name should be x-csrf-token', () => {
      expect(CSRF_HEADER_NAME).toBe('x-csrf-token');
    });

    it('CSRF header name should be consistent', async () => {
      const property = fc.asyncProperty(
        fc.constant('x-csrf-token'),
        async (expectedHeader) => {
          expect(CSRF_HEADER_NAME).toBe(expectedHeader);
        }
      );

      await fc.assert(property, { numRuns: 1 });
    });
  });

  describe('State-modifying methods require CSRF', () => {
    it('state-modifying requests should require CSRF protection', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('POST'),
          fc.constant('PUT'),
          fc.constant('PATCH'),
          fc.constant('DELETE')
        ),
        async (method) => {
          const request = createMockRequest({
            method,
            csrfToken: undefined, // No token
            cookies: {
              'next-auth.csrf-token': 'valid-token|mock-hash',
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          // State-modifying methods without CSRF should be rejected
          expect(response.status).toBe(403);
          expect(handler).not.toHaveBeenCalled();
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });
  });

  describe('Safe methods bypass CSRF', () => {
    it('safe method requests should bypass CSRF protection', async () => {
      const property = fc.asyncProperty(
        fc.oneof(
          { max: 1000 },
          fc.constant('GET'),
          fc.constant('HEAD'),
          fc.constant('OPTIONS')
        ),
        async (method) => {
          const request = createMockRequest({
            method,
            csrfToken: undefined, // No token - should still work
            cookies: {
              'next-auth.session-token': createMockSessionToken(),
            },
          });

          const handler = jest.fn().mockResolvedValue(
            NextResponse.json({ success: true })
          );

          const protectedHandler = withCsrfProtection(handler);
          const response = await protectedHandler(request);

          // Safe methods should bypass CSRF check
          expect(handler).toHaveBeenCalled();
          expect(response.status).toBe(200);
        }
      );

      await fc.assert(property, { numRuns: 100 });
    });
  });
});