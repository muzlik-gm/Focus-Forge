# NextAuth Configuration for Forgrin

## Overview

This directory contains the NextAuth.js authentication configuration for Forgrin. The implementation follows the requirements specified in the design document (Requirements 1.2, 13.2).

## Files

- **`auth.ts`**: Main NextAuth configuration with credentials provider, JWT session strategy, and secure cookie settings
- **`auth-client.ts`**: Client-side authentication utilities including logout functions
- **`../app/api/auth/[...nextauth]/route.ts`**: API route handler for NextAuth endpoints
- **`../types/next-auth.d.ts`**: TypeScript type definitions extending NextAuth types

## Configuration Details

### Session Strategy

- **Type**: JWT (JSON Web Token)
- **Max Age**: 30 days
- **Storage**: Secure HTTP-only cookies

### Cookie Settings

The session cookie is configured with the following security settings:

- **httpOnly**: `true` - Prevents client-side JavaScript access (XSS protection)
- **sameSite**: `lax` - CSRF protection while allowing normal navigation
- **secure**: `true` in production - Ensures cookies are only sent over HTTPS
- **path**: `/` - Cookie available across the entire application

### Credentials Provider

The credentials provider authenticates users with email and password:

1. Validates that email and password are provided
2. Looks up user in the database by email
3. Verifies password using bcrypt comparison
4. Returns user object if authentication succeeds
5. Throws error if authentication fails

### JWT Callbacks

**JWT Callback**: Encodes user data into the JWT token
- Adds user ID, email, name, subscription tier, and workspace ID to token
- Handles session updates (e.g., when subscription tier changes)

**Session Callback**: Decodes JWT token into session object
- Makes user data available to the application via `session.user`

## Usage

### Server Components

```typescript
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
      <p>Subscription: {session.user.subscriptionTier}</p>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { logout } from '@/lib/auth-client';

export function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  );
}
```

### Logout Functionality

The logout functionality is implemented in `auth-client.ts` and provides two functions:

**`logout(callbackUrl?: string)`**: Logs out the user and redirects to the specified URL (default: '/')

```typescript
import { logout } from '@/lib/auth-client';

// Basic logout
await logout();

// Logout with custom redirect
await logout('/goodbye');
```

**`logoutWithoutRedirect()`**: Logs out the user without automatic redirect (useful for custom cleanup)

```typescript
import { logoutWithoutRedirect } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleLogout = async () => {
  await logoutWithoutRedirect();
  // Perform custom cleanup
  router.push('/');
};
```

When logout is called, NextAuth automatically:
1. Invalidates the JWT session token
2. Clears the session cookie (sets it with an expired date)
3. Redirects to the callback URL (if redirect is enabled)

**Requirements**: 1.4 - Session invalidation and cookie clearing

### API Routes

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use session.user.id to fetch user-specific data
  return NextResponse.json({ userId: session.user.id });
}
```

## Environment Variables

Required environment variables (see `.env.local.example`):

```env
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### Generating NEXTAUTH_SECRET

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Security Features

1. **Password Hashing**: Passwords are hashed with bcrypt before storage
2. **HTTP-Only Cookies**: Session tokens cannot be accessed by JavaScript
3. **SameSite Protection**: Cookies include SameSite=lax for CSRF protection
4. **HTTPS Enforcement**: Secure flag enabled in production
5. **JWT Signing**: Tokens are signed with NEXTAUTH_SECRET
6. **Session Expiration**: Sessions expire after 30 days

## API Endpoints

NextAuth automatically creates the following endpoints:

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/credentials` - Credentials sign in
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - List available providers

## Testing

To test the authentication flow:

1. Ensure database is running and migrated
2. Create a test user (see Task 3.2 for registration endpoint)
3. Use the credentials provider to sign in
4. Verify session is created and accessible

## Related Tasks

- **Task 3.1**: Configure NextAuth with credentials provider (this task)
- **Task 3.2**: Implement user registration endpoint
- **Task 3.3**: Write property test for password encryption
- **Task 3.4**: Write property test for session creation
- **Task 3.5**: Implement logout functionality
- **Task 3.6**: Write property test for session invalidation

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js with App Router](https://next-auth.js.org/configuration/nextjs#in-app-router)
- [Prisma Adapter](https://next-auth.js.org/adapters/prisma)
- [Credentials Provider](https://next-auth.js.org/providers/credentials)
