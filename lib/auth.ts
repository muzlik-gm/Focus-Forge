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
 * NextAuth configuration for Forgrin
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

        // FIREBASE / GOOGLE SIGN-IN PATH
        // If the client provides an idToken, always use Firebase verification
        // regardless of the user's DB state (passwordHash may or may not exist)
        if (credentials?.idToken) {
          const decodedToken = await verifyFirebaseToken(credentials.idToken);

          if (!decodedToken || decodedToken.email !== user.email) {
            throw new Error('Invalid authentication token');
          }

          // Update firebaseUid if not already set
          if (!user.firebaseUid) {
            await prisma.user.update({
              where: { id: user.id },
              data: { firebaseUid: decodedToken.uid },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            subscriptionTier: user.subscriptionTier,
            workspaceId: user.workspaceId,
            isPro: user.subscriptionTier === 'PRO' || user.subscriptionTier === 'TEAM',
            isTeam: user.subscriptionTier === 'TEAM',
            maxDurationMinutes: user.subscriptionTier === 'FREE' ? 180 : 480,
          };
        }

        // REGULAR EMAIL/PASSWORD SIGN-IN PATH
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
          isPro: user.subscriptionTier === 'PRO' || user.subscriptionTier === 'TEAM',
          isTeam: user.subscriptionTier === 'TEAM',
          maxDurationMinutes: user.subscriptionTier === 'FREE' ? 180 : 480,
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
        token.isPro = user.isPro;
        token.isTeam = user.isTeam;
        token.maxDurationMinutes = user.maxDurationMinutes;
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
          // Fetch fresh user data from database to get latest subscription tier
          // This ensures the session always has the most up-to-date information
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
            session.user.isPro = user.subscriptionTier === 'PRO' || user.subscriptionTier === 'TEAM';
            session.user.isTeam = user.subscriptionTier === 'TEAM';

            // Enforce duration and session limits based on subscription tier
            const isFree = user.subscriptionTier === 'FREE';
            const maxDurationMinutes = isFree ? 180 : 480; // 3 hours for free (Free plan), 8 hours for paid
            session.user.maxDurationMinutes = maxDurationMinutes;

            // Check daily session limit for free users (3 sessions / day)
            if (isFree) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);

              const sessionCount = await prisma.focusSession.count({
                where: {
                  userId: session.user.id,
                  startTime: {
                    gte: today,
                    lt: tomorrow,
                  },
                },
              });

              session.user.dailySessionCount = sessionCount;
              session.user.dailySessionLimit = 3;
            }
          } else {
            // Fallback to token data if user not found
            session.user.id = token.id as string;
            session.user.email = token.email as string;
            session.user.name = token.name as string;
            session.user.subscriptionTier = token.subscriptionTier as string;
            session.user.workspaceId = token.workspaceId as string | null;
            session.user.isPro = token.subscriptionTier === 'PRO' || token.subscriptionTier === 'TEAM';
            session.user.isTeam = token.subscriptionTier === 'TEAM';
            session.user.maxDurationMinutes = (token.subscriptionTier === 'FREE') ? 180 : 480;
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
          // Fallback to token data
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.subscriptionTier = token.subscriptionTier as string;
          session.user.workspaceId = token.workspaceId as string | null;
          session.user.isPro = token.subscriptionTier === 'PRO' || token.subscriptionTier === 'TEAM';
          session.user.isTeam = token.subscriptionTier === 'TEAM';
          session.user.maxDurationMinutes = (token.subscriptionTier === 'FREE') ? 180 : 480;
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
