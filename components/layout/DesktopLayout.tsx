'use client';

import { useEffect, useState } from 'react';
import { isDesktopApp } from '@/lib/desktop-session';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

/**
 * DesktopLayout - Applies desktop-specific styling and layout
 * 
 * Automatically detects if running in desktop app and applies
 * the skeuomorphic design system for a native app feel.
 */
export function DesktopLayout({ children }: DesktopLayoutProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(isDesktopApp());
  }, []);

  // Add desktop-specific class to body
  useEffect(() => {
    if (isDesktop) {
      document.body.classList.add('desktop-app');
    } else {
      document.body.classList.remove('desktop-app');
    }

    return () => {
      document.body.classList.remove('desktop-app');
    };
  }, [isDesktop]);

  return <>{children}</>;
}
