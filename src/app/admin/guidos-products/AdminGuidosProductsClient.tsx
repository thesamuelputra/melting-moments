'use client';

import { useState } from 'react';
import { addGuidosProduct, updateGuidosProduct, deleteGuidosProduct } from './actions';

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

const CATEGORIES = ['Lasagnes', 'Pot Pies', 'Soups', 'Pasta', 'Desserts', 'Holiday'];

const emptyProduct = (): Omit<Product, 'id'> => ({
  name: '',
  category: 'Lasagnes',
  priceFrom: 0,
  sizes: [],
  image: '',
  isAvailable: true,
  isLimitedEdition: false,
  orderIndex: 0,
});

export default function AdminGuidosProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct());
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  const filtered = filterCategory === 'All' ? products : products.filter(p => p.category === filterCategory);

  const handleAdd = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    try {
      const newItem = await addGuidosProduct(form);
      setProducts([...products, newItem as Product]);
      setForm(emptyProduct());
      setShowAddForm(false);
    } catch (e) {
      console.error('Failed to add product:', e);
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name) return;
    setSaving(true);
    try {
      await updateGuidosProduct(editingId, form);
      setProducts(products.map(p => p.id === editingId ? { ...form, id: editingId } : p));
      setEditingId(null);
      setForm(emptyProduct());
    } catch (e) {
      console.error('Failed to update product:', e);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteGuidosProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      console.error('Failed to delete product:', e);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setShowAddForm(false);
    setForm({
      name: product.name,
      category: product.category,
      priceFrom: product.priceFrom,
      sizes: product.sizes,
      image: product.image,
      isAvailable: product.isAvailable,
      isLimitedEdition: product.isLimitedEdition,
      orderIndex: product.orderIndex,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setForm(emptyProduct());
  };

  // Size management helpers
  const addSize = () => {
    setForm({ ...form, sizes: [...form.sizes, { label: '', price: 0 }] });
  };
  const updateSize = (index: number, field: 'label' | 'price', value: string | number) => {
    const newSizes = [...form.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setForm({ ...form, sizes: newSizes });
  };
  const removeSize = (index: number) => {
    setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== index) });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #E5E7EB',
    borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Guido&apos;s Products</h1>
          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{products.length} products across {new Set(products.map(p => p.category)).size} categories</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => { setShowAddForm(true); setEditingId(null); setForm(emptyProduct()); }}>
          + Add Product
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`admin-btn admin-btn--sm ${filterCategory === cat ? 'admin-btn--primary' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      {(showAddForm || editingId) && (
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editingId ? 'Edit Product' : 'Add Product'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Name *</span>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Category *</span>
              <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Price From ($) *</span>
              <input type="number" step="0.01" min="0" style={inputStyle} value={form.priceFrom} onChange={e => setForm({ ...form, priceFrom: parseFloat(e.target.value) || 0 })} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Image Path</span>
              <input style={inputStyle} placeholder="/guidos/product-name.webp" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Sort Order</span>
              <input type="number" style={inputStyle} value={form.orderIndex} onChange={e => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })} />
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingTop: '1.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
                Available
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={form.isLimitedEdition} onChange={e => setForm({ ...form, isLimitedEdition: e.target.checked })} />
                Limited Edition
              </label>
            </div>
          </div>

          {/* Sizes */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Size Variants</span>
              <button className="admin-btn admin-btn--sm" onClick={addSize}>+ Add Size</button>
            </div>
            {form.sizes.map((size, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input style={{ ...inputStyle, flex: 2 }} placeholder="e.g. Family (4-6)" value={size.label} onChange={e => updateSize(i, 'label', e.target.value)} />
                <input type="number" step="0.01" style={{ ...inputStyle, flex: 1 }} placeholder="Price" value={size.price} onChange={e => updateSize(i, 'price', parseFloat(e.target.value) || 0)} />
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeSize(i)}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="admin-btn admin-btn--primary" onClick={editingId ? handleUpdate : handleAdd} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            <button className="admin-btn" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sizes</th>
              <th>Status</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong>{product.name}</strong>
                  {product.isLimitedEdition && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                      LIMITED
                    </span>
                  )}
                </td>
                <td>{product.category}</td>
                <td>${product.priceFrom.toFixed(2)}</td>
                <td>{product.sizes.length > 0 ? product.sizes.map(s => s.label).join(', ') : '—'}</td>
                <td>
                  <span style={{
                    fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                    background: product.isAvailable ? '#D1FAE5' : '#FEE2E2',
                    color: product.isAvailable ? '#065F46' : '#991B1B',
                  }}>
                    {product.isAvailable ? 'Available' : 'Sold Out'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="admin-btn admin-btn--sm" onClick={() => startEdit(product)}>Edit</button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
