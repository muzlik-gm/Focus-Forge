import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

/**
 * Type definitions for NextAuth
 * 
 * Extends the default NextAuth types to include custom user properties
 * from the FocusForge User model.
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
  }
}
