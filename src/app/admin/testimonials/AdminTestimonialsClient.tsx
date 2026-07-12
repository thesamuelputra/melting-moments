'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ConfirmDialog,
  DragHandle,
  EmptyState,
  SlidePanel,
  SortableList,
  TextAreaField,
  TextField,
  ToastProvider,
  useDirtyGuard,
  useToast,
} from '../_components';
import {
  createTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  updateTestimonial,
  type ActionResult,
  type TestimonialBrand,
} from './actions';

export type Testimonial = {
  id: string;
  author: string;
  role?: string;
  text: string;
  rating?: number;
  brand?: TestimonialBrand;
  isActive: boolean;
};

type Failure = Extract<ActionResult, { success: false }>;
// Fallback when a server action throws (network failure, server crash).
const REQUEST_FAILED: Failure = { success: false, error: 'failed' };

const isValidRating = (r: unknown): r is number =>
  typeof r === 'number' && Number.isInteger(r) && r >= 1 && r <= 5;

/* ===== Chip radio group (roving tabindex + arrow keys) ===== */

type ChipOption = { value: string; label: string; ariaLabel?: string };

function ChipRadioGroup({
  label,
  value,
  options,
  onChange,
  help,
  disabled,
}: {
  label: string;
  value: string;
  options: ChipOption[];
  onChange: (value: string) => void;
  help?: string;
  disabled?: boolean;
}) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  const move = (delta: number) => {
    const next = (selectedIndex + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className="admin-field">
      <span id={labelId} className="admin-field__label">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {options.map((opt, i) => {
          const checked = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={opt.ariaLabel}
              tabIndex={i === selectedIndex ? 0 : -1}
              disabled={disabled}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="admin-btn admin-btn--sm"
              style={
                checked
                  ? { background: 'var(--clr-ink)', color: 'white', borderColor: 'var(--clr-ink)' }
                  : undefined
              }
              onClick={() => onChange(opt.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  move(1);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  move(-1);
                }
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {help && <p className="admin-field__help">{help}</p>}
    </div>
  );
}

/* ===== Badges ===== */

const BADGE_STYLES: Record<'catering' | 'guidos' | 'both', React.CSSProperties> = {
  catering: { background: '#EEF3FF', color: '#2563EB' },
  guidos: { background: '#FEF3E2', color: '#B45309' },
  both: { background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.55)' },
};

function BrandBadge({ brand }: { brand?: TestimonialBrand }) {
  const key = brand ?? 'both';
  const label = brand === 'catering' ? 'Catering' : brand === 'guidos' ? "Guido's" : 'Both';
  return (
    <span className="admin-badge" style={BADGE_STYLES[key]}>
      {label}
    </span>
  );
}

/* ===== Form option sets ===== */

const BRAND_OPTIONS: ChipOption[] = [
  { value: '', label: 'Both', ariaLabel: 'Shown for both brands' },
  { value: 'catering', label: 'Catering' },
  { value: 'guidos', label: "Guido's Gourmet" },
];

const RATING_OPTIONS: ChipOption[] = [
  { value: '', label: 'No rating' },
  ...[1, 2, 3, 4, 5].map((n) => ({
    value: String(n),
    label: '★'.repeat(n),
    ariaLabel: `${n} out of 5 stars`,
  })),
];

type PanelState = { mode: 'create' } | { mode: 'edit'; testimonial: Testimonial } | null;
type Draft = {
  author: string;
  role: string;
  text: string;
  rating: '' | '1' | '2' | '3' | '4' | '5';
  brand: '' | TestimonialBrand;
};

const EMPTY_DRAFT: Draft = { author: '', role: '', text: '', rating: '', brand: '' };

function draftFrom(t: Testimonial): Draft {
  return {
    author: t.author,
    role: t.role ?? '',
    text: t.text,
    rating: isValidRating(t.rating) ? (String(t.rating) as Draft['rating']) : '',
    brand: t.brand ?? '',
  };
}

/* ===== Manager ===== */

function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] | null }) {
  const toast = useToast();
  const router = useRouter();
  const tempCounter = useRef(0);

  const [items, setItems] = useState<Testimonial[]>(initialTestimonials ?? []);
  const [panel, setPanel] = useState<PanelState>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<Testimonial | null>(null);
  // Per-row in-flight markers instead of one global lock.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [sessionExpired, setSessionExpired] = useState(false);

  const cmsUnreachable = initialTestimonials === null;

  const setPending = (id: string, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const fail = (res: Failure, fallback: string) => {
    if (res.error === 'unauthorized') {
      setSessionExpired(true);
      toast.error('Session expired, log in again');
    } else {
      toast.error(res.message ?? fallback);
    }
  };

  /* ===== Panel (create / edit) ===== */

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setPanel({ mode: 'create' });
  };

  const openEdit = (t: Testimonial) => {
    setDraft(draftFrom(t));
    setPanel({ mode: 'edit', testimonial: t });
  };

  const isDirty = useMemo(() => {
    if (!panel) return false;
    const baseline = panel.mode === 'create' ? EMPTY_DRAFT : draftFrom(panel.testimonial);
    return (
      draft.author !== baseline.author ||
      draft.role !== baseline.role ||
      draft.text !== baseline.text ||
      draft.rating !== baseline.rating ||
      draft.brand !== baseline.brand
    );
  }, [panel, draft]);
  useDirtyGuard(isDirty);

  const canSave = draft.author.trim() !== '' && draft.text.trim() !== '';

  const handleSave = async () => {
    if (!panel || !canSave || saving) return;
    const author = draft.author.trim();
    const text = draft.text.trim();
    const role = draft.role.trim();
    const rating = draft.rating === '' ? null : Number(draft.rating);
    const brand = draft.brand === '' ? null : draft.brand;

    if (panel.mode === 'create') {
      setSaving(true);
      const tempId = `temp-${++tempCounter.current}`;
      const optimistic: Testimonial = {
        id: tempId,
        author,
        text,
        role: role || undefined,
        rating: rating ?? undefined,
        brand: brand ?? undefined,
        isActive: true,
      };
      setItems((prev) => [...prev, optimistic]);
      setPanel(null);
      const res = await createTestimonial({
        author,
        text,
        ...(role ? { role } : {}),
        ...(rating !== null ? { rating } : {}),
        ...(brand !== null ? { brand } : {}),
      }).catch(() => REQUEST_FAILED);
      if (res.success && res.id) {
        // Swap the optimistic temp id for the real Convex id so edit/toggle/
        // delete/reorder on the new row hit a real document.
        const realId = res.id;
        setItems((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: realId } : t)));
        toast.success('Testimonial added');
      } else {
        setItems((prev) => prev.filter((t) => t.id !== tempId));
        // Reopen the create panel (draft state is untouched) so the admin's
        // typed content survives the failure instead of being discarded.
        setPanel((current) => current ?? { mode: 'create' });
        fail(res.success ? REQUEST_FAILED : res, 'Failed to add testimonial');
      }
      setSaving(false);
      return;
    }

    // Edit is a partial patch: send only what changed.
    const original = panel.testimonial;
    const fields: Parameters<typeof updateTestimonial>[1] = {};
    if (author !== original.author) fields.author = author;
    if (text !== original.text) fields.text = text;
    if (role !== (original.role ?? '')) fields.role = role === '' ? null : role;
    if (rating !== (isValidRating(original.rating) ? original.rating : null)) fields.rating = rating;
    if (brand !== (original.brand ?? null)) fields.brand = brand;
    if (Object.keys(fields).length === 0) {
      setPanel(null);
      return;
    }

    setSaving(true);
    const updated: Testimonial = {
      ...original,
      author,
      text,
      role: role || undefined,
      rating: rating ?? undefined,
      brand: brand ?? undefined,
    };
    setItems((prev) => prev.map((t) => (t.id === original.id ? updated : t)));
    setPanel(null);
    setPending(original.id, true);
    const res = await updateTestimonial(original.id, fields).catch(() => REQUEST_FAILED);
    if (res.success) {
      toast.success('Testimonial updated');
    } else {
      setItems((prev) => prev.map((t) => (t.id === original.id ? original : t)));
      fail(res, 'Failed to update testimonial, changes reverted');
    }
    setPending(original.id, false);
    setSaving(false);
  };

  /* ===== Row actions ===== */

  const handleToggle = async (item: Testimonial) => {
    if (pendingIds.has(item.id)) return;
    setPending(item.id, true);
    setItems((prev) => prev.map((t) => (t.id === item.id ? { ...t, isActive: !item.isActive } : t)));
    const res = await updateTestimonial(item.id, { isActive: !item.isActive }).catch(() => REQUEST_FAILED);
    if (!res.success) {
      setItems((prev) => prev.map((t) => (t.id === item.id ? { ...t, isActive: item.isActive } : t)));
      fail(res, 'Failed to update visibility, reverted');
    }
    setPending(item.id, false);
  };

  const handleDelete = async (item: Testimonial) => {
    const index = items.findIndex((t) => t.id === item.id);
    if (index < 0) return;
    setConfirmingDelete(null);
    setItems((prev) => prev.filter((t) => t.id !== item.id));
    const res = await deleteTestimonial(item.id).catch(() => REQUEST_FAILED);
    if (res.success) {
      toast.success('Testimonial deleted');
    } else {
      // Restore at the original position, not appended to the end.
      setItems((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, item);
        return next;
      });
      fail(res, 'Failed to delete testimonial, restored');
    }
  };

  const handleReorder = async (ids: string[]) => {
    const res = await reorderTestimonials(ids).catch(() => REQUEST_FAILED);
    if (res.success) {
      // Keep the parent array in the new order so unrelated state updates
      // don't re-sync SortableList back to the stale order.
      setItems((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t]));
        const next = ids.map((id) => byId.get(id)).filter((t): t is Testimonial => t !== undefined);
        return next.length === prev.length ? next : prev;
      });
      toast.success('Order saved');
    } else {
      fail(res, 'Failed to save order, reverted');
    }
    return res.success; // false ⇒ SortableList reverts to the pre-drag order
  };

  /* ===== Render ===== */

  const panelTitle = panel?.mode === 'edit' ? 'Edit Testimonial' : 'New Testimonial';

  return (
    <div>
      {sessionExpired && (
        <div
          role="alert"
          style={{
            marginBottom: '1.5rem',
            padding: '0.875rem 1.25rem',
            background: '#FEF2F2',
            border: '1px solid rgba(185,28,28,0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: '#B91C1C', fontWeight: 500 }}>
            Your admin session has expired. Changes are no longer being saved.
          </span>
          <a href="/admin-login" className="admin-btn admin-btn--sm" style={{ flexShrink: 0 }}>
            Log in again
          </a>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Testimonials</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
              Displayed on{' '}
              <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                /testimonials
              </code>
            </p>
            <a
              href="/testimonials"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem',
                color: 'rgba(0,0,0,0.35)',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              View live →
            </a>
          </div>
        </div>
        {!cmsUnreachable && (
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>
            + Add Testimonial
          </button>
        )}
      </div>

      {cmsUnreachable ? (
        <EmptyState
          title="CMS temporarily unreachable"
          body="The content database could not be reached. Your testimonials are safe. Refresh to try again."
          action={
            <button className="admin-btn admin-btn--primary" onClick={() => router.refresh()}>
              Refresh
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          body="Testimonials appear on the public site once you add them here. Until then, the public /testimonials page shows a short invitation to get in touch; there are no placeholder reviews."
          action={
            <button className="admin-btn admin-btn--primary" onClick={openCreate}>
              + Add Testimonial
            </button>
          }
        />
      ) : (
        <SortableList
          items={items}
          getId={(t) => t.id}
          getLabel={(t) => `Testimonial from ${t.author}`}
          onReorder={handleReorder}
          /* Reordering while an optimistic temp-id row exists would persist an
             id list the server does not know yet; lock dragging until the
             create settles and the real id is swapped in. */
          disabled={items.some((t) => t.id.startsWith('temp-'))}
          renderItem={(item, { handleProps }) => {
            const rowPending = pendingIds.has(item.id) || item.id.startsWith('temp-');
            return (
              <>
                <DragHandle {...handleProps} />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '0.6rem 0',
                    opacity: item.isActive ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.author}</span>
                    {item.role && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>{item.role}</span>
                    )}
                    <BrandBadge brand={item.brand} />
                    {isValidRating(item.rating) && (
                      <span
                        role="img"
                        aria-label={`${item.rating} out of 5 stars`}
                        style={{ color: '#F59E0B', fontSize: '0.8rem' }}
                      >
                        {'★'.repeat(item.rating)}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'rgba(0,0,0,0.55)',
                      lineHeight: 1.55,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => openEdit(item)}
                    disabled={rowPending}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => handleToggle(item)}
                    disabled={rowPending}
                    style={{ color: item.isActive ? '#059669' : '#6B7280' }}
                    title={item.isActive ? 'Visible on the public site. Click to hide' : 'Hidden. Click to show'}
                  >
                    {item.isActive ? '● Visible' : '○ Hidden'}
                  </button>
                  <button
                    className="admin-btn admin-btn--sm"
                    style={{ color: '#B91C1C' }}
                    onClick={() => setConfirmingDelete(item)}
                    disabled={rowPending}
                  >
                    Delete
                  </button>
                </div>
              </>
            );
          }}
        />
      )}

      <SlidePanel
        open={panel !== null}
        title={panelTitle}
        dirty={isDirty}
        onClose={() => setPanel(null)}
        footer={
          <>
            <button className="admin-btn" onClick={() => setPanel(null)} disabled={saving}>
              Cancel
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSave}
              disabled={!canSave || saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <TextField
          label="Author"
          required
          value={draft.author}
          onChange={(v) => setDraft((d) => ({ ...d, author: v }))}
          placeholder="e.g. Sarah & James"
          maxLength={120}
        />
        <TextField
          label="Role / Context"
          value={draft.role}
          onChange={(v) => setDraft((d) => ({ ...d, role: v }))}
          placeholder="e.g. Wedding Clients, 2026"
          maxLength={160}
        />
        <TextAreaField
          label="Testimonial"
          required
          value={draft.text}
          onChange={(v) => setDraft((d) => ({ ...d, text: v }))}
          placeholder="What did they say?"
          maxLength={2000}
        />
        <ChipRadioGroup
          label="Brand"
          value={draft.brand}
          options={BRAND_OPTIONS}
          onChange={(v) => setDraft((d) => ({ ...d, brand: v as Draft['brand'] }))}
          help="Which brand this quote is about. 'Both' shows it everywhere."
        />
        <ChipRadioGroup
          label="Rating"
          value={draft.rating}
          options={RATING_OPTIONS}
          onChange={(v) => setDraft((d) => ({ ...d, rating: v as Draft['rating'] }))}
          help="Optional. Pick 'No rating' to show the quote without stars."
        />
      </SlidePanel>

      <ConfirmDialog
        open={confirmingDelete !== null}
        title="Delete testimonial?"
        body={
          confirmingDelete
            ? `The quote from “${confirmingDelete.author}” will be permanently removed from the public site.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmingDelete) void handleDelete(confirmingDelete);
        }}
        onCancel={() => setConfirmingDelete(null)}
      />
    </div>
  );
}

export default function AdminTestimonialsClient({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[] | null;
}) {
  // ToastProvider is not mounted globally; each admin module wraps its own tree.
  return (
    <ToastProvider>
      <TestimonialsManager initialTestimonials={initialTestimonials} />
    </ToastProvider>
  );
}
