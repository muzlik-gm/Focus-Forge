/**
 * Example Protected API Route
 * 
 * This is an example route that demonstrates CSRF protection.
 * It can be used for testing and as a reference for implementing other routes.
 * 
 * Requirements: 1.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * GET /api/example-protected
 * 
 * This endpoint doesn't require CSRF protection (GET is a safe method)
 */
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
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

  return NextResponse.json({
    message: 'GET request successful',
    user: {
      id: token.id,
      email: token.email,
      name: token.name,
    },
  });
}

/**
 * POST /api/example-protected
 * 
 * This endpoint requires CSRF protection (POST is a state-changing method)
 * The middleware automatically validates the CSRF token before this handler runs.
 */
export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
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

  // If we reach here, the CSRF token has been validated by the middleware
  const body = await request.json();

  return NextResponse.json({
    message: 'POST request successful with CSRF protection',
    user: {
      id: token.id,
      email: token.email,
      name: token.name,
    },
    data: body,
  });
}

/**
 * PUT /api/example-protected
 * 
 * This endpoint requires CSRF protection (PUT is a state-changing method)
 */
export async function PUT(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
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

  const body = await request.json();

  return NextResponse.json({
    message: 'PUT request successful with CSRF protection',
    user: {
      id: token.id,
      email: token.email,
      name: token.name,
    },
    data: body,
  });
}

/**
 * DELETE /api/example-protected
 * 
 * This endpoint requires CSRF protection (DELETE is a state-changing method)
 */
export async function DELETE(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
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

  return NextResponse.json({
    message: 'DELETE request successful with CSRF protection',
    user: {
      id: token.id,
      email: token.email,
      name: token.name,
    },
  });
}
