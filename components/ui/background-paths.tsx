'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ============================================================
   BackgroundPaths — flowing animated stroke field.
   VLUX adaptation:
   - Cyan strokes over the dark ink background (very low opacity).
   - Deterministic durations (no Math.random → stable, no surprises).
   - Animates only while in view + respects prefers-reduced-motion.
   - `slice` aspect ratio so it covers tall sections (e.g. timeline).
   Drop inside any `relative` section as an absolute background layer.
   ============================================================ */

function FloatingPaths({ position, animate }: { position: number; animate: boolean }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    opacity: 0.05 + i * 0.015,
    duration: 22 + (i % 9) * 1.4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-cyan-core"
        viewBox="0 0 696 316"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={
              animate
                ? {
                    pathLength: 1,
                    opacity: [0.25, 0.55, 0.25],
                    pathOffset: [0, 1, 0],
                  }
                : { pathLength: 1, opacity: 0.3 }
            }
            transition={
              animate
                ? {
                    duration: path.duration,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }
                : { duration: 0.8 }
            }
          />
        ))}
      </svg>
    </div>
  );
}

export interface BackgroundPathsProps {
  className?: string;
}

export function BackgroundPaths({ className }: BackgroundPathsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-10% 0px -10% 0px' });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;

  return (
    <div
      ref={ref}
      className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
      aria-hidden="true"
    >
      <FloatingPaths position={1} animate={animate} />
      <FloatingPaths position={-1} animate={animate} />
    </div>
  );
}
