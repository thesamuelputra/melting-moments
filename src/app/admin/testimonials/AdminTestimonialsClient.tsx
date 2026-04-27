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
          <input className="admin-inline-input" value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Sarah & James" />
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
        <button className="admin-btn admin-btn--primary" onClick={() => onSave({ author, role: role || undefined, text, rating, orderIndex: initial?.orderIndex ?? 0 })} disabled={!author.trim() || !text.trim()}>Save</button>
        <button className="admin-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminTestimonialsClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleCreate = (data: Omit<Testimonial, 'id' | 'isActive'>) => {
    const optimistic: Testimonial = { ...data, id: `temp-${Date.now()}`, isActive: true, orderIndex: items.length };
    setItems(prev => [...prev, optimistic]);
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
    if (!confirm('Delete this testimonial?')) return;
    setItems(prev => prev.filter(t => t.id !== id));
    startTransition(async () => { await deleteTestimonial(id); showToast('Deleted'); });
  };

  return (
    <div style={{ opacity: isPending ? 0.8 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Testimonials</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.25rem' }}>
            Displayed on the public <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>/testimonials</code> page
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setCreating(true)}>+ Add Testimonial</button>
      </div>

      {creating && (
        <div className="admin-section" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>New Testimonial</h3>
          <TestimonialForm onSave={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            No testimonials yet. Add your first one above.
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="admin-section" style={{ opacity: item.isActive ? 1 : 0.5 }}>
            {editing?.id === item.id ? (
              <TestimonialForm initial={editing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.author}</span>
                    {item.role && <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>{item.role}</span>}
                    {item.rating && (
                      <span style={{ color: '#F59E0B', fontSize: '0.8rem' }}>{'★'.repeat(item.rating)}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.6, fontStyle: 'italic' }}>"{item.text}"</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="admin-btn admin-btn--sm" onClick={() => setEditing(item)}>Edit</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => handleToggle(item)} style={{ color: item.isActive ? '#059669' : '#6B7280' }}>
                    {item.isActive ? '● Visible' : '○ Hidden'}
                  </button>
                  <button className="admin-btn admin-btn--sm" style={{ color: '#B91C1C' }} onClick={() => handleDelete(item.id)}>Delete</button>
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
