'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/* ============================================================
   Props
   ============================================================ */
export interface ContainerScrollProps {
  /** Content rendered above the card. Translates up as the user scrolls. */
  titleComponent: ReactNode;
  /** Content rendered inside the rotating card. Usually a device / dashboard mockup. */
  children: ReactNode;
}

interface HeaderProps {
  translate: MotionValue<number>;
  titleComponent: ReactNode;
}

interface CardProps {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: ReactNode;
}

/* ============================================================
   ContainerScroll
   ============================================================
 * Scroll-driven 3D reveal: a card starts tilted on the X axis
 * and flattens to 0° as the user scrolls through the container.
 * The title above translates up to amplify the effect.
 *
 * VLUX adaptation:
 * - Tokens (cyan, ink, white-hairlines) instead of stock grays.
 * - Heights tuned shorter for B2B (less scroll required).
 * - Respects `prefers-reduced-motion` — renders without animation if user opted out.
 */
export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const [isMobile, setIsMobile] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(motionQuery.matches);
    const onMotionChange = () => setPrefersReduced(motionQuery.matches);
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  // On mobile (and reduced-motion) we drop the 3D scroll choreography entirely:
  // the fixed-height tilt/scale clipped the dashboard and the upward title
  // parallax slid the H1 under the fixed header. Render flat + full-size so the
  // dashboard shows in full. Desktop keeps the cinematic reveal.
  const flat = prefersReduced || isMobile;
  const rotate = useTransform(scrollYProgress, [0, 1], flat ? [0, 0] : [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], flat ? [1, 1] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], flat ? [0, 0] : [0, -100]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-auto md:h-[72rem] items-start justify-center p-2 md:px-20 md:pt-8 md:pb-20"
    >
      <div className="relative w-full pt-2 pb-6 md:pt-4 md:pb-12" style={{ perspective: '1000px' }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Header (translates up as scroll progresses)
   ============================================================ */
function Header({ translate, titleComponent }: HeaderProps) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

/* ============================================================
   Card (tilts flat on scroll, holds the dashboard / device)
   ============================================================ */
function Card({ rotate, scale, children }: CardProps) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow: [
          '0 0 0 1px rgba(34,211,238,0.05)',
          '0 1px 0 0 rgba(255,255,255,0.04) inset',
          '0 18px 40px -12px rgba(0,0,0,0.55)',
          '0 60px 100px -30px rgba(0,0,0,0.5)',
          '0 120px 160px -60px rgba(34,211,238,0.06)',
        ].join(', '),
      }}
      className="mx-auto mt-8 md:mt-20 h-auto w-full max-w-5xl rounded-2xl border border-white/[0.08] bg-elevated p-2 md:h-[40rem] md:p-3"
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-panel">
        {children}
      </div>
    </motion.div>
  );
}
