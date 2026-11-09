'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GUIDOS_DELIVERY_FEE, SITE } from '@/lib/seo';

// The longest dish name a menu link may drop into the order list.
const MAX_PREFILL_LENGTH = 200;

// Labels and fields are styled exactly like the contact form, so the two
// request forms read as one family.
const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  opacity: 0.62,
  marginBottom: '0.5rem',
} as const;

const inputStyle = {
  width: '100%',
  padding: '1rem',
  border: '1px solid rgba(0,0,0,0.2)',
  backgroundColor: 'transparent',
  fontSize: '1rem',
  fontFamily: 'inherit',
} as const;

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: 'var(--text-body)',
  padding: '0.6rem 0',
  minHeight: '44px',
} as const;

// Margin reset so the circles line up with the left edge of the fields above
const radioStyle = { accentColor: 'var(--g-green)', width: '20px', height: '20px', margin: 0 } as const;

export default function OrderForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const [formData, setFormData] = useState(() => {
    // The "Order" links on the menu arrive as /guidos/order?item=Dish name, so
    // the list starts with one of that dish. Only the first render reads it:
    // anything the visitor types afterwards is never overwritten.
    const item = (searchParams.get('item') ?? '').trim().slice(0, MAX_PREFILL_LENGTH).trimEnd();
    return {
      name: '',
      email: '',
      phone: '',
      items: item ? `1 x ${item}` : '',
      deliveryMethod: 'delivery',
      address: '',
      notes: '',
      website: '', // Honeypot
    };
  });

  // Move focus to the confirmation heading so screen readers announce success
  useEffect(() => {
    if (submitted) {
      successHeadingRef.current?.focus();
    }
  }, [submitted]);

  const setField =
    (field: keyof typeof formData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: FormEvent) => {
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
      if (res.status === 429) {
        setError(`We've received a lot of requests just now. Please wait a minute, or call us at ${SITE.phoneDisplay}.`);
        return;
      }
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch {
      setError(`We were unable to send your order request. Please try again, or call us directly at ${SITE.phoneDisplay}.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // The panel hugs its content instead of stretching to the height of the
    // facts column, so the confirmation does not sit in a tall empty box.
    <div style={{ alignSelf: 'start', backgroundColor: 'white', padding: 'clamp(2rem, 5vw, 4rem)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)', animation: 'fadeIn 0.5s ease forwards' }}>
      {!submitted ? (
        <form onSubmit={handleSubmit} aria-label="Order request">
          {/* Honeypot */}
          <input type="text" name="website" value={formData.website} onChange={setField('website')} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <p style={{ fontSize: '0.78rem', opacity: 0.55, lineHeight: 1.6, marginBottom: '2rem' }}>
            No online payment. We confirm your total before anything is charged.
          </p>

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={labelStyle}>Full name *</span>
            <input type="text" required maxLength={200} autoComplete="name" value={formData.name} onChange={setField('name')} style={inputStyle} />
          </label>

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={labelStyle}>Email address *</span>
            <input type="email" required maxLength={200} autoComplete="email" value={formData.email} onChange={setField('email')} style={inputStyle} />
          </label>

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={labelStyle}>Phone number *</span>
            <input type="tel" required maxLength={50} autoComplete="tel" placeholder="250-555-0123" value={formData.phone} onChange={setField('phone')} style={inputStyle} />
          </label>

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={labelStyle}>What would you like to order? *</span>
            <textarea
              required
              maxLength={3000}
              rows={4}
              placeholder="2 x Beef Bolognese Lasagne, family size"
              value={formData.items}
              onChange={setField('items')}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>

          {/* Delivery method */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0, marginBottom: '1.5rem' }}>
            <legend style={{ ...labelStyle, padding: 0 }}>Delivery method *</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '1.5rem' }}>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={formData.deliveryMethod === 'delivery'}
                  onChange={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                  style={radioStyle}
                />
                Delivery ({GUIDOS_DELIVERY_FEE})
              </label>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={formData.deliveryMethod === 'pickup'}
                  onChange={() => setFormData({ ...formData, deliveryMethod: 'pickup', address: '' })}
                  style={radioStyle}
                />
                Pickup
              </label>
            </div>
          </fieldset>

          {/* The address only matters for delivery, so pickup hides it and clears it */}
          {formData.deliveryMethod === 'delivery' && (
            <label style={{ display: 'block', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
              <span style={labelStyle}>Delivery address *</span>
              <input
                type="text"
                required
                maxLength={500}
                autoComplete="street-address"
                placeholder="123 Government St, Victoria"
                value={formData.address}
                onChange={setField('address')}
                style={inputStyle}
              />
            </label>
          )}

          <label style={{ display: 'block', marginBottom: '1.5rem' }}>
            <span style={labelStyle}>Notes (optional)</span>
            <textarea
              rows={3}
              maxLength={2000}
              placeholder="Allergies, requests, preferred delivery time"
              value={formData.notes}
              onChange={setField('notes')}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>

          {error && (
            <div role="alert" style={{ padding: '1rem', backgroundColor: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', animation: 'fadeIn 0.3s ease' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-solid" style={{ width: '100%', marginTop: '2rem', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'wait' : 'pointer' }} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send order request'}
          </button>
        </form>
      ) : (
        <div style={{ animation: 'fadeIn 0.8s ease forwards', textAlign: 'center', padding: '4rem 0' }}>
          <h2 ref={successHeadingRef} tabIndex={-1} className="noire-serif" style={{ marginBottom: '1rem', outline: 'none' }}>Request received</h2>
          <p style={{ opacity: 0.7, maxWidth: '36ch', margin: '0 auto', marginBottom: '0.5rem', textWrap: 'balance' }}>
            Thank you, {formData.name.trim().split(/\s+/)[0] || 'there'}. Chef Paul will confirm your items, total and pickup or delivery within 24 hours.
          </p>
          <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>We will be in touch at {formData.email}.</p>
          <Link href="/guidos" className="btn-outline" style={{ marginTop: '2rem' }}>Back to the menu</Link>
        </div>
      )}
    </div>
  );
}
