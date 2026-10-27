'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GUIDOS_DELIVERY_FEE, SITE } from '@/lib/seo';

type Fields = {
  name: string;
  email: string;
  phone: string;
  items: string;
  deliveryMethod: 'delivery' | 'pickup';
  address: string;
  notes: string;
  website: string; // honeypot
};
type Errors = Partial<Record<'name' | 'email' | 'phone' | 'items' | 'address', string>>;
const ORDER: (keyof Errors)[] = ['name', 'email', 'phone', 'items', 'address'];
const LABELS: Record<keyof Errors, string> = { name: 'Your name', email: 'Email', phone: 'Phone', items: 'What would you like', address: 'Delivery address' };

function check(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Please tell us your name.';
  if (!f.email.trim()) e.email = 'Please add an email address so Paul can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'That email address does not look right.';
  if (!f.phone.trim()) e.phone = 'Please add a phone number.';
  else if (f.phone.replace(/\D/g, '').length < 7) e.phone = 'That phone number looks too short.';
  if (!f.items.trim()) e.items = 'Please say what you would like to order.';
  if (f.deliveryMethod === 'delivery' && !f.address.trim()) e.address = 'Please add the delivery address.';
  return e;
}

/**
 * The order request. Nothing is paid here: the request reaches Paul, who
 * replies to confirm the items, the total and a time. Mistakes are shown
 * beside each field and focus moves to the first one.
 */
export default function OrderForm({ menuReference }: { menuReference: ReactNode }) {
  const [f, setF] = useState<Fields>({ name: '', email: '', phone: '', items: '', deliveryMethod: 'delivery', address: '', notes: '', website: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const [summary, setSummary] = useState('');
  const doneRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // "Request a pickup" on the map links here with ?method=pickup
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (new URLSearchParams(window.location.search).get('method') === 'pickup') {
        setF((cur) => ({ ...cur, deliveryMethod: 'pickup', address: '' }));
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    const next = { ...f, [key]: value };
    setF(next);
    // Once a field has been flagged, recheck it as it is corrected
    if (key in errors) setErrors((cur) => ({ ...cur, [key]: check(next)[key as keyof Errors] }));
  };

  const recheck = (key: keyof Errors) => {
    if (key in errors) setErrors((cur) => ({ ...cur, [key]: check(f)[key] }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.website) return;
    const found = check(f);
    setErrors(found);
    const bad = ORDER.filter((k) => found[k]);
    // Also said aloud: when the first field to fix already has focus (Enter
    // pressed inside it), moving focus there announces nothing. Cleared first
    // so the same summary is read again on a second try.
    setSummary('');
    if (bad.length > 0) {
      const text = `${bad.length === 1 ? '1 field needs' : `${bad.length} fields need`} attention: ${bad.map((k) => LABELS[k]).join(', ')}.`;
      requestAnimationFrame(() => setSummary(text));
      formRef.current?.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    setServerError('');
    try {
      const res = await fetch('/api/guidos-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      if (res.status === 429) {
        setServerError(`We have had a lot of requests just now. Please wait a minute, or call us at ${SITE.phoneDisplay}.`);
        return;
      }
      if (!res.ok) throw new Error('Failed');
      setSent(true);
    } catch {
      setServerError(`Your request did not send. Please try again, or call us at ${SITE.phoneDisplay}.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="gg-done">
        <h2 ref={doneRef} tabIndex={-1}>Request sent. Thank you, {f.name.trim().replace(/\.+$/, '')}.</h2>
        <p>Paul will reply within 24 hours to confirm your items, your total and a time for {f.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}. He will write to {f.email.trim()}.</p>
        <div className="gg-actions" style={{ marginTop: 20 }}>
          <Link className="gg-textlink" href="/guidos/menu">Back to the menu</Link>
        </div>
      </div>
    );
  }

  const fieldProps = (key: keyof Errors, hint?: string) => ({
    id: `gg-${key}`,
    name: key,
    'aria-required': true as const,
    'aria-invalid': errors[key] ? (true as const) : undefined,
    'aria-describedby': [hint ? `gg-${key}-hint` : '', errors[key] ? `gg-${key}-error` : ''].filter(Boolean).join(' ') || undefined,
    onBlur: () => recheck(key),
  });
  const err = (key: keyof Errors) => errors[key] ? <p className="gg-error" id={`gg-${key}-error`}>{errors[key]}</p> : null;

  return (
    // A post, so a submit made before the script has loaded never puts the
    // customer's details in the address bar
    <form ref={formRef} className="gg-form" method="post" onSubmit={submit} noValidate>
      <p className="gg-form-intro">Every field is needed unless it says optional.</p>
      <p className="gg-sr-only" role="status">{summary}</p>

      {/* Left empty by people; filled by bots */}
      <input type="text" name="website" value={f.website} onChange={(e) => set('website', e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="gg-field">
        <label htmlFor="gg-name">Your name</label>
        <input className="gg-input" type="text" autoComplete="name" maxLength={200} value={f.name} onChange={(e) => set('name', e.target.value)} {...fieldProps('name')} />
        {err('name')}
      </div>

      <div className="gg-row2">
        <div className="gg-field">
          <label htmlFor="gg-email">Email</label>
          <input className="gg-input" type="email" autoComplete="email" maxLength={200} value={f.email} onChange={(e) => set('email', e.target.value)} {...fieldProps('email')} />
          {err('email')}
        </div>
        <div className="gg-field">
          <label htmlFor="gg-phone">Phone</label>
          <input className="gg-input" type="tel" autoComplete="tel" maxLength={50} value={f.phone} onChange={(e) => set('phone', e.target.value)} {...fieldProps('phone')} />
          {err('phone')}
        </div>
      </div>

      <div className="gg-field">
        <label htmlFor="gg-items">What would you like?</label>
        <p className="gg-hint" id="gg-items-hint">The dish, the size and how many. For example: 2 Beef Bolognese Lasagne, family size.</p>
        <textarea className="gg-input" rows={5} maxLength={3000} value={f.items} onChange={(e) => set('items', e.target.value)} {...fieldProps('items', 'hint')} />
        {err('items')}
        <details className="gg-ref">
          <summary>Menu and prices</summary>
          <div className="gg-ref-body">{menuReference}</div>
        </details>
      </div>

      <fieldset className="gg-field">
        <legend>Delivery or pickup</legend>
        <label className="gg-choice">
          <input type="radio" name="deliveryMethod" value="delivery" checked={f.deliveryMethod === 'delivery'} onChange={() => set('deliveryMethod', 'delivery')} />
          <span>
            <strong>Delivery</strong>
            <span className="gg-choice-detail">{GUIDOS_DELIVERY_FEE} flat, anywhere in Victoria</span>
          </span>
        </label>
        <label className="gg-choice">
          <input
            type="radio"
            name="deliveryMethod"
            value="pickup"
            checked={f.deliveryMethod === 'pickup'}
            onChange={() => {
              setF((cur) => ({ ...cur, deliveryMethod: 'pickup', address: '' }));
              // Remove the key, not just its message: a key means the field was flagged
              setErrors((cur) => {
                const rest = { ...cur };
                delete rest.address;
                return rest;
              });
            }}
          />
          <span>
            <strong>Pickup</strong>
            <span className="gg-choice-detail">By appointment at {SITE.addressShort}</span>
          </span>
        </label>
      </fieldset>

      {f.deliveryMethod === 'delivery' && (
        <div className="gg-field">
          <label htmlFor="gg-address">Delivery address</label>
          <input className="gg-input" type="text" autoComplete="street-address" maxLength={500} value={f.address} onChange={(e) => set('address', e.target.value)} {...fieldProps('address')} />
          {err('address')}
        </div>
      )}

      <div className="gg-field">
        <label htmlFor="gg-notes">Notes <span className="gg-opt">(optional)</span></label>
        <p className="gg-hint" id="gg-notes-hint">Allergies, a day or time that suits you, anything Paul should know.</p>
        <textarea id="gg-notes" name="notes" className="gg-input" rows={3} maxLength={2000} value={f.notes} onChange={(e) => set('notes', e.target.value)} aria-describedby="gg-notes-hint" />
      </div>

      {serverError && <p className="gg-alert" role="alert">{serverError}</p>}

      <div className="gg-submit">
        <button type="submit" className="gg-btn" disabled={submitting}>{submitting ? 'Sending…' : 'Send request'}</button>
        <p>Nothing is charged now. Paul confirms the total first.</p>
      </div>
    </form>
  );
}
