import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (server-side)
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'elysium-legacy',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { idToken, name, email, photoURL } = await request.json();

    if (!idToken || !email) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      const auth = getAuth();
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return NextResponse.json(
        { error: { message: 'Invalid authentication token' } },
        { status: 401 }
      );
    }

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
          password: '', // No password for OAuth users
          firebaseUid: decodedToken.uid,
          emailVerified: decodedToken.email_verified || false,
          image: photoURL,
          subscriptionTier: 'FREE',
        },
      });

      console.log('[Firebase Login] New user created:', user.email);
    } else {
      // Update existing user with Firebase UID if not set
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firebaseUid: decodedToken.uid,
            emailVerified: decodedToken.email_verified || user.emailVerified,
            image: photoURL || user.image,
          },
        });
      }

      console.log('[Firebase Login] Existing user logged in:', user.email);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('[Firebase Login] Error:', error);
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
