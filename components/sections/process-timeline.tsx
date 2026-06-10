'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { SectionKicker } from '@/components/ui/section-kicker';
import { BackgroundPaths } from '@/components/ui/background-paths';

interface Step {
  num: string;
  title: string;
  description: string;
  meta: string;
}

const STEPS: readonly Step[] = [
  {
    num: '01',
    title: 'Diagnóstico operativo',
    description: 'Mapeamos tus herramientas, áreas y dónde se duplica captura o se rompe el seguimiento.',
    meta: 'Sin costo · 30–45 min',
  },
  {
    num: '02',
    title: 'Mapa del primer módulo',
    description: 'Alcance, roles e integraciones en una sola hoja de ruta — con fecha de entrega.',
    meta: 'Alcance fijo',
  },
  {
    num: '03',
    title: 'Implementación por etapas',
    description: 'Liberamos por bloques validables con el equipo. Lo que entra en producción ya está adoptado.',
    meta: 'Sprints de 2–3 sem',
  },
  {
    num: '04',
    title: 'Medición y mejora',
    description: 'Tableros activos desde día uno. Ajustes en base a uso real, no a suposiciones.',
    meta: 'Continuo',
  },
] as const;

/**
 * Vertical timeline with scroll-bound progress fill.
 * - A static hairline runs down the middle.
 * - A cyan progress line fills from top to bottom as the user scrolls past each step.
 * - Each numbered node activates (scale + glow) as scroll reaches it.
 * - Cards alternate left/right on desktop.
 */
export function ProcessTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 20%'],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="proceso" ref={ref} className="relative py-24 lg:py-32 border-t border-white/[0.05] overflow-hidden">
      {/* Flowing cyan stroke field — animates only while the section is in view */}
      <BackgroundPaths className="z-0 opacity-80" />

      <div className="relative z-10 max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
        <SectionKicker num="[06]" label="El Proceso · Cómo trabajamos" />

        <div className="max-w-4xl mt-6">
          <h2 className="display-2 reveal" style={{ ['--delay' as never]: '80ms' }}>
            Del proceso manual<br />
            al primer módulo <span className="em-serif">funcionando</span>.
          </h2>
          <p className="lead mt-7 reveal" style={{ ['--delay' as never]: '160ms' }}>
            Cuatro etapas. El primer módulo arranca en semanas, no en trimestres.
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-20 lg:mt-28 relative">
          {/* Vertical hairline background */}
          <div className="absolute left-[27px] lg:left-1/2 top-0 bottom-0 w-px bg-white/[0.06] lg:-translate-x-1/2" />

          {/* Vertical progress line — fills cyan as you scroll */}
          <motion.div
            style={{ scaleY: lineScaleY, transformOrigin: 'top' }}
            className="absolute left-[27px] lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-core via-cyan-core to-cyan-core/30 lg:-translate-x-1/2"
          />

          {STEPS.map((step, i) => (
            <TimelineStep
              key={step.num}
              index={i}
              total={STEPS.length}
              step={step}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TimelineStepProps {
  index: number;
  total: number;
  step: Step;
  progress: MotionValue<number>;
}

function TimelineStep({ index, total, step, progress }: TimelineStepProps) {
  // Numerically stable boundary at 1.0 (avoids 0.9999... floating-point drift)
  const start = index / total;
  const slice = 1 / total;
  const threshold = start + slice * 0.4;

  // Clamp all input ranges to [0, 1] — required by WAAPI (used internally by framer-motion v12)
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const activateStart = clamp01(threshold - 0.1);
  const activateEnd = clamp01(threshold);
  const cardStart = clamp01(threshold - 0.15);
  const cardEnd = clamp01(threshold - 0.05);

  // Node activates as scroll passes its position
  const nodeScale = useTransform(progress, [activateStart, activateEnd], [0.7, 1]);
  const nodeBg = useTransform(progress, [activateStart, activateEnd], ['#0A0D08', '#22D3EE']);
  const nodeBorderColor = useTransform(progress, [activateStart, activateEnd], ['rgba(34,211,238,0.4)', 'rgba(34,211,238,1)']);
  const nodeNumColor = useTransform(progress, [activateStart, activateEnd], ['#22D3EE', '#0A0D08']);
  // Ensure cardEnd > cardStart even after clamping (avoid equal-offset edge case)
  const cardOpacity = useTransform(
    progress,
    cardStart < cardEnd ? [cardStart, cardEnd] : [cardStart, cardStart + 0.01],
    [0.5, 1],
  );

  const isLeft = index % 2 === 0;

  return (
    <div className="relative mb-16 lg:mb-24 last:mb-0 grid lg:grid-cols-2 gap-6 lg:gap-16 items-center pl-16 lg:pl-0">
      {/* Node — absolute on the line */}
      <motion.div
        style={{ scale: nodeScale }}
        className="absolute left-[27px] lg:left-1/2 top-0 lg:top-1/2 -translate-x-1/2 lg:-translate-y-1/2 z-10"
      >
        <motion.div
          style={{
            backgroundColor: nodeBg,
            borderColor: nodeBorderColor,
          }}
          className="w-14 h-14 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center"
        >
          <motion.span
            style={{ color: nodeNumColor }}
            className="font-display tnum text-[0.85rem] lg:text-[0.95rem] font-bold tracking-[0.05em]"
          >
            {step.num}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Card */}
      <motion.div
        style={{ opacity: cardOpacity }}
        className={`panel p-6 lg:p-8 ${isLeft ? 'lg:col-start-1' : 'lg:col-start-2'}`}
      >
        <div className="kicker mb-3">{step.meta}</div>
        <h3 className="font-display text-[1.4rem] lg:text-[1.85rem] font-bold tracking-[var(--tracking-tightest)] leading-tight">
          {step.title}
        </h3>
        <p className="text-mist mt-3 leading-relaxed text-[0.95rem] lg:text-[1rem]">
          {step.description}
        </p>
      </motion.div>
    </div>
  );
}
