'use client';

import { useState, useTransition } from 'react';
import { createFaq, updateFaq, deleteFaq } from './actions';

type Faq = { id: string; question: string; answer: string; orderIndex: number; isActive: boolean };

export default function AdminFaqClient({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleCreate = () => {
    if (!newQ.trim() || !newA.trim()) return;
    const optimistic: Faq = { id: `temp-${Date.now()}`, question: newQ, answer: newA, orderIndex: faqs.length, isActive: true };
    setFaqs(prev => [...prev, optimistic]);
    setCreating(false);
    setNewQ(''); setNewA('');
    startTransition(async () => {
      const res = await createFaq(newQ, newA, faqs.length);
      if (res.success) showToast('FAQ added');
    });
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    setFaqs(prev => prev.map(f => f.id === editing.id ? editing : f));
    startTransition(async () => {
      const res = await updateFaq(editing.id, { question: editing.question, answer: editing.answer });
      if (res.success) showToast('FAQ updated');
    });
    setEditing(null);
  };

  const handleToggle = (faq: Faq) => {
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: !f.isActive } : f));
    startTransition(async () => {
      await updateFaq(faq.id, { isActive: !faq.isActive });
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this FAQ? This cannot be undone.')) return;
    setFaqs(prev => prev.filter(f => f.id !== id));
    startTransition(async () => {
      await deleteFaq(id);
      showToast('FAQ deleted');
    });
  };

  return (
    <div style={{ opacity: isPending ? 0.8 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.25rem' }}>
            Displayed on the public <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>/faq</code> page
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setCreating(true)}>+ Add FAQ</button>
      </div>

      {/* Add New FAQ Form */}
      {creating && (
        <div className="admin-section" style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>New FAQ</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label className="admin-modal__label">Question</label>
              <input className="admin-inline-input" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="e.g. How far in advance should I book?" />
            </div>
            <div>
              <label className="admin-modal__label">Answer</label>
              <textarea className="admin-inline-input" value={newA} onChange={e => setNewA(e.target.value)} rows={3} placeholder="Write a clear, helpful answer..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="admin-btn admin-btn--primary" onClick={handleCreate} disabled={!newQ.trim() || !newA.trim()}>Save FAQ</button>
            <button className="admin-btn" onClick={() => { setCreating(false); setNewQ(''); setNewA(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {faqs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            No FAQs yet. Add your first one above.
          </div>
        )}
        {faqs.map((faq) => (
          <div key={faq.id} className="admin-section" style={{ opacity: faq.isActive ? 1 : 0.5 }}>
            {editing?.id === faq.id ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label className="admin-modal__label">Question</label>
                  <input className="admin-inline-input" value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} />
                </div>
                <div>
                  <label className="admin-modal__label">Answer</label>
                  <textarea className="admin-inline-input" value={editing.answer} onChange={e => setEditing({ ...editing, answer: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="admin-btn admin-btn--primary" onClick={handleSaveEdit}>Save</button>
                  <button className="admin-btn" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{faq.question}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6 }}>{faq.answer}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="admin-btn admin-btn--sm" onClick={() => setEditing(faq)}>Edit</button>
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => handleToggle(faq)}
                    style={{ color: faq.isActive ? '#059669' : '#6B7280' }}
                    title={faq.isActive ? 'Active — click to hide' : 'Hidden — click to show'}
                  >
                    {faq.isActive ? '● Visible' : '○ Hidden'}
                  </button>
                  <button className="admin-btn admin-btn--sm" style={{ color: '#B91C1C' }} onClick={() => handleDelete(faq.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#059669', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 60 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
