import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Settings Notifications API endpoint
 * 
 * PATCH /api/settings/notifications - Update notification preferences
 * 
 * Requirements: 8.3
 */

// Validation schema for notification preferences
const notificationsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  weeklySummary: z.boolean().optional(),
  teamUpdates: z.boolean().optional(),
});

/**
 * PATCH /api/settings/notifications
 * Update notification preferences
 * 
 * Body parameters:
 * - emailNotifications: Receive email updates
 * - browserNotifications: Receive browser notifications
 * - weeklySummary: Receive weekly productivity reports
 * - teamUpdates: Get notified about team activity
 * 
 * Requirements: 8.3
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
            message: 'You must be logged in to update notification preferences',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = notificationsSchema.safeParse(body);

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

    const preferences = validationResult.data;

    // Upsert notification preferences in database
    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: preferences,
      create: {
        userId: session.user.id,
        ...preferences,
      },
    });

    return NextResponse.json({
      preferences: {
        emailNotifications: updatedPreferences.emailNotifications,
        browserNotifications: updatedPreferences.browserNotifications,
        weeklySummary: updatedPreferences.weeklySummary,
        teamUpdates: updatedPreferences.teamUpdates,
      },
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    console.error('Notification preferences update error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while updating notification preferences',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/settings/notifications
 * Get current notification preferences
 * 
 * Requirements: 8.3
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view notification preferences',
          },
        },
        { status: 401 }
      );
    }

    // Retrieve preferences from database
    const userPreferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Return preferences or defaults if not set
    const preferences = userPreferences
      ? {
          emailNotifications: userPreferences.emailNotifications,
          browserNotifications: userPreferences.browserNotifications,
          weeklySummary: userPreferences.weeklySummary,
          teamUpdates: userPreferences.teamUpdates,
        }
      : {
          emailNotifications: true,
          browserNotifications: true,
          weeklySummary: true,
          teamUpdates: true,
        };

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Notification preferences retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving notification preferences',
        },
      },
      { status: 500 }
    );
  }
}