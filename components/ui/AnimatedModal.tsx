'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'scale' | 'slide' | 'rotate' | 'bounce';
}

export function AnimatedModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  animation = 'scale',
}: AnimatedModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const animationVariants = {
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    slide: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
    rotate: {
      initial: { opacity: 0, rotate: -10, scale: 0.9 },
      animate: { opacity: 1, rotate: 0, scale: 1 },
      exit: { opacity: 0, rotate: 10, scale: 0.9 },
    },
    bounce: {
      initial: { opacity: 0, y: -100 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -100 },
    },
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Animated Modal */}
          <motion.div
            {...animationVariants[animation]}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className={`relative bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

            {/* Header */}
            {title && (
              <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all hover:rotate-90 duration-300 group"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 transition-transform" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="modal-content relative p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
