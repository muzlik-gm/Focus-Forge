'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Confetti Component
 * 
 * Simple confetti animation for celebrations.
 * 
 * Requirements: 21.7
 */

interface ConfettiProps {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  onComplete?: () => void;
}

export function Confetti({
  particleCount = 100,
  spread = 70,
  origin = { x: 0.5, y: 0.5 },
  onComplete,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    decay: number;
  }

  const colors = [
    '#6366f1', // primary
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ec4899', // pink
    '#8b5cf6', // violet
  ];

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const x = canvas.width * origin.x;
    const y = canvas.height * origin.y;
    
    // Random velocity with spread
    const angle = (Math.random() - 0.5) * Math.PI * spread / 180;
    const speed = Math.random() * 10 + 5;
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      decay: Math.random() * 0.02 + 0.01,
    };
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    let activeParticles = 0;
    
    particlesRef.current.forEach((particle) => {
      if (particle.opacity <= 0) return;
      
      activeParticles++;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravity
      particle.vx *= 0.99; // Air resistance
      
      // Update rotation
      particle.rotation += particle.rotationSpeed;
      
      // Update opacity
      particle.opacity -= particle.decay;
      
      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    });

    // Continue animation if there are active particles
    if (activeParticles > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }, [origin, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    particlesRef.current = Array(particleCount)
      .fill(null)
      .map(() => createParticle(canvas));

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, origin, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
}