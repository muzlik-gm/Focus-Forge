/**
 * @jest-environment jsdom
 */

import { logout, logoutWithoutRedirect } from '@/lib/auth-client';

/**
 * Integration tests for user logout
 * 
 * Tests the logout utility functions and their behavior.
 * Note: These tests verify the client-side logout utilities.
 * The actual session invalidation is handled by NextAuth internally.
 * 
 * Requirements: 1.4
 * Property: 3 - Session Invalidation on Logout
 */

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

import { signOut } from 'next-auth/react';

describe('User Logout Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should call NextAuth signOut with default callback URL', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);

    await logout();

    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: '/',
      redirect: true,
    });
  });

  it('should call NextAuth signOut with custom callback URL', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);

    await logout('/goodbye');

    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: '/goodbye',
      redirect: true,
    });
  });

  it('should handle logout errors gracefully and redirect', async () => {
    const error = new Error('Logout failed');
    (signOut as jest.Mock).mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await logout('/fallback');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', error);
    expect(window.location.href).toBe('/fallback');

    consoleErrorSpy.mockRestore();
  });

  it('should logout without redirect when using logoutWithoutRedirect', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);

    await logoutWithoutRedirect();

    expect(signOut).toHaveBeenCalledWith({
      redirect: false,
    });
  });

  it('should throw error when logoutWithoutRedirect fails', async () => {
    const error = new Error('Logout failed');
    (signOut as jest.Mock).mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect(logoutWithoutRedirect()).rejects.toThrow('Logout failed');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', error);

    consoleErrorSpy.mockRestore();
  });

  it('should handle multiple logout calls', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);

    await logout();
    await logout();
    await logout();

    expect(signOut).toHaveBeenCalledTimes(3);
  });
});

/**
 * NextAuth Logout Behavior Documentation
 * 
 * The logout functionality is implemented using NextAuth's built-in signOut function.
 * When signOut is called, NextAuth automatically:
 * 
 * 1. Invalidates the JWT session token
 * 2. Clears the session cookie by setting it with an expired date
 * 3. Redirects to the specified callback URL (if redirect: true)
 * 
 * Cookie Clearing:
 * - NextAuth sets the 'next-auth.session-token' cookie with:
 *   - Max-Age: 0 (expires immediately)
 *   - Expires: Thu, 01 Jan 1970 00:00:00 GMT (past date)
 *   - This effectively removes the cookie from the browser
 * 
 * Session Invalidation:
 * - The JWT token is no longer valid after logout
 * - Any subsequent requests with the old token will be rejected
 * - The session callback will not find a valid session
 * - Protected routes will redirect to the signin page
 * 
 * Requirements Satisfied:
 * - 1.4: Session invalidation and cookie clearing
 * - Property 3: Session Invalidation on Logout
 * 
 * The actual NextAuth implementation is tested by NextAuth's own test suite.
 * Our tests verify that we correctly call the NextAuth functions with proper parameters.
 */
