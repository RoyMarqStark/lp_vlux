/* ============================================================
   CONTENT · [04] Módulos — "índice vivo"
   Copy & data for each module row. The micro-film scenes and
   animation live in components/sections/modules-showcase.tsx.
   ============================================================ */

export interface Module {
  id: string;
  pre: string;
  em: string;
  url: string;
  trigger: string;
  deliver: string[];
  result: string;
  resultEm: string;
}

export const MODULES: readonly Module[] = [
  {
    id: 'excel',
    pre: 'Excel a ',
    em: 'sistema operativo',
    url: 'vlux.app/inventario',
    trigger: 'Cuando una hoja ya controla inventario, costos, pedidos o asistencia y crece más rápido que las fórmulas.',
    deliver: ['App por roles', 'Historial y permisos', 'Base centralizada'],
    result: 'Una sola versión de la verdad,',
    resultEm: 'sin perseguir archivos',
  },
  {
    id: 'whatsapp',
    pre: 'WhatsApp ',
    em: 'con seguimiento',
    url: 'vlux.app/pedidos',
    trigger: 'Cuando los pedidos, solicitudes o tickets entran por chat y el seguimiento depende de quién recuerde.',
    deliver: ['Captura estructurada', 'Asignación automática', 'Alertas en panel'],
    result: 'Cero conversaciones perdidas,',
    resultEm: 'cada solicitud con dueño',
  },
  {
    id: 'reportes',
    pre: 'Reportes y ',
    em: 'tableros claros',
    url: 'vlux.app/tableros',
    trigger: 'Cuando dirección toma decisiones con datos de hace una semana o no comparables entre áreas.',
    deliver: ['Tableros en vivo', 'KPIs por rol', 'Exportes programados'],
    result: 'Decisiones con datos de hoy,',
    resultEm: 'no de la semana pasada',
  },
] as const;
