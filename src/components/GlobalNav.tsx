'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      // On homepage, navbar appears after scrolling past 40% of viewport
      if (isHomepage) {
        setVisible(y > window.innerHeight * 0.4);
      }
    };
    // On subpages, always visible
    if (!isHomepage) {
      setVisible(true);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  const navOpacity = visible ? 1 : 0;
  const navPointerEvents = visible ? 'auto' as const : 'none' as const;

  return (
    <>
      <nav 
        className="global-nav" 
        aria-label="Main navigation"
        style={{ 
          color: 'var(--clr-ink)', 
          backgroundColor: scrolled ? 'var(--clr-bone)' : 'transparent', 
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '1.25rem clamp(1.5rem, 5vw, 4rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background-color 0.4s ease, border-color 0.4s ease, opacity 0.4s ease',
          opacity: navOpacity,
          pointerEvents: navPointerEvents,
      }}>
          <Link href="/" style={{ fontWeight: 600, letterSpacing: '-0.02em', zIndex: 10001, fontSize: '0.85rem' }}>Melting Moments</Link>
          
          {/* Desktop Navigation */}
          <div className="nav-links-desktop" style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', alignItems: 'center' }}>
              <Link href="/menus">Menus</Link>
              <Link href="/corporate">Corporate</Link>
              <Link href="/family-style">Family Style</Link>
              <Link href="/fountains">Fountains</Link>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/contact" className="btn-solid" style={{ minHeight: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>Book Event</Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="nav-hamburger"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            style={{ 
                display: 'none', 
                flexDirection: 'column', 
                gap: '6px', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                zIndex: 10001
            }}
            id="mobile-menu-btn"
          >
            <span style={{ width: '24px', height: '2px', backgroundColor: 'var(--clr-ink)', transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ width: '24px', height: '2px', backgroundColor: 'var(--clr-ink)', transition: 'opacity 0.3s', opacity: isOpen ? 0 : 1 }} />
            <span style={{ width: '24px', height: '2px', backgroundColor: 'var(--clr-ink)', transition: 'transform 0.3s', transform: isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }} />
          </button>
      </nav>

      {/* Mobile Navigation Panel */}
      {isOpen && (
        <div 
          className="nav-mobile-panel"
          style={{
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--clr-bone)',
            zIndex: 10000,
            padding: '8rem 2rem 2rem 2rem',
            animation: 'fadeIn 0.2s ease forwards',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', alignItems: 'center', textAlign: 'center' }}>
            <Link href="/menus" onClick={() => setIsOpen(false)}>Menus</Link>
            <Link href="/corporate" onClick={() => setIsOpen(false)}>Corporate</Link>
            <Link href="/family-style" onClick={() => setIsOpen(false)}>Family Style</Link>
            <Link href="/fountains" onClick={() => setIsOpen(false)}>Fountains</Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link href="/gallery" onClick={() => setIsOpen(false)}>Gallery</Link>
            <div className="spacer-large" style={{ margin: '1rem 0' }}><div className="noire-divider"></div></div>
            <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="btn-solid" style={{ minHeight: 'auto', marginTop: '1rem', padding: '1rem 3rem', fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>Book Event</Link>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          #mobile-menu-btn { display: none !important; }
          .nav-mobile-panel { display: none !important; }
        }
      `}} />
    </>
  );
}
