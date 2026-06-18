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

// Items priced this way carry no distinct figure — they are bundled into the
// package/per-person rate. We surface this once per section as a quiet note
// instead of repeating the same bold word on every row.
const INCLUDED_LABEL = 'Included';
const isIncluded = (label: string) => label.trim().toLowerCase() === INCLUDED_LABEL.toLowerCase();

export default function MenuClient({ menuItems, disclaimer }: { menuItems: MenuItem[]; disclaimer: string }) {
  const [filter, setFilter] = useState('ALL');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Show/hide scroll-to-top button (#22)
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track viewport so the sticky desktop index only mounts where there is room
  // for it. On mobile the horizontal filter rail already serves navigation.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
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

  const sectionId = (cat: string) => `menu-${cat.toLowerCase()}`;

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

  // Jump from the sticky index to a section. The anchor href is the no-JS
  // fallback; this handler resets any active filter first so the target
  // section actually exists in the DOM, then scrolls with a header offset.
  const handleIndexClick = (e: React.MouseEvent<HTMLAnchorElement>, cat: string) => {
    e.preventDefault();
    const scrollToSection = () => {
      const el = document.getElementById(sectionId(cat));
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    if (filter !== 'ALL') {
      setFilter('ALL');
      setTimeout(scrollToSection, 60);
    } else {
      scrollToSection();
    }
  };

  // Lightweight scroll-spy: highlight the section currently in view within the
  // sticky index. Only subscribes when the full list is shown on desktop;
  // state is only updated from the observer callback (an external event), and
  // the highlight is otherwise suppressed at render time below.
  useEffect(() => {
    if (!isDesktop || filter !== 'ALL') return;
    const sections = availableCategories
      .map(cat => document.getElementById(sectionId(cat)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(en => en.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-100px 0px -65% 0px', threshold: 0 }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [isDesktop, filter, availableCategories]);

  // Only trust the scroll-spy highlight when the full list is shown on desktop;
  // otherwise the active marker follows the explicit filter selection.
  const spyActive = isDesktop && filter === 'ALL' ? activeSection : null;

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

      {/* Two-column shell: a sticky category index occupies the otherwise-empty
          left margin on desktop; the menu column holds the existing content.
          On mobile only the menu column renders (the filter rail above serves
          navigation), so the layout collapses to its original single column. */}
      <div
        style={
          isDesktop
            ? { display: 'grid', gridTemplateColumns: 'minmax(180px, 240px) 1fr', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'start' }
            : undefined
        }
      >
        {/* STICKY CATEGORY INDEX (desktop only) */}
        {isDesktop && (
          <nav aria-label="Menu sections" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
            <div className="menu-index" style={{ marginBottom: '1.5rem' }}>Sections</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {availableCategories.map((cat, i) => {
                const current = filter === 'ALL' ? spyActive === sectionId(cat) : filter === cat;
                return (
                  <li key={cat} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <span className="menu-index" style={{ opacity: current ? 1 : 0.4 }}>{String(i + 1).padStart(2, '0')}</span>
                    <a
                      href={`#${sectionId(cat)}`}
                      onClick={(e) => handleIndexClick(e, cat)}
                      className="noire-serif"
                      style={{
                        fontSize: 'var(--text-body)',
                        lineHeight: 1.3,
                        color: 'var(--clr-ink)',
                        textDecoration: 'none',
                        opacity: current ? 1 : 0.55,
                        borderBottom: current ? '1px solid var(--clr-ink)' : '1px solid transparent',
                        paddingBottom: '2px',
                        transition: 'opacity 0.2s ease, border-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = current ? '1' : '0.55'; }}
                    >
                      {formatCategoryName(cat)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* MENU COLUMN */}
        <div>
          {availableCategories.map((cat, groupIdx) => {
            if (filter !== 'ALL' && filter !== cat) return null;

            const items = menuItems.filter(m => m.category === cat && m.isActive !== false).sort((a,b) => a.orderIndex - b.orderIndex);
            if (items.length === 0) return null;

            // If the section carries no distinct figures (everything bundled in
            // the package rate), note that once instead of on every row.
            const allIncluded = items.every(i => !i.priceLabel || isIncluded(i.priceLabel));
            const showTopBorder = filter === 'ALL' && groupIdx > 0;

            return (
              <div key={cat} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div
                  id={sectionId(cat)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: allIncluded ? '1.5rem' : '3rem', marginTop: showTopBorder ? '4rem' : 0, borderTop: showTopBorder ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: showTopBorder ? '3rem' : 0, scrollMarginTop: '100px' }}
                >
                  <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>{formatCategoryName(cat)}</h2>
                  <span className="menu-index">{String(groupIdx + 1).padStart(2, '0')}</span>
                </div>

                {/* Single quiet note for sections with no per-item pricing */}
                {allIncluded && (
                  <p className="menu-index" style={{ opacity: 0.45, marginBottom: '2rem', textTransform: 'uppercase' }}>
                    Included in package pricing
                  </p>
                )}

                {items.map((item) => {
                  const included = !item.priceLabel || isIncluded(item.priceLabel);
                  return (
                    <div key={item.id} className="menu-grid-constraint">
                      {/* Per-row section numbering removed — the section header
                          carries the single index marker. Spacer keeps the
                          existing 3-column reading grid aligned. */}
                      <div aria-hidden="true" />
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
                      {/* Real figures only. "Included" rows in a mixed section
                          get a small muted caption; sections that are entirely
                          "Included" carry the note above instead. */}
                      {item.priceLabel && !included && (
                        <div className="menu-price" style={{ textAlign: 'right', marginTop: '6px', alignSelf: 'start', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"', whiteSpace: 'nowrap' }}>
                          {item.priceLabel}
                        </div>
                      )}
                      {item.priceLabel && included && !allIncluded && (
                        <div className="menu-index" style={{ textAlign: 'right', marginTop: '8px', alignSelf: 'start', marginLeft: 'auto', opacity: 0.45 }}>
                          Included
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
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

      {/* STICKY "GET A QUOTE" CTA — converts intent mid-scroll, not only at the
          page bottom. Sits above the scroll-to-top control so they never
          collide. */}
      <Link
        href="/contact"
        className="btn-solid"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: showScrollTop ? '5.5rem' : '2rem',
          zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          borderRadius: '999px',
          padding: '0.85rem 1.5rem',
          transition: 'right 0.25s ease, transform 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        Get a Quote
      </Link>

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
