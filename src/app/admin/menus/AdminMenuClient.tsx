'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_CATEGORY_ORDER } from '@/lib/menu-category-order';
import {
  ConfirmDialog,
  DragHandle,
  EmptyState,
  NumberField,
  SelectField,
  SlidePanel,
  SortableList,
  TextAreaField,
  TextField,
  ToastProvider,
  ToggleSwitch,
  parseNumberField,
  useDirtyGuard,
  useToast,
  type SortableHandleProps,
} from '../_components';
import {
  addMenuItem,
  bulkDeleteMenuItems,
  deleteMenuItem,
  reorderMenuItems,
  saveCategoryOrder,
  setMenuItemFlag,
  updateMenuItem,
  type ActionResult,
  type BulkDeleteResult,
  type MenuItemInput,
} from './actions';

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number | null;
  priceLabel: string;
  orderIndex: number;
  isActive: boolean;
  isFeatured: boolean;
};

type Props = {
  initialItems: MenuItem[];
  /** Parsed menu_category_order setting ([] when unset → alphabetical default). */
  savedCategoryOrder: string[];
};

const NEW_CATEGORY = '__new-category__';

/** Fallback result when a server action throws (network failure etc.). */
const FAILED = { success: false as const, error: 'failed' as const };

type PanelState = { mode: 'create' } | { mode: 'edit'; item: MenuItem };

type FormState = {
  name: string;
  categoryChoice: string;
  newCategory: string;
  description: string;
  priceStr: string;
  priceLabel: string;
  /** Once the admin edits the label by hand we stop auto-deriving it from price. */
  labelTouched: boolean;
  isActive: boolean;
  isFeatured: boolean;
};

type FormErrors = { name?: string; category?: string; price?: string };

function deriveLabel(price: number | null): string {
  return price !== null && price > 0 ? `$${price.toFixed(2)}/pp` : 'Included';
}

/** Dirty comparison ignores labelTouched (UI bookkeeping, not content). */
function formSignature(f: FormState): string {
  return JSON.stringify([
    f.name,
    f.categoryChoice,
    f.newCategory,
    f.description,
    f.priceStr,
    f.priceLabel,
    f.isActive,
    f.isFeatured,
  ]);
}

/**
 * Saved order first (kept even when a category is currently empty); when the
 * setting is unset, fall back to the same curated DEFAULT_CATEGORY_ORDER the
 * public /menus page uses — never a bare alphabetical list, or the first
 * "Order categories" save would silently reorder the live site. Unknown
 * categories are appended alphabetically either way.
 */
function resolveCategoryOrder(saved: string[], items: { category: string }[]): string[] {
  const savedClean = Array.from(new Set(saved.map((s) => s.trim()).filter(Boolean)));
  const base = savedClean.length > 0 ? savedClean : DEFAULT_CATEGORY_ORDER;
  const known = new Set(base);
  const dataCategories = new Set(items.map((i) => i.category));
  const extras = Array.from(dataCategories)
    .filter((c) => !known.has(c))
    .sort((a, b) => a.localeCompare(b));
  // Curated defaults only count if items actually exist in them (a saved
  // order is kept verbatim so temporarily-empty categories keep their slot).
  const baseKept = savedClean.length > 0 ? base : base.filter((c) => dataCategories.has(c));
  return [...baseKept, ...extras];
}

/** Re-insert rows at (an approximation of) their original positions, ascending. */
function restoreMany(prev: MenuItem[], entries: { item: MenuItem; index: number }[]): MenuItem[] {
  const next = [...prev];
  for (const { item, index } of [...entries].sort((a, b) => a.index - b.index)) {
    next.splice(Math.min(index, next.length), 0, item);
  }
  return next;
}

/* ------------------------------------------------------------------ */
/* Row content — shared by the sortable view and the search results    */
/* ------------------------------------------------------------------ */

function ItemRowContent({
  item,
  pending,
  isSelected,
  onSelect,
  onToggleActive,
  onToggleFeatured,
  onEdit,
  onDelete,
  handleProps,
}: {
  item: MenuItem;
  pending: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
  onEdit: () => void;
  onDelete: () => void;
  handleProps?: SortableHandleProps;
}) {
  return (
    <>
      {handleProps && <DragHandle {...handleProps} />}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        aria-label={`Select ${item.name}`}
        disabled={pending}
        style={{
          accentColor: '#111',
          cursor: pending ? 'default' : 'pointer',
          flexShrink: 0,
          width: '15px',
          height: '15px',
          marginLeft: handleProps ? 0 : '0.6rem',
        }}
      />
      <div
        style={{
          flex: '1 1 auto',
          minWidth: 0,
          padding: '0.35rem 0',
          opacity: pending ? 0.5 : item.isActive ? 1 : 0.45,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', minWidth: 0 }}>
          <span
            className="admin-table__name"
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {item.name}
          </span>
          {!item.isActive && (
            <span
              style={{
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '999px',
                padding: '0.05rem 0.45rem',
                flexShrink: 0,
              }}
            >
              Hidden
            </span>
          )}
        </div>
        {item.description && (
          <div
            style={{
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.45)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '0.15rem',
            }}
          >
            {item.description}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: '0.78rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          minWidth: '72px',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: 'rgba(0,0,0,0.75)',
        }}
      >
        {item.priceLabel || 'Included'}
      </span>
      <button
        type="button"
        className="admin-btn admin-btn--sm"
        onClick={onToggleFeatured}
        disabled={pending}
        aria-pressed={item.isFeatured}
        aria-label={
          item.isFeatured
            ? `Remove Chef's Pick from ${item.name}`
            : `Mark ${item.name} as Chef's Pick`
        }
        title={item.isFeatured ? "Chef's Pick — click to remove" : "Mark as Chef's Pick"}
        style={{ paddingLeft: '0.45rem', paddingRight: '0.45rem', flexShrink: 0, lineHeight: 0 }}
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill={item.isFeatured ? '#D97706' : 'none'}
          stroke={item.isFeatured ? '#D97706' : 'rgba(0,0,0,0.4)'}
          strokeWidth="1.6"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3.2l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.8l6.2-.9z" />
        </svg>
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={item.isActive}
        aria-label={`${item.name} visible on public site`}
        className="admin-switch"
        disabled={pending}
        onClick={onToggleActive}
        style={{ flexShrink: 0 }}
      >
        <span className="admin-switch__knob" aria-hidden="true" />
      </button>
      <button type="button" className="admin-btn admin-btn--sm" onClick={onEdit} disabled={pending}>
        Edit
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--sm"
        style={{ color: '#B91C1C' }}
        onClick={onDelete}
        disabled={pending}
      >
        Delete
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main manager                                                        */
/* ------------------------------------------------------------------ */

function MenuManager({ initialItems, savedCategoryOrder }: Props) {
  const toast = useToast();
  const formId = useId();
  const selectAllId = useId();

  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() =>
    resolveCategoryOrder(savedCategoryOrder, initialItems)
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    () => resolveCategoryOrder(savedCategoryOrder, initialItems)[0] ?? ''
  );
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [reorderPending, setReorderPending] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [panel, setPanel] = useState<PanelState | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    categoryChoice: '',
    newCategory: '',
    description: '',
    priceStr: '',
    priceLabel: 'Included',
    labelTouched: false,
    isActive: true,
    isFeatured: false,
  });
  const [initialSig, setInitialSig] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [confirmDelete, setConfirmDelete] = useState<MenuItem | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [catPanelOpen, setCatPanelOpen] = useState(false);

  // Server actions call revalidatePath('/admin/menus'), so the server component
  // re-renders with fresh data after each mutation. Adopt it only while no
  // optimistic operation is in flight, so server truth never clobbers pending UI.
  const [prevInitial, setPrevInitial] = useState(initialItems);
  if (initialItems !== prevInitial) {
    setPrevInitial(initialItems);
    if (pendingIds.size === 0 && !reorderPending) {
      setItems(initialItems);
    }
  }
  const [prevSavedOrder, setPrevSavedOrder] = useState(savedCategoryOrder);
  if (savedCategoryOrder !== prevSavedOrder) {
    setPrevSavedOrder(savedCategoryOrder);
    setCategoryOrder(resolveCategoryOrder(savedCategoryOrder, initialItems));
  }

  /* ---------------- derived data ---------------- */

  const categories = useMemo(() => {
    const known = new Set(categoryOrder);
    const extras = Array.from(new Set(items.map((i) => i.category)))
      .filter((c) => !known.has(c))
      .sort((a, b) => a.localeCompare(b));
    return [...categoryOrder, ...extras];
  }, [categoryOrder, items]);

  // Render-phase adjustment: if the active tab's category disappears (last item
  // deleted and it is not in the saved order), fall back to the first tab.
  if (categories.length > 0 && !categories.includes(activeCategory)) {
    setActiveCategory(categories[0]);
  }

  const query = search.trim().toLowerCase();
  const searchActive = query.length > 0;

  const categoryItems = useMemo(
    () =>
      items
        .filter((i) => i.category === activeCategory)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [items, activeCategory]
  );

  // Search spans ALL categories, grouped by category in display order.
  const searchGroups = useMemo(() => {
    if (!searchActive) return [];
    const matches = items.filter(
      (i) => i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
    );
    return categories
      .map((cat) => ({
        category: cat,
        items: matches
          .filter((m) => m.category === cat)
          .sort((a, b) => a.orderIndex - b.orderIndex),
      }))
      .filter((g) => g.items.length > 0);
  }, [items, categories, query, searchActive]);

  const visibleRows = useMemo(
    () => (searchActive ? searchGroups.flatMap((g) => g.items) : categoryItems),
    [searchActive, searchGroups, categoryItems]
  );

  // Bulk selection respects VISIBLE rows only — prune whenever the view changes
  // (render-phase adjustment keyed on the visible id list).
  const visibleIdsKey = visibleRows.map((r) => r.id).join('|');
  const [prevVisibleKey, setPrevVisibleKey] = useState(visibleIdsKey);
  if (visibleIdsKey !== prevVisibleKey) {
    setPrevVisibleKey(visibleIdsKey);
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const visible = new Set(visibleIdsKey.split('|').filter(Boolean));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visible.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((r) => selected.has(r.id));

  const countFor = (cat: string) => items.filter((i) => i.category === cat).length;

  const isDirty = panel !== null && formSignature(form) !== initialSig;
  useDirtyGuard(isDirty);

  /* ---------------- helpers ---------------- */

  const markPending = (id: string, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const markManyPending = (ids: string[], on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const handleFailure = (
    failure: { error: 'unauthorized' | 'invalid' | 'failed'; message?: string },
    fallback: string
  ) => {
    if (failure.error === 'unauthorized') {
      setSessionExpired(true);
      toast.error('Session expired — log in again');
      return;
    }
    toast.error(failure.message ?? fallback);
  };

  /* ---------------- selection ---------------- */

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleRows.forEach((r) => next.delete(r.id));
      else visibleRows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  /* ---------------- toggles (optimistic, per-row pending) ---------------- */

  const toggleFlag = (item: MenuItem, flag: 'isActive' | 'isFeatured') => {
    if (pendingIds.has(item.id)) return;
    const nextValue = !item[flag];
    markPending(item.id, true);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, [flag]: nextValue } : i)));
    void (async () => {
      const res: ActionResult = await setMenuItemFlag(item.id, flag, nextValue).catch(() => FAILED);
      markPending(item.id, false);
      if (res.success) {
        if (flag === 'isActive') {
          toast.success(nextValue ? `"${item.name}" is now visible` : `"${item.name}" hidden from site`);
        } else {
          toast.success(nextValue ? `"${item.name}" marked as Chef's Pick` : `Chef's Pick removed from "${item.name}"`);
        }
      } else {
        // Rollback to the pre-toggle value
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, [flag]: !nextValue } : i))
        );
        handleFailure(res, 'Failed to update — reverted');
      }
    })();
  };

  /* ---------------- create / edit panel ---------------- */

  const openCreate = () => {
    const defaultCat =
      categories.length > 0
        ? categories.includes(activeCategory)
          ? activeCategory
          : categories[0]
        : NEW_CATEGORY;
    const f: FormState = {
      name: '',
      categoryChoice: defaultCat,
      newCategory: '',
      description: '',
      priceStr: '',
      priceLabel: 'Included',
      labelTouched: false,
      isActive: true,
      isFeatured: false,
    };
    setForm(f);
    setInitialSig(formSignature(f));
    setFormErrors({});
    setPanel({ mode: 'create' });
  };

  const openEdit = (item: MenuItem) => {
    const f: FormState = {
      name: item.name,
      categoryChoice: item.category,
      newCategory: '',
      description: item.description,
      priceStr: item.price !== null ? String(item.price) : '',
      priceLabel: item.priceLabel,
      // A label that matches the derivation keeps following price edits;
      // a custom label is treated as hand-written and never overwritten.
      labelTouched: item.priceLabel !== deriveLabel(item.price),
      isActive: item.isActive,
      isFeatured: item.isFeatured,
    };
    setForm(f);
    setInitialSig(formSignature(f));
    setFormErrors({});
    setPanel({ mode: 'edit', item });
  };

  const closePanel = () => {
    setPanel(null);
    setFormErrors({});
  };

  const onPriceChange = (v: string) => {
    setForm((f) => {
      const price = parseNumberField(v);
      return {
        ...f,
        priceStr: v,
        priceLabel: f.labelTouched ? f.priceLabel : deriveLabel(price),
      };
    });
  };

  const onLabelChange = (v: string) => {
    setForm((f) => ({ ...f, priceLabel: v, labelTouched: true }));
  };

  const submitForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (panel === null) return;

    const name = form.name.trim();
    const category =
      form.categoryChoice === NEW_CATEGORY
        ? form.newCategory.trim().toUpperCase()
        : form.categoryChoice;
    const priceRaw = form.priceStr.trim();
    const price = parseNumberField(form.priceStr);

    const errors: FormErrors = {};
    if (!name) errors.name = 'Name is required';
    if (!category) {
      errors.category =
        form.categoryChoice === NEW_CATEGORY
          ? 'Enter a name for the new category'
          : 'Choose a category';
    }
    if (priceRaw !== '' && (price === null || price < 0)) {
      errors.price = 'Enter a valid non-negative price';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: MenuItemInput = {
      category,
      name,
      description: form.description.trim(),
      price: priceRaw === '' ? null : price,
      priceLabel: form.priceLabel.trim() || 'Included',
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };

    if (panel.mode === 'create') {
      const tempId = `temp-${Date.now()}`;
      const localOrderIndex =
        items
          .filter((i) => i.category === payload.category)
          .reduce((max, i) => Math.max(max, i.orderIndex), -1) + 1;
      const optimistic: MenuItem = { id: tempId, orderIndex: localOrderIndex, ...payload };
      setItems((prev) => [...prev, optimistic]);
      setPanel(null);
      setSearch('');
      setActiveCategory(payload.category);
      markPending(tempId, true);
      void (async () => {
        const res: ActionResult = await addMenuItem(payload).catch(() => FAILED);
        markPending(tempId, false);
        if (res.success && typeof res.id === 'string') {
          const realId = res.id;
          setItems((prev) => prev.map((i) => (i.id === tempId ? { ...i, id: realId } : i)));
          toast.success(`Added "${payload.name}"`);
        } else {
          setItems((prev) => prev.filter((i) => i.id !== tempId));
          // Reopen with the form untouched so nothing typed is lost.
          setPanel((current) => (current === null ? { mode: 'create' } : current));
          handleFailure(res.success ? FAILED : res, 'Failed to add the item');
        }
      })();
    } else {
      const original = panel.item;
      const updated: MenuItem = {
        ...original,
        category: payload.category,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        priceLabel: payload.priceLabel,
        isActive: payload.isActive,
        isFeatured: payload.isFeatured,
        // orderIndex intentionally preserved from the original.
      };
      setItems((prev) => prev.map((i) => (i.id === original.id ? updated : i)));
      setPanel(null);
      markPending(original.id, true);
      void (async () => {
        const res: ActionResult = await updateMenuItem(original.id, payload).catch(() => FAILED);
        markPending(original.id, false);
        if (res.success) {
          toast.success(`Updated "${payload.name}"`);
        } else {
          // Rollback to the snapshot (same index — replaced in place).
          setItems((prev) => prev.map((i) => (i.id === original.id ? original : i)));
          setPanel((current) => (current === null ? { mode: 'edit', item: original } : current));
          handleFailure(res, 'Failed to save changes');
        }
      })();
    }
  };

  /* ---------------- delete ---------------- */

  const performDelete = () => {
    const item = confirmDelete;
    if (!item) return;
    const index = items.findIndex((i) => i.id === item.id);
    setConfirmDelete(null);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    markPending(item.id, true);
    void (async () => {
      const res: ActionResult = await deleteMenuItem(item.id).catch(() => FAILED);
      markPending(item.id, false);
      if (res.success) {
        toast.success(`Deleted "${item.name}"`);
      } else {
        // Restore at the ORIGINAL index, not appended at the end.
        setItems((prev) => restoreMany(prev, [{ item, index: Math.max(index, 0) }]));
        handleFailure(res, `Failed to delete "${item.name}" — restored`);
      }
    })();
  };

  const performBulkDelete = () => {
    const ids = Array.from(selected);
    setBulkConfirm(false);
    if (ids.length === 0) return;
    const snapshot = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => selected.has(item.id));
    setSelected(new Set());
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    markManyPending(ids, true);
    void (async () => {
      const res: BulkDeleteResult = await bulkDeleteMenuItems(ids).catch(() => FAILED);
      markManyPending(ids, false);
      if (res.success) {
        toast.success(`Deleted ${ids.length} item${ids.length === 1 ? '' : 's'}`);
        return;
      }
      const failedIds = new Set('failedIds' in res && res.failedIds ? res.failedIds : ids);
      const toRestore = snapshot.filter(({ item }) => failedIds.has(item.id));
      if (toRestore.length > 0) {
        setItems((prev) => restoreMany(prev, toRestore));
      }
      if (res.error === 'unauthorized') {
        handleFailure(res, '');
        return;
      }
      const deletedCount = ids.length - toRestore.length;
      toast.error(
        deletedCount > 0
          ? `Deleted ${deletedCount} of ${ids.length} — ${toRestore.length} failed and ${toRestore.length === 1 ? 'was' : 'were'} restored`
          : 'Failed to delete the selected items — restored'
      );
    })();
  };

  /* ---------------- render ---------------- */

  const rowProps = (item: MenuItem, handleProps?: SortableHandleProps) => ({
    item,
    pending: pendingIds.has(item.id),
    isSelected: selected.has(item.id),
    onSelect: () => toggleSelect(item.id),
    onToggleActive: () => toggleFlag(item, 'isActive'),
    onToggleFeatured: () => toggleFlag(item, 'isFeatured'),
    onEdit: () => openEdit(item),
    onDelete: () => setConfirmDelete(item),
    handleProps,
  });

  const labelSuggestion = deriveLabel(parseNumberField(form.priceStr));

  return (
    <div>
      {/* Persistent session-expired notice (kit toasts auto-dismiss, so the
          re-login link lives here) */}
      {sessionExpired && (
        <div
          role="alert"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(185,28,28,0.06)',
            border: '1px solid rgba(185,28,28,0.3)',
            borderRadius: '6px',
            color: '#B91C1C',
            fontSize: '0.82rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span>Session expired — recent changes were not saved. Log in again to continue.</span>
          <Link href="/admin-login" className="admin-btn admin-btn--sm" style={{ color: '#B91C1C', flexShrink: 0 }}>
            Log in again
          </Link>
        </div>
      )}

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="admin-tabs" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`admin-tab${activeCategory === cat && !searchActive ? ' admin-tab--active' : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                setSearch('');
              }}
            >
              {cat}
              <span style={{ marginLeft: '0.35rem', opacity: 0.4 }}>{countFor(cat)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="14"
            height="14"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.35,
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="admin-inline-input"
            placeholder="Search all categories…"
            aria-label="Search menu items across all categories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem', fontSize: '0.82rem', width: '100%' }}
          />
        </div>

        {searchActive && (
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            onClick={() => setSearch('')}
            title="Drag-to-reorder works per category — clear the search to drag items"
            style={{ borderStyle: 'dashed', color: 'rgba(0,0,0,0.55)', flexShrink: 0 }}
          >
            Clear search to reorder
          </button>
        )}

        {selected.size > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              background: 'rgba(17,17,17,0.05)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'rgba(0,0,0,0.55)' }}>{selected.size} selected</span>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              style={{ color: '#B91C1C' }}
              onClick={() => setBulkConfirm(true)}
            >
              Delete selected
            </button>
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 }}>
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            onClick={() => setCatPanelOpen(true)}
            disabled={categories.length < 2}
          >
            Order categories
          </button>
          <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={openCreate}>
            + Add item
          </button>
        </div>
      </div>

      {/* Section header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '1rem',
          margin: '0 0 0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 400 }}>
          {searchActive ? `Results for "${search.trim()}"` : activeCategory || 'Menu items'}{' '}
          <span style={{ opacity: 0.4, fontWeight: 400, fontSize: '0.85rem' }}>
            ({visibleRows.length}
            {searchActive && searchGroups.length > 1 ? ` across ${searchGroups.length} categories` : ''})
          </span>
        </h3>
        <a
          href="/menus"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.72rem',
            color: 'rgba(0,0,0,0.4)',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          View live page ↗
        </a>
      </div>

      {/* Select-all for visible rows */}
      {visibleRows.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            margin: '0 0 0.6rem',
            fontSize: '0.78rem',
            color: 'rgba(0,0,0,0.55)',
          }}
        >
          <input
            id={selectAllId}
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleSelectAllVisible}
            style={{ accentColor: '#111', cursor: 'pointer', width: '15px', height: '15px' }}
          />
          <label htmlFor={selectAllId} style={{ cursor: 'pointer' }}>
            Select all {searchActive ? 'results' : 'visible'} ({visibleRows.length})
          </label>
        </div>
      )}

      {/* Content */}
      {searchActive ? (
        searchGroups.length === 0 ? (
          <EmptyState
            title={`No items match "${search.trim()}"`}
            body="The search covers names and descriptions in every category."
            action={
              <button type="button" className="admin-btn" onClick={() => setSearch('')}>
                Clear search
              </button>
            }
          />
        ) : (
          <div className="admin-table-wrap">
            <div style={{ minWidth: '640px' }}>
              {searchGroups.map((group) => (
                <div key={group.category} style={{ marginBottom: '1.25rem' }}>
                  <h4
                    style={{
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'rgba(0,0,0,0.45)',
                      margin: '0 0 0.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {group.category}{' '}
                    <span style={{ opacity: 0.6, fontWeight: 400 }}>({group.items.length})</span>
                  </h4>
                  <ul className="admin-sortable-list">
                    {group.items.map((item) => (
                      <li key={item.id} className="admin-sortable-row" style={{ paddingLeft: '0.25rem' }}>
                        <ItemRowContent {...rowProps(item)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )
      ) : categoryItems.length === 0 ? (
        <EmptyState
          title={activeCategory ? `No items in ${activeCategory} yet` : 'No menu items yet'}
          body="Items you add here appear on the public Menus page."
          action={
            <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
              + Add item
            </button>
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <div style={{ minWidth: '640px' }}>
            <SortableList
              items={categoryItems}
              getId={(i) => i.id}
              getLabel={(i) => i.name}
              disabled={reorderPending}
              onReorder={async (ids) => {
                setReorderPending(true);
                const res: ActionResult = await reorderMenuItems(activeCategory, ids).catch(
                  () => FAILED
                );
                setReorderPending(false);
                if (res.success) {
                  // Sync orderIndex locally so later state updates keep this order.
                  setItems((prev) =>
                    prev.map((i) => {
                      const pos = ids.indexOf(i.id);
                      return pos >= 0 ? { ...i, orderIndex: pos } : i;
                    })
                  );
                  toast.success('Order saved');
                  return true;
                }
                handleFailure(res, 'Failed to save order — reverted');
                return false; // SortableList reverts to the pre-drag order
              }}
              renderItem={(item, { handleProps }) => (
                <ItemRowContent {...rowProps(item, handleProps)} />
              )}
            />
          </div>
        </div>
      )}

      {/* Create / edit panel */}
      <SlidePanel
        open={panel !== null}
        title={panel?.mode === 'edit' ? `Edit "${panel.item.name}"` : 'New menu item'}
        dirty={isDirty}
        onClose={closePanel}
        footer={
          <>
            <button type="button" className="admin-btn" onClick={closePanel}>
              Cancel
            </button>
            <button type="submit" form={formId} className="admin-btn admin-btn--primary">
              {panel?.mode === 'edit' ? 'Save changes' : 'Add item'}
            </button>
          </>
        }
      >
        <form id={formId} onSubmit={submitForm} noValidate>
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            error={formErrors.name}
            placeholder="e.g. Beef Wellington"
          />
          <SelectField
            label="Category"
            required
            value={form.categoryChoice}
            onChange={(v) => setForm((f) => ({ ...f, categoryChoice: v }))}
            error={form.categoryChoice === NEW_CATEGORY ? undefined : formErrors.category}
            options={[
              ...categories.map((c) => ({ value: c, label: c })),
              { value: NEW_CATEGORY, label: 'New category…' },
            ]}
            help={panel?.mode === 'edit' ? 'Pick a different category to move this item.' : undefined}
          />
          {form.categoryChoice === NEW_CATEGORY && (
            <TextField
              label="New category name"
              required
              value={form.newCategory}
              onChange={(v) => setForm((f) => ({ ...f, newCategory: v }))}
              error={formErrors.category}
              placeholder="e.g. DESSERTS"
              help="Saved in ALL CAPS to match the existing sections."
            />
          )}
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            maxLength={400}
            help="Shown under the item name on the public menu."
          />
          <NumberField
            label="Price"
            value={form.priceStr}
            onChange={onPriceChange}
            error={formErrors.price}
            placeholder="e.g. 9.95"
            help="Leave blank when the item is included in package pricing."
          />
          <TextField
            label="Price label"
            value={form.priceLabel}
            onChange={onLabelChange}
            help={
              form.labelTouched
                ? `Custom label — suggestion from price: ${labelSuggestion}`
                : 'Follows the price automatically until you edit it.'
            }
          />
          <ToggleSwitch
            label="Chef's Pick"
            checked={form.isFeatured}
            onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
            help="Adds the Chef's Pick badge on the public menu."
          />
          <ToggleSwitch
            label="Active"
            checked={form.isActive}
            onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            help="Inactive items stay here but are hidden from the public site."
          />
        </form>
      </SlidePanel>

      {/* Category order panel — each drop persists immediately */}
      <SlidePanel
        open={catPanelOpen}
        title="Order categories"
        onClose={() => setCatPanelOpen(false)}
        footer={
          <button type="button" className="admin-btn" onClick={() => setCatPanelOpen(false)}>
            Done
          </button>
        }
      >
        <p style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.55)', margin: '0 0 1rem', lineHeight: 1.5 }}>
          Drag to change the order the sections appear in on the public Menus page. Each change
          is saved immediately.
        </p>
        <SortableList
          items={categories}
          getId={(c) => c}
          getLabel={(c) => c}
          onReorder={async (orderedCategories) => {
            const res: ActionResult = await saveCategoryOrder(orderedCategories).catch(
              () => FAILED
            );
            if (res.success) {
              setCategoryOrder(orderedCategories);
              toast.success('Category order saved');
              return true;
            }
            handleFailure(res, 'Failed to save category order — reverted');
            return false;
          }}
          renderItem={(cat, { handleProps }) => (
            <>
              <DragHandle {...handleProps} />
              <span
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {cat}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', flexShrink: 0, paddingRight: '0.5rem' }}>
                {countFor(cat)} item{countFor(cat) === 1 ? '' : 's'}
              </span>
            </>
          )}
        />
      </SlidePanel>

      {/* Single delete confirmation — names the item */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title={confirmDelete ? `Delete "${confirmDelete.name}"?` : 'Delete item?'}
        body="This permanently removes the item from the public menu. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={performDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Bulk delete confirmation */}
      <ConfirmDialog
        open={bulkConfirm}
        title={`Delete ${selected.size} item${selected.size === 1 ? '' : 's'}?`}
        body="This permanently removes the selected items from the public menu. This cannot be undone."
        confirmLabel="Delete all"
        destructive
        onConfirm={performBulkDelete}
        onCancel={() => setBulkConfirm(false)}
      />
    </div>
  );
}

export default function AdminMenuClient(props: Props) {
  // ToastProvider is not mounted globally — wrap this module's client tree.
  return (
    <ToastProvider>
      <MenuManager {...props} />
    </ToastProvider>
  );
}
