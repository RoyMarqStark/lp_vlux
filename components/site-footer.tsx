import { CALENDAR_URL, WHATSAPP_URL, EMAIL, PHONE_DISPLAY, NAV_LINKS } from '@/lib/links';

/**
 * Editorial footer — Wibify-inspired with location coordinates,
 * site map, and direct contact column. Pure server component.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.05] pt-16 pb-10 relative">
      <div className="max-w-[var(--container-shell)] mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="logo-mark">V</span>
              <span className="font-display font-bold text-pearl text-[1.4rem] tracking-[var(--tracking-tightest)]">
                VLUX<span className="text-cyan-core">.</span>
              </span>
              <span className="hidden md:inline-block w-px h-4 bg-white/10" aria-hidden="true" />
              <span className="kicker text-mist hidden md:inline-block">AI Transformation Partner</span>
            </div>
            <p className="mt-6 text-mist max-w-md leading-relaxed">
              Convertimos procesos manuales en módulos operativos <span className="em-serif-sm">claros, medibles y fáciles de adoptar</span>.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[0.78rem] text-ash">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Ciudad de México · MX <span className="text-ash/60 ml-2 tnum">· 19.4326° N · 99.1332° W</span>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="kicker mb-4">Sección</div>
            <ul className="space-y-2.5 text-[0.92rem] text-mist">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-pearl transition-colors">
                    {link.num} {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="kicker mb-4">Contacto directo</div>
            <ul className="space-y-3 text-[0.92rem]">
              <li>
                <a href={`mailto:${EMAIL}`} className="group flex items-center gap-3 text-pearl hover:text-cyan-core transition-colors">
                  <svg className="w-4 h-4 text-mist group-hover:text-cyan-core transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="group flex items-center gap-3 text-pearl hover:text-cyan-core transition-colors">
                  <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.88 11.91L4 20l4.19-1.1a7.93 7.93 0 003.79.97h.01a7.94 7.94 0 005.61-13.55z" />
                  </svg>
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={CALENDAR_URL} target="_blank" rel="noopener" className="group flex items-center gap-3 text-pearl hover:text-cyan-core transition-colors">
                  <svg className="w-4 h-4 text-mist group-hover:text-cyan-core transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Agendar diagnóstico
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-[0.78rem] text-ash">
            © <span className="tnum">2026</span> VLUX · Diseñado y operado desde Ciudad de México.
          </div>
          <div className="flex items-center gap-5 text-[0.78rem] text-ash">
            <a href="#" className="hover:text-pearl transition-colors">Privacidad</a>
            <a href="#" className="hover:text-pearl transition-colors">Términos</a>
            <span>Built in Mexico</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
