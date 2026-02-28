import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * Initialize Firebase Admin SDK
 * This is used for verifying Firebase ID tokens on the server
 */
export function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
    }
  }
}

/**
 * Verify a Firebase ID token
 * @param idToken The token to verify
 * @returns The decoded token or null if invalid
 */
export async function verifyFirebaseToken(idToken: string) {
  initializeFirebaseAdmin();
  try {
    const auth = getAuth();
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}
