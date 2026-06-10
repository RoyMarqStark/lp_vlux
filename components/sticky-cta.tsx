'use client';

import { useEffect, useState } from 'react';
import { CALENDAR_URL } from '@/lib/links';

/**
 * Mobile-only floating CTA that slides up after the user
 * scrolls past 600px. Hidden on `md+` via CSS.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`sticky-cta ${show ? 'show' : ''}`}>
      <a
        href={CALENDAR_URL}
        target="_blank"
        rel="noopener"
        className="btn-cta btn-cta-primary w-full justify-center py-3.5 text-[0.95rem]"
      >
        Agendar diagnóstico operativo
        <span className="arrow" aria-hidden="true">→</span>
      </a>
    </div>
  );
}
