/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/register/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cleanupTestDatabase, generateTestEmail } from '../helpers/test-db';

/**
 * Integration tests for user registration
 * 
 * Tests the complete registration flow with actual database operations
 * 
 * Requirements: 1.1, 13.1
 */

describe('User Registration Integration', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestDatabase();
  }, 30000); // Increase timeout for database cleanup

  afterAll(async () => {
    // Clean up and disconnect after all tests
    await cleanupTestDatabase();
    await prisma.$disconnect();
  }, 30000);

  it('should create a user with hashed password in database', async () => {
    const testEmail = generateTestEmail('integration');
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123',
        name: 'Integration Test User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(201);
    expect(data.user).toMatchObject({
      email: testEmail,
      name: 'Integration Test User',
      subscriptionTier: 'FREE',
    });
    expect(data.user.id).toBeDefined();
    expect(data.user.createdAt).toBeDefined();

    // Verify user was created in database
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    expect(dbUser).toBeTruthy();
    expect(dbUser?.email).toBe(testEmail);
    expect(dbUser?.name).toBe('Integration Test User');
    expect(dbUser?.subscriptionTier).toBe('FREE');

    // Verify password was hashed (not stored as plaintext)
    expect(dbUser?.passwordHash).not.toBe('TestPassword123');
    expect(dbUser?.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt hash format

    // Verify password can be verified
    const isPasswordValid = await bcrypt.compare(
      'TestPassword123',
      dbUser!.passwordHash
    );
    expect(isPasswordValid).toBe(true);
  });

  it('should prevent duplicate email registration', async () => {
    const testEmail = generateTestEmail('duplicate');
    // Create first user
    await prisma.user.create({
      data: {
        email: testEmail,
        name: 'First User',
        passwordHash: await bcrypt.hash('Password123', 12),
      },
    });

    // Attempt to create second user with same email
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: 'DifferentPassword123',
        name: 'Second User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error.code).toBe('USER_EXISTS');

    // Verify only one user exists
    const users = await prisma.user.findMany({
      where: { email: testEmail },
    });
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('First User');
  });

  it('should enforce password complexity requirements', async () => {
    const weakPasswords = [
      'short', // Too short
      'nouppercase123', // No uppercase
      'NOLOWERCASE123', // No lowercase
      'NoNumbers', // No numbers
    ];

    for (const password of weakPasswords) {
      const testEmail = generateTestEmail(`weak-${password}`);
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password,
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.password).toBeDefined();
    }
  });

  it('should validate email format', async () => {
    const invalidEmails = [
      'notanemail',
      '@nodomain.com',
      'missing@domain',
      'spaces in@email.com',
    ];

    for (const email of invalidEmails) {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: 'ValidPassword123',
          name: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.email).toBeDefined();
    }
  });

  it('should create multiple users with unique emails', async () => {
    const users = [
      { email: generateTestEmail('user1'), password: 'Password123', name: 'User One' },
      { email: generateTestEmail('user2'), password: 'Password456', name: 'User Two' },
      { email: generateTestEmail('user3'), password: 'Password789', name: 'User Three' },
    ];

    for (const userData of users) {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    }

    // Verify all users were created
    const dbUsers = await prisma.user.findMany({
      where: {
        email: {
          in: users.map(u => u.email)
        }
      },
      orderBy: { email: 'asc' },
    });

    expect(dbUsers).toHaveLength(3);
  });
});
