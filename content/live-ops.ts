/* ============================================================
   CONTENT · [LIVE] Demo — "Tu operación en tiempo real"
   Scripted feed + seed data for the self-running simulation.
   Behavior (timing, KPI math, rendering) lives in
   components/sections/live-ops-theater.tsx.
   ============================================================ */

export type Channel = 'whatsapp' | 'excel' | 'sistema';
export type Status = 'nuevo' | 'asignado' | 'listo' | 'alerta';

export interface OpEvent {
  id: number;
  channel: Channel;
  text: string;
  meta: string;
  status: Status;
}

/** Scripted loop — feels organic, stays deterministic. */
export const SCRIPT: ReadonlyArray<Omit<OpEvent, 'id'>> = [
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
export const INITIAL_FEED: OpEvent[] = [
  { id: 3, channel: 'sistema', text: 'OP-2417 completada', meta: '01h 05m · sin seguimiento manual', status: 'listo' },
  { id: 2, channel: 'whatsapp', text: 'Pedido nuevo · Acme MX', meta: 'Capturado automáticamente desde chat', status: 'nuevo' },
  { id: 1, channel: 'excel', text: 'Hoja de costos migrada', meta: 'Una sola versión de la verdad', status: 'listo' },
];

export const INITIAL_BARS = [42, 58, 50, 72, 64, 80, 68, 88, 76];

export const INITIAL_KPIS = { recibidos: 47, enCurso: 12, completados: 31 };
