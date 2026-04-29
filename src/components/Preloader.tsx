'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Wait for fonts + critical images
    const waitForAssets = async () => {
      try {
        // Wait for fonts to be ready
        await document.fonts.ready;
        
        // Wait up to 2 seconds for priority images to be rendered into the DOM by React
        let heroImages = document.querySelectorAll('img[fetchpriority="high"]');
        let attempts = 0;
        while (heroImages.length === 0 && attempts < 40) {
          await new Promise(r => setTimeout(r, 50));
          heroImages = document.querySelectorAll('img[fetchpriority="high"]');
          attempts++;
        }
        
        // Wait for all images with priority attribute to load
        const imagePromises = Array.from(heroImages).map((img) => {
          const imgEl = img as HTMLImageElement;
          if (imgEl.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            imgEl.addEventListener('load', () => resolve(), { once: true });
            imgEl.addEventListener('error', () => resolve(), { once: true });
          });
        });
        
        // Wait for images with a timeout fallback of 5s
        await Promise.race([
          Promise.all(imagePromises),
          new Promise(resolve => setTimeout(resolve, 5000))
        ]);
      } catch {
        // Fallback: proceed anyway
      }
      
      // Minimum display time of 1.2s for brand impression
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setLoaded(true);
      // Remove from DOM after exit animation
      setTimeout(() => setHidden(true), 900);
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
