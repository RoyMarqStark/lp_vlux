'use client';

import { motion } from 'framer-motion';
import { SectionKicker } from '@/components/ui/section-kicker';

const ITEMS = [
  'Excel',
  'WhatsApp',
  'Global Shop',
  'ERP / CRM',
  'Base de datos',
  'Power BI',
  'Workflows',
  'AI / Agents',
] as const;

/**
 * Infinite-scrolling marquee of integration names.
 * Premium B2B convention — feels alive without being noisy.
 * Gradients on the edges fade items into the dark background.
 */
export function IntegrationsMarquee() {
  return (
    <section
      id="integraciones"
      className="relative py-20 lg:py-28 border-t border-white/[0.05] overflow-hidden"
    >
      <div className="max-w-[var(--container-shell)] mx-auto px-5 lg:px-8 mb-12 lg:mb-16">
        <SectionKicker num="[05]" label="Integraciones · Con lo que ya usas" />
        <h2 className="display-2 mt-6 reveal max-w-3xl" style={{ ['--delay' as never]: '80ms' }}>
          Trabajamos con lo que<br />
          <span className="em-serif">ya usa tu equipo</span>.
        </h2>
      </div>

      <div className="relative">
        {/* Edge gradients */}
        <div className="absolute inset-y-0 left-0 w-32 lg:w-56 z-10 bg-gradient-to-r from-ink via-ink/90 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 lg:w-56 z-10 bg-gradient-to-l from-ink via-ink/90 to-transparent pointer-events-none" />

        {/* Marquee track */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-12 lg:gap-20 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 42, ease: 'linear', repeat: Infinity }}
          >
            {[...ITEMS, ...ITEMS].map((item, i) => (
              <div key={`${item}-${i}`} className="flex items-center gap-12 lg:gap-20 shrink-0">
                <span className="font-display text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-bold text-pearl tracking-[var(--tracking-tightest)] leading-none">
                  {item}
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-core/60 shrink-0" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-[var(--container-shell)] mx-auto px-5 lg:px-8 mt-12 lg:mt-14 flex items-center gap-3 text-[0.78rem] text-ash reveal">
        <span className="w-8 h-px bg-white/10" aria-hidden="true" />
        <span>¿Trabajas con otra herramienta? La integramos en el diagnóstico.</span>
      </div>
    </section>
  );
}
