/**
 * @jest-environment node
 */

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/firebase-admin';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock rate limiting
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({ isLimited: false })),
  RATE_LIMIT_CONFIGS: {
    login: {},
  },
}));

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  verifyFirebaseToken: jest.fn(),
}));

describe('Authentication Bypass Fix Verification', () => {
  const authorize = authOptions.providers[0].authorize;

  it('FIX VERIFICATION: should NOT allow login for Firebase user without ID token', async () => {
    const mockFirebaseUser = {
      id: 'firebase-user-id',
      email: 'victim@example.com',
      name: 'Victim',
      firebaseUid: 'firebase-uid-123',
      passwordHash: null,
      subscriptionTier: 'FREE',
      workspaceId: null,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockFirebaseUser);

    // Attempt to authorize WITHOUT idToken
    const authorizePromise = authorize({
      email: 'victim@example.com',
      password: 'any-arbitrary-password',
    }, {} as any);

    await expect(authorizePromise).rejects.toThrow('Authentication token required for this account');
  });

  it('FIX VERIFICATION: should NOT allow login with INVALID ID token', async () => {
    const mockFirebaseUser = {
      id: 'firebase-user-id',
      email: 'victim@example.com',
      name: 'Victim',
      firebaseUid: 'firebase-uid-123',
      passwordHash: null,
      subscriptionTier: 'FREE',
      workspaceId: null,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockFirebaseUser);
    (verifyFirebaseToken as jest.Mock).mockResolvedValue(null);

    // Attempt to authorize with INVALID idToken
    const authorizePromise = authorize({
      email: 'victim@example.com',
      password: 'any-arbitrary-password',
      idToken: 'invalid-token',
    }, {} as any);

    await expect(authorizePromise).rejects.toThrow('Invalid authentication token');
  });

  it('FIX VERIFICATION: should allow login with VALID ID token', async () => {
    const mockFirebaseUser = {
      id: 'firebase-user-id',
      email: 'victim@example.com',
      name: 'Victim',
      firebaseUid: 'firebase-uid-123',
      passwordHash: null,
      subscriptionTier: 'FREE',
      workspaceId: null,
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockFirebaseUser);
    (verifyFirebaseToken as jest.Mock).mockResolvedValue({
      uid: 'firebase-uid-123',
      email: 'victim@example.com',
    });

    // Attempt to authorize with VALID idToken
    const result = await authorize({
      email: 'victim@example.com',
      password: 'any-arbitrary-password',
      idToken: 'valid-token',
    }, {} as any);

    expect(result).toEqual({
      id: mockFirebaseUser.id,
      email: mockFirebaseUser.email,
      name: mockFirebaseUser.name,
      subscriptionTier: mockFirebaseUser.subscriptionTier,
      workspaceId: mockFirebaseUser.workspaceId,
    });
  });
});
