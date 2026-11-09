import { Suspense } from 'react';
import Link from 'next/link';
import { GUIDOS_DELIVERY_FEE, SITE } from '@/lib/seo';
import OrderForm from './OrderForm';

// Body text and links in the facts column, as set on the contact page
const groupTextStyle = { fontSize: 'var(--text-body)', opacity: 0.7, marginTop: '1rem', lineHeight: 1.6 } as const;
const underlined = { textDecoration: 'underline' } as const;

// The same two columns as the contact page: the practical facts on the left,
// the request form on the right. The form reads the ?item= query string, which
// a statically built page cannot know, so it sits inside a Suspense boundary
// and everything around it is still built ahead of time.
export default function GuidosOrderPage() {
  return (
    <section className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)' }}>
      <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(min(300px, 100%), 1fr) minmax(min(400px, 100%), 1.5fr)', gap: 'clamp(4rem, 10vw, 8rem)' }}>

        {/* LEFT COLUMN: page title and the practical facts */}
        <div>
          <div className="menu-index" style={{ marginBottom: '2rem' }}>Guido&apos;s Gourmet</div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>ORDER</h1>
          {/* The rule centres itself by default; this margin keeps it under the left edge of the title */}
          <div className="g-tricolor g-tricolor--rule" aria-hidden="true" style={{ margin: '1.5rem 0 3rem' }} />
          <div style={{ display: 'grid', gap: '3rem' }}>
            <div>
              <h2 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>How it works</h2>
              <p style={groupTextStyle}>
                Tell us what you would like. This is a request, not a confirmed order. Chef Paul confirms your items, total and pickup or delivery within 24 hours. There is no online payment; nothing is charged until he has confirmed your total.
              </p>
            </div>
            <div>
              <h2 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>Pickup</h2>
              <p style={groupTextStyle}>
                {SITE.addressShort}<br />
                By appointment. Paul arranges a time when he confirms your order.
              </p>
            </div>
            <div>
              <h2 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>Delivery</h2>
              <p style={groupTextStyle}>Flat rate {GUIDOS_DELIVERY_FEE} anywhere in Victoria.</p>
            </div>
            <div>
              <h2 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>Questions</h2>
              <p style={groupTextStyle}>
                <a href={SITE.phoneHref} style={underlined}>{SITE.phoneDisplay}</a><br />
                <Link href="/guidos" style={underlined}>Back to the menu</Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: the request form on its white panel */}
        <Suspense fallback={null}>
          <OrderForm />
        </Suspense>
      </div>
    </section>
  );
}
