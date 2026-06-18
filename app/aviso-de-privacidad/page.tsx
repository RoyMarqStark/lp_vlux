import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { EMAIL, LEGAL_NAME, LEGAL_ADDRESS, PRIVACY_UPDATED } from '@/lib/links';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad — VLUX',
  description:
    'Aviso de Privacidad de VLUX S.A.S. — cómo recabamos, usamos y protegemos tus datos personales, y cómo ejercer tus derechos ARCO.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient halo, same language as the landing */}
      <div className="halo-left" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-8 pt-28 lg:pt-36 pb-24 lg:pb-32">

        {/* Back to home */}
        <a
          href="/"
          className="group inline-flex items-center gap-2 text-[0.82rem] text-mist hover:text-cyan-soft transition-colors mb-12"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-0.5" aria-hidden="true">←</span>
          Volver al inicio
        </a>

        {/* Kicker */}
        <div className="flex items-center gap-3 mb-7">
          <span className="w-7 h-px bg-cyan-core/60" aria-hidden="true" />
          <span className="section-num tnum">[LEGAL]</span>
          <span className="kicker">Privacidad · {LEGAL_NAME}</span>
        </div>

        {/* Title */}
        <h1 className="display-2 mb-7">
          Aviso de <span className="em-serif">privacidad</span>.
        </h1>

        {/* Intro */}
        <p className="lead">
          {LEGAL_NAME}, con domicilio en {LEGAL_ADDRESS}, y correo electrónico de contacto{' '}
          <a href={`mailto:${EMAIL}`} className="text-cyan-soft hover:text-cyan-core transition-colors">
            {EMAIL}
          </a>
          , es responsable del tratamiento y protección de los datos personales que recabe a través de este sitio web.
        </p>

        <div className="mt-14 space-y-12">

          <Section title="Datos personales que recabamos">
            <p>
              Este sitio web puede recopilar de manera voluntaria los siguientes datos personales cuando el usuario decida proporcionarlos:
            </p>
            <List items={[
              'Nombre.',
              'Correo electrónico.',
              'Número telefónico.',
              'Empresa u organización.',
              'Cualquier información que el usuario proporcione de forma voluntaria mediante los medios de contacto disponibles en el sitio.',
            ]} />
            <p>
              {LEGAL_NAME} no recaba de manera intencional datos personales sensibles a través de este sitio web.
            </p>
          </Section>

          <Section title="Finalidades del tratamiento">
            <p>Los datos personales serán utilizados para:</p>
            <List items={[
              'Atender solicitudes de información.',
              'Dar respuesta a consultas realizadas por usuarios.',
              'Establecer contacto comercial o profesional.',
              'Proporcionar información sobre los servicios ofrecidos por VLUX, S.A.S.',
              'Dar seguimiento a solicitudes, cotizaciones o propuestas comerciales.',
              'Cumplir obligaciones legales aplicables.',
            ]} />
          </Section>

          <Section title="Transferencia de datos">
            <p>{LEGAL_NAME} no vende, renta ni comercializa datos personales a terceros.</p>
            <p>
              Los datos únicamente podrán ser compartidos cuando exista una obligación legal o requerimiento de autoridad competente conforme a la legislación aplicable.
            </p>
          </Section>

          <Section title="Derechos ARCO">
            <p>
              El titular de los datos personales podrá ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición (ARCO), así como revocar el consentimiento otorgado para el tratamiento de sus datos personales.
            </p>
            <p>
              Para ejercer cualquiera de estos derechos deberá enviar una solicitud al correo:{' '}
              <a href={`mailto:${EMAIL}`} className="text-cyan-soft hover:text-cyan-core transition-colors">
                {EMAIL}
              </a>
            </p>
            <p>La solicitud deberá incluir:</p>
            <List items={[
              'Nombre del titular.',
              'Medio de contacto para recibir respuesta.',
              'Descripción clara del derecho que desea ejercer.',
              'Información que permita acreditar su identidad.',
            ]} />
          </Section>

          <Section title="Uso de cookies y tecnologías similares">
            <p>
              Este sitio web puede utilizar cookies o tecnologías similares para fines técnicos, estadísticos y de mejora de la experiencia de navegación.
            </p>
            <p>
              El usuario puede configurar su navegador para limitar o rechazar el uso de dichas tecnologías.
            </p>
          </Section>

          <Section title="Modificaciones al aviso de privacidad">
            <p>
              {LEGAL_NAME} se reserva el derecho de modificar o actualizar el presente Aviso de Privacidad para atender cambios legales, regulatorios o internos.
            </p>
            <p>Las modificaciones serán publicadas en esta misma sección del sitio web.</p>
          </Section>

          <Section title="Consentimiento">
            <p>
              Al utilizar este sitio web y proporcionar voluntariamente sus datos personales, el usuario manifiesta haber leído y aceptado los términos del presente Aviso de Privacidad.
            </p>
          </Section>

        </div>

        {/* Footer meta */}
        <div className="mt-16 pt-7 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[0.78rem] text-ash">
            Última actualización: <span className="text-mist">{PRIVACY_UPDATED}</span>.
          </p>
          <a href="/" className="btn-cta btn-cta-primary text-[0.85rem] px-4 py-2">
            Volver al inicio
            <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}

/* ---------- Pieces ---------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[1.35rem] lg:text-[1.6rem] font-bold tracking-[var(--tracking-tightest)] text-pearl mb-4">
        {title}
      </h2>
      <div className="space-y-3 text-mist leading-relaxed text-[0.96rem]">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 my-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="text-cyan-core mt-[0.55rem] w-1.5 h-1.5 rounded-full bg-cyan-core shrink-0" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
