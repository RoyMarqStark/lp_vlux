'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageCircle,
  FileSpreadsheet,
  Zap,
  CheckCircle2,
  Bell,
  UserRound,
} from 'lucide-react';
import { SectionKicker } from '@/components/ui/section-kicker';

/* ============================================================
   LIVE OPS THEATER — self-running simulation of a VLUX system.
   The visitor literally WATCHES the promise happen:
   WhatsApp orders get captured, assigned, completed — KPIs tick,
   bars grow, the adoption ring fills. No video. Real DOM, real
   motion, deterministic SSR, paused offscreen, reduced-motion safe.
   ============================================================ */

type Channel = 'whatsapp' | 'excel' | 'sistema';
type Status = 'nuevo' | 'asignado' | 'listo' | 'alerta';

interface OpEvent {
  id: number;
  channel: Channel;
  text: string;
  meta: string;
  status: Status;
}

/** Scripted loop — feels organic, stays deterministic. */
const SCRIPT: ReadonlyArray<Omit<OpEvent, 'id'>> = [
  { channel: 'whatsapp', text: 'Pedido nuevo · Ferretería Lomas', meta: 'Capturado automáticamente desde chat', status: 'nuevo' },
  { channel: 'sistema', text: 'OP-2421 asignada a Lucía R.', meta: 'Regla automática · zona norte', status: 'asignado' },
  { channel: 'excel', text: 'Inventario sincronizado', meta: '214 SKUs actualizados sin captura manual', status: 'listo' },
  { channel: 'sistema', text: 'OP-2418 completada', meta: '02h 14m · cero retrabajos', status: 'listo' },
  { channel: 'whatsapp', text: 'Cotización solicitada · Acme MX', meta: 'Capturado automáticamente desde chat', status: 'nuevo' },
  { channel: 'sistema', text: 'OP-2420 cerca del límite de tiempo', meta: 'Alerta enviada a Sofía E.', status: 'alerta' },
  { channel: 'excel', text: 'Reporte diario generado', meta: 'Enviado a dirección · 07:00 en punto', status: 'listo' },
  { channel: 'sistema', text: 'OP-2419 completada', meta: '00h 42m · entregado a tiempo', status: 'listo' },
  { channel: 'whatsapp', text: 'Ticket de soporte · Distribuidora Norte', meta: 'Capturado y clasificado solo', status: 'nuevo' },
  { channel: 'sistema', text: 'OP-2422 asignada a Mario A.', meta: 'Balanceo de carga automático', status: 'asignado' },
] as const;

/** Deterministic initial feed (must match SSR exactly). */
const INITIAL_FEED: OpEvent[] = [
  { id: 3, channel: 'sistema', text: 'OP-2417 completada', meta: '01h 05m · sin seguimiento manual', status: 'listo' },
  { id: 2, channel: 'whatsapp', text: 'Pedido nuevo · Acme MX', meta: 'Capturado automáticamente desde chat', status: 'nuevo' },
  { id: 1, channel: 'excel', text: 'Hoja de costos migrada', meta: 'Una sola versión de la verdad', status: 'listo' },
];

const INITIAL_BARS = [42, 58, 50, 72, 64, 80, 68, 88, 76];

const TICK_MS = 2400;

export function LiveOpsTheater() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scriptIdx = useRef(0);
  const nextId = useRef(100);

  const [feed, setFeed] = useState<OpEvent[]>(INITIAL_FEED);
  const [kpis, setKpis] = useState({ recibidos: 47, enCurso: 12, completados: 31 });
  const [bars, setBars] = useState<number[]>(INITIAL_BARS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let visible = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const ev = SCRIPT[scriptIdx.current % SCRIPT.length];
      scriptIdx.current += 1;
      nextId.current += 1;

      setFeed((prev) => [{ ...ev, id: nextId.current }, ...prev].slice(0, 5));

      setKpis((prev) => {
        if (ev.status === 'nuevo') {
          return { ...prev, recibidos: prev.recibidos + 1, enCurso: prev.enCurso + 1 };
        }
        if (ev.status === 'listo') {
          return { ...prev, completados: prev.completados + 1, enCurso: Math.max(2, prev.enCurso - 1) };
        }
        return prev;
      });

      setBars((prev) => [...prev.slice(1), 45 + Math.round(Math.random() * 50)]);
    };

    const start = () => {
      if (interval) return;
      interval = setInterval(tick, TICK_MS);
      setRunning(true);
    };
    const stop = () => {
      if (interval) { clearInterval(interval); interval = null; }
      setRunning(false);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) start();
        else stop();
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const adoptionPct = Math.min(
    98,
    Math.round((kpis.completados / (kpis.completados + kpis.enCurso)) * 100),
  );
  const RADIUS = 52;
  const CIRC = 2 * Math.PI * RADIUS;

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-t border-white/[0.05] overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-core/[0.07] blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
        <SectionKicker num="[LIVE]" label="Demo · Tu operación en tiempo real" />

        <div className="max-w-4xl mt-6">
          <h2 className="display-2 reveal" style={{ ['--delay' as never]: '80ms' }}>
            Mira una operación<br />
            ordenarse <span className="em-serif">en tiempo real</span>.
          </h2>
          <p className="lead mt-7 reveal" style={{ ['--delay' as never]: '160ms' }}>
            Esto no es un video. Es una simulación de cómo un módulo VLUX captura, asigna y mide — sin que nadie persiga nada.
          </p>
        </div>

        {/* ===== Theater frame ===== */}
        <div className="mt-14 lg:mt-20 mockup-frame reveal" style={{ ['--delay' as never]: '240ms' }}>

          {/* Chrome bar */}
          <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[0.68rem] font-mono text-ash">
              vlux.app/centro-de-control
            </div>
            <div className="flex items-center gap-2 text-[0.68rem] text-mist">
              <span className="live-dot" aria-hidden="true" />
              <span className="font-display tracking-tight uppercase">
                {running ? 'Simulación en vivo' : 'Simulación'}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="grid lg:grid-cols-12 min-h-[480px]">

            {/* ===== LEFT — Live event feed ===== */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/[0.05] p-5 lg:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="kicker">Actividad</div>
                <span className="pill pill-cyan">
                  <Bell className="size-3" aria-hidden="true" />
                  Auto
                </span>
              </div>

              <div className="flex-1 space-y-2.5 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  {feed.map((ev) => (
                    <motion.div
                      key={ev.id}
                      layout
                      initial={{ opacity: 0, x: -18, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 26 }}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-3.5 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0">
                          <ChannelIcon channel={ev.channel} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[0.85rem] font-display font-medium text-pearl truncate">
                            {ev.text}
                          </div>
                          <div className="text-[0.7rem] text-ash mt-0.5 truncate">{ev.meta}</div>
                        </div>
                        <StatusPill status={ev.status} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[0.66rem] text-ash">
                <UserRound className="size-3" aria-hidden="true" />
                Nadie está capturando esto a mano.
              </div>
            </div>

            {/* ===== RIGHT — KPIs + chart + ring ===== */}
            <div className="lg:col-span-7 p-5 lg:p-6 flex flex-col gap-5">

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-2.5 lg:gap-4">
                <Kpi label="Recibidos hoy" value={kpis.recibidos} tone="pearl" />
                <Kpi label="En curso" value={kpis.enCurso} tone="cyan" />
                <Kpi label="Completados" value={kpis.completados} tone="success" />
              </div>

              <div className="grid sm:grid-cols-5 gap-5 flex-1">

                {/* Live bar chart */}
                <div className="sm:col-span-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 flex flex-col">
                  <div className="kicker text-[0.6rem] mb-3">Flujo por hora</div>
                  <div className="flex-1 flex items-end gap-1.5 min-h-[140px]">
                    {bars.map((h, i) => (
                      <motion.div
                        key={`bar-${i}`}
                        animate={{ height: `${h}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        className={`flex-1 rounded-t-sm ${i === bars.length - 1 ? 'bg-cyan-core' : 'bg-cyan-core/25'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[0.58rem] font-mono text-ash uppercase tracking-widest">
                    <span>−9h</span><span>ahora</span>
                  </div>
                </div>

                {/* Adoption ring */}
                <div className="sm:col-span-2 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 flex flex-col items-center justify-center">
                  <div className="kicker text-[0.6rem] mb-3 self-start">Resueltos sin retrabajo</div>
                  <div className="relative w-[124px] h-[124px]">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <motion.circle
                        cx="60" cy="60" r={RADIUS} fill="none"
                        stroke="#22D3EE" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={CIRC}
                        animate={{ strokeDashoffset: CIRC * (1 - adoptionPct / 100) }}
                        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
                        style={{ strokeDashoffset: CIRC * (1 - adoptionPct / 100) }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <AnimatedNumber value={adoptionPct} suffix="%" className="font-display text-[1.7rem] font-bold tracking-tight text-pearl tnum" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[0.66rem] text-mist">
                    <CheckCircle2 className="size-3 text-success" aria-hidden="true" />
                    Subiendo en vivo
                  </div>
                </div>
              </div>

              {/* Footer strip */}
              <div className="flex items-center justify-between text-[0.66rem] text-ash">
                <span>Sincronizado con WhatsApp · ERP · Excel</span>
                <span className="hidden sm:inline">Datos ilustrativos · así se ve tu módulo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Pieces
   ============================================================ */

function ChannelIcon({ channel }: { channel: Channel }) {
  if (channel === 'whatsapp') {
    return (
      <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-success/10 border border-success/25">
        <MessageCircle className="size-3.5 text-success" aria-hidden="true" />
      </span>
    );
  }
  if (channel === 'excel') {
    return (
      <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-cyan-core/10 border border-cyan-core/25">
        <FileSpreadsheet className="size-3.5 text-cyan-soft" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/10">
      <Zap className="size-3.5 text-cyan-core" aria-hidden="true" />
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === 'nuevo') return <span className="pill pill-cyan shrink-0">Nuevo</span>;
  if (status === 'asignado') return <span className="pill pill-muted shrink-0">Asignado</span>;
  if (status === 'alerta') return <span className="pill pill-warn shrink-0">Alerta</span>;
  return <span className="pill pill-green shrink-0">Listo</span>;
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: 'pearl' | 'cyan' | 'success' }) {
  const toneClass =
    tone === 'cyan' ? 'text-cyan-soft' : tone === 'success' ? 'text-success' : 'text-pearl';
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 lg:p-4">
      <div className="kicker text-[0.6rem]">{label}</div>
      <AnimatedNumber
        value={value}
        className={`font-display text-[1.5rem] lg:text-[2rem] font-bold tracking-tight tnum mt-1 ${toneClass}`}
      />
    </div>
  );
}

/** Number that slides up each time its value changes. */
function AnimatedNumber({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  return (
    <div className={className} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          className="inline-block"
        >
          {value}{suffix}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
