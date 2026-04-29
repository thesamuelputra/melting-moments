'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GuidosOrderPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
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
      setError('We were unable to process your order. Please try again, or call us directly at 250.385.2462.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    border: '1px solid rgba(0,0,0,0.2)',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    opacity: 0.5,
    marginBottom: '0.5rem',
  };

  return (
    <div>
      <section className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(4rem, 8vw, 8rem)', maxWidth: '700px' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Guido&apos;s Gourmet</div>
        <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '1rem' }}>
          Order
        </h1>
        <p style={{ fontSize: 'var(--text-body)', opacity: 0.5, marginBottom: 'clamp(2rem, 4vw, 4rem)', maxWidth: '45ch' }}>
          Let us know what you&apos;d like and we&apos;ll confirm your order within 24 hours.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: 'clamp(2rem, 5vw, 4rem)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            {/* Honeypot */}
            <input type="text" name="website" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Full Name *</span>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </label>

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Email Address *</span>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} />
            </label>

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Phone Number *</span>
              <input type="tel" required placeholder="e.g. 250-555-0123" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
            </label>

            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={labelStyle}>What would you like to order? *</span>
              <textarea
                required
                rows={5}
                placeholder={"e.g.\n2x Beef Bolognese Lasagne (Family size)\n1x Tiramisu Cans (Classic)\n1x Turkey Pot Pie"}
                value={formData.items}
                onChange={(e) => setFormData({...formData, items: e.target.value})}
                style={{ ...inputStyle, resize: 'vertical' as const }}
              />
            </label>

            {/* Delivery Method */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={labelStyle}>Delivery Method *</span>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-body)' }}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={formData.deliveryMethod === 'delivery'}
                    onChange={() => setFormData({...formData, deliveryMethod: 'delivery'})}
                    style={{ accentColor: 'var(--clr-ink)' }}
                  />
                  Delivery ($12.50)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-body)' }}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={() => setFormData({...formData, deliveryMethod: 'pickup', address: ''})}
                    style={{ accentColor: 'var(--clr-ink)' }}
                  />
                  Pickup
                </label>
              </div>
            </div>

            {/* Conditional address field */}
            {formData.deliveryMethod === 'delivery' && (
              <label style={{ display: 'block', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <span style={labelStyle}>Delivery Address *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Government St, Victoria"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={inputStyle}
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
                style={{ ...inputStyle, resize: 'vertical' as const }}
              />
            </label>

            {error && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', animation: 'fadeIn 0.3s ease' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-solid" style={{ width: '100%', marginTop: '1rem', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'wait' : 'pointer' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Order'}
            </button>

            {/* Pickup info */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <p className="menu-index" style={{ marginBottom: '0.5rem' }}>Pickup Location</p>
              <p style={{ fontSize: 'var(--text-body)', opacity: 0.5 }}>
                614 Grenville Ave, Esquimalt<br />
                Mon-Wed 8am-12pm, Thu-Sat by appointment
              </p>
            </div>
          </form>
        ) : (
          <div style={{ animation: 'fadeIn 0.8s ease forwards', textAlign: 'center', padding: '4rem', backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="shape-circle" style={{ width: '80px', height: '80px', backgroundColor: 'var(--clr-ink)', margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>✓</div>
            <h2 className="noire-serif" style={{ marginBottom: '1rem' }}>Order Received</h2>
            <p style={{ opacity: 0.7, maxWidth: '35ch', margin: '0 auto', marginBottom: '0.5rem' }}>
              Thank you, {formData.name}. Chef Paul will confirm your order within 24 hours.
            </p>
            <p style={{ opacity: 0.5, fontSize: '0.8rem', marginBottom: '2rem' }}>A confirmation has been sent to {formData.email}.</p>
            <Link href="/guidos/menu" className="btn-outline">Back to Menu</Link>
          </div>
        )}
      </section>

      {/* Cross-sell */}
      <section className="container" style={{ padding: 'clamp(2rem, 4vw, 3rem) 0', textAlign: 'center' }}>
        <span className="menu-index">
          Planning an event? <Link href="/menus" style={{ textDecoration: 'underline' }}>Melting Moments Catering →</Link>
        </span>
      </section>
    </div>
  );
}
