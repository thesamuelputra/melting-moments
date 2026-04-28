'use client';
import { useState, useTransition, useMemo } from 'react';
import { addMenuItem, updateMenuItem, deleteMenuItem } from './actions';

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number | null;
  priceLabel: string;
  orderIndex: number;
  isActive: boolean;
  isFeatured: boolean;
};

const ALL_CATEGORIES = [
  'BREADS', 'ANTIPASTO', 'SALADS', 'STARCHES', 'VEGETABLES',
  'SEAFOOD', 'ENTREES', 'PACKAGES', 'SOIREE', 'PEASANO',
  'MEXICAN', 'BBQ', 'LUNCH', 'BREAKFAST', 'BEVERAGES'
];

const CATEGORY_CONTEXT: Record<string, { page: string; slug: string; description: string }> = {
  'BREADS':     { page: 'Catering Menus', slug: '/menus', description: 'Artisan bread selection shown on the main Menus page' },
  'ANTIPASTO':  { page: 'Catering Menus', slug: '/menus', description: 'Antipasto items displayed on the main Menus page' },
  'SALADS':     { page: 'Catering Menus', slug: '/menus', description: 'Salad options on the main Menus page' },
  'STARCHES':   { page: 'Catering Menus', slug: '/menus', description: 'Starch sides on the main Menus page' },
  'VEGETABLES': { page: 'Catering Menus', slug: '/menus', description: 'Vegetable sides on the main Menus page' },
  'SEAFOOD':    { page: 'Catering Menus', slug: '/menus', description: 'Seafood entrees on the main Menus page' },
  'ENTREES':    { page: 'Catering Menus', slug: '/menus', description: 'Main entrees on the Menus page' },
  'PACKAGES':   { page: 'Catering Menus', slug: '/menus', description: 'Full catering packages on the Menus page' },
  'SOIREE':     { page: 'Catering Menus', slug: '/menus', description: 'Soirée / cocktail offerings on the Menus page' },
  'PEASANO':    { page: 'Catering Menus', slug: '/menus', description: 'Peasano family-style menu on the Menus page' },
  'MEXICAN':    { page: 'Catering Menus', slug: '/menus', description: 'Mexican-themed options on the Menus page' },
  'BBQ':        { page: 'Catering Menus', slug: '/menus', description: 'BBQ packages on the Menus page' },
  'LUNCH':      { page: 'Catering Menus & Corporate', slug: '/menus', description: 'Lunch items shown on Menus and filtered into the Corporate page' },
  'BREAKFAST':  { page: 'Catering Menus & Corporate', slug: '/menus', description: 'Breakfast items shown on Menus and filtered into the Corporate page' },
  'BEVERAGES':  { page: 'Catering Menus', slug: '/menus', description: 'Beverage options on the Menus page' },
};

export default function AdminMenuClient({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<MenuItem>>({});
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Search & filter
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'hidden'>('all');

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const categories = Array.from(new Set([...ALL_CATEGORIES, ...initialItems.map(i => i.category)]));
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const ctx = CATEGORY_CONTEXT[activeCategory];

  // Filtered + searched items for current category
  const filtered = useMemo(() => {
    let base = items.filter(i => i.category === activeCategory);
    if (filterActive === 'active') base = base.filter(i => i.isActive);
    if (filterActive === 'hidden') base = base.filter(i => !i.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q)
      );
    }
    return base;
  }, [items, activeCategory, filterActive, search]);

  const allSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id));
  const someSelected = selected.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(i => s.delete(i.id)); return s; });
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(i => s.add(i.id)); return s; });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const startEdit = (item: MenuItem) => {
    setEditId(item.id);
    setEditData({ name: item.name, description: item.description, price: item.price, priceLabel: item.priceLabel, category: item.category, isActive: item.isActive, isFeatured: item.isFeatured });
  };

  const saveEdit = () => {
    if (!editId) return;
    const finalData = {
      ...editData,
      priceLabel: editData.price != null && editData.price > 0
        ? `$${Number(editData.price).toFixed(2)}/pp`
        : (editData.priceLabel || 'Included'),
    };
    startTransition(async () => {
      setItems(prev => prev.map(i => i.id === editId ? { ...i, ...finalData } as MenuItem : i));
      setEditId(null);
      setEditData({});
      if (editId.startsWith('new-')) {
        const result = await addMenuItem({
          category: activeCategory,
          name: editData.name || 'New Item',
          description: editData.description || '',
          price: editData.price ?? null,
          priceLabel: finalData.priceLabel,
          isActive: editData.isActive ?? true,
          isFeatured: editData.isFeatured ?? false,
        });
        setItems(prev => prev.map(i => i.id === editId ? { ...result, isActive: result.isActive ?? true } : i));
      } else {
        await updateMenuItem(editId, {
          category: editData.category || activeCategory,
          name: editData.name || '',
          description: editData.description || '',
          price: editData.price ?? null,
          priceLabel: finalData.priceLabel,
          isActive: editData.isActive ?? true,
          isFeatured: editData.isFeatured ?? false,
        });
      }
    });
  };

  const cancelEdit = () => {
    if (editId?.startsWith('new-')) setItems(prev => prev.filter(i => i.id !== editId));
    setEditId(null);
    setEditData({});
  };

  const deleteItem = (id: string) => {
    startTransition(async () => {
      setItems(prev => prev.filter(i => i.id !== id));
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
      setDeleteConfirm(null);
      if (!id.startsWith('new-')) await deleteMenuItem(id);
    });
  };

  const bulkDelete = () => {
    const ids = Array.from(selected);
    startTransition(async () => {
      setItems(prev => prev.filter(i => !ids.includes(i.id)));
      setSelected(new Set());
      setBulkDeleteConfirm(false);
      for (const id of ids) {
        if (!id.startsWith('new-')) await deleteMenuItem(id);
      }
    });
  };

  const toggleActive = (item: MenuItem) => {
    startTransition(async () => {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
      if (!item.id.startsWith('new-')) {
        await updateMenuItem(item.id, {
          category: item.category, name: item.name,
          description: item.description || '', price: item.price ?? null,
          priceLabel: item.priceLabel, orderIndex: item.orderIndex,
          isActive: !item.isActive,
        });
      }
    });
  };

  const addItem = () => {
    const newItem: MenuItem = {
      id: `new-${Date.now()}`, category: activeCategory, name: 'New Item',
      description: '', price: null, priceLabel: 'Included',
      orderIndex: items.filter(i => i.category === activeCategory).length + 1,
      isActive: true, isFeatured: false,
    };
    setItems(prev => [...prev, newItem]);
    startEdit(newItem);
  };

  return (
    <div>
      {/* Bulk delete confirmation modal */}
      {bulkDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '2rem', maxWidth: '360px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 400, marginBottom: '0.75rem' }}>Delete {selected.size} Item{selected.size !== 1 ? 's' : ''}?</h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              This will permanently remove {selected.size} menu item{selected.size !== 1 ? 's' : ''}. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="admin-btn" onClick={() => setBulkDeleteConfirm(false)}>Cancel</button>
              <button className="admin-btn" style={{ background: '#B91C1C', color: 'white', borderColor: '#B91C1C' }} onClick={bulkDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete all'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="admin-tabs" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`admin-tab ${activeCategory === cat ? 'admin-tab--active' : ''}`}
            onClick={() => { setActiveCategory(cat); cancelEdit(); setDeleteConfirm(null); setSearch(''); setSelected(new Set()); }}
          >
            {cat}
            <span style={{ marginLeft: '0.35rem', opacity: 0.4 }}>{items.filter(i => i.category === cat).length}</span>
          </button>
        ))}
      </div>

      {/* Category Context Bar */}
      {ctx && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>{ctx.description}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.3)', marginTop: '0.2rem' }}>
              Appears on: <strong style={{ color: 'rgba(0,0,0,0.5)' }}>{ctx.page}</strong>
            </div>
          </div>
          <a href={ctx.slug} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px', flexShrink: 0 }}>View live page</a>
        </div>
      )}

      {/* Toolbar: search + filter + bulk actions */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="admin-inline-input"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem', fontSize: '0.82rem' }}
          />
        </div>

        {/* Active filter */}
        <div style={{ display: 'flex', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
          {(['all', 'active', 'hidden'] as const).map(f => (
            <button key={f} onClick={() => setFilterActive(f)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: filterActive === f ? 600 : 400, background: filterActive === f ? '#111' : 'white', color: filterActive === f ? 'white' : 'rgba(0,0,0,0.5)', transition: 'all 0.15s ease', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Bulk action bar — only shown when items are selected */}
        {someSelected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(17,17,17,0.05)', borderRadius: '6px', fontSize: '0.78rem' }}>
            <span style={{ color: 'rgba(0,0,0,0.5)' }}>{selected.size} selected</span>
            <button className="admin-btn admin-btn--sm" style={{ color: '#B91C1C' }} onClick={() => setBulkDeleteConfirm(true)} disabled={isPending}>
              Delete selected
            </button>
            <button className="admin-btn admin-btn--sm" onClick={() => setSelected(new Set())} disabled={isPending}>Clear</button>
          </div>
        )}

        <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addItem} disabled={isPending} style={{ marginLeft: 'auto', flexShrink: 0 }}>
          + Add Item
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header" style={{ paddingBottom: '0.75rem' }}>
          <h3>{activeCategory} <span style={{ opacity: 0.4, fontWeight: 400, fontSize: '0.9rem' }}>({filtered.length}{search || filterActive !== 'all' ? ` of ${items.filter(i => i.category === activeCategory).length}` : ''})</span></h3>
        </div>
        <div className="admin-table-overflow">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    style={{ cursor: 'pointer', accentColor: '#111' }} title="Select all" />
                </th>
                <th style={{ width: '36px' }}>#</th>
                <th style={{ width: '50px' }}>Vis</th>
                <th style={{ width: '55px' }}>Chef Pick</th>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '13%' }}>Price</th>
                <th style={{ width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ opacity: isPending ? 0.6 : 1 }}>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(0,0,0,0.3)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3, lineHeight: 1 }}>—</div>
                      {search || filterActive !== 'all' ? (
                        <>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>No items match your filter</div>
                          <button className="admin-btn admin-btn--sm" style={{ marginTop: '0.5rem' }} onClick={() => { setSearch(''); setFilterActive('all'); }}>
                            Clear filter
                          </button>
                        </>
                      ) : (
                        <>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>No items in this category</div>
                          <div style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>Items added here appear on the <strong>{ctx?.page ?? 'Menus'}</strong> page.</div>
                          <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addItem}>+ Add first item</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((item, idx) => (
                <tr key={item.id} style={{ opacity: item.isActive || editId === item.id ? 1 : 0.4, background: selected.has(item.id) ? 'rgba(17,17,17,0.03)' : undefined }}>
                  <td>
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)}
                      style={{ cursor: 'pointer', accentColor: '#111' }} />
                  </td>
                  <td style={{ color: 'rgba(0,0,0,0.25)', fontSize: '0.75rem' }}>{String(idx + 1).padStart(2, '0')}</td>
                  <td>
                    <button onClick={() => toggleActive(item)} className="admin-btn admin-btn--sm"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: item.isActive ? '#059669' : '#6B7280' }}
                      disabled={isPending || editId === item.id}>
                      {item.isActive ? 'On' : 'Off'}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        startTransition(async () => {
                          setItems(prev => prev.map(i => i.id === item.id ? { ...i, isFeatured: !i.isFeatured } : i));
                          if (!item.id.startsWith('new-')) {
                            await updateMenuItem(item.id, {
                              category: item.category, name: item.name, description: item.description || '',
                              price: item.price ?? null, priceLabel: item.priceLabel, orderIndex: item.orderIndex,
                              isActive: item.isActive, isFeatured: !item.isFeatured,
                            });
                          }
                        });
                      }}
                      className="admin-btn admin-btn--sm"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: item.isFeatured ? '#D97706' : 'rgba(0,0,0,0.2)' }}
                      disabled={isPending || editId === item.id}>
                      {item.isFeatured ? 'Yes' : '–'}
                    </button>
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input className="admin-inline-input" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} autoFocus />
                    ) : (
                      <span className="admin-table__name">{item.name}</span>
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input className="admin-inline-input" value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)' }}>{item.description}</span>
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input className="admin-inline-input" placeholder="e.g. $9.95/pp" value={editData.priceLabel ?? ''} onChange={e => setEditData({ ...editData, priceLabel: e.target.value })} style={{ width: '110px' }} />
                    ) : (
                      <span style={{ fontWeight: 500 }}>{item.priceLabel || 'Included'}</span>
                    )}
                  </td>
                  <td>
                    {deleteConfirm === item.id ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="admin-btn admin-btn--sm" style={{ background: '#B91C1C', color: 'white', borderColor: '#B91C1C' }} onClick={() => deleteItem(item.id)} disabled={isPending}>Confirm</button>
                        <button className="admin-btn admin-btn--sm" onClick={() => setDeleteConfirm(null)} disabled={isPending}>No</button>
                      </div>
                    ) : editId === item.id ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={saveEdit} disabled={isPending}>Save</button>
                        <button className="admin-btn admin-btn--sm" onClick={cancelEdit} disabled={isPending}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="admin-btn admin-btn--sm" onClick={() => startEdit(item)} disabled={isPending}>Edit</button>
                        <button className="admin-btn admin-btn--sm" style={{ color: '#B91C1C' }} onClick={() => setDeleteConfirm(item.id)} disabled={isPending}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
