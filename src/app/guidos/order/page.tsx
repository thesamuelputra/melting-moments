'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function GuidosOrderPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    items: '',
    deliveryMethod: 'delivery',
    address: '',
    notes: '',
    website: '', // Honeypot
  });

  // Move focus to the confirmation heading so screen readers announce success
  useEffect(() => {
    if (submitted) {
      successHeadingRef.current?.focus();
    }
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return; // Honeypot triggered
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/guidos-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setError('We were unable to send your order request. Please try again, or call us directly at 250-385-2462.');
    } finally {
      setSubmitting(false);
    }
  };

  // Gold small tracked caps, the Guido's label voice
  const labelStyle = {
    display: 'block' as const,
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: 'var(--g-gold)',
    fontWeight: 600 as const,
    marginBottom: '0.5rem',
  };

  return (
    <div>
      {/* Cream fields with a warm hairline; the focus ring is Italian green.
          Scoped to this page's fields so no shared styling is touched. */}
      <style>{`
        .g-order-field {
          width: 100%;
          padding: 1rem;
          border: 1px solid var(--g-line);
          border-radius: 6px;
          background-color: var(--g-cream);
          color: var(--g-ink);
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .g-order-field::placeholder { color: var(--g-ink-soft); }
        .g-order-field:focus,
        .g-order-field:focus-visible {
          outline: none;
          border-color: var(--g-green);
          box-shadow: 0 0 0 3px rgba(28, 107, 74, 0.18);
        }
        .g-order-field--area { resize: vertical; }
        @media (prefers-reduced-motion: reduce) {
          .g-order-field { transition: none; }
        }
      `}</style>

      <section className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(4rem, 8vw, 8rem)', maxWidth: '700px' }}>
        <div className="g-eyebrow" style={{ marginBottom: '1.25rem' }}>Guido&apos;s Gourmet</div>
        <h1 className="noire-serif" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '1.25rem' }}>
          Order Request
        </h1>
        <div className="g-tricolor--rule" style={{ marginLeft: 0, marginRight: 'auto', marginBottom: '1.5rem' }} aria-hidden="true" />
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--g-ink-soft)', marginBottom: '1.25rem', maxWidth: '45ch' }}>
          Tell us what you&apos;d like below. This is a request, not a confirmed order. Chef Paul will reply within 24 hours to confirm your items, total, and pickup or delivery.
        </p>
        <p className="g-script g-script--sm" style={{ marginBottom: 'clamp(2rem, 4vw, 4rem)' }}>Chef crafted. Handmade. Made with love.</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--g-cream-2)', padding: 'clamp(2rem, 5vw, 4rem)', border: '1px solid var(--g-line)', borderRadius: '10px', boxShadow: '0 20px 40px rgba(18,63,46,0.05)' }}>
            {/* Honeypot */}
            <input type="text" name="website" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <p style={{ fontSize: '0.85rem', color: 'var(--g-ink-soft)', lineHeight: 1.5, marginBottom: '2rem' }}>
              No online payment; we&apos;ll confirm your total before anything is charged.
            </p>

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Full Name *</span>
              <input type="text" required autoComplete="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="g-order-field" />
            </label>

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Email Address *</span>
              <input type="email" required autoComplete="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="g-order-field" />
            </label>

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Phone Number *</span>
              <input type="tel" required autoComplete="tel" placeholder="e.g. 250-555-0123" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="g-order-field" />
            </label>

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>What would you like to order? *</span>
              <textarea
                required
                rows={5}
                placeholder={"e.g.\n2x Beef Bolognese Lasagne (Family size)\n1x Tiramisu Cans (Classic)\n1x Turkey Pot Pie"}
                value={formData.items}
                onChange={(e) => setFormData({...formData, items: e.target.value})}
                className="g-order-field g-order-field--area"
              />
            </label>

            {/* Delivery Method */}
            <fieldset style={{ border: 'none', padding: 0, margin: 0, marginBottom: '1.5rem' }}>
              <legend style={labelStyle}>Delivery Method *</legend>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-body)', padding: '0.6rem 0' }}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={formData.deliveryMethod === 'delivery'}
                    onChange={() => setFormData({...formData, deliveryMethod: 'delivery'})}
                    style={{ accentColor: 'var(--g-green)', width: '20px', height: '20px' }}
                  />
                  Delivery ($12.50)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-body)', padding: '0.6rem 0' }}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={() => setFormData({...formData, deliveryMethod: 'pickup', address: ''})}
                    style={{ accentColor: 'var(--g-green)', width: '20px', height: '20px' }}
                  />
                  Pickup
                </label>
              </div>
            </fieldset>

            {/* Conditional address field */}
            {formData.deliveryMethod === 'delivery' && (
              <label style={{ display: 'block', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <span style={labelStyle}>Delivery Address *</span>
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  placeholder="e.g. 123 Government St, Victoria"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="g-order-field"
                />
              </label>
            )}

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Any notes? (Optional)</span>
              <textarea
                rows={3}
                placeholder="Allergies, special requests, preferred delivery time, etc."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="g-order-field g-order-field--area"
              />
            </label>

            {error && (
              <div role="alert" style={{ padding: '1rem', backgroundColor: 'rgba(193,58,46,0.06)', border: '1px solid rgba(193,58,46,0.35)', borderRadius: '6px', color: 'var(--g-ink)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', animation: 'fadeIn 0.3s ease' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-solid" style={{ width: '100%', marginTop: '1rem', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'wait' : 'pointer' }} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Order Request'}
            </button>

            {/* Pickup info */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--g-line)' }}>
              <p className="g-eyebrow" style={{ marginBottom: '0.5rem' }}>Pickup Location</p>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--g-ink-soft)' }}>
                614 Grenville Ave, Esquimalt<br />
                Pickup by appointment. Paul will arrange a time when he confirms your order.
              </p>
            </div>
          </form>
        ) : (
          <div style={{ animation: 'fadeIn 0.8s ease forwards', textAlign: 'center', padding: '4rem', backgroundColor: 'var(--g-cream-2)', border: '1px solid var(--g-line)', borderRadius: '10px' }}>
            <div className="shape-circle" style={{ width: '80px', height: '80px', backgroundColor: 'var(--g-green)', margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g-cream)', fontSize: '2rem' }}>✓</div>
            <h2 ref={successHeadingRef} tabIndex={-1} className="noire-serif" style={{ marginBottom: '1rem', outline: 'none' }}>Request Received</h2>
            <p style={{ color: 'var(--g-ink-soft)', maxWidth: '38ch', margin: '0 auto', marginBottom: '0.5rem' }}>
              Thank you, {formData.name}. We&apos;ve received your request. Chef Paul will confirm your items, total, and pickup/delivery within 24 hours.
            </p>
            <p style={{ color: 'var(--g-ink-soft)', fontSize: '0.8rem', marginBottom: '2rem' }}>We&apos;ll be in touch at {formData.email}.</p>
            <Link href="/guidos/menu" className="btn-outline">Back to Menu</Link>
          </div>
        )}
      </section>
    </div>
  );
}
