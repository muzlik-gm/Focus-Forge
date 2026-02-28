import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rate-limit';

/**
 * Exchange OAuth authorization code for user information
 * This endpoint is called by the desktop app after the user authenticates in their browser
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_CONFIGS.login);

    if (rateLimitResult.isLimited) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );

      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts. Please try again later.',
            retryAfter,
          },
        },
        { status: 429 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: { message: 'Authorization code is required' } },
        { status: 400 }
      );
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/oauth-callback`;

    console.log('[OAuth Exchange] Exchanging code for tokens...');
    console.log('[OAuth Exchange] Redirect URI:', redirectUri);

    // Exchange code for tokens with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('[OAuth Exchange] Token exchange failed:', error);
      return NextResponse.json(
        { error: { message: error.error_description || 'Failed to exchange authorization code' } },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();
    const { id_token, access_token } = tokens;

    console.log('[OAuth Exchange] Tokens received, fetching user info...');

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('[OAuth Exchange] Failed to get user info');
      return NextResponse.json(
        { error: { message: 'Failed to get user information' } },
        { status: 400 }
      );
    }

    const userInfo = await userInfoResponse.json();
    const { email, name, picture, id: googleId } = userInfo;

    console.log('[OAuth Exchange] User authenticated:', email);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          passwordHash: '',
          firebaseUid: googleId,
          emailVerified: true, // Google accounts are pre-verified
          image: picture,
          subscriptionTier: 'FREE',
        },
      });

      console.log('[OAuth Exchange] New user created:', user.email);
    } else {
      // Update existing user with Google info if not set
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firebaseUid: googleId,
            emailVerified: true,
            image: picture || user.image,
          },
        });
      }

      console.log('[OAuth Exchange] Existing user logged in:', user.email);
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      name: user.name,
      photoURL: user.image,
      userId: user.id,
    });
  } catch (error) {
    console.error('[OAuth Exchange] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
