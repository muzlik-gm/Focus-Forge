# CSRF Protection Implementation

This document explains the CSRF (Cross-Site Request Forgery) protection implementation in FocusForge.

## Overview

CSRF protection prevents malicious websites from making unauthorized requests on behalf of authenticated users. The implementation uses NextAuth's built-in CSRF token mechanism combined with custom middleware to validate tokens on all authenticated state-changing requests.

## Requirements

- **Requirement 1.5**: THE System SHALL enforce CSRF protection on all authenticated requests
- **Property 4**: For any authenticated POST/PUT/DELETE request without a valid CSRF token, the system should reject the request with a 403 error

## Architecture

The CSRF protection system consists of three main components:

### 1. Token Generation (NextAuth)

NextAuth automatically generates CSRF tokens and makes them available via:
- Cookie: `next-auth.csrf-token` (format: `token|hash`)
- Endpoint: `GET /api/auth/csrf` (returns `{ csrfToken: "..." }`)

### 2. Token Validation (Middleware)

The Next.js middleware (`middleware.ts`) intercepts all API requests and:
1. Checks if the route requires CSRF protection
2. Validates authentication status
3. Compares the token from the request header with the token in the cookie
4. Returns 403 if validation fails

### 3. Client-Side Utilities

Helper functions make it easy to include CSRF tokens in requests:
- `lib/csrf.ts`: Core CSRF utilities
- `lib/api-client.ts`: Convenient API client functions

## Usage

### Server-Side (API Routes)

#### Option 1: Using Middleware (Recommended)

The global middleware automatically protects all API routes under:
- `/api/tasks`
- `/api/sessions`
- `/api/analytics`
- `/api/team`
- `/api/reviews`
- `/api/billing`
- `/api/settings`

No additional code needed in your route handlers!

```typescript
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This route is automatically protected by the middleware
export async function POST(request: NextRequest) {
  // Your logic here - CSRF is already validated
  return NextResponse.json({ success: true });
}
```

#### Option 2: Using Route-Level Protection

For routes not covered by the middleware, use the `withCsrfProtection` wrapper:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection } from '@/lib/csrf';

async function handler(request: NextRequest) {
  // Your logic here
  return NextResponse.json({ success: true });
}

export const POST = withCsrfProtection(handler);
```

#### Option 3: Combined Auth + CSRF Protection

For routes that require both authentication and CSRF validation:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndCsrf } from '@/lib/csrf';

async function handler(request: NextRequest) {
  // User is guaranteed to be authenticated here
  return NextResponse.json({ success: true });
}

export const POST = withAuthAndCsrf(handler);
```

### Client-Side (React Components)

#### Option 1: Using API Client Helpers (Recommended)

```typescript
'use client';

import { post, put, patch, del } from '@/lib/api-client';

async function createTask() {
  const response = await post('/api/tasks', {
    title: 'New task',
    priority: 'HIGH',
  });
  
  const result = await response.json();
  return result;
}

async function updateTask(id: string) {
  const response = await patch(`/api/tasks/${id}`, {
    status: 'IN_PROGRESS',
  });
  
  return response.json();
}

async function deleteTask(id: string) {
  const response = await del(`/api/tasks/${id}`);
  return response.json();
}
```

#### Option 2: Manual CSRF Token Handling

```typescript
'use client';

import { getCsrfToken, CSRF_HEADER_NAME } from '@/lib/csrf';

async function createTask() {
  const csrfToken = await getCsrfToken();
  
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [CSRF_HEADER_NAME]: csrfToken || '',
    },
    body: JSON.stringify({
      title: 'New task',
      priority: 'HIGH',
    }),
  });
  
  return response.json();
}
```

#### Option 3: Using fetchWithCsrf

```typescript
'use client';

import { fetchWithCsrf } from '@/lib/api-client';

async function createTask() {
  const response = await fetchWithCsrf('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'New task',
      priority: 'HIGH',
    }),
  });
  
  return response.json();
}
```

## Protected Routes

The following API routes are automatically protected by the middleware:

- `/api/tasks/*` - Task management
- `/api/sessions/*` - Focus session management
- `/api/analytics/*` - Analytics data
- `/api/team/*` - Team collaboration
- `/api/reviews/*` - Weekly reviews
- `/api/billing/*` - Subscription and billing
- `/api/settings/*` - User settings

## Excluded Routes

The following routes are excluded from CSRF protection:

- `/api/auth/*` - NextAuth handles its own CSRF protection

## HTTP Methods

CSRF protection is enforced on state-changing methods:
- `POST` - Create operations
- `PUT` - Full update operations
- `PATCH` - Partial update operations
- `DELETE` - Delete operations

Safe methods (GET, HEAD, OPTIONS) do not require CSRF tokens.

## Error Responses

### 403 Forbidden - Invalid CSRF Token

```json
{
  "error": {
    "code": "CSRF_TOKEN_INVALID",
    "message": "Invalid or missing CSRF token"
  }
}
```

This error occurs when:
- The CSRF token is missing from the request header
- The CSRF token doesn't match the token in the cookie
- The CSRF cookie is missing or expired

### 401 Unauthorized - Not Authenticated

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

This error occurs when using `withAuthAndCsrf` and the user is not authenticated.

## Security Considerations

### Token Storage

- CSRF tokens are stored in HTTP-only cookies by NextAuth
- Tokens are never exposed to client-side JavaScript (except when explicitly fetched)
- Tokens are tied to the user's session

### Token Validation

- Tokens are validated on every state-changing request
- Validation uses constant-time comparison to prevent timing attacks
- Invalid tokens result in immediate 403 rejection

### Token Rotation

- NextAuth automatically rotates CSRF tokens on each request
- Old tokens are invalidated when new ones are generated
- This prevents token reuse attacks

## Testing

### Unit Tests

Test CSRF protection in your API routes:

```typescript
import { POST } from '@/app/api/tasks/route';
import { NextRequest } from 'next/server';

describe('POST /api/tasks', () => {
  it('should reject requests without CSRF token', async () => {
    const request = new NextRequest('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(403);
  });
});
```

### Integration Tests

Test the full flow including token generation and validation:

```typescript
import { getCsrfToken } from '@/lib/csrf';
import { post } from '@/lib/api-client';

describe('CSRF Protection', () => {
  it('should allow requests with valid CSRF token', async () => {
    const response = await post('/api/tasks', {
      title: 'Test task',
    });
    
    expect(response.ok).toBe(true);
  });
});
```

## Troubleshooting

### "Invalid or missing CSRF token" error

**Cause**: The CSRF token is not being sent with the request.

**Solution**: 
- Use the API client helpers (`post`, `put`, `patch`, `del`)
- Or manually include the token using `getCsrfToken()` and the `x-csrf-token` header

### CSRF token not found in cookie

**Cause**: The user is not authenticated or the session has expired.

**Solution**:
- Ensure the user is logged in
- Check that the NextAuth session is valid
- Verify that cookies are enabled in the browser

### CSRF protection not working in development

**Cause**: Cookies might not be set correctly in development mode.

**Solution**:
- Ensure `NEXTAUTH_URL` is set correctly in `.env.local`
- Use `http://localhost:3000` (not `127.0.0.1`)
- Clear browser cookies and restart the dev server

## References

- [NextAuth CSRF Protection](https://next-auth.js.org/configuration/options#cookies)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
