/**
 * CSRF Protection Utilities
 * 
 * Provides CSRF token generation and validation for authenticated routes.
 * Works in conjunction with NextAuth's built-in CSRF protection.
 * 
 * Requirements: 1.5, 13.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * CSRF token header name
 */
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Get CSRF token from NextAuth
 * 
 * NextAuth automatically generates CSRF tokens and makes them available
 * via the /api/auth/csrf endpoint. This function fetches the token.
 * 
 * @returns Promise<string | null> The CSRF token or null if unavailable
 * 
 * Usage in client components:
 * ```typescript
 * import { getCsrfToken } from '@/lib/csrf';
 * 
 * const token = await getCsrfToken();
 * const response = await fetch('/api/tasks', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-csrf-token': token,
 *   },
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/csrf');
    const data = await response.json();
    return data.csrfToken || null;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
}

/**
 * Validate CSRF token from request
 * 
 * This function checks if the request contains a valid CSRF token.
 * It compares the token from the request header with the token stored
 * in the NextAuth JWT.
 * 
 * @param request - The incoming Next.js request
 * @returns Promise<boolean> True if token is valid, false otherwise
 */
async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  try {
    // Get CSRF token from request header
    const csrfToken = request.headers.get(CSRF_HEADER_NAME);
    
    if (!csrfToken) {
      return false;
    }

    // Get the JWT token to verify the session
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return false;
    }

    // NextAuth stores the CSRF token in the cookie
    // We need to verify that the token from the header matches
    const cookies = request.cookies;
    const csrfCookie = cookies.get('next-auth.csrf-token');
    
    if (!csrfCookie) {
      return false;
    }

    // The CSRF cookie format is: token|hash
    // We need to extract the token part
    const [cookieToken] = csrfCookie.value.split('|');
    
    // Compare tokens (constant-time comparison would be ideal in production)
    return csrfToken === cookieToken;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

/**
 * CSRF protection middleware
 * 
 * This middleware validates CSRF tokens for authenticated POST, PUT, PATCH, and DELETE requests.
 * It should be applied to all API routes that modify data.
 * 
 * @param request - The incoming Next.js request
 * @param handler - The route handler function to execute if CSRF validation passes
 * @returns Promise<NextResponse> The response from the handler or a 403 error
 * 
 * Usage in API routes:
 * ```typescript
 * import { withCsrfProtection } from '@/lib/csrf';
 * 
 * async function handler(request: NextRequest) {
 *   // Your route logic here
 *   return NextResponse.json({ success: true });
 * }
 * 
 * export const POST = withCsrfProtection(handler);
 * ```
 * 
 * Requirements: 1.5 - CSRF protection on authenticated requests
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Only check CSRF for state-changing methods
    const method = request.method;
    const requiresCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (!requiresCsrf) {
      // GET and HEAD requests don't need CSRF protection
      return handler(request);
    }

    // Check if user is authenticated
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Not authenticated, let the route handler deal with it
      // (it will return 401 Unauthorized)
      return handler(request);
    }

    // User is authenticated, validate CSRF token
    const isValidCsrf = await validateCsrfToken(request);

    if (!isValidCsrf) {
      return NextResponse.json(
        {
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid or missing CSRF token',
          },
        },
        { status: 403 }
      );
    }

    // CSRF token is valid, proceed with the request
    return handler(request);
  };
}

/**
 * Middleware helper to check authentication
 * 
 * This is a utility function to check if a request is authenticated.
 * It can be used in combination with CSRF protection.
 * 
 * @param request - The incoming Next.js request
 * @returns Promise<boolean> True if authenticated, false otherwise
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    return !!token;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
}

/**
 * Combined authentication and CSRF protection middleware
 * 
 * This middleware checks both authentication and CSRF token validity.
 * Use this for routes that require both authentication and CSRF protection.
 * 
 * @param request - The incoming Next.js request
 * @param handler - The route handler function to execute if validation passes
 * @returns Promise<NextResponse> The response from the handler or an error
 * 
 * Usage in API routes:
 * ```typescript
 * import { withAuthAndCsrf } from '@/lib/csrf';
 * 
 * async function handler(request: NextRequest) {
 *   // Your route logic here - user is guaranteed to be authenticated
 *   return NextResponse.json({ success: true });
 * }
 * 
 * export const POST = withAuthAndCsrf(handler);
 * ```
 */
export function withAuthAndCsrf(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check authentication first
    const authenticated = await isAuthenticated(request);

    if (!authenticated) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Then apply CSRF protection
    return withCsrfProtection(handler)(request);
  };
}
