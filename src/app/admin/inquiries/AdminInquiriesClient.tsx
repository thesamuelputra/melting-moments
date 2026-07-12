'use client';

import { useCallback, useState } from 'react';
import SessionExpiredToast from './SessionExpiredToast';
import {
  ConfirmDialog,
  SlidePanel,
  TextAreaField,
  useAutoRefresh,
  useToast,
} from '../_components';
import {
  deleteInquiry,
  restoreInquiry,
  updateAdminNotes,
  updateInquiryStatus,
  type ActionResult,
  type InquiryStatus,
} from './actions';

const INQUIRY_STATUSES = ['new', 'contacted', 'booked', 'declined', 'archived'] as const;

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  guestCount: string;
  date: string;
  venue: string;
  status: InquiryStatus;
  /** Customer-submitted message — immutable, read-only in the admin. */
  notes: string;
  /** Internal admin notes — editable. */
  adminNotes: string;
  /** Status the inquiry had before archiving (set server-side on archive). */
  archivedFromStatus: string | null;
  submittedAt: string; // ISO string
};

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'booked', label: 'Booked' },
  { value: 'declined', label: 'Declined' },
  { value: 'archived', label: 'Archived' },
];

const ARCHIVED_BADGE_STYLE: React.CSSProperties = { background: '#F3F4F6', color: '#6B7280' };

function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value);
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Neutralize spreadsheet formula injection: prefix =, +, -, @ with a quote. */
function sanitizeCsvCell(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

export default function AdminInquiriesClient({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const toast = useToast();
  const { refresh } = useAutoRefresh(60000);

  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Admin-notes draft for the currently open inquiry.
  const [notesDraft, setNotesDraft] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSavedOnce, setNotesSavedOnce] = useState(false);

  // Re-sync local state whenever the server payload changes (auto/manual refresh,
  // post-action revalidation).
  const [prevInitial, setPrevInitial] = useState(initialInquiries);
  if (initialInquiries !== prevInitial) {
    setPrevInitial(initialInquiries);
    setInquiries(initialInquiries);
  }

  const selected = selectedId !== null ? inquiries.find((i) => i.id === selectedId) ?? null : null;

  // Reset the notes draft when a different inquiry is opened.
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  if (selectedId !== prevSelectedId) {
    setPrevSelectedId(selectedId);
    setNotesDraft(selected ? selected.adminNotes : '');
    setNotesSaving(false);
    setNotesSavedOnce(false);
  }

  const notesDirty = selected !== null && notesDraft !== selected.adminNotes;

  const markPending = useCallback((id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unmarkPending = useCallback((id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const patchInquiry = useCallback((id: string, patch: Partial<Inquiry>) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const reportFailure = useCallback(
    (res: Extract<ActionResult, { success: false }>, fallback: string) => {
      if (res.error === 'unauthorized') {
        // Persistent SessionExpiredToast takes over — no transient duplicate.
        setSessionExpired(true);
      } else {
        toast.error(res.message ?? fallback);
      }
    },
    [toast]
  );

  const handleStatusChange = useCallback(
    async (id: string, status: InquiryStatus) => {
      const row = inquiries.find((i) => i.id === id);
      if (!row || row.status === status || pendingIds.has(id)) return;

      // Snapshot for rollback, then apply optimistically (index preserved by map).
      const previous = { status: row.status, archivedFromStatus: row.archivedFromStatus };
      patchInquiry(id, {
        status,
        archivedFromStatus: status === 'archived' ? row.status : null,
      });
      markPending(id);
      const res = await updateInquiryStatus(id, status).catch(
        () => ({ success: false, error: 'failed' } as const)
      );
      unmarkPending(id);
      if (res.success) {
        toast.success(`Status set to ${status}`);
      } else {
        patchInquiry(id, previous);
        reportFailure(res, 'Failed to update status — change reverted');
      }
    },
    [inquiries, pendingIds, patchInquiry, markPending, unmarkPending, reportFailure, toast]
  );

  const handleRestore = useCallback(
    async (id: string) => {
      const row = inquiries.find((i) => i.id === id);
      if (!row || row.status !== 'archived' || pendingIds.has(id)) return;

      const previous = { status: row.status, archivedFromStatus: row.archivedFromStatus };
      const optimisticTarget: InquiryStatus =
        row.archivedFromStatus && isInquiryStatus(row.archivedFromStatus) && row.archivedFromStatus !== 'archived'
          ? row.archivedFromStatus
          : 'new';
      patchInquiry(id, { status: optimisticTarget, archivedFromStatus: null });
      markPending(id);
      const res = await restoreInquiry(id).catch(() => ({ success: false, error: 'failed' } as const));
      unmarkPending(id);
      if (res.success) {
        // Reconcile with the authoritative status returned by the server.
        if (isInquiryStatus(res.restoredStatus)) patchInquiry(id, { status: res.restoredStatus });
        toast.success(`Inquiry restored to ${res.restoredStatus}`);
      } else {
        patchInquiry(id, previous);
        reportFailure(res, 'Failed to restore inquiry — change reverted');
      }
    },
    [inquiries, pendingIds, patchInquiry, markPending, unmarkPending, reportFailure, toast]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const index = inquiries.findIndex((i) => i.id === id);
      if (index === -1) return;
      const row = inquiries[index];

      // Optimistically remove; close panel + confirm dialog immediately.
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirmId(null);
      setSelectedId((prev) => (prev === id ? null : prev));

      const res = await deleteInquiry(id).catch(() => ({ success: false, error: 'failed' } as const));
      if (res.success) {
        toast.success('Inquiry deleted');
      } else {
        // Rollback: restore the row at its original index.
        setInquiries((prev) => {
          if (prev.some((i) => i.id === id)) return prev;
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, row);
          return next;
        });
        reportFailure(res, 'Failed to delete inquiry — row restored');
      }
    },
    [inquiries, reportFailure, toast]
  );

  const handleSaveNotes = useCallback(async () => {
    if (!selected || notesSaving) return;
    const id = selected.id;
    const sent = notesDraft;
    if (sent === selected.adminNotes) return;

    setNotesSaving(true);
    const res = await updateAdminNotes(id, sent).catch(
      () => ({ success: false, error: 'failed' } as const)
    );
    setNotesSaving(false);
    if (res.success) {
      patchInquiry(id, { adminNotes: sent });
      setNotesSavedOnce(true);
    } else {
      reportFailure(res, 'Failed to save notes');
    }
  }, [selected, notesSaving, notesDraft, patchInquiry, reportFailure]);

  // CSV export — includes admin notes; every cell is formula-injection safe.
  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Email', 'Phone', 'Event Type', 'Guest Count', 'Date', 'Venue', 'Status', 'Customer Notes', 'Admin Notes', 'Submitted'];
    const rows = inquiries.map((i) => [
      i.name, i.email, i.phone, i.eventType, i.guestCount,
      i.date, i.venue, i.status, i.notes, i.adminNotes,
      new Date(i.submittedAt).toISOString().split('T')[0],
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${sanitizeCsvCell(String(c)).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melting-moments-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [inquiries]);

  const filtered = filterStatus === 'all'
    ? inquiries.filter((i) => i.status !== 'archived')
    : inquiries.filter((i) => i.status === filterStatus);

  const statusCounts: Record<string, number> = {
    all: inquiries.filter((i) => i.status !== 'archived').length,
    new: 0,
    contacted: 0,
    booked: 0,
    declined: 0,
    archived: 0,
  };
  for (const i of inquiries) {
    if (i.status in statusCounts) statusCounts[i.status] += 1;
  }

  const notesIndicator = notesSaving
    ? 'Saving…'
    : notesDirty
      ? 'Unsaved changes'
      : notesSavedOnce
        ? 'Saved'
        : '';

  return (
    <div>
      {/* Persistent session-expired toast (regular toasts auto-dismiss; this stays). */}
      <SessionExpiredToast open={sessionExpired} />

      {/* Filter Tabs + toolbar */}
      <div className="admin-tabs" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn admin-btn--sm" onClick={refresh}>
            Refresh
          </button>
          <button className="admin-btn admin-btn--sm" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <div className="admin-table-wrap">
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
              {filtered.map((inq) => {
                const rowPending = pendingIds.has(inq.id);
                return (
                  <tr
                    key={inq.id}
                    tabIndex={0}
                    aria-busy={rowPending || undefined}
                    style={{ cursor: 'pointer', opacity: inq.status === 'archived' ? 0.55 : 1 }}
                    onClick={() => setSelectedId(inq.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedId(inq.id);
                      }
                    }}
                  >
                    <td>
                      <div className="admin-table__name">{inq.name}</div>
                      <div className="admin-table__email">{inq.email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{inq.eventType}</td>
                    <td>{inq.guestCount || '—'}</td>
                    <td>{inq.date ? new Date(inq.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td
                      style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)' }}
                      title={formatAbsolute(inq.submittedAt)}
                      suppressHydrationWarning
                    >
                      {new Date(inq.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span
                        className={`admin-badge admin-badge--${inq.status}`}
                        style={inq.status === 'archived' ? ARCHIVED_BADGE_STYLE : undefined}
                      >
                        <span className="admin-badge__dot" />
                        {inq.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <select
                          className="admin-field__input admin-field__input--select"
                          style={{ width: 'auto', fontSize: '0.75rem', padding: '0.35rem 1.6rem 0.35rem 0.5rem' }}
                          value={inq.status}
                          aria-label={`Change status for ${inq.name}`}
                          disabled={rowPending}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (isInquiryStatus(next)) void handleStatusChange(inq.id, next);
                          }}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {inq.status === 'archived' && (
                          <button
                            className="admin-btn admin-btn--sm"
                            onClick={() => void handleRestore(inq.id)}
                            disabled={rowPending}
                            title={`Restore to ${inq.archivedFromStatus && isInquiryStatus(inq.archivedFromStatus) ? inq.archivedFromStatus : 'new'}`}
                          >
                            Restore
                          </button>
                        )}
                        {rowPending && (
                          <span style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.35)' }} aria-hidden="true">
                            Saving…
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail slide-over (kit SlidePanel: focus in on open, restored to the
          trigger row on close, Escape/overlay handling, dirty-close confirm). */}
      <SlidePanel
        open={selected !== null}
        title="Inquiry Detail"
        dirty={notesDirty && !notesSaving}
        onClose={() => setSelectedId(null)}
        footer={
          selected ? (
            <>
              <a
                href={`mailto:${selected.email}?subject=Re: Your ${selected.eventType} inquiry, Melting Moments Catering`}
                className="admin-btn admin-btn--sm"
                style={{ textDecoration: 'none' }}
              >
                Reply via Email
              </a>
              <button
                className="admin-btn admin-btn--sm admin-btn--danger"
                style={{ marginLeft: 'auto' }}
                onClick={() => setDeleteConfirmId(selected.id)}
                disabled={pendingIds.has(selected.id)}
              >
                Delete
              </button>
            </>
          ) : undefined
        }
      >
        {selected && (
          <>
            {/* Admin controls — status */}
            <div className="admin-modal__field">
              <div className="admin-modal__label">Status</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="admin-field__input admin-field__input--select"
                  style={{ width: 'auto', fontSize: '0.8rem', padding: '0.45rem 1.8rem 0.45rem 0.6rem' }}
                  value={selected.status}
                  aria-label="Inquiry status"
                  disabled={pendingIds.has(selected.id)}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (isInquiryStatus(next)) void handleStatusChange(selected.id, next);
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {selected.status === 'archived' && (
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => void handleRestore(selected.id)}
                    disabled={pendingIds.has(selected.id)}
                  >
                    Restore to {selected.archivedFromStatus && isInquiryStatus(selected.archivedFromStatus) ? selected.archivedFromStatus : 'new'}
                  </button>
                )}
                {pendingIds.has(selected.id) && (
                  <span style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)' }}>Saving…</span>
                )}
              </div>
            </div>

            {/* Admin notes — editable, autosaves on blur */}
            <div style={{ marginBottom: '1.5rem' }}>
              <TextAreaField
                label="Admin Notes"
                value={notesDraft}
                onChange={setNotesDraft}
                onBlur={() => void handleSaveNotes()}
                maxLength={5000}
                rows={4}
                placeholder="Internal notes about this inquiry…"
                help="Only visible in the admin — autosaves when you click away."
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem' }}>
                <button
                  className="admin-btn admin-btn--sm"
                  onClick={() => void handleSaveNotes()}
                  disabled={notesSaving || !notesDirty}
                >
                  {notesSaving ? 'Saving…' : 'Save Notes'}
                </button>
                <span aria-live="polite" style={{ fontSize: '0.72rem', color: notesDirty && !notesSaving ? '#B45309' : 'rgba(0,0,0,0.4)' }}>
                  {notesIndicator}
                </span>
              </div>
            </div>

            {/* Customer submission — read-only, visually separated */}
            <div style={{ background: '#FAFAF8', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', padding: '1rem 1.1rem' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.45)', fontWeight: 600, marginBottom: '1rem' }}>
                Customer Submission (read-only)
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
                  <div className="admin-modal__value">{selected.guestCount || '—'}</div>
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
                <div className="admin-modal__label">Details from Customer</div>
                <div className="admin-modal__value" style={{ lineHeight: 1.6 }}>{selected.notes || 'No additional details provided.'}</div>
              </div>

              <div className="admin-modal__field" style={{ marginBottom: 0 }}>
                <div className="admin-modal__label">Submitted</div>
                <div className="admin-modal__value" title={formatAbsolute(selected.submittedAt)} suppressHydrationWarning>
                  {formatAbsolute(selected.submittedAt)}
                </div>
              </div>
            </div>
          </>
        )}
      </SlidePanel>

      {/* Delete confirmation (kit dialog; delete itself is optimistic with rollback) */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="Delete inquiry?"
        body="This permanently removes the inquiry, including its admin notes. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteConfirmId !== null) void handleDelete(deleteConfirmId);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
