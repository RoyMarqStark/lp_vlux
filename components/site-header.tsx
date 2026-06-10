'use client';

import { useEffect, useState } from 'react';
import { CALENDAR_URL, NAV_LINKS } from '@/lib/links';
// CALENDAR_URL still used by drawer's bottom CTA — kept

/**
 * Floating capsule header with hamburger that opens a
 * full-screen drawer. State + side effects handled here;
 * everything else stays in Server Components.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      {/* ---------- Floating capsule (left-aligned, logo + menu only) ---------- */}
      <header className="floating-header fixed top-4 left-4 z-[60] lg:top-6 lg:left-6">
        <div className="capsule">
          <a href="#inicio" className="flex items-center gap-2.5 pr-1" aria-label="VLUX — inicio">
            <span className="logo-mark">V</span>
            <span className="hidden sm:inline font-display font-bold text-pearl text-[1rem] tracking-[var(--tracking-tightest)]">
              VLUX<span className="text-cyan-core">.</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-white/[0.10] hover:border-cyan-core/40 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 7h18M3 17h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* ---------- Drawer ---------- */}
      <div className={`menu-drawer ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open}>
        <div className="max-w-[var(--container-shell)] mx-auto px-5 lg:px-8 pt-6 lg:pt-7 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="logo-mark">V</span>
              <span className="font-display font-bold text-pearl text-[1rem] tracking-[var(--tracking-tightest)]">
                VLUX<span className="text-cyan-core">.</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="w-10 h-10 flex items-center justify-center rounded-full border border-white/[0.10] hover:border-cyan-core/40 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center gap-2 lg:gap-1 mt-8 lg:mt-0">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-5 py-3 lg:py-4 border-b border-white/[0.06]"
              >
                <span className="section-num tnum w-12">{link.num}</span>
                <span className="font-display text-[2rem] lg:text-[3rem] font-medium tracking-[var(--tracking-tighter)] text-pearl group-hover:text-cyan-core transition-colors">
                  {link.label}
                </span>
              </a>
            ))}
          </nav>

          <div className="pb-8 lg:pb-12 pt-6 lg:pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/[0.06]">
            <div className="text-mist text-sm">
              <span className="em-serif-sm">VLUX</span> · AI Transformation Partner · Ciudad de México
            </div>
            <a href={CALENDAR_URL} target="_blank" rel="noopener" className="btn-cta btn-cta-primary">
              Agendar diagnóstico <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
