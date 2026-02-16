'use client';

import { logout } from '@/lib/auth-client';
import { useState } from 'react';

/**
 * Logout button component
 * 
 * Provides a button that logs out the user when clicked.
 * Handles loading state and errors gracefully.
 * 
 * Requirements: 1.4, 46
 */

interface LogoutButtonProps {
  /**
   * Optional callback URL to redirect to after logout
   * Default: '/'
   */
  callbackUrl?: string;

  /**
   * Optional custom button text
   * Default: 'Logout'
   */
  children?: React.ReactNode;

  /**
   * Optional CSS classes for styling
   */
  className?: string;

  /**
   * Button variant
   */
  variant?: 'default' | 'ghost' | 'destructive';
}

export function LogoutButton({
  callbackUrl = '/',
  children = 'Logout',
  className = '',
  variant = 'default',
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout(callbackUrl);
      // Note: The logout function will redirect, so code after this won't execute
    } catch (error) {
      console.error('Failed to logout:', error);
      setIsLoggingOut(false);
      // Optionally show an error toast here
    }
  };

  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    default: 'bg-gray-700 hover:bg-gray-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label="Logout"
    >
      {isLoggingOut ? 'Logging out...' : children}
    </button>
  );
}
