'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

function NavDropdown({ label, items, closeMenu }: { label: string; items: { href: string; label: string }[]; closeMenu?: () => void }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  const enter = () => { clearTimeout(timeout.current); setOpen(true); };
  const leave = () => { timeout.current = setTimeout(() => setOpen(false), 200); };

  return (
    <div ref={ref} style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', padding: 0,
          fontFamily: 'inherit', fontSize: '11px', fontWeight: 400,
          textTransform: 'uppercase', letterSpacing: '1.65px', lineHeight: '16.5px',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        {label}
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.75rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--clr-ink)',
            minWidth: '180px',
            padding: '0.75rem 0',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.15s ease forwards',
            zIndex: 10002,
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { setOpen(false); closeMenu?.(); }}
              style={{
                color: 'var(--clr-oat)',
                padding: '0.5rem 1.25rem',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                transition: 'background-color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const servicesItems = [
  { href: '/corporate', label: 'Corporate' },
  { href: '/family-style', label: 'Family Style' },
  { href: '/weddings', label: 'Weddings' },
  { href: '/private-events', label: 'Private Events' },
];

const aboutItems = [
  { href: '/about', label: 'About Us' },
  { href: '/chef-paul', label: 'Chef Paul' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/faq', label: 'FAQ' },
  { href: '/service-area', label: 'Service Area' },
];

export default function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape handler for mobile nav (#6)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); return; }
      if (e.key === 'Tab' && mobileNavRef.current) {
        const focusable = mobileNavRef.current.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      // On homepage, navbar appears after scrolling past 15vh for quicker access
      if (isHomepage && !visible) {
        if (y > window.innerHeight * 0.15) {
          setVisible(true);
        }
      }
    };
    // On subpages, always visible
    if (!isHomepage) {
      setVisible(true);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage, visible]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setMobileServicesOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

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
              <NavDropdown label="Services" items={servicesItems} />
              <Link href="/fountains">Fountains</Link>
              <NavDropdown label="About" items={aboutItems} />
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
          ref={mobileNavRef}
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
            padding: '7rem 2rem 2rem 2rem',
            animation: 'fadeIn 0.2s ease forwards',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', alignItems: 'center', textAlign: 'center' }}>
            <Link href="/menus" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem 0' }}>Menus</Link>

            {/* Mobile Services Accordion */}
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                font: 'inherit', color: 'inherit', padding: '0.75rem 0',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              Services
              <svg width="10" height="6" viewBox="0 0 8 5" fill="none" style={{ transition: 'transform 0.2s', transform: mobileServicesOpen ? 'rotate(180deg)' : 'none' }}>
                <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {mobileServicesOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '0.5rem' }}>
                {servicesItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                    style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', color: 'rgba(0,0,0,0.5)', padding: '0.5rem 0', letterSpacing: '0.04em' }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/fountains" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem 0' }}>Fountains</Link>

            {/* Mobile About Accordion */}
            <button
              onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                font: 'inherit', color: 'inherit', padding: '0.75rem 0',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              About
              <svg width="10" height="6" viewBox="0 0 8 5" fill="none" style={{ transition: 'transform 0.2s', transform: mobileAboutOpen ? 'rotate(180deg)' : 'none' }}>
                <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {mobileAboutOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '0.5rem' }}>
                {aboutItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                    style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', color: 'rgba(0,0,0,0.5)', padding: '0.5rem 0', letterSpacing: '0.04em' }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="spacer-large" style={{ margin: '0.75rem 0' }}><div className="noire-divider"></div></div>
            <Link href="/contact" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem 0' }}>Contact</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="btn-solid" style={{ minHeight: 'auto', marginTop: '1rem', padding: '1rem 3rem', fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>Book Event</Link>
          </div>
        </div>
      )}
    </>
  );
}

