/**
 * Firebase Configuration and Initialization
 * 
 * Provides Firebase services:
 * - Authentication (Google, Email/Password)
 * - Email verification
 * - Analytics
 * - Realtime Database (optional)
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCLGCos-TuJGQwEWlXpDV4dhUzT_Lbdk7A",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "elysium-legacy.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://elysium-legacy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elysium-legacy",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "elysium-legacy.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "583440735607",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:583440735607:web:d14c09330330a8e2201572",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3DRWK43R3H"
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Analytics only works in browser
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics not available:', error);
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  auth = getAuth(app);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  displayName?: string
): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    // Send verification email
    await sendEmailVerification(result.user);
    
    return result.user;
  } catch (error: any) {
    console.error('Email sign-up error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string, 
  password: string
): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Email sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(user: FirebaseUser): Promise<void> {
  try {
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error('Send verification email error:', error);
    throw new Error(error.message || 'Failed to send verification email');
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if email is verified
 */
export function isEmailVerified(): boolean {
  const user = getCurrentUser();
  return user?.emailVerified || false;
}

// Export instances
export { auth, analytics, app };
export type { FirebaseUser };
