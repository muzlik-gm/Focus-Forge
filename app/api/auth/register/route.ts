import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';

/**
 * User registration endpoint
 * 
 * POST /api/auth/register
 * 
 * Implements:
 * - Rate limiting to prevent abuse
 * - Input validation with Zod schema
 * - Password hashing with bcrypt
 * - User record creation in database
 * 
 * Requirements: 1.1, 1.6, 13.1
 */

// Validation schema for registration input
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  firebaseUid: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_CONFIGS.register);

    if (rateLimitResult.isLimited) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );

      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many registration attempts. Please try again later.',
            retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.register.maxAttempts.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password, name, firebaseUid } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email already exists',
          },
        },
        { status: 409 }
      );
    }

    // For Firebase OAuth users, don't hash password (they don't have one)
    let passwordHash = '';
    if (password && !firebaseUid) {
      // Regular email/password registration
      passwordHash = await bcrypt.hash(password, 12);
    }

    // Create user record in database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: passwordHash || undefined,
        firebaseUid: firebaseUid || undefined,
        emailVerified: !!firebaseUid, // Firebase users are pre-verified
        subscriptionTier: 'FREE', // Default tier
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    // Return success response (exclude password hash)
    return NextResponse.json(
      {
        user,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_CONFIGS.register.maxAttempts.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle database errors
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration',
        },
      },
      { status: 500 }
    );
  }
}
