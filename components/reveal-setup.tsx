'use client';

import { useEffect } from 'react';

/**
 * Mount once at the page root. Finds every element with `.reveal`
 * class and animates it in when it enters the viewport.
 *
 * Server components stay free of `'use client'` while still getting
 * scroll-triggered animations — they only need to render the markup
 * with `className="reveal"` and `style={{ '--delay': '120ms' }}`.
 */
export function RevealSetup() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = document.querySelectorAll<HTMLElement>('.reveal');

    if (prefersReduced || !('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
