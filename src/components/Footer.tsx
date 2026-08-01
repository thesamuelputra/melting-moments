'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GuidosCrest } from '@/components/guidos/GuidosWordmark';
import { SITE } from '@/lib/seo';

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
            <div className="menu-index footer-nav" style={{ color: 'rgba(255,255,255,0.72)' }}>
                <div className="footer-nav__groups">
                    <div className="footer-nav__group">
                        <div className="footer-nav__heading">Catering</div>
                        <Link href="/catering">Overview</Link>
                        <Link href="/menus">Menus</Link>
                        <Link href="/weddings">Weddings</Link>
                        <Link href="/corporate">Corporate</Link>
                        <Link href="/private-events">Private Events</Link>
                        <Link href="/family-style">Family Style</Link>
                        <Link href="/fountains">Fountains</Link>
                    </div>
                    <div className="footer-nav__group">
                        <div className="footer-nav__heading">Guido&apos;s</div>
                        <Link href="/guidos">About</Link>
                        <Link href="/guidos/menu">Menu</Link>
                        <Link href="/guidos/order">Order</Link>
                    </div>
                    <div className="footer-nav__group">
                        <div className="footer-nav__heading">Discover</div>
                        <Link href="/about">About Us</Link>
                        <Link href="/chef-paul">Chef Paul</Link>
                        <Link href="/testimonials">Testimonials</Link>
                        <Link href="/faq">FAQ</Link>
                        <Link href="/service-area">Service Area</Link>
                    </div>
                </div>
                {/* Semantic <address> for NAP extraction; fontStyle reset keeps the visual identical */}
                <address style={{ fontStyle: 'normal', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                    <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a> · <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · {SITE.addressDisplay}
                </address>
                <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                    Consultations &amp; tastings by appointment
                </div>
                <div className="footer-nav__legal" style={{ fontSize: '0.75rem' }}>
                    <Link href="/privacy">Privacy</Link>
                    <Link href="/terms">Terms</Link>
                </div>
                <div>© {year} Chef Paul Silletta. All rights reserved.</div>
            </div>
        </div>
    </footer>
  );
}
