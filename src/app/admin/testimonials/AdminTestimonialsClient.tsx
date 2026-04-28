'use client';

import { useState, useTransition } from 'react';
import { createTestimonial, updateTestimonial, deleteTestimonial } from './actions';

type Testimonial = { id: string; author: string; role?: string; text: string; rating?: number; orderIndex: number; isActive: boolean };

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div style={{ display: 'flex', gap: '0.25rem' }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: n <= value ? '#F59E0B' : 'rgba(0,0,0,0.15)', padding: '0.1rem' }}>
        ★
      </button>
    ))}
  </div>
);

function TestimonialForm({ initial, onSave, onCancel }: {
  initial?: Partial<Testimonial>;
  onSave: (data: Omit<Testimonial, 'id' | 'isActive'>) => void;
  onCancel: () => void;
}) {
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const [rating, setRating] = useState(initial?.rating ?? 5);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label className="admin-modal__label">Author Name *</label>
          <input className="admin-inline-input" value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Sarah &amp; James" />
        </div>
        <div>
          <label className="admin-modal__label">Role / Context</label>
          <input className="admin-inline-input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Wedding Client, 2024" />
        </div>
      </div>
      <div>
        <label className="admin-modal__label">Testimonial Text *</label>
        <textarea className="admin-inline-input" value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="What did they say?" style={{ resize: 'vertical' }} />
      </div>
      <div>
        <label className="admin-modal__label" style={{ marginBottom: '0.5rem' }}>Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="admin-btn admin-btn--primary"
          onClick={() => onSave({ author, role: role || undefined, text, rating, orderIndex: initial?.orderIndex ?? 0 })}
          disabled={!author.trim() || !text.trim()}>Save</button>
        <button className="admin-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminTestimonialsClient({ initialTestimonials, isSeeded }: { initialTestimonials: Testimonial[]; isSeeded: boolean }) {
  const [items, setItems] = useState<Testimonial[]>([...initialTestimonials].sort((a, b) => a.orderIndex - b.orderIndex));
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(isSeeded);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleSeedAll = () => {
    startTransition(async () => {
      for (const t of items) {
        await createTestimonial({ author: t.author, role: t.role, text: t.text, rating: t.rating, orderIndex: t.orderIndex });
      }
      setSeeded(true);
      showToast('All testimonials saved to CMS');
    });
  };

  const handleCreate = (data: Omit<Testimonial, 'id' | 'isActive'>) => {
    const optimistic: Testimonial = { ...data, id: `temp-${Date.now()}`, isActive: true, orderIndex: items.length };
    setItems(prev => [...prev, optimistic].sort((a, b) => a.orderIndex - b.orderIndex));
    setCreating(false);
    startTransition(async () => {
      const res = await createTestimonial({ ...data, orderIndex: items.length });
      if (res.success) showToast('Testimonial added');
    });
  };

  const handleSaveEdit = (data: Omit<Testimonial, 'id' | 'isActive'>) => {
    if (!editing) return;
    setItems(prev => prev.map(t => t.id === editing.id ? { ...editing, ...data } : t));
    startTransition(async () => {
      const res = await updateTestimonial(editing.id, data);
      if (res.success) showToast('Testimonial updated');
    });
    setEditing(null);
  };

  const handleToggle = (item: Testimonial) => {
    setItems(prev => prev.map(t => t.id === item.id ? { ...t, isActive: !t.isActive } : t));
    startTransition(async () => { await updateTestimonial(item.id, { isActive: !item.isActive }); });
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
    startTransition(async () => { await deleteTestimonial(id); showToast('Deleted'); });
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    setItems(prev => {
      const sorted = [...prev].sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = sorted.findIndex(t => t.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const newOrder = sorted.map((t, i) => {
        if (i === idx) return { ...t, orderIndex: sorted[swapIdx].orderIndex };
        if (i === swapIdx) return { ...t, orderIndex: sorted[idx].orderIndex };
        return t;
      }).sort((a, b) => a.orderIndex - b.orderIndex);
      startTransition(async () => {
        await updateTestimonial(sorted[idx].id, { orderIndex: sorted[swapIdx].orderIndex });
        await updateTestimonial(sorted[swapIdx].id, { orderIndex: sorted[idx].orderIndex });
      });
      return newOrder;
    });
  };

  const sorted = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div style={{ opacity: isPending ? 0.85 : 1, transition: 'opacity 0.2s' }}>
      {/* Not-seeded notice */}
      {!seeded && (
        <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#92400E', marginBottom: '0.2rem' }}>Previewing static defaults</div>
            <div style={{ fontSize: '0.75rem', color: '#B45309' }}>These are the fallback testimonials shown on your public site. Save them to the CMS to manage them here.</div>
          </div>
          <button className="admin-btn admin-btn--primary" style={{ flexShrink: 0 }} onClick={handleSeedAll} disabled={isPending}>Save to CMS</button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Testimonials</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
              Displayed on <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>/testimonials</code>
            </p>
            <a href="/testimonials" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>View live →</a>
          </div>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setCreating(true)}>+ Add Testimonial</button>
      </div>

      {creating && (
        <div className="admin-section" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>New Testimonial</h3>
          <TestimonialForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            No testimonials yet. Add your first one above.
          </div>
        )}
        {sorted.map((item, idx) => (
          <div key={item.id} className="admin-section" style={{ opacity: item.isActive ? 1 : 0.5, padding: '1.25rem 1.5rem' }}>
            {deleteConfirm === item.id ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#B91C1C' }}>Delete testimonial by &ldquo;{item.author}&rdquo;?</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="admin-btn admin-btn--sm" style={{ background: '#B91C1C', color: 'white', borderColor: '#B91C1C' }} onClick={() => handleDelete(item.id)}>Yes, delete</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                </div>
              </div>
            ) : editing?.id === item.id ? (
              <TestimonialForm initial={editing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', alignItems: 'start' }}>
                {/* Reorder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingTop: '0.2rem' }}>
                  <button onClick={() => handleMove(item.id, 'up')} disabled={idx === 0}
                    style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', width: '22px', height: '22px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Move up">↑</button>
                  <button onClick={() => handleMove(item.id, 'down')} disabled={idx === sorted.length - 1}
                    style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', width: '22px', height: '22px', cursor: idx === sorted.length - 1 ? 'default' : 'pointer', opacity: idx === sorted.length - 1 ? 0.3 : 1, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Move down">↓</button>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.author}</span>
                    {item.role && <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>{item.role}</span>}
                    {item.rating && <span style={{ color: '#F59E0B', fontSize: '0.8rem' }}>{'★'.repeat(item.rating)}</span>}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{item.text}&rdquo;</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="admin-btn admin-btn--sm" onClick={() => setEditing(item)}>Edit</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => handleToggle(item)} style={{ color: item.isActive ? '#059669' : '#6B7280' }}>
                    {item.isActive ? '● Visible' : '○ Hidden'}
                  </button>
                  <button className="admin-btn admin-btn--sm" style={{ color: '#B91C1C' }} onClick={() => setDeleteConfirm(item.id)}>Delete</button>
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
