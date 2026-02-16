import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

/**
 * Settings API Keys API endpoint
 * 
 * GET /api/settings/api-keys - List API keys
 * POST /api/settings/api-keys - Create API key
 * 
 * Requirements: 8.5, 31
 */

// Validation schema for API key creation
const apiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

/**
 * GET /api/settings/api-keys
 * List all API keys for the current user
 * 
 * Requirements: 8.5
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
            message: 'You must be logged in to view API keys',
          },
        },
        { status: 401 }
      );
    }

    // Get API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        lastUsed: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('API keys retrieval error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while retrieving API keys',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/api-keys
 * Create a new API key
 * 
 * Body parameters:
 * - name: Name for the API key
 * 
 * Requirements: 8.5, 31
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to create API keys',
          },
        },
        { status: 401 }
      );
    }

    // Check subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    if (!user || (user.subscriptionTier !== 'PRO' && user.subscriptionTier !== 'TEAM')) {
      return NextResponse.json(
        {
          error: {
            code: 'UPGRADE_REQUIRED',
            message: 'API keys are only available for Pro and Team plans',
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = apiKeySchema.safeParse(body);

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

    const { name } = validationResult.data;

    // Generate API key
    const key = `ff_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    // Store the hash, not the actual key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash,
      },
    });

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: key, // Only returned once on creation
        createdAt: apiKey.createdAt,
      },
      message: 'API key created successfully. Save this key now, it will not be shown again.',
    });
  } catch (error) {
    console.error('API key creation error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating API key',
        },
      },
      { status: 500 }
    );
  }
}