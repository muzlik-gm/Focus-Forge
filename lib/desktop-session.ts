/**
 * Desktop Session Persistence Helper
 * 
 * Tauri v1 webview doesn't automatically persist cookies from remote domains.
 * This helper stores the NextAuth session token in localStorage and includes it
 * in API requests to maintain session persistence across app restarts.
 */

const SESSION_TOKEN_KEY = 'next-auth.session-token';
const DESKTOP_SESSION_KEY = 'forgrinsession_token';
const DESKTOP_SESSION_EXPIRY_KEY = 'forgrinsktop_session_expiry';

/**
 * Check if running in Tauri desktop environment
 * More robust detection that checks multiple times
 */
export function isDesktopApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Tauri v1
  if ((window as any).__TAURI__) {
    return true;
  }

  // Check for Tauri v2
  if ((window as any).__TAURI_INTERNALS__) {
    return true;
  }

  // Check user agent as fallback
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || '';
    if (userAgent.includes('Forgrin-Desktop') || userAgent.includes('Tauri')) {
      return true;
    }
  }

  return false;
}

/**
 * Get cookie value by name
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Set cookie value with proper attributes
 */
function setCookieValue(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;

  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`;
  console.log('[DesktopSession] Cookie set:', name, 'expires:', expires);
}

/**
 * Delete cookie by name
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Save session token to localStorage for desktop persistence
 */
export function saveDesktopSession(token: string): void {
  if (!isDesktopApp()) return;

  try {
    const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
    localStorage.setItem(DESKTOP_SESSION_KEY, token);
    localStorage.setItem(DESKTOP_SESSION_EXPIRY_KEY, expiry.toString());
    console.log('[DesktopSession] Session token saved to localStorage, expires:', new Date(expiry).toISOString());
  } catch (error) {
    console.error('[DesktopSession] Failed to save session token:', error);
  }
}

/**
 * Load session token from localStorage and restore it as a cookie
 */
export function restoreDesktopSession(): boolean {
  if (!isDesktopApp()) return false;

  try {
    const token = localStorage.getItem(DESKTOP_SESSION_KEY);
    const expiryStr = localStorage.getItem(DESKTOP_SESSION_EXPIRY_KEY);

    if (!token || !expiryStr) {
      console.log('[DesktopSession] No stored session found');
      return false;
    }

    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();

    // Check if session has expired
    if (now >= expiry) {
      console.log('[DesktopSession] Stored session has expired');
      clearDesktopSession();
      return false;
    }

    // Calculate remaining time
    const remainingSeconds = Math.floor((expiry - now) / 1000);

    // Set the session token as a cookie so NextAuth can read it
    setCookieValue(SESSION_TOKEN_KEY, token, remainingSeconds);
    console.log('[DesktopSession] Session token restored from localStorage');
    console.log('[DesktopSession] Session valid for:', Math.floor(remainingSeconds / 86400), 'days');

    return true;
  } catch (error) {
    console.error('[DesktopSession] Failed to restore session token:', error);
    return false;
  }
}

/**
 * Clear desktop session
 */
export function clearDesktopSession(): void {
  if (!isDesktopApp()) return;

  try {
    localStorage.removeItem(DESKTOP_SESSION_KEY);
    localStorage.removeItem(DESKTOP_SESSION_EXPIRY_KEY);
    deleteCookie(SESSION_TOKEN_KEY);
    console.log('[DesktopSession] Session token cleared');
  } catch (error) {
    console.error('[DesktopSession] Failed to clear session token:', error);
  }
}

/**
 * Check if desktop session exists and is valid
 */
export function hasValidDesktopSession(): boolean {
  if (!isDesktopApp()) return false;

  try {
    const token = localStorage.getItem(DESKTOP_SESSION_KEY);
    const expiryStr = localStorage.getItem(DESKTOP_SESSION_EXPIRY_KEY);

    if (!token || !expiryStr) return false;

    const expiry = parseInt(expiryStr, 10);
    return Date.now() < expiry;
  } catch (error) {
    return false;
  }
}

/**
 * Monitor session cookie changes and sync to localStorage
 * This ensures the session persists even if the cookie changes
 */
export function monitorSessionChanges(): () => void {
  if (!isDesktopApp()) return () => { };

  let lastToken: string | null = null;

  const checkSession = () => {
    try {
      const token = getCookieValue(SESSION_TOKEN_KEY);

      if (token && token !== lastToken) {
        console.log('[DesktopSession] Session token changed, updating localStorage');
        saveDesktopSession(token);
        lastToken = token;
      } else if (!token && lastToken) {
        console.log('[DesktopSession] Session token removed from cookies');
        lastToken = null;
      }
    } catch (error) {
      console.error('[DesktopSession] Error monitoring session:', error);
    }
  };

  // Check immediately
  checkSession();

  // Check every 5 seconds
  const interval = setInterval(checkSession, 5000);

  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Force refresh the session cookie from localStorage
 * Call this after login to ensure the session is properly set
 */
export function forceRefreshSession(): void {
  if (!isDesktopApp()) return;

  console.log('[DesktopSession] Force refreshing session...');

  // Wait a bit for the cookie to be set by NextAuth
  setTimeout(() => {
    const token = getCookieValue(SESSION_TOKEN_KEY);
    if (token) {
      console.log('[DesktopSession] Found session token in cookies, saving to localStorage');
      saveDesktopSession(token);
    } else {
      console.log('[DesktopSession] No session token found in cookies yet');
      // Try to restore from localStorage
      restoreDesktopSession();
    }
  }, 1000);
}
