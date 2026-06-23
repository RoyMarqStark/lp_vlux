import type { CSSProperties } from 'react';

// Layout primitives
import { SiteHeader } from '@/components/site-header';
import { ContactRail } from '@/components/contact-rail';
import { StickyCta } from '@/components/sticky-cta';
import { RevealSetup } from '@/components/reveal-setup';
import { CinematicFooter } from '@/components/ui/motion-footer';

// Hero composition pieces
import { NeuralNoise } from '@/components/ui/neural-noise';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { AnimatedGenerateButton } from '@/components/ui/animated-generate-button';
import { DashboardMockup } from '@/components/dashboard-mockup';

// Sections — each one is its own cinematic moment
import { ProblemSticky } from '@/components/sections/problem-sticky';
import { Manifesto } from '@/components/sections/manifesto';
import { ModulesShowcase } from '@/components/sections/modules-showcase';
import { LiveOpsTheater } from '@/components/sections/live-ops-theater';
import { IntegrationsMarquee } from '@/components/sections/integrations-marquee';
import { ProcessTimeline } from '@/components/sections/process-timeline';
import { CtaFinal } from '@/components/sections/cta-final';

import { CALENDAR_URL } from '@/lib/links';

const delay = (ms: number): CSSProperties => ({ ['--delay' as never]: `${ms}ms` });

/**
 * VLUX landing — composition root.
 *
 * Narrative flow:
 *   [01] Hero            — WebGL neural noise + scroll-driven dashboard reveal
 *   [02] Problema        — sticky scroll narrative, pinned title + revealing pains
 *   [03] Promesa         — editorial manifesto, word-by-word reveal on scroll
 *   [04] Módulos         — asymmetric bento grid with 3D magnetic hover
 *   [05] Integraciones   — infinite marquee of partner tools
 *   [06] Proceso         — vertical timeline with scroll-bound progress fill
 *   [07] Diagnóstico     — magnetic CTA with dramatic halo
 *   Footer               — editorial sitemap + direct contact
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <ContactRail />

      <Hero />
      <ProblemSticky />
      <Manifesto />
      <ModulesShowcase />
      <LiveOpsTheater />
      <IntegrationsMarquee />
      <ProcessTimeline />
      <CtaFinal />
      <CinematicFooter />

      <StickyCta />
      <RevealSetup />
    </>
  );
}

/* ==================================================================
   [01] HERO — kept inline to preserve direct wiring of NeuralNoise +
   ContainerScroll + DashboardMockup. Everything below the hero is
   isolated in its own component file.
   ================================================================== */
function Hero() {
  return (
    <section id="inicio" className="relative pt-20 lg:pt-16 overflow-hidden">
      {/* WebGL neural-noise background — scoped to this section, brand cyan, subtle */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <NeuralNoise />
      </div>
      <div className="halo-left" aria-hidden="true" />

      {/* ContainerScroll: kicker + title translate up together; dashboard flattens from rotateX 20° → 0° */}
      <div className="relative z-10">
        <ContainerScroll
          titleComponent={
            <div className="px-3 sm:px-5">
              <h1 className="display reveal" style={delay(80)}>
                Tu operación no falla por <span className="em-serif">falta de software</span>.<br className="hidden md:block" />
                Falla porque <span className="em-serif">nadie lo usa</span>.
              </h1>

              <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 reveal" style={delay(180)}>
                <AnimatedGenerateButton
                  href={CALENDAR_URL}
                  target="_blank"
                  labelIdle="Agendar diagnóstico"
                  labelActive="Agendando"
                />
                <AnimatedGenerateButton
                  href="#modulos"
                  labelIdle="Ver módulos"
                  labelActive="Cargando"
                  minTextWidth="6.5em"
                />
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.82rem] text-mist reveal" style={delay(340)}>
                {['Diagnóstico sin costo', 'Mapa de prioridades', 'Primer módulo en semanas'].map((label) => (
                  <span key={label} className="inline-flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-cyan-core" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          }
        >
          <DashboardMockup />
        </ContainerScroll>
      </div>
    </section>
  );
}
