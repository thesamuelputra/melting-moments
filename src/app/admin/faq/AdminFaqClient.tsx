'use client';

import { useRef, useState, useTransition } from 'react';
import { createFaq, updateFaq, deleteFaq } from './actions';

type Faq = { id: string; question: string; answer: string; orderIndex: number; isActive: boolean };

export default function AdminFaqClient({ initialFaqs, isSeeded }: { initialFaqs: Faq[]; isSeeded: boolean }) {
  const [faqs, setFaqs] = useState<Faq[]>([...initialFaqs].sort((a, b) => a.orderIndex - b.orderIndex));
  const tempIdCounter = useRef(0);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(isSeeded);

  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2500); };

  // Fallback result when a server action throws (network failure, expired session)
  const REQUEST_FAILED = { success: false as const };

  const handleSeedAll = () => {
    startTransition(async () => {
      // Create each static FAQ in Convex
      let failures = 0;
      for (const faq of faqs) {
        const res = await createFaq(faq.question, faq.answer, faq.orderIndex).catch(() => REQUEST_FAILED);
        if (!res.success) failures++;
      }
      if (failures === 0) {
        setSeeded(true);
        showToast('All FAQs saved to CMS');
      } else {
        showToast(`Failed to save ${failures} FAQ${failures !== 1 ? 's' : ''} to CMS — please try again`, 'error');
      }
    });
  };

  const handleCreate = () => {
    if (!newQ.trim() || !newA.trim()) return;
    const tempId = `temp-${++tempIdCounter.current}`;
    const optimistic: Faq = { id: tempId, question: newQ, answer: newA, orderIndex: faqs.length, isActive: true };
    setFaqs(prev => [...prev, optimistic]);
    setCreating(false); setNewQ(''); setNewA('');
    startTransition(async () => {
      const res = await createFaq(newQ, newA, faqs.length).catch(() => REQUEST_FAILED);
      if (res.success) {
        // Swap the optimistic temp id for the real CMS id so edit/delete work
        setFaqs(prev => prev.map(f => f.id === tempId ? { ...f, id: res.id } : f));
        showToast('FAQ added');
      } else {
        setFaqs(prev => prev.filter(f => f.id !== tempId));
        showToast('Failed to add FAQ — please try again', 'error');
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    const edited = editing;
    const original = faqs.find(f => f.id === edited.id);
    setFaqs(prev => prev.map(f => f.id === edited.id ? edited : f));
    startTransition(async () => {
      const res = await updateFaq(edited.id, { question: edited.question, answer: edited.answer }).catch(() => REQUEST_FAILED);
      if (res.success) {
        showToast('FAQ updated');
      } else {
        if (original) setFaqs(prev => prev.map(f => f.id === edited.id ? original : f));
        showToast('Failed to update FAQ — changes reverted', 'error');
      }
    });
    setEditing(null);
  };

  const handleToggle = (faq: Faq) => {
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: !f.isActive } : f));
    startTransition(async () => {
      const res = await updateFaq(faq.id, { isActive: !faq.isActive }).catch(() => REQUEST_FAILED);
      if (!res.success) {
        setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: faq.isActive } : f));
        showToast('Failed to update visibility — reverted', 'error');
      }
    });
  };

  const handleDelete = (id: string) => {
    const removed = faqs.find(f => f.id === id);
    setFaqs(prev => prev.filter(f => f.id !== id));
    setDeleteConfirm(null);
    startTransition(async () => {
      const res = await deleteFaq(id).catch(() => REQUEST_FAILED);
      if (res.success) {
        showToast('FAQ deleted');
      } else {
        if (removed) setFaqs(prev => [...prev, removed]);
        showToast('Failed to delete FAQ — restored', 'error');
      }
    });
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    setFaqs(prev => {
      const sorted = [...prev].sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = sorted.findIndex(f => f.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      // Swap orderIndex values
      const newOrder = sorted.map((f, i) => {
        if (i === idx) return { ...f, orderIndex: sorted[swapIdx].orderIndex };
        if (i === swapIdx) return { ...f, orderIndex: sorted[idx].orderIndex };
        return f;
      }).sort((a, b) => a.orderIndex - b.orderIndex);
      // Persist to server
      startTransition(async () => {
        await updateFaq(sorted[idx].id, { orderIndex: sorted[swapIdx].orderIndex });
        await updateFaq(sorted[swapIdx].id, { orderIndex: sorted[idx].orderIndex });
      });
      return newOrder;
    });
  };

  const sorted = [...faqs].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div style={{ opacity: isPending ? 0.85 : 1, transition: 'opacity 0.2s' }}>
      {/* Not-seeded notice */}
      {!seeded && (
        <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#92400E', marginBottom: '0.2rem' }}>Previewing static defaults</div>
            <div style={{ fontSize: '0.75rem', color: '#B45309' }}>These are the fallback FAQs shown on your public site. Save them to the CMS to manage them here.</div>
          </div>
          <button className="admin-btn admin-btn--primary" style={{ flexShrink: 0 }} onClick={handleSeedAll} disabled={isPending}>Save to CMS</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
              Displayed on <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>/faq</code>
            </p>
            <a href="/faq" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>View live →</a>
          </div>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setCreating(true)}>+ Add FAQ</button>
      </div>

      {/* Add New FAQ */}
      {creating && (
        <div className="admin-section" style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '1.25rem 1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>New FAQ</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label className="admin-modal__label" htmlFor="faq-new-question">Question</label>
              <input id="faq-new-question" className="admin-inline-input" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="e.g. How far in advance should I book?" />
            </div>
            <div>
              <label className="admin-modal__label" htmlFor="faq-new-answer">Answer</label>
              <textarea id="faq-new-answer" className="admin-inline-input" value={newA} onChange={e => setNewA(e.target.value)} rows={3} placeholder="Write a clear, helpful answer..." style={{ resize: 'vertical' }} />
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
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            No FAQs yet. Add your first one above.
          </div>
        )}
        {sorted.map((faq, idx) => (
          <div key={faq.id} className="admin-section" style={{ opacity: faq.isActive ? 1 : 0.5, padding: '1.25rem 1.5rem' }}>
            {/* Delete confirmation */}
            {deleteConfirm === faq.id ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#B91C1C' }}>Delete &ldquo;{faq.question.slice(0, 50)}...&rdquo;?</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="admin-btn admin-btn--sm" style={{ background: '#B91C1C', color: 'white', borderColor: '#B91C1C' }} onClick={() => handleDelete(faq.id)}>Yes, delete</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                </div>
              </div>
            ) : editing?.id === faq.id ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label className="admin-modal__label" htmlFor={`faq-edit-question-${faq.id}`}>Question</label>
                  <input id={`faq-edit-question-${faq.id}`} className="admin-inline-input" value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} />
                </div>
                <div>
                  <label className="admin-modal__label" htmlFor={`faq-edit-answer-${faq.id}`}>Answer</label>
                  <textarea id={`faq-edit-answer-${faq.id}`} className="admin-inline-input" value={editing.answer} onChange={e => setEditing({ ...editing, answer: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="admin-btn admin-btn--primary" onClick={handleSaveEdit}>Save</button>
                  <button className="admin-btn" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', alignItems: 'start' }}>
                {/* Reorder arrows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingTop: '0.2rem' }}>
                  <button
                    onClick={() => handleMove(faq.id, 'up')} disabled={idx === 0}
                    style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', width: '22px', height: '22px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Move up"
                  >↑</button>
                  <button
                    onClick={() => handleMove(faq.id, 'down')} disabled={idx === sorted.length - 1}
                    style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', width: '22px', height: '22px', cursor: idx === sorted.length - 1 ? 'default' : 'pointer', opacity: idx === sorted.length - 1 ? 0.3 : 1, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Move down"
                  >↓</button>
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>{faq.question}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6 }}>{faq.answer}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="admin-btn admin-btn--sm" onClick={() => setEditing(faq)}>Edit</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => handleToggle(faq)} style={{ color: faq.isActive ? '#059669' : '#6B7280' }} title={faq.isActive ? 'Active. Click to hide' : 'Hidden. Click to show'}>
                    {faq.isActive ? '● Visible' : '○ Hidden'}
                  </button>
                  <button className="admin-btn admin-btn--sm" style={{ color: '#B91C1C' }} onClick={() => setDeleteConfirm(faq.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {toast && (
        <div role={toast.kind === 'error' ? 'alert' : 'status'} aria-live={toast.kind === 'error' ? 'assertive' : 'polite'} style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.kind === 'error' ? '#B91C1C' : '#059669', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 60 }}>
          {toast.kind === 'error' ? '✕' : '✓'} {toast.msg}
        </div>
      )}
    </div>
  );
}
