'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Magnetic anchor — the element subtly follows the cursor on hover.
 * Used on premium CTAs to give a tactile, alive feel.
 *
 * `strength` defaults to 0.3 (button moves 30% of cursor offset).
 * Higher = more pull, lower = subtler.
 */
interface MagneticButtonProps {
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  strength?: number;
  ariaLabel?: string;
}

export function MagneticButton({
  children,
  href,
  target,
  rel,
  className,
  strength = 0.28,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 18, mass: 0.4 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: xSpring, y: ySpring }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
