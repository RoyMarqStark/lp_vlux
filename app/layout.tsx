import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/* ---------- Self-hosted Switzer via next/font/local ---------- */
const switzer = localFont({
  src: [
    { path: '../public/fonts/switzer-400.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/switzer-500.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/switzer-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-switzer',
  display: 'swap',
  preload: true,
});

/* ---------- Google Fonts via next/font/google (auto-subsetted + self-hosted) ---------- */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/* ---------- Metadata ---------- */
export const metadata: Metadata = {
  title: 'VLUX — Convierte Excel y WhatsApp en un sistema que tu equipo sí usa',
  description:
    'VLUX convierte Excel, WhatsApp y reportes manuales en módulos operativos digitales — claros, medibles y fáciles de adoptar. AI Transformation Partner en Ciudad de México.',
  openGraph: {
    title: 'VLUX — Sistemas operativos para empresas que crecieron',
    description:
      'Convertimos Excel, WhatsApp y reportes manuales en módulos operativos que reducen errores y dan visibilidad — sin cambiar toda tu operación de golpe.',
    type: 'website',
    locale: 'es_MX',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0D08',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/* ---------- Root layout ---------- */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = `${switzer.variable} ${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`;

  return (
    <html lang="es" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
