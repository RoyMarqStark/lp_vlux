'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { FileSpreadsheet, MessageCircle, CheckCircle2 } from 'lucide-react';
import { SectionKicker } from '@/components/ui/section-kicker';

/* ============================================================
   MODULES SHOWCASE — "índice vivo".
   Zero cards. Editorial index rows (left) drive a single living
   stage (right) where each module plays its own micro-film:
   Excel chaos collapsing into a system · a WhatsApp message
   becoming an assigned ticket · a dashboard drawing itself.
   Auto-advances like stories; hover/click switches instantly.
   ============================================================ */

const AUTO_SECONDS = 6;

interface Mod {
  id: string;
  pre: string;
  em: string;
  url: string;
  trigger: string;
  deliver: string[];
  result: string;
  resultEm: string;
}

const MODS: readonly Mod[] = [
  {
    id: 'excel',
    pre: 'Excel a ',
    em: 'sistema operativo',
    url: 'vlux.app/inventario',
    trigger: 'Cuando una hoja ya controla inventario, costos, pedidos o asistencia y crece más rápido que las fórmulas.',
    deliver: ['App por roles', 'Historial y permisos', 'Base centralizada'],
    result: 'Una sola versión de la verdad,',
    resultEm: 'sin perseguir archivos',
  },
  {
    id: 'whatsapp',
    pre: 'WhatsApp ',
    em: 'con seguimiento',
    url: 'vlux.app/pedidos',
    trigger: 'Cuando los pedidos, solicitudes o tickets entran por chat y el seguimiento depende de quién recuerde.',
    deliver: ['Captura estructurada', 'Asignación automática', 'Alertas en panel'],
    result: 'Cero conversaciones perdidas,',
    resultEm: 'cada solicitud con dueño',
  },
  {
    id: 'reportes',
    pre: 'Reportes y ',
    em: 'tableros claros',
    url: 'vlux.app/tableros',
    trigger: 'Cuando dirección toma decisiones con datos de hace una semana o no comparables entre áreas.',
    deliver: ['Tableros en vivo', 'KPIs por rol', 'Exportes programados'],
    result: 'Decisiones con datos de hoy,',
    resultEm: 'no de la semana pasada',
  },
] as const;

export function ModulesShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { margin: '-20% 0px -20% 0px' });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);

  const autoRun = inView && !reduced;

  const select = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1); // restart story-bar even when re-selecting same row
  };

  const advance = () => {
    setActive((a) => (a + 1) % MODS.length);
    setCycle((c) => c + 1);
  };

  return (
    <section
      id="modulos"
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-t border-white/[0.05] overflow-hidden"
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-cyan-core/[0.05] blur-3xl rounded-full pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
        <SectionKicker num="[04]" label="Los Módulos · Qué entregamos" />

        <div className="max-w-4xl mt-6">
          <h2 className="display-2 reveal" style={{ ['--delay' as never]: '80ms' }}>
            Construimos solo el módulo<br />
            que resuelve <span className="em-serif">el cuello de botella</span>.
          </h2>
          <p className="lead mt-7 reveal" style={{ ['--delay' as never]: '160ms' }}>
            Nada de migraciones masivas. Encontramos el proceso que más te está costando y entregamos un módulo conectado a lo que ya usas.
          </p>
        </div>

        <div className="mt-14 lg:mt-20 grid lg:grid-cols-12 gap-6 lg:gap-14 items-start">

          {/* ===== LEFT — editorial index rows ===== */}
          <div className="lg:col-span-6 reveal" style={{ ['--delay' as never]: '240ms' }}>
            {MODS.map((mod, i) => {
              const isActive = i === active;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => select(i)}
                  onMouseEnter={() => { if (i !== active) select(i); }}
                  aria-pressed={isActive}
                  className="group block w-full text-left border-t border-white/[0.06] last:border-b py-6 lg:py-7 transition-colors cursor-pointer"
                >
                  <div className="flex items-baseline gap-5">
                    <span className={`section-num tnum transition-colors duration-300 ${isActive ? 'text-cyan-core' : 'text-ash'}`}>
                      0{i + 1}
                    </span>
                    <h3 className={`font-display font-bold tracking-[var(--tracking-tightest)] leading-[1.02] text-[clamp(1.5rem,3.2vw,2.6rem)] transition-colors duration-300 ${isActive ? 'text-pearl' : 'text-ash group-hover:text-mist'}`}>
                      {mod.pre}
                      <span className={`italic transition-colors duration-300 ${isActive ? 'em-serif-sm' : 'font-serif text-ash group-hover:text-mist'}`}>
                        {mod.em}
                      </span>
                    </h3>
                    <span
                      className={`ml-auto shrink-0 text-cyan-core transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>

                  {/* Expanded detail — only on active row */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pl-5 lg:pl-12 pt-4 pr-4">
                          <p className="text-mist text-[0.95rem] leading-relaxed max-w-lg">
                            {mod.trigger}
                          </p>
                          <div className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-cyan-soft/90">
                            {mod.deliver.join('  ·  ')}
                          </div>
                          <p className="mt-4 font-display text-pearl text-[1.02rem] leading-snug">
                            {mod.result} <span className="em-serif-sm">{mod.resultEm}</span>.
                          </p>

                          {/* Story progress bar — drives the auto-advance */}
                          <div className="mt-5 h-[2px] w-full max-w-md bg-white/[0.07] rounded-full overflow-hidden">
                            {autoRun ? (
                              <motion.div
                                key={`progress-${active}-${cycle}`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: AUTO_SECONDS, ease: 'linear' }}
                                onAnimationComplete={advance}
                                className="h-full bg-cyan-core origin-left"
                              />
                            ) : (
                              <div className="h-full w-full bg-cyan-core/40" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* ===== RIGHT — single living stage ===== */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 reveal" style={{ ['--delay' as never]: '320ms' }}>
            <div className="mockup-frame">
              {/* Chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={MODS[active].url}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-1.5 text-[0.68rem] font-mono text-ash"
                  >
                    {MODS[active].url}
                  </motion.div>
                </AnimatePresence>
                <div className="flex items-center gap-1.5 text-[0.65rem] text-mist">
                  <span className="live-dot" aria-hidden="true" />
                  <span className="font-display tracking-tight">En vivo</span>
                </div>
              </div>

              {/* Stage */}
              <div className="h-[420px] lg:h-[460px] relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    {active === 0 && <ExcelScene />}
                    {active === 1 && <WhatsScene />}
                    {active === 2 && <ReportScene />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SCENE A — Excel chaos collapses into a system
   ============================================================ */
function ExcelScene() {
  const files = [
    { name: 'ventas_FINAL_v7.xlsx', meta: 'editado hace 3 días · Mario' },
    { name: 'ventas_FINAL_v7 (copia).xlsx', meta: 'editado hoy · Lucía' },
    { name: 'VENTAS_REAL_USAR_ESTA.xlsx', meta: '¿fórmulas rotas?' },
  ];
  const rows = [
    { sku: 'SKU-0214 · Válvula 3/4"', stock: '142', status: 'OK' },
    { sku: 'SKU-0587 · Conector PVC', stock: '38', status: 'Bajo' },
    { sku: 'SKU-0091 · Manguera 10m', stock: '215', status: 'OK' },
  ];
  return (
    <div className="p-5 h-full flex flex-col">
      <div className="kicker text-[0.6rem] text-risk/90 mb-2.5">Antes · 3 versiones del mismo archivo</div>
      <div className="space-y-1.5">
        {files.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
            className="flex items-center gap-2 text-[0.76rem] font-mono text-mist"
          >
            <FileSpreadsheet className="size-3.5 text-risk/70 shrink-0" aria-hidden="true" />
            <span className="line-through decoration-risk/50 decoration-1">{f.name}</span>
            <span className="text-ash text-[0.64rem] truncate">{f.meta}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.55, duration: 0.35 }}
        className="self-center my-3 w-px h-7 bg-gradient-to-b from-risk/40 to-cyan-core origin-top"
        aria-hidden="true"
      />

      <div className="kicker text-[0.6rem] text-cyan-soft mb-2.5">Después · una sola base, con roles</div>
      <div className="flex-1 rounded-lg border border-white/[0.06] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-2 text-[0.58rem] uppercase tracking-[0.14em] text-ash bg-white/[0.015]">
          <div className="col-span-7">Artículo</div>
          <div className="col-span-2 text-right">Stock</div>
          <div className="col-span-3 text-right">Estado</div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {rows.map((r, i) => (
            <motion.div
              key={r.sku}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.14 }}
              className="grid grid-cols-12 items-center px-3 py-2.5"
            >
              <div className="col-span-7 text-[0.78rem] font-display font-medium text-pearl truncate">{r.sku}</div>
              <div className="col-span-2 text-right text-[0.78rem] text-mist tnum">{r.stock}</div>
              <div className="col-span-3 text-right">
                <span className={`pill ${r.status === 'OK' ? 'pill-green' : 'pill-warn'}`}>{r.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-3 flex items-center gap-2 text-[0.66rem] text-ash"
      >
        <CheckCircle2 className="size-3 text-success" aria-hidden="true" />
        Historial completo · Permisos por rol · Cada cambio con autor
      </motion.div>
    </div>
  );
}

/* ============================================================
   SCENE B — WhatsApp message becomes an assigned ticket
   ============================================================ */
function WhatsScene() {
  return (
    <div className="p-5 h-full flex flex-col gap-4">
      <div className="kicker text-[0.6rem] mb-1">Llega por chat…</div>

      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 22 }}
        className="max-w-[85%] rounded-2xl rounded-tl-sm border border-success/25 bg-success/[0.07] px-3.5 py-2.5"
      >
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="size-3.5 text-success" aria-hidden="true" />
          <span className="text-[0.66rem] font-mono text-success/90">Ferretería Lomas · 9:42</span>
        </div>
        <p className="text-[0.85rem] text-pearl leading-snug">
          ¿Me mandas 20 cajas de conectores para el viernes? Urge porfa 🙏
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="self-center flex items-center gap-2 text-[0.64rem] font-mono uppercase tracking-[0.14em] text-cyan-soft"
      >
        <motion.span
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="block w-px h-6 bg-gradient-to-b from-success/40 to-cyan-core origin-top"
          aria-hidden="true"
        />
        capturado · clasificado · asignado
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05 }}
        className="rounded-lg border border-cyan-core/25 bg-cyan-core/[0.04] px-4 py-3.5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[0.82rem] font-display font-bold text-pearl">OP-2431 · 20 cajas conectores</div>
            <div className="text-[0.68rem] text-ash mt-0.5">Entrega: viernes 13:00 · Cliente: Ferretería Lomas</div>
          </div>
          <span className="pill pill-cyan shrink-0">Asignado</span>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.68rem]">
          <span className="flex items-center gap-1.5 text-mist">
            <span className="w-4 h-4 rounded-full bg-cyan-core/20 text-cyan-soft text-[0.56rem] flex items-center justify-center font-display">LR</span>
            Lucía R. · zona norte
          </span>
          <span className="text-ash tnum">recordatorio jue 17:00</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="rounded-lg border border-white/[0.06] px-4 py-3 flex items-center justify-between"
      >
        <span className="text-[0.78rem] text-mist">Viernes 12:48 — entregado y confirmado al cliente</span>
        <span className="pill pill-green shrink-0">Listo</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.85 }}
        className="mt-auto flex items-center gap-2 text-[0.66rem] text-ash"
      >
        <CheckCircle2 className="size-3 text-success" aria-hidden="true" />
        Nadie tuvo que copiarlo a una hoja ni recordarlo
      </motion.div>
    </div>
  );
}

/* ============================================================
   SCENE C — a dashboard draws itself
   ============================================================ */
function ReportScene() {
  const bars = [38, 55, 47, 70, 62, 84, 76];
  const spark = 'M0,44 L24,38 L48,41 L72,30 L96,33 L120,21 L144,25 L168,12 L192,16 L216,6';
  return (
    <div className="p-5 h-full flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="kicker text-[0.6rem] mb-1.5">Ventas · esta semana</div>
          <div className="flex items-baseline gap-2">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-[2.2rem] font-bold tracking-tight text-pearl tnum leading-none"
            >
              $1.24M
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[0.72rem] text-success font-mono"
            >
              ▲ 12% vs sem. pasada
            </motion.span>
          </div>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pill pill-muted"
        >
          Actualizado hace 12 s
        </motion.span>
      </div>

      {/* Sparkline draws itself */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-4">
        <div className="kicker text-[0.58rem] mb-2">Margen por día</div>
        <svg viewBox="0 0 216 50" className="w-full h-[52px]" fill="none" aria-hidden="true">
          <motion.path
            d={spark}
            stroke="#22D3EE"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 1.1, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="216" cy="6" r="3.5" fill="#22D3EE"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
          />
        </svg>
      </div>

      {/* Bars grow with stagger */}
      <div className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.015] p-4 flex flex-col">
        <div className="kicker text-[0.58rem] mb-3">Pedidos por área</div>
        <div className="flex-1 flex items-end gap-2 min-h-[90px]">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: '4%' }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.5 + i * 0.09, type: 'spring', stiffness: 130, damping: 18 }}
              className={`flex-1 rounded-t-sm ${i === bars.length - 1 ? 'bg-cyan-core' : 'bg-cyan-core/25'}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[0.56rem] font-mono text-ash uppercase tracking-widest">
          <span>Lun</span><span>Dom</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="flex items-center gap-2 text-[0.66rem] text-ash"
      >
        <CheckCircle2 className="size-3 text-success" aria-hidden="true" />
        Dirección lo ve igual que operación — mismos números, en vivo
      </motion.div>
    </div>
  );
}
