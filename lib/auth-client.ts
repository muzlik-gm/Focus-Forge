/**
 * Client-side authentication utilities
 * 
 * Provides helper functions for authentication actions on the client side
 * 
 * Requirements: 1.4
 */

import { signOut as nextAuthSignOut } from 'next-auth/react';

/**
 * Logout function that invalidates the session and clears cookies
 * 
 * This function:
 * 1. Calls NextAuth's signOut function to invalidate the session
 * 2. Clears the session token cookie
 * 3. Redirects to the landing page or specified callback URL
 * 
 * @param callbackUrl - Optional URL to redirect to after logout (default: '/')
 * @returns Promise that resolves when logout is complete
 * 
 * Usage:
 * ```typescript
 * import { logout } from '@/lib/auth-client';
 * 
 * // In a component
 * const handleLogout = async () => {
 *   await logout();
 * };
 * 
 * // With custom redirect
 * const handleLogout = async () => {
 *   await logout('/goodbye');
 * };
 * ```
 * 
 * Requirements: 1.4 - Session invalidation and cookie clearing
 */
export async function logout(callbackUrl: string = '/'): Promise<void> {
  try {
    // NextAuth's signOut function handles:
    // - Invalidating the JWT token
    // - Clearing the session cookie (by setting it with an expired date)
    // - Redirecting to the callback URL
    await nextAuthSignOut({
      callbackUrl,
      redirect: true,
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, attempt to redirect to ensure user is logged out
    window.location.href = callbackUrl;
  }
}

/**
 * Logout function without redirect
 * 
 * Use this when you want to handle the redirect manually or perform
 * additional cleanup before redirecting.
 * 
 * @returns Promise that resolves when logout is complete
 * 
 * Usage:
 * ```typescript
 * import { logoutWithoutRedirect } from '@/lib/auth-client';
 * 
 * const handleLogout = async () => {
 *   await logoutWithoutRedirect();
 *   // Perform additional cleanup
 *   router.push('/');
 * };
 * ```
 */
export async function logoutWithoutRedirect(): Promise<void> {
  try {
    await nextAuthSignOut({
      redirect: false,
    });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}
