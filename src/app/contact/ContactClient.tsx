'use client';

import { useState, useRef, useEffect } from 'react';

type ContactInfo = {
  name: string;
  businessName: string;
  address: string;
  phone: string;
  phoneRaw: string;
  email: string;
  website: string;
};

// Custom Minimalist Dropdown
function CustomSelect({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string, onChange: (val: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) { setIsOpen(true); }
      else if (activeIndex >= 0) { onChange(options[activeIndex].value); setIsOpen(false); }
    } else if (e.key === 'Escape') { setIsOpen(false); }
    else if (e.key === 'ArrowDown' && isOpen) { e.preventDefault(); setActiveIndex(prev => prev < options.length - 1 ? prev + 1 : prev); }
    else if (e.key === 'ArrowUp' && isOpen) { e.preventDefault(); setActiveIndex(prev => prev > 0 ? prev - 1 : 0); }
  };

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
      onClick={() => setIsOpen(!isOpen)} role="combobox" aria-expanded={isOpen}
      aria-haspopup="listbox" aria-label={placeholder} tabIndex={0} onKeyDown={handleKeyDown}>
      <div style={{ padding: '1rem', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'transparent', fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.3s' }}>
        <span>{selectedLabel}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>↓</span>
      </div>
      {isOpen && (
        <div role="listbox" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', zIndex: 50, animation: 'fadeIn 0.2s ease', marginTop: '4px' }}>
          {options.map((opt, idx) => (
            <div key={opt.value} role="option" aria-selected={value === opt.value}
              onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.02)', transition: 'background-color 0.2s', backgroundColor: (value === opt.value || activeIndex === idx) ? 'rgba(0,0,0,0.03)' : 'transparent' }}
              onMouseEnter={() => setActiveIndex(idx)}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: '3px', backgroundColor: i < currentStep ? 'var(--clr-ink)' : 'rgba(0,0,0,0.1)', transition: 'background-color 0.4s ease' }} />
      ))}
    </div>
  );
}

export default function ContactClient({ contactInfo }: { contactInfo: ContactInfo }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [formData, setFormData] = useState({
    eventType: '', guestCount: '50-100', date: '', venue: '',
    name: '', email: '', phone: '', details: '',
    website: '', // Honeypot
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !formData.eventType) { setStep1Error('Please select an event type to continue.'); return; }
    setStep1Error(''); setError(''); setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('Failed to submit');
      setStep(4);
    } catch (err) {
      console.error(err);
      setError(`We were unable to process your request. Please try again, or contact us directly at ${contactInfo.email}.`);
    } finally { setSubmitting(false); }
  };

  // Format address for display (newline → <br>)
  const addressLines = contactInfo.address.split('\n');

  return (
    <div>
      <section className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 1.5fr)', gap: 'clamp(4rem, 10vw, 8rem)' }}>

          {/* LEFT COLUMN — dynamic from Settings */}
          <div>
            <div className="menu-index" style={{ marginBottom: '2rem' }}>Concierge Desk</div>
            <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '3rem' }}>CONTACT</h1>
            <div style={{ display: 'grid', gap: '3rem' }}>
              <div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>Mailing Address</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, marginTop: '1rem', lineHeight: 1.6 }}>
                  {contactInfo.name}<br />
                  {contactInfo.businessName}<br />
                  {addressLines.map((line, i) => <span key={i}>{line}{i < addressLines.length - 1 && <br />}</span>)}
                </p>
              </div>
              <div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>Direct Line</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, marginTop: '1rem', lineHeight: 1.6 }}>
                  Ph: <a href={`tel:${contactInfo.phoneRaw}`} style={{ textDecoration: 'underline' }}>{contactInfo.phone}</a><br />
                  <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{contactInfo.website.replace(/^https?:\/\//, '')}</a><br />
                  <a href={`mailto:${contactInfo.email}`} style={{ textDecoration: 'underline' }}>{contactInfo.email}</a>
                </p>
              </div>
              <div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>Socials</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, marginTop: '1rem', lineHeight: 1.6 }}>
                  <a href="https://www.facebook.com/MeltingMomentsCatering" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Facebook: Melting Moments Catering</a><br />
                  <a href="https://www.google.ca/maps/@48.4304115,-123.4182687,17z?hl=en" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>View Map Location</a>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — multi-step form */}
          <div style={{ backgroundColor: 'white', padding: 'clamp(2rem, 5vw, 4rem)', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            {step < 4 && <ProgressBar currentStep={step} totalSteps={3} />}

            {step === 1 && (
              <form onSubmit={handleNext} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div className="menu-index" style={{ marginBottom: '1rem' }}>Step 01 / 03</div>
                <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>Event Details</h2>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Event Type *</span>
                  <CustomSelect value={formData.eventType} onChange={(val) => { setFormData({...formData, eventType: val}); setStep1Error(''); }} placeholder="Select event type..."
                    options={[{ value: "corporate", label: "Corporate Function" }, { value: "wedding", label: "Wedding" }, { value: "private", label: "Private Gathering" }, { value: "fountain", label: "Chocolate Fountain Rental" }]} />
                  {step1Error && <div style={{ color: '#B91C1C', fontSize: '0.8rem', marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>{step1Error}</div>}
                </label>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Estimated Guests</span>
                  <CustomSelect value={formData.guestCount} onChange={(val) => setFormData({...formData, guestCount: val})} placeholder="Select guest count..."
                    options={[{ value: "under50", label: "Under 50" }, { value: "50-100", label: "50 - 100" }, { value: "100-250", label: "100 - 250" }, { value: "250+", label: "250+" }]} />
                </label>
                <button type="submit" className="btn-solid" style={{ width: '100%', marginTop: '2rem' }}>Next Step</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleNext} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div className="menu-index" style={{ marginBottom: '1rem' }}>Step 02 / 03</div>
                <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>Date &amp; Venue</h2>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Event Date</span>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'transparent', fontSize: '1rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Venue / Location (Optional)</span>
                  <input type="text" placeholder="e.g. Victoria Conference Centre" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'transparent', fontSize: '1rem' }} />
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1, padding: '1rem' }}>Back</button>
                  <button type="submit" className="btn-solid" style={{ flex: 2, padding: '1rem' }}>Next Step</button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div className="menu-index" style={{ marginBottom: '1rem' }}>Step 03 / 03</div>
                <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>Your Information</h2>
                <input type="text" name="website" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Full Name *</span>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'transparent', fontSize: '1rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Email Address *</span>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'transparent', fontSize: '1rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Phone Number (Optional)</span>
                  <input type="tel" placeholder="e.g. 250-555-0123" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'transparent', fontSize: '1rem' }} />
                </label>
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Additional Details (Optional)</span>
                  <textarea rows={4} placeholder="Dietary needs, theme preferences, budget range, etc." value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.2)', backgroundColor: 'transparent', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' }} />
                </label>
                {error && (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem', animation: 'fadeIn 0.3s ease' }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setStep(2)} className="btn-outline" style={{ flex: 1, padding: '1rem' }}>Back</button>
                  <button type="submit" className="btn-solid" style={{ flex: 2, padding: '1rem', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'wait' : 'pointer' }} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Request Quote'}
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div style={{ animation: 'fadeIn 0.8s ease forwards', textAlign: 'center', padding: '4rem 0' }}>
                <div className="shape-circle" style={{ width: '80px', height: '80px', backgroundColor: 'var(--clr-ink)', margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>✓</div>
                <h2 className="noire-serif" style={{ marginBottom: '1rem' }}>Request Received</h2>
                <p style={{ opacity: 0.7, maxWidth: '30ch', margin: '0 auto', marginBottom: '0.5rem' }}>
                  Thank you, {formData.name || 'Guest'}. Chef Paul or our concierge team will contact you shortly.
                </p>
                <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>A confirmation has been sent to {formData.email}.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
