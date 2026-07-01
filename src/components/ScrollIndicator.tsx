'use client';

import { useEffect, useRef } from 'react';

export default function ScrollIndicator() {
  const barRef = useRef<HTMLDivElement>(null);

  // Driven imperatively (rAF + transform) — a setState here would re-render
  // React on every scroll tick, and animating height forces layout.
  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScrollable <= 0
        ? 0
        : Math.min(1, Math.max(0, window.scrollY / totalScrollable));
      if (barRef.current) barRef.current.style.transform = `scaleY(${progress})`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '4px',
      height: '100dvh',
      backgroundColor: 'rgba(17, 17, 17, 0.05)',
      zIndex: 9999,
      pointerEvents: 'none',
      mixBlendMode: 'difference' // Keeps it visible across light/dark backgrounds
    }}>
      <div
        ref={barRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F7F6F0', // Bone white line cutting through difference mode
          transform: 'scaleY(0)',
          transformOrigin: 'top',
          transition: 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
}
