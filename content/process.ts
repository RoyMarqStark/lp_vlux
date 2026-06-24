/* ============================================================
   CONTENT · Proceso (página /proceso)
   The four stages of how VLUX works. Presentation (timeline,
   progress line, nodes) lives in
   components/sections/process-timeline.tsx.
   ============================================================ */

export interface ProcessStep {
  num: string;
  title: string;
  description: string;
  meta: string;
}

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    num: '01',
    title: 'Diagnóstico operativo',
    description: 'Mapeamos tus herramientas, áreas y dónde se duplica captura o se rompe el seguimiento.',
    meta: 'Sin costo · 30–45 min',
  },
  {
    num: '02',
    title: 'Mapa del primer módulo',
    description: 'Alcance, roles e integraciones en una sola hoja de ruta — con fecha de entrega.',
    meta: 'Alcance fijo',
  },
  {
    num: '03',
    title: 'Implementación por etapas',
    description: 'Liberamos por bloques validables con el equipo. Lo que entra en producción ya está adoptado.',
    meta: 'Sprints de 2–3 sem',
  },
  {
    num: '04',
    title: 'Medición y mejora',
    description: 'Tableros activos desde día uno. Ajustes en base a uso real, no a suposiciones.',
    meta: 'Continuo',
  },
] as const;
