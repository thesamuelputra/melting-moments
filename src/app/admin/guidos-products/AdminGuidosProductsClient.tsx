'use client';

import { useMemo, useState } from 'react';
import {
  ConfirmDialog,
  DragHandle,
  EmptyState,
  NumberField,
  SelectField,
  SlidePanel,
  SortableList,
  TextField,
  ToggleSwitch,
  parseNumberField,
  useDirtyGuard,
  useToast,
} from '../_components';
import SessionExpiredToast from './SessionExpiredToast';
import {
  addGuidosProduct,
  deleteGuidosProduct,
  reorderGuidosProducts,
  updateGuidosProduct,
  type ActionResult,
  type ProductPatchInput,
} from './actions';

type Size = { label: string; price: number };

type Product = {
  id: string;
  name: string;
  category: string;
  priceFrom: number;
  sizes: Size[];
  image: string;
  isAvailable: boolean;
  isLimitedEdition: boolean;
  orderIndex: number;
};

/** Canonical Guido's categories — always offered, even when currently empty. */
const CANONICAL_CATEGORIES = ['Lasagnes', 'Pot Pies', 'Soups', 'Pasta', 'Desserts', 'Holiday'];

const NEW_CATEGORY = '__new_category__';

const FAILED: ActionResult = { success: false, error: 'failed' };

/** True when the string is a ref a plain <img> can render (site path or https URL). */
function isRenderableImage(src: string): boolean {
  return src.startsWith('/') || src.startsWith('https://');
}

function formatPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

type SizeDraft = { key: number; label: string; price: string };

type Draft = {
  name: string;
  category: string; // an existing category, or NEW_CATEGORY
  newCategory: string;
  priceFrom: string; // string-backed; only editable when there are no sizes
  sizes: SizeDraft[];
  image: string;
  isAvailable: boolean;
  isLimitedEdition: boolean;
};

let sizeKeyCounter = 0;
const nextSizeKey = () => ++sizeKeyCounter;

function draftFromProduct(product: Product | null, defaultCategory: string): Draft {
  if (!product) {
    return {
      name: '',
      category: defaultCategory,
      newCategory: '',
      priceFrom: '',
      sizes: [],
      image: '',
      isAvailable: true,
      isLimitedEdition: false,
    };
  }
  return {
    name: product.name,
    category: product.category,
    newCategory: '',
    priceFrom: String(product.priceFrom),
    sizes: product.sizes.map((s) => ({ key: nextSizeKey(), label: s.label, price: String(s.price) })),
    image: product.image,
    isAvailable: product.isAvailable,
    isLimitedEdition: product.isLimitedEdition,
  };
}

/* ------------------------------------------------------------------ */
/* Thumbnails                                                          */
/* ------------------------------------------------------------------ */

function Thumb({ image, size = 44 }: { image: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  const box: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: 6,
    border: '1px solid rgba(0,0,0,0.08)',
    overflow: 'hidden',
    background: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  if (isRenderableImage(image) && !broken) {
    return (
      <span style={box}>
        {/* Plain <img> on purpose: admin-only thumbnails may point at arbitrary
            https URLs which next/image would reject without remotePatterns. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setBroken(true)} />
      </span>
    );
  }
  return (
    <span style={box} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size * 0.4} height={size * 0.4} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 16l-5-5-8 8" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main client                                                         */
/* ------------------------------------------------------------------ */

export default function AdminGuidosProductsClient({
  initialProducts,
  libraryImages,
}: {
  initialProducts: Product[];
  libraryImages: string[];
}) {
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  // Re-sync whenever the server sends a fresh payload (revalidatePath after saves).
  const [prevInitial, setPrevInitial] = useState(initialProducts);
  if (initialProducts !== prevInitial) {
    setPrevInitial(initialProducts);
    setProducts(initialProducts);
  }

  const [activeCategory, setActiveCategory] = useState(CANONICAL_CATEGORIES[0]);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [sessionExpired, setSessionExpired] = useState(false);

  // Slide panel (create/edit)
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftFromProduct(null, CANONICAL_CATEGORIES[0]));
  const [initialDraft, setInitialDraft] = useState<Draft>(draft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [confirmingDelete, setConfirmingDelete] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  /* ---------------- categories (data ∪ canonical) ---------------- */

  const categories = useMemo(() => {
    const known = new Set(CANONICAL_CATEGORIES);
    const extras = [...new Set(products.map((p) => p.category))].filter((c) => !known.has(c)).sort();
    return [...CANONICAL_CATEGORIES, ...extras];
  }, [products]);

  const currentCategory = categories.includes(activeCategory) ? activeCategory : categories[0];

  const categoryProducts = useMemo(
    () =>
      products
        .filter((p) => p.category === currentCategory)
        .sort((a, b) => a.orderIndex - b.orderIndex || a.name.localeCompare(b.name)),
    [products, currentCategory]
  );

  const imageOptions = useMemo(() => {
    const set = new Set<string>(libraryImages);
    for (const p of products) {
      if (isRenderableImage(p.image)) set.add(p.image);
    }
    return [...set].sort();
  }, [libraryImages, products]);

  /* ---------------- shared failure handling ---------------- */

  const surfaceFailure = (res: Extract<ActionResult, { success: false }>, fallback: string) => {
    if (res.error === 'unauthorized') setSessionExpired(true);
    else toast.error(res.message ?? fallback);
  };

  const markPending = (id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  /* ---------------- row mutations (optimistic) ---------------- */

  const toggleField = async (product: Product, field: 'isAvailable' | 'isLimitedEdition') => {
    if (pendingIds.has(product.id)) return;
    const previous = product[field];
    const nextValue = !previous;
    markPending(product.id, true);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: nextValue } : p)));

    const res = await updateGuidosProduct(product.id, { [field]: nextValue }).catch(() => FAILED);
    if (res.success) {
      toast.success(
        field === 'isAvailable'
          ? nextValue
            ? `"${product.name}" marked available`
            : `"${product.name}" marked sold out`
          : nextValue
            ? `"${product.name}" marked limited edition`
            : `Limited badge removed from "${product.name}"`
      );
    } else {
      // Rollback to the snapshot value (row never moved, so index is unchanged).
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: previous } : p)));
      surfaceFailure(res, 'Could not save — change reverted');
    }
    markPending(product.id, false);
  };

  const handleReorder = async (ids: string[]): Promise<boolean> => {
    const res = await reorderGuidosProducts(currentCategory, ids).catch(() => FAILED);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => {
          const idx = ids.indexOf(p.id);
          return idx >= 0 ? { ...p, orderIndex: idx } : p;
        })
      );
      toast.success('Order saved');
      return true;
    }
    surfaceFailure(res, 'Could not save the new order — reverted');
    return false; // SortableList reverts to the pre-drag order
  };

  const handleDelete = async () => {
    const product = confirmingDelete;
    if (!product) return;
    const originalIndex = products.findIndex((p) => p.id === product.id);
    setDeleteBusy(true);
    // Optimistic removal…
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    const res = await deleteGuidosProduct(product.id).catch(() => FAILED);
    setDeleteBusy(false);
    setConfirmingDelete(null);
    if (res.success) {
      toast.success(`"${product.name}" deleted`);
    } else {
      // …restored at its ORIGINAL index on failure.
      setProducts((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(Math.max(originalIndex, 0), next.length), 0, product);
        return next;
      });
      surfaceFailure(res, 'Could not delete — product restored');
    }
  };

  /* ---------------- panel open/close ---------------- */

  const openCreate = (category: string) => {
    const d = draftFromProduct(null, category === NEW_CATEGORY ? categories[0] : category);
    setEditingProduct(null);
    setDraft(d);
    setInitialDraft(d);
    setErrors({});
    setPanelOpen(true);
  };

  const openEdit = (product: Product) => {
    const d = draftFromProduct(product, product.category);
    setEditingProduct(product);
    setDraft(d);
    setInitialDraft(d);
    setErrors({});
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setErrors({});
  };

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initialDraft), [draft, initialDraft]);
  useDirtyGuard(panelOpen && isDirty);

  /* ---------------- draft helpers ---------------- */

  const patchDraft = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const addSizeRow = () =>
    patchDraft({ sizes: [...draft.sizes, { key: nextSizeKey(), label: '', price: '' }] });

  const updateSizeRow = (index: number, patch: Partial<Pick<SizeDraft, 'label' | 'price'>>) => {
    const sizes = draft.sizes.map((s, i) => (i === index ? { ...s, ...patch } : s));
    patchDraft({ sizes });
  };

  const removeSizeRow = (index: number) =>
    patchDraft({ sizes: draft.sizes.filter((_, i) => i !== index) });

  const moveSizeRow = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.sizes.length) return;
    const sizes = [...draft.sizes];
    [sizes[index], sizes[target]] = [sizes[target], sizes[index]];
    patchDraft({ sizes });
  };

  // priceFrom is auto-derived from the lowest size price whenever sizes exist.
  const parsedSizePrices = draft.sizes.map((s) => parseNumberField(s.price));
  const allSizePricesValid =
    draft.sizes.length > 0 && parsedSizePrices.every((n) => n !== null && n > 0);
  const derivedPriceFrom = allSizePricesValid
    ? Math.min(...(parsedSizePrices as number[]))
    : null;

  /* ---------------- save ---------------- */

  const validateDraft = (): { name: string; category: string; priceFrom: number; sizes: Size[]; image: string } | null => {
    const nextErrors: Record<string, string> = {};
    const name = draft.name.trim();
    if (!name) nextErrors.name = 'Name is required';

    const category = draft.category === NEW_CATEGORY ? draft.newCategory.trim() : draft.category;
    if (draft.category === NEW_CATEGORY && !category) {
      nextErrors.newCategory = 'Enter the new category name';
    }

    const sizes: Size[] = [];
    draft.sizes.forEach((s, i) => {
      const label = s.label.trim();
      const price = parseNumberField(s.price);
      if (!label) nextErrors[`size-${i}-label`] = 'Label is required';
      if (price === null || price <= 0) nextErrors[`size-${i}-price`] = 'Must be > 0';
      if (label && price !== null && price > 0) sizes.push({ label, price });
    });

    let priceFrom: number;
    if (draft.sizes.length > 0) {
      priceFrom = derivedPriceFrom ?? 0; // size errors above already block invalid states
    } else {
      const parsed = parseNumberField(draft.priceFrom);
      if (parsed === null || parsed < 0) {
        nextErrors.priceFrom = 'Enter a valid price';
        priceFrom = 0;
      } else {
        priceFrom = parsed;
      }
    }

    const image = draft.image.trim();
    if (image && !isRenderableImage(image)) {
      nextErrors.image = 'Use a site path starting with / or an https:// URL';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;
    return { name, category, priceFrom, sizes, image };
  };

  const handleSave = async () => {
    const valid = validateDraft();
    if (!valid) return;
    setSaving(true);

    if (!editingProduct) {
      const res = await addGuidosProduct({
        name: valid.name,
        category: valid.category,
        priceFrom: valid.priceFrom,
        sizes: valid.sizes.length > 0 ? valid.sizes : undefined,
        image: valid.image || undefined,
        isAvailable: draft.isAvailable,
        isLimitedEdition: draft.isLimitedEdition,
      }).catch(() => FAILED);
      setSaving(false);
      if (res.success && res.id) {
        const siblingMax = products
          .filter((p) => p.category === valid.category)
          .reduce((max, p) => Math.max(max, p.orderIndex), -1);
        setProducts((prev) => [
          ...prev,
          {
            id: res.id!,
            name: valid.name,
            category: valid.category,
            priceFrom: valid.priceFrom,
            sizes: valid.sizes,
            image: valid.image,
            isAvailable: draft.isAvailable,
            isLimitedEdition: draft.isLimitedEdition,
            orderIndex: siblingMax + 1,
          },
        ]);
        setActiveCategory(valid.category);
        toast.success(`"${valid.name}" added`);
        closePanel();
      } else if (!res.success) {
        surfaceFailure(res, 'Could not add the product');
      }
      return;
    }

    // Edit: send ONLY changed fields — the backend is partial-patch.
    const original = editingProduct;
    const patch: ProductPatchInput = {};
    if (valid.name !== original.name) patch.name = valid.name;
    if (valid.category !== original.category) patch.category = valid.category;
    if (valid.priceFrom !== original.priceFrom) patch.priceFrom = valid.priceFrom;
    if (JSON.stringify(valid.sizes) !== JSON.stringify(original.sizes)) {
      patch.sizes = valid.sizes.length > 0 ? valid.sizes : null;
    }
    if (valid.image !== original.image) patch.image = valid.image || null;
    if (draft.isAvailable !== original.isAvailable) patch.isAvailable = draft.isAvailable;
    if (draft.isLimitedEdition !== original.isLimitedEdition) patch.isLimitedEdition = draft.isLimitedEdition;

    if (Object.keys(patch).length === 0) {
      setSaving(false);
      toast.info('No changes to save');
      closePanel();
      return;
    }

    const res = await updateGuidosProduct(original.id, patch).catch(() => FAILED);
    setSaving(false);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === original.id
            ? {
                ...p,
                name: valid.name,
                category: valid.category,
                priceFrom: valid.priceFrom,
                sizes: valid.sizes,
                image: valid.image,
                isAvailable: draft.isAvailable,
                isLimitedEdition: draft.isLimitedEdition,
              }
            : p
        )
      );
      if (valid.category !== original.category) setActiveCategory(valid.category);
      toast.success(`"${valid.name}" updated`);
      closePanel();
    } else {
      surfaceFailure(res, 'Could not save the product');
    }
  };

  /* ---------------- render ---------------- */

  const categorySelectOptions = [
    ...categories.map((c) => ({ value: c, label: c })),
    { value: NEW_CATEGORY, label: 'New category…' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guido&apos;s Products</h2>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            {products.length} products · drag rows to change the order shown on the public menu
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => openCreate(currentCategory)}>
          + Add Product
        </button>
      </div>

      {/* Category tabs (canonical ∪ whatever exists in the data) */}
      <div className="admin-tabs" role="tablist" aria-label="Product categories">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          const active = cat === currentCategory;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={active}
              className={`admin-tab${active ? ' admin-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Product list for the active category */}
      {categoryProducts.length === 0 ? (
        <EmptyState
          title={`No products in ${currentCategory} yet`}
          body="Products you add to this category appear on the public Guido's menu in the order shown here."
          action={
            <button className="admin-btn admin-btn--primary" onClick={() => openCreate(currentCategory)}>
              + Add to {currentCategory}
            </button>
          }
        />
      ) : (
        <SortableList
          items={categoryProducts}
          getId={(p) => p.id}
          getLabel={(p) => p.name}
          onReorder={handleReorder}
          renderItem={(p, { handleProps }) => {
            const pending = pendingIds.has(p.id);
            return (
              <>
                <DragHandle {...handleProps} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', opacity: pending ? 0.6 : 1 }}>
                  <Thumb image={p.image} />
                  <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <span className="admin-table__name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                      {p.isLimitedEdition && (
                        <span style={{ flexShrink: 0, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em', background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.4rem', borderRadius: 3 }}>
                          LIMITED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      From {formatPrice(p.priceFrom)}
                      {p.sizes.length > 0 && ` · ${p.sizes.length} size${p.sizes.length > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: p.isAvailable ? '#065F46' : '#991B1B', minWidth: 58, textAlign: 'right' }}>
                      {p.isAvailable ? 'Available' : 'Sold out'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.isAvailable}
                      aria-label={`Available: ${p.name}`}
                      className="admin-switch"
                      disabled={pending}
                      onClick={() => toggleField(p, 'isAvailable')}
                    >
                      <span className="admin-switch__knob" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-pressed={p.isLimitedEdition}
                      className="admin-btn admin-btn--sm"
                      disabled={pending}
                      onClick={() => toggleField(p, 'isLimitedEdition')}
                      style={p.isLimitedEdition ? { background: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' } : undefined}
                      title={p.isLimitedEdition ? 'Remove the limited-edition badge' : 'Mark as limited edition'}
                    >
                      Limited
                    </button>
                    <button className="admin-btn admin-btn--sm" disabled={pending} onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      disabled={pending}
                      onClick={() => setConfirmingDelete(p)}
                      aria-label={`Delete ${p.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            );
          }}
        />
      )}

      {/* Create / Edit panel */}
      <SlidePanel
        open={panelOpen}
        title={editingProduct ? `Edit: ${editingProduct.name}` : 'New Product'}
        dirty={isDirty}
        onClose={closePanel}
        footer={
          <>
            <button className="admin-btn" onClick={closePanel} disabled={saving}>
              Cancel
            </button>
            <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editingProduct ? 'Save changes' : 'Add product'}
            </button>
          </>
        }
      >
        <TextField label="Name" required value={draft.name} onChange={(v) => patchDraft({ name: v })} error={errors.name} />

        <SelectField
          label="Category"
          required
          value={draft.category}
          onChange={(v) => patchDraft({ category: v })}
          options={categorySelectOptions}
        />
        {draft.category === NEW_CATEGORY && (
          <TextField
            label="New category name"
            required
            value={draft.newCategory}
            onChange={(v) => patchDraft({ newCategory: v })}
            error={errors.newCategory}
            help="Creates the category as soon as this product is saved."
          />
        )}

        {/* Price — derived from sizes when they exist */}
        {draft.sizes.length > 0 ? (
          <div className="admin-field">
            <span className="admin-field__label">From price</span>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              {derivedPriceFrom !== null ? (
                <>
                  <strong>{formatPrice(derivedPriceFrom)}</strong>
                  <span style={{ color: '#6B7280' }}> — derived automatically from the lowest size price.</span>
                </>
              ) : (
                <span style={{ color: '#6B7280' }}>
                  Will be derived from the lowest size price once every size has a valid price.
                </span>
              )}
            </p>
          </div>
        ) : (
          <NumberField
            label="From price ($)"
            required
            value={draft.priceFrom}
            onChange={(v) => patchDraft({ priceFrom: v })}
            error={errors.priceFrom}
            help="Shown as “From $X” on the menu. Add size variants below to derive it automatically."
          />
        )}

        {/* Sizes editor */}
        <div className="admin-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="admin-field__label" style={{ marginBottom: 0 }}>Size variants</span>
            <button type="button" className="admin-btn admin-btn--sm" onClick={addSizeRow}>
              + Add size
            </button>
          </div>
          {draft.sizes.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.5rem 0 0' }}>
              No sizes — the product is sold at the single “from” price above.
            </p>
          )}
          {draft.sizes.map((size, i) => (
            <div key={size.key} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '0.75rem' }}>
              <div style={{ flex: 2, minWidth: 0 }}>
                <TextField
                  label={`Size ${i + 1} label`}
                  required
                  value={size.label}
                  onChange={(v) => updateSizeRow(i, { label: v })}
                  error={errors[`size-${i}-label`]}
                  placeholder="e.g. Family (4-6)"
                />
              </div>
              <div style={{ flex: 1, minWidth: 90 }}>
                <NumberField
                  label="Price ($)"
                  required
                  value={size.price}
                  onChange={(v) => updateSizeRow(i, { price: v })}
                  error={errors[`size-${i}-price`]}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', paddingTop: '1.45rem', flexShrink: 0 }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  onClick={() => moveSizeRow(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move size ${i + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  onClick={() => moveSizeRow(i, 1)}
                  disabled={i === draft.sizes.length - 1}
                  aria-label={`Move size ${i + 1} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => removeSizeRow(i)}
                  aria-label={`Remove size ${i + 1}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Image picker */}
        <div className="admin-field">
          <span className="admin-field__label">Image</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Thumb image={draft.image.trim()} size={72} />
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
              {draft.image.trim()
                ? isRenderableImage(draft.image.trim())
                  ? draft.image.trim()
                  : 'Not a usable image reference'
                : 'No image selected — the site shows a neutral placeholder.'}
            </p>
          </div>
          {imageOptions.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {imageOptions.map((src) => {
                const selected = draft.image.trim() === src;
                return (
                  <button
                    key={src}
                    type="button"
                    className="admin-btn"
                    onClick={() => patchDraft({ image: selected ? '' : src })}
                    aria-pressed={selected}
                    aria-label={selected ? `Deselect image ${src}` : `Use image ${src}`}
                    title={src}
                    style={{
                      padding: 2,
                      height: 'auto',
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: selected ? 'var(--clr-ink, #111)' : 'rgba(0,0,0,0.08)',
                      background: 'white',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                  </button>
                );
              })}
            </div>
          )}
          <TextField
            label="Image path or URL"
            value={draft.image}
            onChange={(v) => patchDraft({ image: v })}
            error={errors.image}
            placeholder="/guidos/dish.webp or https://…"
            help="Site-relative paths (/…) or https:// URLs. Leave blank for no image."
          />
        </div>

        <ToggleSwitch
          label="Available"
          checked={draft.isAvailable}
          onChange={(v) => patchDraft({ isAvailable: v })}
          help="Off = shown as sold out on the public menu."
        />
        <ToggleSwitch
          label="Limited edition"
          checked={draft.isLimitedEdition}
          onChange={(v) => patchDraft({ isLimitedEdition: v })}
          help="Shows the LIMITED badge on the public menu."
        />
      </SlidePanel>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmingDelete !== null}
        title="Delete product?"
        body={
          confirmingDelete
            ? `“${confirmingDelete.name}” will be removed from the public Guido's menu permanently. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(null)}
      />

      <SessionExpiredToast open={sessionExpired} />
    </div>
  );
}
