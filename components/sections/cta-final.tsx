import { SectionKicker } from '@/components/ui/section-kicker';
import { AnimatedGenerateButton } from '@/components/ui/animated-generate-button';
import DisplayCards, { type DisplayCardProps } from '@/components/ui/display-cards';
import { Search, Crosshair, Database } from 'lucide-react';
import { CALENDAR_URL, WHATSAPP_URL } from '@/lib/links';

/** Stacked interactive cards — the 3 things covered in the diagnostic. */
const REVIEW_CARDS: DisplayCardProps[] = [
  {
    icon: <Search className="size-4 text-cyan-soft" />,
    title: 'Captura duplicada',
    description: 'Dónde se duplica el trabajo',
    date: 'Paso 01 · Diagnóstico',
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Crosshair className="size-4 text-cyan-soft" />,
    title: 'Módulo de impacto',
    description: 'Cuál ordena más tu operación',
    date: 'Paso 02 · Prioridad',
    className:
      "[grid-area:stack] translate-x-10 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Database className="size-4 text-cyan-soft" />,
    title: 'Datos y roles',
    description: 'Qué falta para arrancar',
    date: 'Paso 03 · Alcance',
    className: '[grid-area:stack] translate-x-20 translate-y-20 hover:translate-y-10',
  },
];

/**
 * Final CTA section.
 * - Centered editorial title with italic emphasis.
 * - Magnetic primary CTA (subtly follows cursor).
 * - Side panel listing what we cover in the diagnostic.
 * - Big radial cyan glow behind the whole thing.
 */
export function CtaFinal() {
  return (
    <section id="contacto" className="relative py-16 lg:py-40 border-t border-white/[0.05] overflow-hidden">
      {/* Big radial halo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-cyan-core/[0.10] blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-cyan-core/[0.05] blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
        <SectionKicker num="[06]" label="Contacto · Diagnóstico operativo" />

        <div className="mt-10 lg:mt-14 grid lg:grid-cols-12 gap-8 lg:gap-16">

          <div className="lg:col-span-7">
            <h2 className="display-2 reveal" style={{ ['--delay' as never]: '80ms' }}>
              Empecemos por encontrar<br />
              el proceso que más<br />
              conviene <span className="em-serif">ordenar primero</span>.
            </h2>
            <p className="lead mt-8 reveal" style={{ ['--delay' as never]: '160ms' }}>
              En una sesión revisamos tus herramientas actuales, el cuello de botella principal y el módulo mínimo para empezar sin frenar al equipo.
            </p>

            <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 reveal" style={{ ['--delay' as never]: '240ms' }}>
              <AnimatedGenerateButton
                href={CALENDAR_URL}
                target="_blank"
                labelIdle="Agendar diagnóstico"
                labelActive="Agendando"
              />

              <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-ghost">
                <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.88 11.91L4 20l4.19-1.1a7.93 7.93 0 003.79.97h.01a7.94 7.94 0 005.61-13.55z" />
                </svg>
                WhatsApp directo
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.82rem] text-mist reveal" style={{ ['--delay' as never]: '320ms' }}>
              <span className="inline-flex items-center gap-2">
                <span className="live-dot scale-75" aria-hidden="true" />
                Respuesta en menos de 24 h
              </span>
              <span className="text-ash">·</span>
              <span>Sesión 30–45 min</span>
              <span className="text-ash">·</span>
              <span>El mapa es tuyo, contrates o no</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="reveal" style={{ ['--delay' as never]: '200ms' }}>
              <div className="kicker mb-10">Qué revisamos juntos</div>
              {/* Skewed stack needs breathing room for hover fan-out */}
              <div className="pt-4 pb-8 pr-2 sm:pb-24 sm:pr-6 overflow-hidden sm:overflow-visible">
                <DisplayCards cards={REVIEW_CARDS} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
