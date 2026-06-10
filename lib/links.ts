/**
 * Centralized contact links and constants.
 * Update once here; consumed by header CTA, hero CTA, final CTA,
 * footer, sticky mobile CTA, and the floating contact rail.
 */

export const CALENDAR_URL = 'https://cal.com/roymarq/vlux-diagnostico';

export const WHATSAPP_NUMBER = '527441452048';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_URL_WITH_MESSAGE = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20VLUX%2C%20me%20interesa%20agendar%20un%20diagn%C3%B3stico.`;

export const PHONE_TEL = '+527441452048';
export const PHONE_DISPLAY = '+52 744 145 2048';

export const EMAIL = 'vluxmarketing@gmail.com';

export const NAV_LINKS = [
  { num: '[02]', label: 'Problema', href: '#problema' },
  { num: '[03]', label: 'Promesa', href: '#promesa' },
  { num: '[04]', label: 'Módulos', href: '#modulos' },
  { num: '[05]', label: 'Integraciones', href: '#integraciones' },
  { num: '[06]', label: 'Proceso', href: '#proceso' },
  { num: '[07]', label: 'Contacto', href: '#contacto' },
] as const;
