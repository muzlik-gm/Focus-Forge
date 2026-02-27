/**
 * Environment Detection Utilities
 * 
 * Detect whether the app is running in:
 * - Web browser
 * - Tauri desktop app
 * 
 * Provides platform-specific feature flags and utilities.
 */

/**
 * Check if running in Tauri desktop app
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window;
}

/**
 * Check if running in web browser
 */
export function isWeb(): boolean {
  return !isDesktop();
}

/**
 * Get API base URL based on environment
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') return '';
  
  if (isDesktop()) {
    // Desktop app connects to server
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  
  // Web uses relative URLs
  return '';
}

/**
 * Platform-specific feature flags
 */
export const platform = {
  // Environment
  isDesktop: typeof window !== 'undefined' && isDesktop(),
  isWeb: typeof window !== 'undefined' && isWeb(),
  
  // Features
  canUseNativeNotifications: typeof window !== 'undefined' && isDesktop(),
  canAccessFileSystem: typeof window !== 'undefined' && isDesktop(),
  canOpenExternal: typeof window !== 'undefined' && isDesktop(),
  canUseSystemTray: typeof window !== 'undefined' && isDesktop(),
  
  // Capabilities
  hasBackdropFilter: typeof window !== 'undefined' && CSS.supports('backdrop-filter', 'blur(10px)'),
  hasWebGL: typeof window !== 'undefined' && !!document.createElement('canvas').getContext('webgl'),
  hasNotificationAPI: typeof window !== 'undefined' && 'Notification' in window,
};

/**
 * Show notification (cross-platform)
 */
export async function showNotification(title: string, body: string, icon?: string): Promise<void> {
  if (platform.isDesktop) {
    try {
      const { sendNotification, isPermissionGranted, requestPermission } = await import('@tauri-apps/api/notification');
      
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
      
      if (permissionGranted) {
        await sendNotification({ title, body, icon });
      }
    } catch (error) {
      console.error('Failed to show desktop notification:', error);
    }
  } else if (platform.hasNotificationAPI) {
    // Web notification
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body, icon });
      }
    }
  }
}

/**
 * Open URL externally (cross-platform)
 */
export async function openExternal(url: string): Promise<void> {
  if (platform.isDesktop) {
    try {
      const { shell } = await import('@tauri-apps/api');
      await shell.open(url);
    } catch (error) {
      console.error('Failed to open external URL:', error);
      // Fallback to window.open
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank');
  }
}

/**
 * Get platform name
 */
export function getPlatformName(): string {
  if (platform.isDesktop) return 'Desktop';
  if (platform.isWeb) return 'Web';
  return 'Unknown';
}

/**
 * Get user agent info
 */
export function getUserAgent(): {
  browser: string;
  os: string;
  isMobile: boolean;
} {
  if (typeof window === 'undefined') {
    return { browser: 'Unknown', os: 'Unknown', isMobile: false };
  }

  const ua = window.navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  // Detect mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  return { browser, os, isMobile };
}

/**
 * Log environment info (for debugging)
 */
export function logEnvironmentInfo(): void {
  console.group('🌍 Environment Info');
  console.log('Platform:', getPlatformName());
  console.log('Is Desktop:', platform.isDesktop);
  console.log('Is Web:', platform.isWeb);
  console.log('User Agent:', getUserAgent());
  console.log('Features:', {
    nativeNotifications: platform.canUseNativeNotifications,
    fileSystem: platform.canAccessFileSystem,
    externalLinks: platform.canOpenExternal,
    backdropFilter: platform.hasBackdropFilter,
    webGL: platform.hasWebGL,
  });
  console.groupEnd();
}
