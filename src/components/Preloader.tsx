'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Brand moment only on the first hard load per session — deep-link
    // landings (ads, search) and returning visitors shouldn't pay it twice.
    let seen = false;
    try { seen = sessionStorage.getItem('mm-preloader') === '1'; } catch { /* private mode */ }
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLoaded(true);
      setHidden(true);
      return;
    }

    const started = performance.now();
    const waitForAssets = async () => {
      try {
        await document.fonts.ready;

        // Give a hero image (if this page has one) a beat to mount…
        let hero: HTMLImageElement | null = null;
        for (let i = 0; i < 6 && !hero; i++) {
          hero = document.querySelector<HTMLImageElement>('main img');
          if (!hero) await new Promise(r => setTimeout(r, 50));
        }
        // …then wait for it to finish decoding, capped so slow networks
        // aren't stuck behind the overlay. Image-less pages skip straight on.
        if (hero && !hero.complete) {
          const target = hero;
          await Promise.race([
            new Promise<void>(resolve => {
              target.addEventListener('load', () => resolve(), { once: true });
              target.addEventListener('error', () => resolve(), { once: true });
            }),
            new Promise(r => setTimeout(r, 1500)),
          ]);
        }
      } catch {
        // Fallback: proceed anyway
      }

      // Minimum display measured from mount (not additive on top of waits)
      const elapsed = performance.now() - started;
      if (elapsed < 600) await new Promise(r => setTimeout(r, 600 - elapsed));

      try { sessionStorage.setItem('mm-preloader', '1'); } catch { /* private mode */ }
      setLoaded(true);
      // Remove from DOM after the 0.5s exit transition
      setTimeout(() => setHidden(true), 550);
    };

    waitForAssets();
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`preloader ${loaded ? 'preloader--exit' : ''}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--clr-ink)',
        color: 'var(--clr-bone)',
      }}
    >
      {/* Brand Mark — Dual brand lockup */}
      <div className={`preloader__brand ${loaded ? 'preloader__brand--exit' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 3vw, 2rem)' }} className="preloader-lockup">
          <div style={{ textAlign: 'center' }}>
            <span className="preloader__line">Melting</span>
            <span className="preloader__line">Moments</span>
          </div>
          <div className="preloader__separator" style={{ width: '1px', height: 'clamp(40px, 6vw, 60px)', backgroundColor: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <div style={{ textAlign: 'center' }}>
            <span className="preloader__line" style={{ animationDelay: '0.35s' }}>Guido&apos;s</span>
            <span className="preloader__line" style={{ animationDelay: '0.45s' }}>Gourmet</span>
          </div>
        </div>
      </div>

      {/* Loading bar */}
      <div className="preloader__bar-track">
        <div className={`preloader__bar-fill ${loaded ? 'preloader__bar-fill--done' : ''}`} />
      </div>
    </div>
  );
}
