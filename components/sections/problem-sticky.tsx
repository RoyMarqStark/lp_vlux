'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
import { SectionKicker } from '@/components/ui/section-kicker';

interface Pain {
  title: string;
  body: string;
  cost: string;
}

const PAINS: readonly Pain[] = [
  {
    title: 'Excel dejó de alcanzar.',
    body: 'Cada área tiene su versión del archivo. Las fórmulas se rompen, los enlaces externos fallan y nadie sabe cuál es la hoja correcta.',
    cost: 'horas en reconciliar versiones, decisiones con datos viejos.',
  },
  {
    title: 'WhatsApp carga la operación.',
    body: 'La información crítica vive en chats. Lo que no se anotó en una hoja, se pierde. El seguimiento depende de quién recuerde qué.',
    cost: 'compromisos que no se cumplen, doble captura, sin responsable.',
  },
  {
    title: 'Los reportes llegan tarde.',
    body: 'Cada cierre toma días. Cuando dirección recibe el reporte, la decisión ya pasó. El equipo opera por intuición, no por dato.',
    cost: 'oportunidades perdidas y visibilidad nula entre áreas.',
  },
] as const;

/**
 * Sticky scroll-pinned narrative.
 * Left column (title + lead + progress dots) pins to viewport.
 * Right column shows one pain at a time, fading in/out as you scroll.
 *
 * Section height scales with viewport: 200vh mobile → 320vh desktop.
 * When prefers-reduced-motion: renders as a static 3-column grid instead.
 */
export function ProblemSticky() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // ── Reduced-motion: static grid, no scroll tricks ──────────────────────
  if (reduced) {
    return (
      <section
        id="problema"
        className="relative border-t border-white/[0.05] py-24 lg:py-32"
      >
        <div className="max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
          <SectionKicker num="[02]" label="El Problema · Por qué duele" />
          <h2 className="display-2 mt-6 mb-4">
            La operación crece,<br />
            pero las herramientas<br />
            <span className="em-serif">se quedan cortas</span>.
          </h2>
          <p className="lead mb-12">
            Los archivos, chats y reportes que sostuvieron el crecimiento empiezan a generar errores, retrabajos y decisiones tarde.
          </p>
          <div className="grid lg:grid-cols-3 gap-6">
            {PAINS.map((pain, i) => (
              <article key={pain.title} className="panel p-8 flex flex-col">
                <div className="icon-box mb-7">
                  <PainIcon index={i} />
                </div>
                <h3 className="font-display text-[1.5rem] font-bold tracking-[var(--tracking-tightest)] leading-[1.05]">
                  {pain.title}
                </h3>
                <p className="text-mist mt-5 leading-relaxed text-[1rem]">{pain.body}</p>
                <div className="mt-auto pt-7 flex items-center gap-2.5 text-[0.85rem] text-ash border-t border-white/[0.06]">
                  <svg className="w-4 h-4 text-warn flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span><span className="text-mist">Cuesta:</span> {pain.cost}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Normal: scroll-driven sticky narrative ──────────────────────────────
  return (
    <section
      id="problema"
      ref={ref}
      className="relative border-t border-white/[0.05] h-[200vh] md:h-[260vh] lg:h-[320vh]"
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-[var(--container-shell)] mx-auto px-5 lg:px-8 w-full grid lg:grid-cols-12 gap-10 lg:gap-16">

          {/* LEFT — Pinned title */}
          <div className="lg:col-span-5 space-y-7">
            <SectionKicker num="[02]" label="El Problema · Por qué duele" />
            <h2 className="display-2">
              La operación crece,<br />
              pero las herramientas<br />
              <span className="em-serif">se quedan cortas</span>.
            </h2>
            <p className="lead">
              Los archivos, chats y reportes que sostuvieron el crecimiento empiezan a generar errores, retrabajos y decisiones tarde.
            </p>
            <ProgressDots progress={scrollYProgress} total={PAINS.length} />
          </div>

          {/* RIGHT — Stacked pain cards */}
          <div className="lg:col-span-7 relative h-[58vh] lg:h-[68vh]">
            {PAINS.map((pain, i) => (
              <StackedPain
                key={pain.title}
                index={i}
                pain={pain}
                progress={scrollYProgress}
                total={PAINS.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface StackedPainProps {
  index: number;
  pain: Pain;
  progress: MotionValue<number>;
  total: number;
}

function StackedPain({ index, pain, progress, total }: StackedPainProps) {
  // Use division (not multiplication) for numerically stable boundary at 1.0
  const start = index / total;
  const end = (index + 1) / total;
  const mid = (start + end) / 2;
  const slice = end - start;

  // All keyframes stay within [0, 1] — WAAPI requires this
  const opacity = useTransform(
    progress,
    [start, start + slice * 0.2, end - slice * 0.2, end],
    [0, 1, 1, 0],
  );
  const y = useTransform(progress, [start, end], [40, -40]);
  const scale = useTransform(progress, [start, mid, end], [0.96, 1, 0.96]);

  return (
    <motion.article
      style={{ opacity, y, scale }}
      className="absolute inset-0 panel p-8 lg:p-12 flex flex-col overflow-hidden"
    >
      <div className="num-outline">{String(index + 1).padStart(2, '0')}</div>
      <div className="relative flex-1 flex flex-col">
        <div className="icon-box mb-7">
          <PainIcon index={index} />
        </div>
        <h3 className="font-display text-[1.85rem] lg:text-[2.4rem] font-bold tracking-[var(--tracking-tightest)] leading-[1.05]">
          {pain.title}
        </h3>
        <p className="text-mist mt-5 leading-relaxed text-[1.05rem] lg:text-[1.12rem] max-w-xl">
          {pain.body}
        </p>
        <div className="mt-auto pt-7 flex items-center gap-2.5 text-[0.85rem] text-ash border-t border-white/[0.06]">
          <svg className="w-4 h-4 text-warn flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span><span className="text-mist">Cuesta:</span> {pain.cost}</span>
        </div>
      </div>
    </motion.article>
  );
}

function PainIcon({ index }: { index: number }) {
  if (index === 0) return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  );
  if (index === 1) return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 4 4 5-6" />
    </svg>
  );
}

interface ProgressDotsProps {
  progress: MotionValue<number>;
  total: number;
}

function ProgressDots({ progress, total }: ProgressDotsProps) {
  return (
    <div className="flex gap-2 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <ProgressDot key={i} index={i} total={total} progress={progress} />
      ))}
    </div>
  );
}

function ProgressDot({ index, total, progress }: { index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const end = (index + 1) / total;
  const slice = end - start;

  // Keyframes constrained to [start, end] — never leak outside [0, 1]
  const opacity = useTransform(
    progress,
    [start, start + slice * 0.1, end - slice * 0.1, end],
    [0.25, 1, 1, 0.25],
  );
  const width = useTransform(
    progress,
    [start, start + slice * 0.1, end - slice * 0.1, end],
    [16, 44, 44, 16],
  );

  return (
    <motion.div
      style={{ opacity, width }}
      className="h-[3px] rounded-full bg-cyan-core"
    />
  );
}
