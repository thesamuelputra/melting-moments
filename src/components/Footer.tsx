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
            <div className="menu-index" style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginBottom: '2rem' }}>
                    <Link href="/about">About Us</Link>
                    <Link href="/chef-paul">Chef Paul</Link>
                    <Link href="/weddings">Weddings</Link>
                    <Link href="/private-events">Private Events</Link>
                    <Link href="/testimonials">Testimonials</Link>
                    <Link href="/faq">FAQ</Link>
                    <Link href="/service-area">Service Area</Link>
                </div>
                <div>© 2026 Melting Moments Catering Victoria BC</div>
            </div>
        </div>
    </footer>
  );
}
