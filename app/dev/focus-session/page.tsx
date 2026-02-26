'use client';

import { DesktopFocusSession } from '@/components/timer/DesktopFocusSession';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Test page for Desktop Focus Session component
 * 
 * This page allows testing the desktop focus session UI in isolation.
 * Navigate to /dev/focus-session to test.
 */
export default function FocusSessionTestPage() {
  const { isDesktop } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Desktop Focus Session Test
          </h1>
          <p className="text-gray-400">
            Testing the desktop-specific focus session management UI
          </p>
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="text-sm text-gray-400">
              Environment: <span className="text-white font-medium">
                {isDesktop ? 'Desktop (Tauri)' : 'Web (Browser)'}
              </span>
            </div>
            {!isDesktop && (
              <div className="mt-2 text-sm text-yellow-400">
                ⚠️ This component is designed for the desktop app. Some features may not work in the browser.
              </div>
            )}
          </div>
        </div>

        <DesktopFocusSession />
      </div>
    </div>
  );
}
