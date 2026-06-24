import type { Metadata } from 'next';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { RevealSetup } from '@/components/reveal-setup';
import { CALENDAR_URL } from '@/lib/links';

export const metadata: Metadata = {
  title: 'Nuestro Proceso — VLUX',
  description:
    'Cómo trabajamos en VLUX: del proceso manual al primer módulo funcionando en cuatro etapas — diagnóstico operativo, mapa del primer módulo, implementación por etapas y medición continua.',
  robots: { index: true, follow: true },
};

/**
 * Dedicated /proceso page — satellite of the landing (same pattern as
 * /aviso-de-privacidad). Keeps the home page short while preserving the
 * full ProcessTimeline design. Reached from the drawer menu's "Proceso ↗".
 */
export default function ProcesoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient halo, same language as the landing */}
      <div className="halo-left" aria-hidden="true" />

      {/* Back to home */}
      <div className="relative z-10 max-w-[var(--container-shell)] mx-auto px-5 lg:px-8 pt-28 lg:pt-32">
        <a
          href="/"
          className="group inline-flex items-center gap-2 text-[0.82rem] text-mist hover:text-cyan-soft transition-colors"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-0.5" aria-hidden="true">←</span>
          Volver al inicio
        </a>
      </div>

      {/* The original process section, full design preserved */}
      <ProcessTimeline />

      {/* Closing CTA */}
      <div className="relative z-10 max-w-[var(--container-shell)] mx-auto px-5 lg:px-8 pb-24 lg:pb-32">
        <div className="pt-7 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[0.92rem] text-mist">
            El primer paso es un <span className="em-serif-sm">diagnóstico sin costo</span>.
          </p>
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener"
            className="btn-cta btn-cta-primary text-[0.85rem] px-4 py-2"
          >
            Agendar diagnóstico <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <RevealSetup />
    </main>
  );
}
