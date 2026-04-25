'use client';

import { useEffect, useState } from 'react';

export default function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollY = window.scrollY;

      // Calculate percentage
      const totalScrollable = documentHeight - windowHeight;
      if (totalScrollable <= 0) {
        setScrollProgress(0);
      } else {
        const progress = Math.min(100, Math.max(0, (scrollY / totalScrollable) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
      <div style={{
        width: '100%',
        height: `${scrollProgress}%`,
        backgroundColor: '#F7F6F0', // Bone white line cutting through difference mode
        transition: 'height 0.1s ease-out'
      }} />
    </div>
  );
}
