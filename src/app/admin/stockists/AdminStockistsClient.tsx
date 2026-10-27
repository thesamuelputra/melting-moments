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
import StockistMapPicker from './StockistMapPicker';
import { normaliseWebsite } from './website';
import {
  createStockist,
  deleteStockist,
  findStockistAddress,
  reorderStockists,
  setStockistVisible,
  updateStockist,
  type ActionResult,
  type AddressMatch,
  type StockistKind,
} from './actions';

export type Stockist = {
  id: string;
  name: string;
  kind: StockistKind;
  address: string;
  lat: number;
  lng: number;
  website: string;
  note: string;
  isActive: boolean;
};

type Failure = Extract<ActionResult, { success: false }>;
// Fallback when a server action throws (network failure, server crash).
const REQUEST_FAILED: Failure = { success: false, error: 'failed' };

const KIND_OPTIONS = [
  { value: 'grocery', label: 'Grocer or deli' },
  { value: 'restaurant', label: 'Restaurant or café' },
];
const KIND_LABEL: Record<StockistKind, string> = { grocery: 'Grocer', restaurant: 'Restaurant' };
const KIND_BADGE: Record<StockistKind, React.CSSProperties> = {
  grocery: { background: '#E8F1EC', color: '#1C6B4A' },
  restaurant: { background: '#FBEDEB', color: '#A2322A' },
};

type Draft = {
  name: string;
  kind: StockistKind;
  address: string;
  lat: number | null;
  lng: number | null;
  website: string;
  note: string;
};

const EMPTY_DRAFT: Draft = { name: '', kind: 'grocery', address: '', lat: null, lng: null, website: '', note: '' };

function draftFrom(s: Stockist): Draft {
  return { name: s.name, kind: s.kind, address: s.address, lat: s.lat, lng: s.lng, website: s.website, note: s.note };
}

type PanelState = { mode: 'create' } | { mode: 'edit'; stockist: Stockist } | null;

function StockistsManager({ initialStockists }: { initialStockists: Stockist[] | null }) {
  const toast = useToast();
  const router = useRouter();
  const tempCounter = useRef(0);

  const [items, setItems] = useState<Stockist[]>(initialStockists ?? []);
  // Every save refreshes the page props with the list as the database has
  // it. Take that list whenever no change is still on its way, so the page
  // follows the server (another device's edits, a Refresh after a failed
  // load) without undoing an optimistic change mid-flight. A list that
  // arrives during a change waits until the last one settles.
  const [inFlight, setInFlight] = useState(0);
  const [latest, setLatest] = useState(initialStockists);
  const [adopted, setAdopted] = useState(initialStockists);
  if (initialStockists !== latest) setLatest(initialStockists);
  if (inFlight === 0 && latest !== null && latest !== adopted) {
    setAdopted(latest);
    setItems(latest);
  }
  const begin = () => setInFlight((n) => n + 1);
  const end = () => setInFlight((n) => n - 1);
  const [panel, setPanel] = useState<PanelState>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<Stockist | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [sessionExpired, setSessionExpired] = useState(false);

  // Address search inside the panel
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<AddressMatch[] | null>(null);
  // Each search gets a number; an answer that arrives after a newer search,
  // or after the panel moved on to another stockist, is dropped
  const searchSeq = useRef(0);
  const [websiteTouched, setWebsiteTouched] = useState(false);

  const cmsUnreachable = initialStockists === null;

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

  /* ===== Panel ===== */

  const resetSearch = (initial = '') => {
    searchSeq.current += 1;
    setSearch(initial);
    setMatches(null);
    setSearching(false);
  };

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setWebsiteTouched(false);
    resetSearch();
    setPanel({ mode: 'create' });
  };

  const openEdit = (s: Stockist) => {
    setDraft(draftFrom(s));
    setWebsiteTouched(false);
    resetSearch();
    setPanel({ mode: 'edit', stockist: s });
  };

  const isDirty = useMemo(() => {
    if (!panel) return false;
    const base = panel.mode === 'create' ? EMPTY_DRAFT : draftFrom(panel.stockist);
    return (Object.keys(base) as (keyof Draft)[]).some((k) => draft[k] !== base[k]);
  }, [panel, draft]);
  useDirtyGuard(isDirty);

  const hasPin = draft.lat !== null && draft.lng !== null;
  const websiteOk = normaliseWebsite(draft.website).ok;
  const websiteError = websiteTouched && !websiteOk ? 'That does not look like a web address, or it is too long. Try something like theirshop.ca' : undefined;
  const canSave = draft.name.trim() !== '' && draft.address.trim() !== '' && hasPin && websiteOk;

  const runSearch = async () => {
    const q = search.trim();
    if (q.length < 3 || searching) return;
    const seq = ++searchSeq.current;
    setSearching(true);
    const res = await findStockistAddress(q).catch(() => REQUEST_FAILED);
    if (seq !== searchSeq.current) return;
    setSearching(false);
    if (res.success) {
      setMatches(res.matches);
    } else {
      setMatches(null);
      fail(res, 'The address search did not work');
    }
  };

  const chooseMatch = (m: AddressMatch) => {
    setDraft((d) => ({
      ...d,
      name: d.name.trim() ? d.name : m.name,
      address: m.address,
      lat: m.lat,
      lng: m.lng,
    }));
    setMatches(null);
  };

  const handleSave = async () => {
    if (!panel || !canSave || saving || draft.lat === null || draft.lng === null) return;
    const fields = {
      name: draft.name.trim(),
      kind: draft.kind,
      address: draft.address.trim(),
      lat: draft.lat,
      lng: draft.lng,
      website: draft.website.trim(),
      note: draft.note.trim(),
    };

    setSaving(true);
    begin();
    if (panel.mode === 'create') {
      const tempId = `temp-${++tempCounter.current}`;
      setItems((prev) => [...prev, { id: tempId, ...fields, isActive: true }]);
      setPanel(null);
      const res = await createStockist(fields).catch(() => REQUEST_FAILED);
      if (res.success && res.id) {
        const realId = res.id;
        setItems((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: realId } : s)));
        toast.success('Stockist added. It is on the map now');
      } else {
        setItems((prev) => prev.filter((s) => s.id !== tempId));
        // Reopen with the typed draft intact so nothing is lost
        setPanel((current) => current ?? { mode: 'create' });
        fail(res.success ? REQUEST_FAILED : res, 'Failed to add the stockist');
      }
      setSaving(false);
      end();
      return;
    }

    const original = panel.stockist;
    const updated: Stockist = { ...original, ...fields };
    setItems((prev) => prev.map((s) => (s.id === original.id ? updated : s)));
    setPanel(null);
    setPending(original.id, true);
    const res = await updateStockist(original.id, fields).catch(() => REQUEST_FAILED);
    if (res.success) {
      toast.success('Stockist updated');
    } else {
      setItems((prev) => prev.map((s) => (s.id === original.id ? original : s)));
      // Reopen with the edits still in the form, so nothing typed is lost
      setPanel((current) => current ?? { mode: 'edit', stockist: original });
      fail(res, 'Failed to update the stockist. Your changes are still in the form');
    }
    setPending(original.id, false);
    setSaving(false);
    end();
  };

  /* ===== Row actions ===== */

  const handleToggle = async (item: Stockist) => {
    if (pendingIds.has(item.id)) return;
    begin();
    setPending(item.id, true);
    setItems((prev) => prev.map((s) => (s.id === item.id ? { ...s, isActive: !item.isActive } : s)));
    const res = await setStockistVisible(item.id, !item.isActive).catch(() => REQUEST_FAILED);
    if (!res.success) {
      setItems((prev) => prev.map((s) => (s.id === item.id ? { ...s, isActive: item.isActive } : s)));
      fail(res, 'Failed to change visibility, reverted');
    }
    setPending(item.id, false);
    end();
  };

  const handleDelete = async (item: Stockist) => {
    const index = items.findIndex((s) => s.id === item.id);
    if (index < 0) return;
    begin();
    setConfirmingDelete(null);
    setItems((prev) => prev.filter((s) => s.id !== item.id));
    const res = await deleteStockist(item.id).catch(() => REQUEST_FAILED);
    if (res.success) {
      toast.success('Stockist deleted');
    } else {
      setItems((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, item);
        return next;
      });
      fail(res, 'Failed to delete the stockist, restored');
    }
    end();
  };

  const handleReorder = async (ids: string[]) => {
    begin();
    const res = await reorderStockists(ids).catch(() => REQUEST_FAILED);
    if (res.success) {
      setItems((prev) => {
        const byId = new Map(prev.map((s) => [s.id, s]));
        const next = ids.map((id) => byId.get(id)).filter((s): s is Stockist => s !== undefined);
        return next.length === prev.length ? next : prev;
      });
      toast.success('Order saved');
    } else {
      fail(res, 'Failed to save order, reverted');
    }
    end();
    return res.success;
  };

  /* ===== Render ===== */

  const editingId = panel?.mode === 'edit' ? panel.stockist.id : null;
  const neighbours = items.filter((s) => s.id !== editingId && !s.id.startsWith('temp-'));

  return (
    <div>
      {sessionExpired && (
        <div
          role="alert"
          style={{
            marginBottom: '1.5rem', padding: '0.875rem 1.25rem', background: '#FEF2F2',
            border: '1px solid rgba(185,28,28,0.3)', borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: '#B91C1C', fontWeight: 500 }}>
            Your admin session has expired. Changes are no longer being saved.
          </span>
          <a href="/admin-login" className="admin-btn admin-btn--sm" style={{ flexShrink: 0 }}>Log in again</a>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>Stockists</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
              The restaurants and grocers that carry Guido&apos;s, listed and numbered on the map at{' '}
              <code style={{ background: 'rgba(0,0,0,0.04)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>/guidos</code>
            </p>
            <a href="/guidos#stockists" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              View live →
            </a>
          </div>
          {items.length > 1 && (
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', marginTop: '0.2rem' }}>
              Drag to change the order. The site lists and numbers them the same way.
            </p>
          )}
        </div>
        {!cmsUnreachable && (
          <button className="admin-btn admin-btn--primary" onClick={openCreate} disabled={saving}>+ Add Stockist</button>
        )}
      </div>

      {cmsUnreachable ? (
        <EmptyState
          title="CMS temporarily unreachable"
          body="The content database could not be reached. Your stockists are safe. Refresh to try again."
          action={<button className="admin-btn admin-btn--primary" onClick={() => router.refresh()}>Refresh</button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No stockists yet"
          body="Add each restaurant or grocer that carries Guido's. They appear on the map on the Guido's page as soon as you save, alongside your own kitchen for pickups."
          action={<button className="admin-btn admin-btn--primary" onClick={openCreate}>+ Add Stockist</button>}
        />
      ) : (
        <SortableList
          items={items}
          getId={(s) => s.id}
          getLabel={(s) => `Stockist ${s.name}`}
          onReorder={handleReorder}
          disabled={items.some((s) => s.id.startsWith('temp-'))}
          renderItem={(item, { handleProps }) => {
            const rowPending = pendingIds.has(item.id) || item.id.startsWith('temp-');
            return (
              <>
                <DragHandle {...handleProps} />
                <div style={{ flex: 1, minWidth: 0, padding: '0.6rem 0', opacity: item.isActive ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                    <span className="admin-badge" style={KIND_BADGE[item.kind]}>{KIND_LABEL[item.kind]}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.5 }}>
                    {item.address}
                    {item.note ? <span style={{ color: 'rgba(0,0,0,0.4)' }}> · {item.note}</span> : null}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                  <button className="admin-btn admin-btn--sm" onClick={() => openEdit(item)} disabled={rowPending || saving}>Edit</button>
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => handleToggle(item)}
                    disabled={rowPending}
                    style={{ color: item.isActive ? '#059669' : '#6B7280' }}
                    title={item.isActive ? 'On the public map. Click to hide' : 'Hidden from the map. Click to show'}
                  >
                    {item.isActive ? '● Visible' : '○ Hidden'}
                  </button>
                  <button className="admin-btn admin-btn--sm" style={{ color: '#B91C1C' }} onClick={() => setConfirmingDelete(item)} disabled={rowPending}>Delete</button>
                </div>
              </>
            );
          }}
        />
      )}

      <SlidePanel
        open={panel !== null}
        title={panel?.mode === 'edit' ? 'Edit Stockist' : 'New Stockist'}
        dirty={isDirty}
        onClose={() => setPanel(null)}
        footer={
          <>
            <button className="admin-btn" onClick={() => setPanel(null)} disabled={saving}>Cancel</button>
            <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form
          className="admin-field"
          onSubmit={(e) => { e.preventDefault(); void runSearch(); }}
          style={{ padding: '0.9rem', background: 'rgba(0,0,0,0.025)', borderRadius: '8px' }}
        >
          <TextField
            label="Find the place"
            value={search}
            onChange={setSearch}
            placeholder="A shop name, or a street address and town"
            maxLength={200}
            help="Searches OpenStreetMap within the area the map covers. Pick a result to drop the pin."
          />
          <button type="submit" className="admin-btn admin-btn--sm" disabled={search.trim().length < 3 || searching} style={{ marginTop: '0.5rem' }}>
            {searching ? 'Searching…' : 'Search'}
          </button>
          {matches && (
            <div role="status" style={{ marginTop: '0.75rem' }}>
              {matches.length === 0 ? (
                <p className="admin-field__help">Nothing found there. Try the street address, or click the map below to place the pin by hand.</p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.35rem' }}>
                  {matches.map((m, i) => (
                    <li key={`${m.lat},${m.lng},${i}`}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal' }}
                        onClick={() => chooseMatch(m)}
                      >
                        {m.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>

        <TextField
          label="Name"
          required
          value={draft.name}
          onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
          placeholder="The shop or restaurant name"
          maxLength={120}
        />
        <SelectField
          label="Kind of place"
          value={draft.kind}
          options={KIND_OPTIONS}
          onChange={(v) => setDraft((d) => ({ ...d, kind: v as StockistKind }))}
        />
        <TextField
          label="Address shown on the site"
          required
          value={draft.address}
          onChange={(v) => setDraft((d) => ({ ...d, address: v }))}
          placeholder="Street and town, e.g. 1234 Fort St, Victoria"
          maxLength={200}
        />
        <StockistMapPicker
          value={hasPin ? { lat: draft.lat as number, lng: draft.lng as number } : null}
          onChange={(p) => setDraft((d) => ({ ...d, lat: p.lat, lng: p.lng }))}
          neighbours={neighbours}
        />
        <TextField
          label="Website"
          type="url"
          value={draft.website}
          onChange={(v) => setDraft((d) => ({ ...d, website: v }))}
          placeholder="Optional, e.g. theirshop.ca"
          maxLength={2048}
          error={websiteError}
          onBlur={() => setWebsiteTouched(true)}
        />
        <TextAreaField
          label="Note for visitors"
          value={draft.note}
          onChange={(v) => setDraft((d) => ({ ...d, note: v }))}
          placeholder="Optional, e.g. In the freezer by the deli counter"
          maxLength={280}
        />
      </SlidePanel>

      <ConfirmDialog
        open={confirmingDelete !== null}
        title="Delete stockist?"
        body={confirmingDelete ? `“${confirmingDelete.name}” will be removed from the map for good. To take it off the map for now, hide it instead.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => { if (confirmingDelete) void handleDelete(confirmingDelete); }}
        onCancel={() => setConfirmingDelete(null)}
      />
    </div>
  );
}

export default function AdminStockistsClient({ initialStockists }: { initialStockists: Stockist[] | null }) {
  // ToastProvider is not mounted globally; each admin module wraps its own tree.
  return (
    <ToastProvider>
      <StockistsManager initialStockists={initialStockists} />
    </ToastProvider>
  );
}
