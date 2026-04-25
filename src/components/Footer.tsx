'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="haus-block-container" style={{ backgroundColor: 'var(--clr-charcoal)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
                <h2 className="haus-display" style={{ color: 'var(--clr-oat)', margin: 0, fontSize: 'clamp(3rem, 10vw, 8rem)', transition: 'opacity 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                    GET A <br /> QUOTE
                </h2>
            </Link>
            <div className="menu-index footer-nav" style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem', marginBottom: '2rem' }}>
                    <Link href="/about">About Us</Link>
                    <Link href="/menus">Menus</Link>
                    <Link href="/chef-paul">Chef Paul</Link>
                    <Link href="/corporate">Corporate</Link>
                    <Link href="/weddings">Weddings</Link>
                    <Link href="/fountains">Fountains</Link>
                    <Link href="/private-events">Private Events</Link>
                    <Link href="/family-style">Family Style</Link>
                    <Link href="/gallery">Gallery</Link>
                    <Link href="/testimonials">Testimonials</Link>
                    <Link href="/faq">FAQ</Link>
                    <Link href="/service-area">Service Area</Link>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem', fontSize: '0.65rem', opacity: 0.5 }}>
                    <Link href="/privacy">Privacy</Link>
                    <Link href="/terms">Terms</Link>
                </div>
                <div>© {new Date().getFullYear()} Melting Moments Catering Victoria BC</div>
            </div>
        </div>
    </footer>
  );
}
