import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth API route handler
 * 
 * This handles all NextAuth API routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 * 
 * Requirements: 1.2, 13.2
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
