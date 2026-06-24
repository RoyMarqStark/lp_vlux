/* ============================================================
   CONTENT · [06] Contacto — "Qué revisamos juntos"
   Text for the stacked review cards. Icons and the stacked-card
   layout (translate offsets) stay in
   components/sections/cta-final.tsx as presentation.
   ============================================================ */

export interface DiagnosticReviewItem {
  title: string;
  description: string;
  step: string;
}

export const DIAGNOSTIC_REVIEW: readonly DiagnosticReviewItem[] = [
  {
    title: 'Captura duplicada',
    description: 'Dónde se duplica el trabajo',
    step: 'Paso 01 · Diagnóstico',
  },
  {
    title: 'Módulo de impacto',
    description: 'Cuál ordena más tu operación',
    step: 'Paso 02 · Prioridad',
  },
  {
    title: 'Datos y roles',
    description: 'Qué falta para arrancar',
    step: 'Paso 03 · Alcance',
  },
] as const;
