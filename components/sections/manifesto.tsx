'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { SectionKicker } from '@/components/ui/section-kicker';

/**
 * Editorial manifesto moment.
 * Three statements reveal as the user scrolls through the section.
 * Each line uses scroll-bound opacity + translateY for premium feel.
 *
 * Pacing: each line fades in over ~25% of the section's scroll range.
 */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      id="promesa"
      ref={ref}
      className="relative py-32 lg:py-56 border-t border-white/[0.05] overflow-hidden"
    >
      {/* Centered halo glow */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[700px] bg-cyan-core/[0.06] blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
        <SectionKicker num="[03]" label="Promesa · Por qué somos diferentes" align="center" />

        <div className="mt-16 lg:mt-28 space-y-14 lg:space-y-24 text-center">
          <ManifestoLine progress={scrollYProgress} range={[0.05, 0.35]}>
            No instalamos <span className="em-serif">software</span>.
          </ManifestoLine>

          <ManifestoLine progress={scrollYProgress} range={[0.28, 0.58]}>
            Construimos <span className="em-serif">operaciones</span>
            <br className="hidden md:inline" />
            {' '}que tu equipo <span className="em-serif">sí adopta</span>.
          </ManifestoLine>

          <ManifestoLine progress={scrollYProgress} range={[0.52, 0.82]}>
            Un módulo <span className="em-serif">a la vez</span>.
          </ManifestoLine>
        </div>
      </div>
    </section>
  );
}

interface ManifestoLineProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

function ManifestoLine({ children, progress, range }: ManifestoLineProps) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [40, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="font-display font-bold tracking-[var(--tracking-tightest)] leading-[0.96] text-[2.4rem] md:text-[4.2rem] lg:text-[5.6rem]"
    >
      {children}
    </motion.div>
  );
}
