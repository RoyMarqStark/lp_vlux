'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { SectionKicker } from '@/components/ui/section-kicker';
import { FractureField } from '@/components/ui/fracture-field';
import { FRACTURES, type Fracture } from '@/content/problem';

/* ============================================================
   [02] PROBLEMA — "Diagnóstico operativo en vivo"
   ------------------------------------------------------------
   A live operations monitor that mirrors the hero dashboard but
   shows the BROKEN state of the business: three "fractures",
   each an unstable vital-sign waveform + a count-up cost metric.

   Replaces the old 320vh sticky-scroll card stack. Renders in
   natural document flow (no pinning, no scroll-jacking), so it
   is light on mobile and freezes cleanly under reduced-motion.
   ============================================================ */

/* Periodic signal paths — start & end at y=20 so two copies tile seamlessly. */
const RISK_PATH =
  'M0 20 H8 L12 7 L16 33 L20 13 L24 20 H40 L45 5 L49 31 L53 20 H70 L75 23 L79 10 L84 30 L88 20 H110 L115 4 L119 35 L123 17 L128 20 H150 L155 25 L159 12 L164 28 L168 20 H190 L195 9 L200 20';
const WARN_PATH =
  'M0 20 H24 L30 15 L36 25 L42 20 H80 L86 16 L92 24 L98 20 H140 L146 14 L152 26 L158 20 H200';

const SEVERITY_COLOR: Record<Fracture['severity'], string> = {
  risk: '#F87171',
  warn: '#FBBF24',
};

export function ProblemDiagnostic() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="problema"
      className="relative border-t border-white/[0.05] py-20 lg:py-32 overflow-hidden"
    >
      {/* z-0: fractured-structure backdrop — the operation, broken */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <FractureField />
      </div>

      <div className="relative z-10 max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
        {/* ── Editorial heading ─────────────────────────────── */}
        <SectionKicker num="[02]" label="El Problema · Diagnóstico operativo" />

        <h2 className="display-2 mt-6 max-w-3xl reveal" style={delay(80)}>
          Tu operación tiene <span className="em-serif">fracturas</span> que no
          aparecen en ningún reporte.
        </h2>
        <p className="lead mt-7 reveal" style={delay(160)}>
          Cada herramienta que te trajo hasta aquí empezó a trabajar en tu
          contra. Esto es lo que pasa <span className="em-serif-sm">ahora mismo</span>,
          mientras lo lees.
        </p>

        {/* ── Live monitor panel ────────────────────────────── */}
        <div
          className="diag-panel relative mt-12 lg:mt-16 panel overflow-hidden reveal"
          style={{
            ...delay(220),
            // Translucent so the fractured-structure field shows through the monitor
            background:
              'linear-gradient(180deg, rgba(17,21,14,0.72) 0%, rgba(11,15,8,0.72) 100%)',
          }}
        >
          {/* Sweeping scan band */}
          <div
            className="diag-scan pointer-events-none absolute inset-0 z-20"
            aria-hidden="true"
          />

          {/* Header strip */}
          <div className="relative flex items-center justify-between gap-4 px-5 py-4 lg:px-8 lg:py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="live-dot" aria-hidden="true" />
              <span className="kicker">Monitor operativo · en vivo</span>
            </div>
            <span className="pill pill-risk shrink-0">3 alertas activas</span>
          </div>

          {/* Fracture rows */}
          {FRACTURES.map((f, i) => (
            <FractureRow key={f.tool} index={i} fracture={f} reduced={reduced} />
          ))}

          {/* Footer line — narrative callback to the hero */}
          <div className="relative flex items-start gap-3 px-5 py-6 lg:px-8 lg:py-7 border-t border-white/[0.06] bg-white/[0.012]">
            <svg
              className="w-4 h-4 mt-0.5 text-warn shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <p className="text-mist text-[0.95rem] leading-relaxed">
              El costo no es el software. Es todo lo que pasa{' '}
              <span className="em-serif-sm">porque nadie lo usa</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Fracture row
   ============================================================ */
interface FractureRowProps {
  index: number;
  fracture: Fracture;
  reduced: boolean;
}

function FractureRow({ index, fracture, reduced }: FractureRowProps) {
  const color = SEVERITY_COLOR[fracture.severity];

  return (
    <article className="relative px-5 py-7 lg:px-8 lg:py-8 border-t border-white/[0.06] first:border-t-0">
      {/* Top — tool identity + status */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3.5">
          <span className="section-num tnum text-ash">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="font-display font-bold text-pearl text-[1.25rem] lg:text-[1.5rem] tracking-[var(--tracking-tightest)] leading-none">
              {fracture.tool}
            </h3>
            <div className="kicker mt-1.5">{fracture.system}</div>
          </div>
        </div>
        <span
          className={`pill shrink-0 ${fracture.severity === 'risk' ? 'pill-risk' : 'pill-warn'}`}
        >
          {fracture.status}
        </span>
      </div>

      {/* Vital-sign waveform */}
      <div className="mt-5">
        <SignalWave severity={fracture.severity} reduced={reduced} />
      </div>

      {/* Problem + cost metric */}
      <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-5 sm:gap-10 items-end">
        <p className="text-mist leading-relaxed text-[0.98rem] lg:text-[1.05rem] max-w-xl">
          {fracture.problem}
        </p>
        <div className="sm:text-right">
          <div
            className="font-display font-bold tnum tracking-[var(--tracking-tightest)] leading-none text-[2.4rem] lg:text-[3rem]"
            style={{ color }}
          >
            {fracture.prefix}
            <CountUp to={fracture.value} reduced={reduced} />
            {fracture.suffix}
          </div>
          <div className="kicker mt-2 max-w-[16rem] sm:ml-auto">
            {fracture.caption}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   SignalWave — scrolling, unstable monitor trace
   ============================================================ */
function SignalWave({
  severity,
  reduced,
}: {
  severity: Fracture['severity'];
  reduced: boolean;
}) {
  const color = SEVERITY_COLOR[severity];
  const d = severity === 'risk' ? RISK_PATH : WARN_PATH;
  const duration = severity === 'risk' ? '5.5s' : '8s';

  return (
    <div className="relative h-10 lg:h-12 overflow-hidden rounded-md border border-white/[0.05] bg-ink/40">
      <div
        className="diag-wave-track h-full"
        style={reduced ? undefined : { animationDuration: duration }}
      >
        <Wave d={d} color={color} />
        <Wave d={d} color={color} />
      </div>
      {/* Leading-edge glow */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-14"
        style={{ background: `linear-gradient(90deg, transparent, ${color}1f)` }}
        aria-hidden="true"
      />
    </div>
  );
}

function Wave({ d, color }: { d: string; color: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      className="h-full"
      aria-hidden="true"
    >
      <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
   CountUp — animates 0 → value once the row is in view
   ============================================================ */
function CountUp({ to, reduced }: { to: number; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced || !inView) return;
    const controls = animate(0, to, {
      duration: 1.2,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduced]);

  return <span ref={ref}>{value}</span>;
}

function delay(ms: number) {
  return { ['--delay' as never]: `${ms}ms` } as React.CSSProperties;
}
