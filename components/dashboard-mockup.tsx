/**
 * Hero dashboard mockup — pure HTML/CSS, no images.
 * Server component, zero JS.
 */
export function DashboardMockup() {
  return (
    <div className="relative mockup-frame">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex items-center gap-1.5 text-[0.68rem] font-mono text-ash">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          vlux.app
        </div>
        <div className="flex items-center gap-1.5 text-[0.65rem] text-mist">
          <span className="live-dot" aria-hidden="true" />
          <span className="font-display tracking-tight">En vivo</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 lg:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <div className="kicker text-[0.62rem] mb-1">Operaciones · Hoy</div>
            <div className="font-display text-[1.05rem] font-medium tracking-tight">Pedidos en proceso</div>
          </div>
          <span className="pill pill-cyan">5 áreas</span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5">
            <div className="kicker text-[0.56rem]">Hoy</div>
            <div className="font-display text-[1.35rem] font-bold tracking-tight tnum mt-1">47</div>
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5">
            <div className="kicker text-[0.56rem]">En curso</div>
            <div className="font-display text-[1.35rem] font-bold tracking-tight tnum mt-1 text-cyan-soft">12</div>
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5">
            <div className="kicker text-[0.56rem]">Riesgo</div>
            <div className="font-display text-[1.35rem] font-bold tracking-tight tnum mt-1 text-warn">3</div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-white/[0.05] overflow-hidden">
          <div className="grid grid-cols-12 px-3 py-2 text-[0.6rem] uppercase tracking-[0.14em] text-ash bg-white/[0.015]">
            <div className="col-span-7">Pedido</div>
            <div className="col-span-5 text-right">Estatus</div>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { id: 'OP-2418 · Acme MX', meta: 'Lucía R. · 02h 14m', status: 'En curso', kind: 'cyan' as const },
              { id: 'OP-2419 · Refacciones', meta: 'Mario A. · 00h 42m', status: 'Listo', kind: 'green' as const },
              { id: 'OP-2420 · Distribuidora', meta: 'Sofía E. · 04h 03m', status: 'Atención', kind: 'warn' as const },
            ].map((row) => (
              <div key={row.id} className="mockup-row grid grid-cols-12 items-center px-3 py-2.5 transition-colors">
                <div className="col-span-7">
                  <div className="text-[0.78rem] font-display font-medium">{row.id}</div>
                  <div className="text-[0.64rem] text-ash">{row.meta}</div>
                </div>
                <div className="col-span-5 text-right">
                  <span className={`pill pill-${row.kind}`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 text-[0.66rem] text-ash">
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 12a9 9 0 11-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
            Sincronizado con WhatsApp · ERP · Excel
          </div>
        </div>
      </div>
    </div>
  );
}
