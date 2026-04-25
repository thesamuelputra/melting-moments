'use client';

import { useState } from 'react';

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number | null;
  priceLabel: string;
  orderIndex: number;
};

export default function CorporateMenuClient({ menuItems }: { menuItems: MenuItem[] }) {
  const [filter, setFilter] = useState('ALL');

  // Corporate categories from the database
  const categoryOrder = ['BREAKFAST', 'LUNCH'];
  const availableCategories = categoryOrder.filter(c => menuItems.some(m => m.category === c));

  const formatCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      'BREAKFAST': 'Breakfast Goodies',
      'LUNCH': 'Lunch Menu',
    };
    return map[cat] || cat;
  };

  const getCategoryTag = (cat: string) => {
    const map: Record<string, string> = {
      'BREAKFAST': 'AM',
      'LUNCH': 'PM',
    };
    return map[cat] || '';
  };

  return (
    <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '8rem' }}>
      
      {/* INTERACTIVE FILTER */}
      <div className="filter-container">
        <button className={`btn-outline ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>Complete Menu</button>
        {availableCategories.map(cat => (
          <button key={cat} className={`btn-outline ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
            {formatCategoryName(cat)}
          </button>
        ))}
      </div>

      {/* Dynamic menu sections from database */}
      {availableCategories.map((cat, groupIdx) => {
        if (filter !== 'ALL' && filter !== cat) return null;
        
        const items = menuItems.filter(m => m.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);
        if (items.length === 0) return null;

        return (
          <div key={cat} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' && groupIdx > 0 ? '4rem' : filter === 'ALL' ? '3rem' : 0, borderTop: filter === 'ALL' && groupIdx > 0 ? '1px solid rgba(0,0,0,0.1)' : 'none', paddingTop: filter === 'ALL' && groupIdx > 0 ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>{formatCategoryName(cat)}</h2>
              <span className="menu-index">{getCategoryTag(cat)}</span>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="menu-grid-constraint">
                <div className="menu-index" style={{ marginTop: '6px' }}>{String(idx + 1).padStart(2, '0')}</div>
                <div>
                  <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{item.name}</h3>
                  {item.description && <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>{item.description}</p>}
                </div>
                {item.priceLabel && (
                  <div className="menu-price" style={{ textAlign: 'right', marginTop: '6px', alignSelf: 'start', marginLeft: 'auto' }}>
                    {item.priceLabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}
