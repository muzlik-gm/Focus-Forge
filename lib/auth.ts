import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { verifyFirebaseToken } from './firebase-admin';
import {
  checkRateLimit,
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
} from './rate-limit';

/**
 * NextAuth configuration for FocusForge
 * 
 * Implements:
 * - Credentials provider for email/password authentication
 * - JWT session strategy for stateless authentication
 * - Secure cookie settings (HTTP-only, secure, sameSite)
 * - Rate limiting for login attempts
 * 
 * Requirements: 1.2, 1.6, 13.2
 */
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database integration
  adapter: PrismaAdapter(prisma),

  // Configure session strategy to use JWT
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // Configure authentication providers
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        idToken: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email) {
          throw new Error('Email is required');
        }

        // Rate limiting for login attempts
        // Use email as identifier for login rate limiting
        // This prevents brute force attacks on specific accounts
        // Rate limiting for login attempts
        // Use both IP address AND email for rate limiting
        const ip = getClientIdentifier(req as any);
        const identifier = `${ip}:${credentials.email.toLowerCase()}`;
        const rateLimitResult = checkRateLimit(
          identifier,
          RATE_LIMIT_CONFIGS.login
        );

        if (rateLimitResult.isLimited) {
          const retryAfter = Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          );
          throw new Error(
            `Too many login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
          );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // Use a fixed delay to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 50));
          throw new Error('Invalid email or password');
        }

        // Check if this is a Firebase OAuth user (no password hash)
        if (user.firebaseUid && !user.passwordHash) {
          // SECURITY FIX: For Firebase users, we MUST verify the Firebase ID token
          // This prevents the authentication bypass vulnerability where someone
          // could log in as a Firebase user by just providing their email.

          if (!credentials?.idToken) {
            throw new Error('Authentication token required for this account');
          }

          const decodedToken = await verifyFirebaseToken(credentials.idToken);

          if (!decodedToken || decodedToken.email !== user.email) {
            throw new Error('Invalid authentication token');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            subscriptionTier: user.subscriptionTier,
            workspaceId: user.workspaceId,
          };
        }

        // For regular users, verify password
        if (!user.passwordHash || !credentials?.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Return user object (will be encoded in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier,
          workspaceId: user.workspaceId,
        };
      },
    }),
  ],

  // Configure secure cookie settings
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true, // Prevent client-side JavaScript access
        sameSite: 'lax', // CSRF protection
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        maxAge: 30 * 24 * 60 * 60, // 30 days - CRITICAL for session persistence
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Configure pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  // Configure callbacks
  callbacks: {
    // JWT callback - called when JWT is created or updated
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.subscriptionTier = user.subscriptionTier;
        token.workspaceId = user.workspaceId;
      }

      // Handle session updates (e.g., subscription tier changes)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    // Session callback - called when session is checked
    async session({ session, token }) {
      if (token && session.user) {
        // Fetch fresh user data from database to get latest subscription tier
        // This ensures the session always has the most up-to-date information
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              name: true,
              subscriptionTier: true,
              workspaceId: true,
            },
          });

          if (user) {
            session.user.id = user.id;
            session.user.email = user.email;
            session.user.name = user.name;
            session.user.subscriptionTier = user.subscriptionTier;
            session.user.workspaceId = user.workspaceId;
          } else {
            // Fallback to token data if user not found
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            session.user.subscriptionTier = token.subscriptionTier as string;
            session.user.workspaceId = token.workspaceId as string | null;
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
          // Fallback to token data
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.subscriptionTier = token.subscriptionTier as string;
          session.user.workspaceId = token.workspaceId as string | null;
        }
      }

      return session;
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',

  // Configure secret for JWT signing
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Helper function to get the current session on the server side
 * 
 * Usage in Server Components:
 * ```typescript
 * import { getServerSession } from '@/lib/auth';
 * 
 * export default async function Page() {
 *   const session = await getServerSession();
 *   if (!session) {
 *     redirect('/auth/signin');
 *   }
 *   // Use session.user.id, session.user.email, etc.
 * }
 * ```
 */
export { getServerSession } from 'next-auth/next';
