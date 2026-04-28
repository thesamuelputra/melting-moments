'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { updateInquiryStatus, deleteInquiry } from './actions';

// Ensure this matches the Convex inquiries schema
export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string;
  guestCount: string;
  date: string | null;
  venue: string | null;
  status: string; // 'new' | 'contacted' | 'booked' | 'declined' | 'archived'
  notes: string | null;
  submittedAt: string;
};

export default function AdminInquiriesClient({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const modalRef = useRef<HTMLDivElement>(null);
  const [actionError, setActionError] = useState('');

  const filtered = filterStatus === 'all' 
    ? inquiries.filter(i => i.status !== 'archived') 
    : inquiries.filter(i => i.status === filterStatus);

  // Focus trap + Escape handler for modal
  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelected(null); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, a, input, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  // Auto-dismiss error
  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(() => setActionError(''), 5000);
    return () => clearTimeout(t);
  }, [actionError]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);

    startTransition(async () => {
      const res = await updateInquiryStatus(id, status);
      if (!res.success) {
        setActionError('Failed to update status. Please try again.');
      }
    });
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
    setSelected(null);
    setDeleteConfirmId(null);

    startTransition(async () => {
      const res = await deleteInquiry(id);
      if (!res.success) {
        setActionError('Failed to delete inquiry. Please try again.');
      }
    });
  };

  // CSV Export
  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Email', 'Phone', 'Event Type', 'Guest Count', 'Date', 'Venue', 'Status', 'Notes', 'Submitted'];
    const rows = inquiries.map(i => [
      i.name, i.email, i.phone || '', i.eventType, i.guestCount,
      i.date || '', i.venue || '', i.status, i.notes || '',
      new Date(i.submittedAt).toISOString().split('T')[0]
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melting-moments-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [inquiries]);

  const statusCounts = {
    all: inquiries.filter(i => i.status !== 'archived').length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    booked: inquiries.filter(i => i.status === 'booked').length,
    declined: inquiries.filter(i => i.status === 'declined').length,
    archived: inquiries.filter(i => i.status === 'archived').length,
  };

  return (
    <div>
      {/* Error banner */}
      {actionError && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: '#B91C1C', fontSize: '0.82rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontWeight: 600, fontSize: '0.9rem' }}>×</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="admin-tabs" style={{ flexWrap: 'wrap' }}>
        {(['all', 'new', 'contacted', 'booked', 'declined', 'archived'] as const).map((status) => (
          <button
            key={status}
            className={`admin-tab ${filterStatus === status ? 'admin-tab--active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span style={{ marginLeft: '0.35rem', opacity: 0.4 }}>{statusCounts[status]}</span>
          </button>
        ))}
        {/* Export CSV button */}
        <button className="admin-btn admin-btn--sm" onClick={exportCSV} style={{ marginLeft: 'auto' }}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-container" style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
        <div className="admin-table-overflow">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Event Type</th>
                <th>Guests</th>
                <th>Event Date</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-charcoal)' }}>
                    No inquiries found.
                  </td>
                </tr>
              )}
              {filtered.map((inq) => (
                <tr key={inq.id} style={{ cursor: 'pointer', opacity: inq.status === 'archived' ? 0.5 : 1 }} onClick={() => setSelected(inq)}>
                  <td>
                    <div className="admin-table__name">{inq.name}</div>
                    <div className="admin-table__email">{inq.email}</div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{inq.eventType}</td>
                  <td>{inq.guestCount}</td>
                  <td>{inq.date ? new Date(inq.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}>
                    {new Date(inq.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${inq.status}`}>
                      <span className="admin-badge__dot" />
                      {inq.status}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {inq.status === 'new' && (
                        <button className="admin-btn admin-btn--sm" onClick={() => handleUpdateStatus(inq.id, 'contacted')} disabled={isPending}>
                          Contacted
                        </button>
                      )}
                      {inq.status === 'contacted' && (
                        <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => handleUpdateStatus(inq.id, 'booked')} disabled={isPending}>
                          Book
                        </button>
                      )}
                      {inq.status !== 'archived' && (
                        <button className="admin-btn admin-btn--sm" style={{ opacity: 0.5 }} onClick={() => handleUpdateStatus(inq.id, 'archived')} disabled={isPending} title="Archive">
                          Archive
                        </button>
                      )}
                      {inq.status === 'archived' && (
                        <button className="admin-btn admin-btn--sm" onClick={() => handleUpdateStatus(inq.id, 'new')} disabled={isPending}>
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel Modal — with focus trap and Escape */}
      {selected && (
        <>
          <div className="admin-modal-overlay" onClick={() => { setSelected(null); setDeleteConfirmId(null); }} />
          <div className="admin-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Inquiry Detail">
            <div className="admin-modal__header">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400 }}>Inquiry Detail</h3>
              <button className="admin-modal__close" onClick={() => { setSelected(null); setDeleteConfirmId(null); }} aria-label="Close dialog">✕</button>
            </div>

            <div className="admin-modal__field">
              <div className="admin-modal__label">Status</div>
              <span className={`admin-badge admin-badge--${selected.status}`}>
                <span className="admin-badge__dot" />
                {selected.status}
              </span>
            </div>

            <div className="admin-modal__field">
              <div className="admin-modal__label">Name</div>
              <div className="admin-modal__value">{selected.name}</div>
            </div>

            <div className="admin-modal__field">
              <div className="admin-modal__label">Email</div>
              <div className="admin-modal__value">
                <a href={`mailto:${selected.email}`} style={{ color: '#2563EB', textDecoration: 'underline' }}>{selected.email}</a>
              </div>
            </div>

            <div className="admin-modal__field">
              <div className="admin-modal__label">Phone</div>
              <div className="admin-modal__value">
                {selected.phone ? <a href={`tel:${selected.phone}`} style={{ color: '#2563EB', textDecoration: 'underline' }}>{selected.phone}</a> : '—'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-modal__field">
                <div className="admin-modal__label">Event Type</div>
                <div className="admin-modal__value" style={{ textTransform: 'capitalize' }}>{selected.eventType}</div>
              </div>
              <div className="admin-modal__field">
                <div className="admin-modal__label">Guests</div>
                <div className="admin-modal__value">{selected.guestCount}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-modal__field">
                <div className="admin-modal__label">Event Date</div>
                <div className="admin-modal__value">
                  {selected.date ? new Date(selected.date).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                </div>
              </div>
              <div className="admin-modal__field">
                <div className="admin-modal__label">Venue</div>
                <div className="admin-modal__value">{selected.venue || '—'}</div>
              </div>
            </div>

            <div className="admin-modal__field">
              <div className="admin-modal__label">Details / Notes</div>
              <div className="admin-modal__value" style={{ lineHeight: 1.6 }}>{selected.notes || 'No additional details provided.'}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
              {/* Reply via Email */}
              <a 
                href={`mailto:${selected.email}?subject=Re: Your ${selected.eventType} inquiry, Melting Moments Catering`}
                className="admin-btn admin-btn--sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
              >
                Reply via Email
              </a>
              {selected.status !== 'booked' && (
                <button className="admin-btn admin-btn--primary" onClick={() => { handleUpdateStatus(selected.id, 'booked'); setSelected(null); }} disabled={isPending}>
                  Mark as Booked
                </button>
              )}
              {selected.status === 'new' && (
                <button className="admin-btn" onClick={() => handleUpdateStatus(selected.id, 'contacted')} disabled={isPending}>
                  Mark Contacted
                </button>
              )}
              {selected.status !== 'archived' && (
                <button className="admin-btn" style={{ color: '#6B7280' }} onClick={() => { handleUpdateStatus(selected.id, 'archived'); setSelected(null); }} disabled={isPending}>
                  Archive
                </button>
              )}
              {selected.status === 'archived' && (
                <button className="admin-btn" onClick={() => { handleUpdateStatus(selected.id, 'new'); setSelected(null); }} disabled={isPending}>
                  Restore
                </button>
              )}
              {selected.status !== 'declined' && selected.status !== 'archived' && (
                <button className="admin-btn" style={{ color: '#B91C1C', borderColor: '#FECACA' }} onClick={() => { handleUpdateStatus(selected.id, 'declined'); setSelected(null); }} disabled={isPending}>
                  Decline
                </button>
              )}
              {/* Delete with inline confirmation */}
              {deleteConfirmId === selected.id ? (
                <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
                  <button className="admin-btn admin-btn--sm" style={{ background: '#B91C1C', color: 'white', borderColor: '#B91C1C' }} onClick={() => handleDelete(selected.id)} disabled={isPending}>Confirm delete</button>
                  <button className="admin-btn admin-btn--sm" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                </div>
              ) : (
                <button className="admin-btn" style={{ color: '#B91C1C', borderColor: '#FECACA', marginLeft: 'auto' }} onClick={() => setDeleteConfirmId(selected.id)} disabled={isPending}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
