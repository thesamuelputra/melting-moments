'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ConfirmDialog,
  DragHandle,
  EmptyState,
  SelectField,
  SlidePanel,
  SortableList,
  TextAreaField,
  TextField,
  ToastProvider,
  useDirtyGuard,
  useToast,
} from '../_components';
import { FALLBACK_FAQS } from '@/lib/fallback-faqs';
import { createFaq, deleteFaq, reorderFaqs, seedStarterFaqs, updateFaq, type ActionResult, type FaqCategory } from './actions';

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category?: FaqCategory;
  isActive: boolean;
};

type Failure = Extract<ActionResult, { success: false }>;
// Fallback when a server action throws (network failure, server crash).
const REQUEST_FAILED: Failure = { success: false, error: 'failed' };

const CATEGORY_OPTIONS = [
  { value: '', label: 'General (shown under Catering)' },
  { value: 'catering', label: 'Catering' },
  { value: 'guidos', label: "Guido's Gourmet" },
];

const BADGE_STYLES: Record<'catering' | 'guidos' | 'none', React.CSSProperties> = {
  catering: { background: '#EEF3FF', color: '#2563EB' },
  guidos: { background: '#FEF3E2', color: '#B45309' },
  none: { background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.55)' },
};

function CategoryBadge({ category }: { category?: FaqCategory }) {
  const key = category ?? 'none';
  const label = category === 'catering' ? 'Catering' : category === 'guidos' ? "Guido's" : 'General';
  return (
    <span className="admin-badge" style={BADGE_STYLES[key]}>
      {label}
    </span>
  );
}

type PanelState = { mode: 'create' } | { mode: 'edit'; faq: Faq } | null;
type Draft = { question: string; answer: string; category: '' | FaqCategory };

const EMPTY_DRAFT: Draft = { question: '', answer: '', category: '' };

function FaqManager({ initialFaqs }: { initialFaqs: Faq[] | null }) {
  const toast = useToast();
  const router = useRouter();
  const tempCounter = useRef(0);

  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs ?? []);
  // Re-sync from the server payload when router.refresh() delivers new props
  // (e.g. after the create action auto-imports the starter FAQs).
  const [prevInitialFaqs, setPrevInitialFaqs] = useState(initialFaqs);
  if (initialFaqs !== prevInitialFaqs) {
    setPrevInitialFaqs(initialFaqs);
    setFaqs(initialFaqs ?? []);
  }
  const [panel, setPanel] = useState<PanelState>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<Faq | null>(null);
  // Per-row in-flight markers instead of one global lock.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [sessionExpired, setSessionExpired] = useState(false);

  const cmsUnreachable = initialFaqs === null;
  const unseeded = !cmsUnreachable && faqs.length === 0;

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

  const openEdit = (faq: Faq) => {
    setDraft({ question: faq.question, answer: faq.answer, category: faq.category ?? '' });
    setPanel({ mode: 'edit', faq });
  };

  const isDirty = useMemo(() => {
    if (!panel) return false;
    if (panel.mode === 'create') {
      return draft.question !== '' || draft.answer !== '' || draft.category !== '';
    }
    return (
      draft.question !== panel.faq.question ||
      draft.answer !== panel.faq.answer ||
      draft.category !== (panel.faq.category ?? '')
    );
  }, [panel, draft]);
  useDirtyGuard(isDirty);

  const canSave = draft.question.trim() !== '' && draft.answer.trim() !== '';

  const handleSave = async () => {
    if (!panel || !canSave || saving) return;
    const question = draft.question.trim();
    const answer = draft.answer.trim();
    const category = draft.category === '' ? undefined : draft.category;

    if (panel.mode === 'create') {
      setSaving(true);
      const tempId = `temp-${++tempCounter.current}`;
      const optimistic: Faq = { id: tempId, question, answer, category, isActive: true };
      setFaqs((prev) => [...prev, optimistic]);
      setPanel(null);
      const res = await createFaq({ question, answer, category }).catch(() => REQUEST_FAILED);
      if (res.success && res.id) {
        // Swap the optimistic temp id for the real Convex id so edit/toggle/
        // delete/reorder on the new row hit a real document.
        const realId = res.id;
        setFaqs((prev) => prev.map((f) => (f.id === tempId ? { ...f, id: realId } : f)));
        if (res.seeded) {
          // First-ever CMS FAQ: the action also imported the starter set so the
          // public page keeps its existing questions; pull them into this view.
          toast.info('Starter FAQs were imported alongside your question so the public page keeps them.');
          router.refresh();
        }
        toast.success('FAQ added');
      } else {
        setFaqs((prev) => prev.filter((f) => f.id !== tempId));
        // Reopen the create panel (draft state is untouched) so the admin's
        // typed content survives the failure instead of being discarded.
        setPanel((current) => current ?? { mode: 'create' });
        fail(res.success ? REQUEST_FAILED : res, 'Failed to add FAQ');
      }
      setSaving(false);
      return;
    }

    // Edit is a partial patch: send only what changed.
    const original = panel.faq;
    const fields: Parameters<typeof updateFaq>[1] = {};
    if (question !== original.question) fields.question = question;
    if (answer !== original.answer) fields.answer = answer;
    if (category !== original.category) fields.category = category ?? null;
    if (Object.keys(fields).length === 0) {
      setPanel(null);
      return;
    }

    setSaving(true);
    const updated: Faq = { ...original, question, answer, category };
    setFaqs((prev) => prev.map((f) => (f.id === original.id ? updated : f)));
    setPanel(null);
    setPending(original.id, true);
    const res = await updateFaq(original.id, fields).catch(() => REQUEST_FAILED);
    if (res.success) {
      toast.success('FAQ updated');
    } else {
      setFaqs((prev) => prev.map((f) => (f.id === original.id ? original : f)));
      fail(res, 'Failed to update FAQ, changes reverted');
    }
    setPending(original.id, false);
    setSaving(false);
  };

  /* ===== Row actions ===== */

  const handleToggle = async (faq: Faq) => {
    if (pendingIds.has(faq.id)) return;
    setPending(faq.id, true);
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, isActive: !faq.isActive } : f)));
    const res = await updateFaq(faq.id, { isActive: !faq.isActive }).catch(() => REQUEST_FAILED);
    if (!res.success) {
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, isActive: faq.isActive } : f)));
      fail(res, 'Failed to update visibility, reverted');
    }
    setPending(faq.id, false);
  };

  const handleDelete = async (faq: Faq) => {
    const index = faqs.findIndex((f) => f.id === faq.id);
    if (index < 0) return;
    setConfirmingDelete(null);
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
    const res = await deleteFaq(faq.id).catch(() => REQUEST_FAILED);
    if (res.success) {
      toast.success('FAQ deleted');
    } else {
      // Restore at the original position, not appended to the end.
      setFaqs((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, faq);
        return next;
      });
      fail(res, 'Failed to delete FAQ, restored');
    }
  };

  const handleReorder = async (ids: string[]) => {
    const res = await reorderFaqs(ids).catch(() => REQUEST_FAILED);
    if (res.success) {
      // Keep the parent array in the new order so unrelated state updates
      // don't re-sync SortableList back to the stale order.
      setFaqs((prev) => {
        const byId = new Map(prev.map((f) => [f.id, f]));
        const next = ids.map((id) => byId.get(id)).filter((f): f is Faq => f !== undefined);
        return next.length === prev.length ? next : prev;
      });
      toast.success('Order saved');
    } else {
      fail(res, 'Failed to save order, reverted');
    }
    return res.success; // false ⇒ SortableList reverts to the pre-drag order
  };

  /* ===== Starter import (only offered while the CMS is empty) ===== */

  const handleImport = async () => {
    if (importing) return;
    setImporting(true);
    // One server action, one transaction: either every starter question is
    // imported or none are, and a repeat click imports nothing.
    const res = await seedStarterFaqs().catch(() => REQUEST_FAILED);
    if (res.success) {
      toast.success(`Imported ${res.count} starter FAQs`);
      router.refresh();
    } else if (res.error === 'invalid') {
      toast.info(res.message ?? 'The starter FAQs are already imported');
      router.refresh();
    } else {
      fail(res, 'Could not import the starter FAQs. Nothing was changed; try again.');
    }
    setImporting(false);
  };

  /* ===== Render ===== */

  const panelTitle = panel?.mode === 'edit' ? 'Edit FAQ' : 'New FAQ';

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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
              Displayed on{' '}
              <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                /faq
              </code>{' '}
              in two sections: Catering (general FAQs land there too) and Guido&apos;s Gourmet
            </p>
            <a
              href="/faq"
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
          <button className="admin-btn admin-btn--primary" onClick={openCreate} disabled={importing}>
            + Add FAQ
          </button>
        )}
      </div>

      {cmsUnreachable ? (
        <EmptyState
          title="CMS temporarily unreachable"
          body="The content database could not be reached. Your FAQs are safe. Refresh to try again."
          action={
            <button className="admin-btn admin-btn--primary" onClick={() => router.refresh()}>
              Refresh
            </button>
          }
        />
      ) : unseeded ? (
        <>
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.875rem 1.25rem',
              background: 'rgba(217,119,6,0.06)',
              border: '1px solid rgba(217,119,6,0.25)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#92400E', marginBottom: '0.2rem' }}>
                Showing built-in fallback FAQs
              </div>
              <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                The public /faq page currently shows these built-in questions. Import them to edit, reorder,
                or hide them here.
              </div>
            </div>
            <button
              className="admin-btn admin-btn--primary"
              style={{ flexShrink: 0 }}
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importing…' : 'Import starter FAQs'}
            </button>
          </div>

          {/* Read-only preview of the fallbacks. These rows are not CMS
              documents yet, so per-item actions stay disabled until import. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FALLBACK_FAQS.map((faq, i) => (
              <div
                key={`fallback-${i}`}
                className="admin-section"
                style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{faq.question}</span>
                    <CategoryBadge category={faq.category} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.55 }}>{faq.answer}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button className="admin-btn admin-btn--sm" disabled title="Import starter FAQs to edit">
                    Edit
                  </button>
                  <button className="admin-btn admin-btn--sm" disabled title="Import starter FAQs to delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : faqs.length === 0 ? (
        <EmptyState
          title="No FAQs yet"
          body="Add your first question to show it on the public /faq page."
          action={
            <button className="admin-btn admin-btn--primary" onClick={openCreate}>
              + Add FAQ
            </button>
          }
        />
      ) : (
        <SortableList
          items={faqs}
          getId={(f) => f.id}
          getLabel={(f) => f.question}
          onReorder={handleReorder}
          /* Reordering while an optimistic temp-id row exists would persist an
             id list the server does not know yet; lock dragging until the
             create settles and the real id is swapped in. */
          disabled={faqs.some((f) => f.id.startsWith('temp-'))}
          renderItem={(faq, { handleProps }) => {
            const rowPending = pendingIds.has(faq.id) || faq.id.startsWith('temp-');
            return (
              <>
                <DragHandle {...handleProps} />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '0.6rem 0',
                    opacity: faq.isActive ? 1 : 0.5,
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
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{faq.question}</span>
                    <CategoryBadge category={faq.category} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.55 }}>{faq.answer}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => openEdit(faq)}
                    disabled={rowPending}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => handleToggle(faq)}
                    disabled={rowPending}
                    style={{ color: faq.isActive ? '#059669' : '#6B7280' }}
                    title={faq.isActive ? 'Visible on the public site. Click to hide' : 'Hidden. Click to show'}
                  >
                    {faq.isActive ? '● Visible' : '○ Hidden'}
                  </button>
                  <button
                    className="admin-btn admin-btn--sm"
                    style={{ color: '#B91C1C' }}
                    onClick={() => setConfirmingDelete(faq)}
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
          label="Question"
          required
          value={draft.question}
          onChange={(v) => setDraft((d) => ({ ...d, question: v }))}
          placeholder="e.g. How far in advance should I book?"
          maxLength={300}
        />
        <TextAreaField
          label="Answer"
          required
          value={draft.answer}
          onChange={(v) => setDraft((d) => ({ ...d, answer: v }))}
          placeholder="Write a clear, helpful answer…"
          maxLength={2000}
        />
        <SelectField
          label="Category"
          value={draft.category}
          onChange={(v) => setDraft((d) => ({ ...d, category: v as Draft['category'] }))}
          options={CATEGORY_OPTIONS}
          help="Controls which /faq section the question appears in."
        />
      </SlidePanel>

      <ConfirmDialog
        open={confirmingDelete !== null}
        title="Delete FAQ?"
        body={
          confirmingDelete
            ? `“${
                confirmingDelete.question.length > 80
                  ? `${confirmingDelete.question.slice(0, 80)}…`
                  : confirmingDelete.question
              }” will be permanently removed from the public site.`
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

export default function AdminFaqClient({ initialFaqs }: { initialFaqs: Faq[] | null }) {
  // ToastProvider is not mounted globally; each admin module wraps its own tree.
  return (
    <ToastProvider>
      <FaqManager initialFaqs={initialFaqs} />
    </ToastProvider>
  );
}
