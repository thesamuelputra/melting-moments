'use client';
import { useState, useTransition } from 'react';
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

// All 15 categories matching the public menu display
const ALL_CATEGORIES = [
  'BREADS', 'ANTIPASTO', 'SALADS', 'STARCHES', 'VEGETABLES',
  'SEAFOOD', 'ENTREES', 'PACKAGES', 'SOIREE', 'PEASANO',
  'MEXICAN', 'BBQ', 'LUNCH', 'BREAKFAST', 'BEVERAGES'
];

// Contextual map — tells admin WHERE each category lives on the site
const CATEGORY_CONTEXT: Record<string, { page: string; slug: string; description: string }> = {
  'BREADS':     { page: 'Catering Menus', slug: '/menus', description: 'Artisan bread selection shown on the main Menus page' },
  'ANTIPASTO':  { page: 'Catering Menus', slug: '/menus', description: 'Antipasto items displayed on the main Menus page' },
  'SALADS':     { page: 'Catering Menus', slug: '/menus', description: 'Salad options on the main Menus page' },
  'STARCHES':   { page: 'Catering Menus', slug: '/menus', description: 'Starch sides on the main Menus page' },
  'VEGETABLES': { page: 'Catering Menus', slug: '/menus', description: 'Vegetable sides on the main Menus page' },
  'SEAFOOD':    { page: 'Catering Menus', slug: '/menus', description: 'Seafood entrees on the main Menus page' },
  'ENTREES':    { page: 'Catering Menus', slug: '/menus', description: 'Main entrees on the Menus page' },
  'PACKAGES':   { page: 'Catering Menus', slug: '/menus', description: 'Full catering packages on the Menus page' },
  'SOIREE':     { page: 'Catering Menus', slug: '/menus', description: 'Soiree/cocktail offerings on the Menus page' },
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

  const categories = Array.from(new Set([...ALL_CATEGORIES, ...initialItems.map(i => i.category)]));
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const ctx = CATEGORY_CONTEXT[activeCategory];

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
    if (editId?.startsWith('new-')) {
      setItems(prev => prev.filter(i => i.id !== editId));
    }
    setEditId(null);
    setEditData({});
  };

  const deleteItem = (id: string) => {
    startTransition(async () => {
      setItems(prev => prev.filter(i => i.id !== id));
      setDeleteConfirm(null);
      if (!id.startsWith('new-')) {
        await deleteMenuItem(id);
      }
    });
  };

  const toggleActive = (item: MenuItem) => {
    startTransition(async () => {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
      if (!item.id.startsWith('new-')) {
        await updateMenuItem(item.id, {
          category: item.category,
          name: item.name,
          description: item.description || '',
          price: item.price ?? null,
          priceLabel: item.priceLabel,
          orderIndex: item.orderIndex,
          isActive: !item.isActive,
        });
      }
    });
  };

  const addItem = () => {
    const newItem: MenuItem = {
      id: `new-${Date.now()}`,
      category: activeCategory,
      name: 'New Item',
      description: '',
      price: null,
      priceLabel: 'Included',
      orderIndex: items.filter(i => i.category === activeCategory).length + 1,
      isActive: true,
      isFeatured: false,
    };
    setItems(prev => [...prev, newItem]);
    startEdit(newItem);
  };

  const filtered = items.filter(i => i.category === activeCategory);

  return (
    <div>
      {/* Category Tabs */}
      <div className="admin-tabs" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`admin-tab ${activeCategory === cat ? 'admin-tab--active' : ''}`}
            onClick={() => { setActiveCategory(cat); cancelEdit(); setDeleteConfirm(null); }}
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
            <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
              {ctx.description}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.3)', marginTop: '0.2rem' }}>
              Appears on: <strong style={{ color: 'rgba(0,0,0,0.5)' }}>{ctx.page}</strong>
            </div>
          </div>
          <a href={ctx.slug} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline', textUnderlineOffset: '2px', flexShrink: 0 }}>View live page</a>
        </div>
      )}

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h3>{activeCategory} ({filtered.length})</h3>
          <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addItem} disabled={isPending}>+ Add Item</button>
        </div>
        <div className="admin-table-overflow">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '50px' }}>Vis</th>
                <th style={{ width: '55px' }}>Featured</th>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '15%' }}>Price Label</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ opacity: isPending ? 0.6 : 1 }}>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.3)' }}>
                    No items in this category yet. Click &quot;+ Add Item&quot; to create one.
                  </td>
                </tr>
              )}
              {filtered.map((item, idx) => (
                <tr key={item.id} style={{ opacity: item.isActive || editId === item.id ? 1 : 0.4 }}>
                  <td style={{ color: 'rgba(0,0,0,0.25)', fontSize: '0.75rem' }}>{String(idx + 1).padStart(2, '0')}</td>
                  <td>
                    <button 
                      onClick={() => toggleActive(item)}
                      className="admin-btn admin-btn--sm"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: item.isActive ? '#059669' : '#6B7280' }}
                      title={item.isActive ? 'Hide Item' : 'Show Item'}
                      disabled={isPending || editId === item.id}
                    >
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
                      title={item.isFeatured ? 'Remove Chef Pick' : 'Set as Chef Pick'}
                      disabled={isPending || editId === item.id}
                    >
                      {item.isFeatured ? 'Yes' : '–'}
                    </button>
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input
                        className="admin-inline-input"
                        value={editData.name || ''}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <span className="admin-table__name">{item.name}</span>
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input
                        className="admin-inline-input"
                        value={editData.description || ''}
                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                      />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)' }}>{item.description}</span>
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <input
                        className="admin-inline-input"
                        placeholder="e.g. $9.95/pp or Included"
                        value={editData.priceLabel ?? ''}
                        onChange={e => setEditData({ ...editData, priceLabel: e.target.value })}
                        style={{ width: '120px' }}
                      />
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
