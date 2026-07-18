'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GuidosCrest } from '@/components/guidos/GuidosWordmark';

export default function Footer() {
  const pathname = usePathname();
  const isGuidosPage = pathname.startsWith('/guidos');
  const [year, setYear] = useState(2026);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  // Context-aware CTA
  const ctaText = isGuidosPage ? 'ORDER\nNOW' : 'GET A\nQUOTE';
  const ctaHref = isGuidosPage ? '/guidos/order' : '/contact';

  return (
    <footer
      className={`haus-block-container${isGuidosPage ? ' brand-guidos' : ''}`}
      style={{ backgroundColor: isGuidosPage ? 'var(--g-green-deeper)' : 'var(--clr-charcoal)', color: '#fff' }}
    >
        {/* Guido's signature at the seam between page and footer */}
        {isGuidosPage && <span className="g-tricolor" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
        {isGuidosPage && (
          <div className="container" style={{ marginBottom: '2.5rem' }}>
            <GuidosCrest tone="cream" size={64} />
          </div>
        )}
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <Link href={ctaHref} className="footer-cta" style={{ textDecoration: 'none' }}>
                <h2 className="haus-display" style={{ color: 'var(--clr-oat)', margin: 0, fontSize: 'clamp(3rem, 10vw, 8rem)', whiteSpace: 'pre-line' }}>
                    {ctaText}
                </h2>
            </Link>
            {/* Cross-sell banner */}
            <div style={{ width: '100%', textAlign: 'center', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '1rem 0' }}>
              {isGuidosPage ? (
                <Link href="/contact" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
                  Planning an event? <span style={{ textDecoration: 'underline' }}>Explore Melting Moments Catering →</span>
                </Link>
              ) : (
                <Link href="/guidos" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
                  Craving Italian at home? <span style={{ textDecoration: 'underline' }}>Order from Guido&apos;s Gourmet →</span>
                </Link>
              )}
            </div>
            <div className="menu-index footer-nav" style={{ color: 'rgba(255,255,255,0.72)', textAlign: 'right' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '2.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', opacity: 0.75, marginBottom: '0.3rem' }}>Catering</div>
                        <Link href="/catering">Overview</Link>
                        <Link href="/menus">Menus</Link>
                        <Link href="/weddings">Weddings</Link>
                        <Link href="/corporate">Corporate</Link>
                        <Link href="/private-events">Private Events</Link>
                        <Link href="/family-style">Family Style</Link>
                        <Link href="/fountains">Fountains</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', opacity: 0.75, marginBottom: '0.3rem' }}>Guido&apos;s</div>
                        <Link href="/guidos">About</Link>
                        <Link href="/guidos/menu">Menu</Link>
                        <Link href="/guidos/order">Order</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', opacity: 0.75, marginBottom: '0.3rem' }}>Discover</div>
                        <Link href="/about">About Us</Link>
                        <Link href="/chef-paul">Chef Paul</Link>
                        <Link href="/testimonials">Testimonials</Link>
                        <Link href="/faq">FAQ</Link>
                        <Link href="/service-area">Service Area</Link>
                    </div>
                </div>
                {/* Semantic <address> for NAP extraction; fontStyle reset keeps the visual identical */}
                <address style={{ fontStyle: 'normal', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                    <a href="tel:+12503852462">250-385-2462</a> · <a href="mailto:info@meltingmoments.ca">info@meltingmoments.ca</a> · 614 Grenville Ave, Esquimalt BC
                </address>
                <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                    Consultations &amp; tastings by appointment
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem', fontSize: '0.75rem' }}>
                    <Link href="/privacy">Privacy</Link>
                    <Link href="/terms">Terms</Link>
                </div>
                <div>© {year} Chef Paul Silletta. All rights reserved.</div>
            </div>
        </div>
    </footer>
  );
}
