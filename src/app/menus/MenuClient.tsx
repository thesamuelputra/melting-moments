'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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

export default function MenuClient({ menuItems, disclaimer }: { menuItems: MenuItem[]; disclaimer: string }) {
  const [filter, setFilter] = useState('ALL');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll-to-top button (#22)
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hardcode the category display order for visual continuity with the design
  const order = [
    'BREADS', 'ANTIPASTO', 'SALADS', 'STARCHES', 'VEGETABLES', 
    'SEAFOOD', 'ENTREES', 'PACKAGES', 'SOIREE', 'PEASANO', 
    'MEXICAN', 'BBQ', 'LUNCH', 'BREAKFAST', 'BEVERAGES'
  ];

  // Dynamically merge any unknown categories to the end of the structural order
  const fullOrder = Array.from(new Set([...order, ...menuItems.map(m => m.category)]));
  
  // Extract unique active categories available in the database
  const availableCategories = fullOrder.filter(c => menuItems.some(m => m.category === c && m.isActive !== false));

  const formatCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      'BREADS': 'Breads',
      'ANTIPASTO': 'Antipasto Platters',
      'SALADS': 'Salads',
      'STARCHES': 'Starches',
      'VEGETABLES': 'Vegetables',
      'SEAFOOD': 'Gourmet Mirrors',
      'ENTREES': 'Chef Carved',
      'PACKAGES': 'Buffet Packages',
      'SOIREE': 'Soirée',
      'PEASANO': 'Peasano Dinner',
      'MEXICAN': 'Mexican Fiesta',
      'BBQ': 'BBQ Menus',
      'LUNCH': 'Lunch',
      'BREAKFAST': 'Breakfast',
      'BEVERAGES': 'Beverages'
    };
    return map[cat] || cat;
  };

  const filterRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to content when filter is clicked (#21)
  // Offset so the filter bar + category title remain visible
  const handleFilterClick = (cat: string) => {
    setFilter(cat);
    // Small delay to allow React to render the filtered content
    setTimeout(() => {
      if (filterRef.current) {
        const top = filterRef.current.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '8rem' }}>
      
      {/* INTERACTIVE FILTER */}
      <div ref={filterRef} className="filter-container" style={{ flexWrap: 'wrap' }}>
          <button className={`btn-outline ${filter === 'ALL' ? 'active' : ''}`} onClick={() => handleFilterClick('ALL')}>All</button>
          {availableCategories.map(cat => (
            <button key={cat} className={`btn-outline ${filter === cat ? 'active' : ''}`} onClick={() => handleFilterClick(cat)}>
              {formatCategoryName(cat)}
            </button>
          ))}
      </div>

      <div>
        {availableCategories.map((cat, groupIdx) => {
          if (filter !== 'ALL' && filter !== cat) return null;
          
          const items = menuItems.filter(m => m.category === cat && m.isActive !== false).sort((a,b) => a.orderIndex - b.orderIndex);
          if (items.length === 0) return null;

          return (
            <div key={cat} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' && groupIdx > 0 ? '4rem' : 0, borderTop: filter === 'ALL' && groupIdx > 0 ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' && groupIdx > 0 ? '3rem' : 0 }}>
                <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>{formatCategoryName(cat)}</h2>
                <span className="menu-index">{String(groupIdx + 1).padStart(2, '0')}</span>
              </div>

              {items.map((item, idx) => (
                <div key={item.id} className="menu-grid-constraint">
                  <div className="menu-index" style={{ marginTop: '6px' }}>{String(idx + 1).padStart(2, '0')}</div>
                  <div>
                    <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {item.name}
                      {item.isFeatured && (
                        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: 'var(--clr-ink)', color: 'var(--clr-bone)', padding: '0.2rem 0.5rem', marginLeft: '0.75rem', verticalAlign: 'middle', fontWeight: 600 }}>
                          Chef&apos;s Pick
                        </span>
                      )}
                    </h3>
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
      </div>

      {/* ── SERVICES NOTICE ── */}
      {filter === 'ALL' && (
        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '3rem' }}>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.8, maxWidth: '65ch' }}>
            {disclaimer}
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/contact" className="btn-solid">Book Your Event</Link>
          </div>
        </div>
      )}

      {/* Scroll to Top Button (#22) */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--clr-ink)',
            color: 'var(--clr-bone)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            animation: 'fadeIn 0.3s ease',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ↑
        </button>
      )}

    </section>
  );
}
