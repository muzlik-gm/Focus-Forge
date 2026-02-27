/**
 * Desktop OAuth Helper
 * 
 * Handles OAuth authentication for desktop app by opening the system browser
 * instead of using Firebase popup (which opens in isolated webview).
 * 
 * Flow:
 * 1. Generate OAuth URL with state parameter
 * 2. Open system browser with OAuth URL
 * 3. User authenticates in their browser (with saved Google accounts)
 * 4. Browser redirects to callback URL with code
 * 5. Desktop app receives callback and exchanges code for tokens
 */

import { isDesktopApp } from './desktop-session';

const OAUTH_STATE_KEY = 'focusforge_oauth_state';
const OAUTH_CALLBACK_KEY = 'focusforge_oauth_callback';

/**
 * Generate a random state parameter for OAuth security
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store OAuth state in localStorage
 */
function saveOAuthState(state: string): void {
  localStorage.setItem(OAUTH_STATE_KEY, state);
  localStorage.setItem(`${OAUTH_STATE_KEY}_timestamp`, Date.now().toString());
}

/**
 * Verify OAuth state matches stored state
 */
function verifyOAuthState(state: string): boolean {
  const storedState = localStorage.getItem(OAUTH_STATE_KEY);
  const timestamp = localStorage.getItem(`${OAUTH_STATE_KEY}_timestamp`);
  
  // Clear stored state
  localStorage.removeItem(OAUTH_STATE_KEY);
  localStorage.removeItem(`${OAUTH_STATE_KEY}_timestamp`);
  
  // Check if state matches and is not expired (5 minutes)
  if (!storedState || !timestamp) return false;
  if (storedState !== state) return false;
  if (Date.now() - parseInt(timestamp) > 5 * 60 * 1000) return false;
  
  return true;
}

/**
 * Build Google OAuth URL for desktop authentication
 */
export function buildGoogleOAuthUrl(): string {
  const state = generateState();
  saveOAuthState(state);
  
  // Use the Google Client ID from environment variables
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '583440735607-your-client-id.apps.googleusercontent.com';
  const redirectUri = `${window.location.origin}/oauth-callback`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    access_type: 'offline',
    prompt: 'select_account', // Always show account selector
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Open system browser for OAuth authentication
 */
export async function openBrowserForOAuth(url: string): Promise<void> {
  if (!isDesktopApp()) {
    throw new Error('This function is only available in desktop app');
  }
  
  try {
    console.log('[DesktopOAuth] Opening system browser with URL:', url);
    
    // Use Tauri's shell.open to open the system browser
    const { open } = await import('@tauri-apps/api/shell');
    await open(url);
    
    console.log('[DesktopOAuth] System browser opened successfully');
  } catch (error) {
    console.error('[DesktopOAuth] Failed to open browser:', error);
    throw new Error(`Failed to open browser for authentication: ${error}`);
  }
}

/**
 * Start OAuth flow for desktop app
 * Opens system browser and returns a promise that resolves when callback is received
 */
export function startDesktopOAuth(): Promise<{ code: string; state: string }> {
  return new Promise((resolve, reject) => {
    const oauthUrl = buildGoogleOAuthUrl();
    
    // Set up callback listener
    const handleCallback = (event: StorageEvent) => {
      if (event.key === OAUTH_CALLBACK_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          
          // Verify state
          if (!verifyOAuthState(data.state)) {
            reject(new Error('Invalid OAuth state'));
            return;
          }
          
          // Clear callback data
          localStorage.removeItem(OAUTH_CALLBACK_KEY);
          
          // Remove listener
          window.removeEventListener('storage', handleCallback);
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      }
    };
    
    // Listen for storage events (callback will write to localStorage)
    window.addEventListener('storage', handleCallback);
    
    // Open browser
    openBrowserForOAuth(oauthUrl).catch(reject);
    
    // Timeout after 5 minutes
    setTimeout(() => {
      window.removeEventListener('storage', handleCallback);
      reject(new Error('OAuth timeout - please try again'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Handle OAuth callback (called by callback page)
 */
export function handleOAuthCallback(code: string, state: string): void {
  // Store callback data in localStorage to trigger storage event
  localStorage.setItem(OAUTH_CALLBACK_KEY, JSON.stringify({ code, state }));
  
  // Close the callback window/tab
  window.close();
}

/**
 * Sign in with Google using desktop OAuth flow
 */
export async function signInWithGoogleDesktop(): Promise<{
  email: string;
  name: string;
  photoURL?: string;
}> {
  if (!isDesktopApp()) {
    throw new Error('This function is only available in desktop app');
  }
  
  try {
    console.log('[DesktopOAuth] Starting Google OAuth flow...');
    
    // Start OAuth flow and wait for callback
    const { code } = await startDesktopOAuth();
    
    console.log('[DesktopOAuth] Received OAuth code, exchanging for tokens...');
    
    // Exchange code for tokens via our backend
    const response = await fetch('/api/auth/oauth-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to exchange OAuth code');
    }
    
    const data = await response.json();
    
    console.log('[DesktopOAuth] OAuth successful:', data.email);
    
    return {
      email: data.email,
      name: data.name,
      photoURL: data.photoURL,
    };
  } catch (error: any) {
    console.error('[DesktopOAuth] OAuth failed:', error);
    throw error;
  }
}
