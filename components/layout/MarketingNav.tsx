'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export function MarketingNav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Dynamically import anime.js only on client side
    import('animejs').then((module) => {
      const anime = (module as any).default || module;
      
      if (navRef.current) {
        // Subtle entrance animation
        anime({
          targets: navRef.current,
          translateY: [-20, 0],
          opacity: [0, 1],
          duration: 800,
          easing: 'easeOutExpo'
        });
      }
    }).catch(() => {
      // Silently fail if anime.js doesn't load
    });
  }, []);

  return (
    <nav 
      ref={navRef}
      className="marketing-nav-fixed"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 skeuo-card-hover p-3 rounded-2xl">
            <img src="/logo.png" alt="FocusForge" className="w-10 h-10" />
            <span className="text-xl font-bold embossed-text tracking-tight">FocusForge</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="skeuo-chip">
              <span className="text-sm">Features</span>
            </Link>
            <Link href="/pricing" className="skeuo-chip">
              <span className="text-sm">Pricing</span>
            </Link>
            <Link href="/docs" className="skeuo-chip">
              <span className="text-sm">Docs</span>
            </Link>
            <>
              <Link href="/login" className="skeuo-chip">
                <span className="text-sm">Sign in</span>
              </Link>
              <Link href="/register" className="skeuo-button px-6 py-3 text-white font-medium flex items-center gap-2">
                <span>Get started</span>
              </Link>
            </>
          </div>
        </div>
      </div>
    </nav>
  );
}
