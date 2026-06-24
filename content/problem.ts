/* ============================================================
   CONTENT · [02] Problema — "Diagnóstico operativo en vivo"
   Copy & data for the operations-monitor section. Edit text here;
   the presentation (waveforms, scan band, count-up) lives in
   components/sections/problem-diagnostic.tsx.
   ============================================================ */

export interface Fracture {
  tool: string;
  system: string;
  problem: string;
  /** Numeric part of the cost metric, count-up on view. */
  value: number;
  prefix: string;
  suffix: string;
  caption: string;
  status: 'CRÍTICO' | 'EN RIESGO';
  severity: 'risk' | 'warn';
}

export const FRACTURES: readonly Fracture[] = [
  {
    tool: 'Excel',
    system: 'Integridad de datos',
    problem:
      'Cada área edita su propia copia. Las fórmulas se rompen, los enlaces externos fallan y nadie sabe cuál es la hoja correcta.',
    value: 14,
    prefix: '≈',
    suffix: ' h',
    caption: 'por semana en reconciliar versiones',
    status: 'CRÍTICO',
    severity: 'risk',
  },
  {
    tool: 'WhatsApp',
    system: 'Trazabilidad',
    problem:
      'La operación crítica vive en chats. Lo que no se anotó en una hoja, se pierde. El seguimiento depende de quién recuerde qué.',
    value: 3,
    prefix: '1 de cada ',
    suffix: '',
    caption: 'compromisos se cae sin responsable',
    status: 'CRÍTICO',
    severity: 'risk',
  },
  {
    tool: 'Reportes',
    system: 'Latencia de decisión',
    problem:
      'Cada cierre toma días. Cuando dirección recibe el dato, la decisión ya pasó. El equipo opera por intuición, no por dato.',
    value: 4,
    prefix: '+',
    suffix: ' días',
    caption: 'entre el hecho real y el reporte',
    status: 'EN RIESGO',
    severity: 'warn',
  },
] as const;
