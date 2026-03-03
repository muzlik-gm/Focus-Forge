import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

/**
 * Type definitions for NextAuth
 * 
 * Extends the default NextAuth types to include custom user properties
 * from the Forgrin User model.
 */

declare module 'next-auth' {
  /**
   * Extended User interface
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    subscriptionTier: string;
    workspaceId: string | null;
    isPro: boolean;
    isTeam: boolean;
    maxDurationMinutes: number;
    dailySessionCount?: number;
    dailySessionLimit?: number;
  }

  /**
   * Extended Session interface
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      subscriptionTier: string;
      workspaceId: string | null;
      isPro: boolean;
      isTeam: boolean;
      maxDurationMinutes: number;
      dailySessionCount?: number;
      dailySessionLimit?: number;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    subscriptionTier: string;
    workspaceId: string | null;
    isPro: boolean;
    isTeam: boolean;
    maxDurationMinutes: number;
    dailySessionCount?: number;
    dailySessionLimit?: number;
  }
}
