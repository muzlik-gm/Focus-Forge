/**
 * Next.js Middleware
 * 
 * This middleware runs on every request and applies security measures
 * including CSRF protection for authenticated API routes.
 * 
 * Requirements: 1.5, 13.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * CSRF token header name
 */
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Routes that require CSRF protection
 * These are API routes that modify data and require authentication
 */
const PROTECTED_API_ROUTES = [
  '/api/tasks',
  '/api/sessions',
  '/api/analytics',
  '/api/team',
  '/api/reviews',
  '/api/billing',
  '/api/settings',
];

/**
 * Routes that are excluded from CSRF protection
 * These are public routes or routes that handle their own CSRF validation
 */
const EXCLUDED_ROUTES = [
  '/api/auth', // NextAuth handles its own CSRF protection
];

/**
 * Check if a path matches any of the protected routes
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path is excluded from CSRF protection
 */
function isExcludedRoute(pathname: string): boolean {
  return EXCLUDED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Validate CSRF token from request
 */
async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  try {
    // Get CSRF token from request header
    const csrfToken = request.headers.get(CSRF_HEADER_NAME);
    
    if (!csrfToken) {
      return false;
    }

    // Get the CSRF cookie
    const csrfCookie = request.cookies.get('next-auth.csrf-token');
    
    if (!csrfCookie) {
      return false;
    }

    // The CSRF cookie format is: token|hash
    // We need to extract the token part
    const [cookieToken] = csrfCookie.value.split('|');
    
    // Compare tokens
    return csrfToken === cookieToken;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

/**
 * Main middleware function
 * 
 * This function:
 * 1. Checks if the request is to a protected API route
 * 2. Validates authentication for protected routes
 * 3. Validates CSRF token for state-changing methods (POST, PUT, PATCH, DELETE)
 * 4. Returns 403 if CSRF validation fails
 * 
 * Requirements: 1.5 - CSRF protection on authenticated requests
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip CSRF check for excluded routes
  if (isExcludedRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if this is a protected API route
  if (isProtectedRoute(pathname)) {
    const method = request.method;
    const requiresCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    // Only check CSRF for state-changing methods
    if (requiresCsrf) {
      // Check if user is authenticated
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // If authenticated, validate CSRF token
      if (token) {
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
      }
    }
  }

  // Continue with the request
  return NextResponse.next();
}

/**
 * Middleware configuration
 * 
 * This tells Next.js which routes to run the middleware on.
 * We only run it on API routes to avoid unnecessary overhead on page requests.
 */
export const config = {
  matcher: [
    /*
     * Match all API routes except:
     * - Static files (_next/static)
     * - Image optimization (_next/image)
     * - Favicon
     */
    '/api/:path*',
  ],
};
