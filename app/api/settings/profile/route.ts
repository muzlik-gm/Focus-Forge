import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Settings Profile API endpoint
 * 
 * PATCH /api/settings/profile - Update user profile
 * 
 * Requirements: 8.1, 8.7
 */

// Validation schema for profile update
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

/**
 * PATCH /api/settings/profile
 * Update user profile information
 * 
 * Body parameters:
 * - name: User's full name
 * - email: User's email address
 * - password: New password (optional)
 * 
 * Requirements: 8.1
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to update profile',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = profileSchema.safeParse(body);

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

    const { name, email, password } = validationResult.data;

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error: {
              code: 'EMAIL_TAKEN',
              message: 'This email is already registered',
            },
          },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updateData: { name: string; email: string; passwordHash?: string } = {
      name,
      email,
    };

    // If password is provided, hash it
    if (password) {
      const bcrypt = await import('bcryptjs');
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating profile',
        },
      },
      { status: 500 }
    );
  }
}