'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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

// Items priced this way carry no distinct figure; they are bundled into the
// package/per-person rate. We surface this once per section as a quiet note
// instead of repeating the same bold word on every row.
const INCLUDED_LABEL = 'Included';
const isIncluded = (label: string) => label.trim().toLowerCase() === INCLUDED_LABEL.toLowerCase();

export default function MenuClient({ menuItems, disclaimer, categoryOrder }: { menuItems: MenuItem[]; disclaimer: string; categoryOrder?: string[] }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fade the floating controls out when the footer scrolls into view so
  // they never sit over the legal links / © line.
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      (entries) => setFooterVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Track viewport so the sticky desktop index only mounts where there is room
  // for it. On mobile the menu reads top-to-bottom like a printed menu.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Category display order: CMS-managed (menu_category_order setting, threaded
  // from the server page) with the original hardcoded order as a fallback.
  // Memoized so the scroll-spy effect below sees referentially stable inputs
  // and only re-subscribes when the menu data actually changes.
  const fullOrder = useMemo(() => {
    const order = categoryOrder && categoryOrder.length > 0 ? categoryOrder : [
      'BREADS', 'ANTIPASTO', 'SALADS', 'STARCHES', 'VEGETABLES',
      'SEAFOOD', 'ENTREES', 'PACKAGES', 'SOIREE', 'PEASANO',
      'MEXICAN', 'BBQ', 'LUNCH', 'BREAKFAST', 'BEVERAGES'
    ];
    // Dynamically merge any unknown categories to the end of the structural order
    return Array.from(new Set([...order, ...menuItems.map(m => m.category)]));
  }, [menuItems, categoryOrder]);

  // Extract unique active categories available in the database
  const availableCategories = useMemo(
    () => fullOrder.filter(c => menuItems.some(m => m.category === c && m.isActive !== false)),
    [fullOrder, menuItems]
  );

  // Per-category item lists, filtered to active rows and sorted once per data change
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const cat of availableCategories) {
      map.set(cat, menuItems.filter(m => m.category === cat && m.isActive !== false).sort((a, b) => a.orderIndex - b.orderIndex));
    }
    return map;
  }, [availableCategories, menuItems]);

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

  // Jump from the sticky index to a section. The anchor href is the no-JS
  // fallback; this handler scrolls with an offset matching the actual fixed
  // chrome (nav + banner + mobile rail), so headers never land underneath it.
  const handleIndexClick = (e: React.MouseEvent<HTMLAnchorElement>, cat: string) => {
    e.preventDefault();
    const el = document.getElementById(sectionId(cat));
    if (el) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rail = railRef.current;
      const railPinned = rail && getComputedStyle(rail).display !== 'none';
      const offset = railPinned ? rail.getBoundingClientRect().height + 63 + 16 : 100;
      const banner = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--banner-height')) || 0;
      const top = el.getBoundingClientRect().top + window.scrollY - offset - banner;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  };

  // Scroll-spy: the active section is the last header at or above the reading
  // line (140px under the fixed nav), so exactly one chip/index entry is lit
  // even mid-section. Drives the sticky index (desktop) and the rail (mobile).
  // rAF-throttled; setState with an unchanged value is a no-op re-render-wise.
  useEffect(() => {
    const ids = availableCategories.map(cat => sectionId(cat));
    let ticking = false;
    const update = () => {
      ticking = false;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 140) current = id;
        else break; // sections are in DOM order; the rest are below the line
      }
      setActiveSection(current ?? ids[0] ?? null);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, [availableCategories]);

  const spyActive = activeSection;

  // Keep the active chip visible inside the mobile rail as the user scrolls
  const railRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (isDesktop || !spyActive || !railRef.current) return;
    const chip = railRef.current.querySelector<HTMLAnchorElement>(`a[href="#${spyActive}"]`);
    if (!chip) return;
    const rail = railRef.current;
    const target = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollTo({ left: Math.max(0, target), behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [spyActive, isDesktop]);

  return (
    <section className="container" style={{ paddingTop: 'clamp(1rem, 2vw, 2rem)', paddingBottom: '8rem' }}>

      {/* Mobile section rail: sticky anchors under the nav (hidden on
          desktop via CSS, where the sticky left index takes over). */}
      <nav ref={railRef} aria-label="Menu sections" className="menu-rail">
        {availableCategories.map(cat => (
          <a
            key={cat}
            href={`#${sectionId(cat)}`}
            className={spyActive === sectionId(cat) ? 'menu-rail__active' : undefined}
            onClick={(e) => handleIndexClick(e, cat)}
          >
            {formatCategoryName(cat)}
          </a>
        ))}
      </nav>

      {/* Two-column shell: a sticky category index occupies the otherwise-empty
          left margin on desktop; the menu column holds the existing content.
          On mobile only the menu column renders, so the layout collapses to a
          single column that reads top-to-bottom like a printed menu. */}
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
                const current = spyActive === sectionId(cat);
                return (
                  <li key={cat} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <span className="menu-index" style={{ opacity: current ? 1 : 0.75 }}>{String(i + 1).padStart(2, '0')}</span>
                    <a
                      href={`#${sectionId(cat)}`}
                      onClick={(e) => handleIndexClick(e, cat)}
                      className={`noire-serif menu-index-link${current ? ' is-current' : ''}`}
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
            const items = itemsByCategory.get(cat) ?? [];
            if (items.length === 0) return null;

            // If the section carries no distinct figures (everything bundled in
            // the package rate), note that once instead of on every row.
            const allIncluded = items.every(i => !i.priceLabel || isIncluded(i.priceLabel));
            const showTopBorder = groupIdx > 0;

            return (
              <div key={cat} style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div
                  id={sectionId(cat)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: allIncluded ? '1.5rem' : '3rem', marginTop: showTopBorder ? '4rem' : 0, borderTop: showTopBorder ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: showTopBorder ? '3rem' : 0, scrollMarginTop: 'calc(var(--banner-height, 0px) + 130px)' }}
                >
                  <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>{formatCategoryName(cat)}</h2>
                  <span className="menu-index">{String(groupIdx + 1).padStart(2, '0')}</span>
                </div>

                {/* Single quiet note for sections with no per-item pricing */}
                {allIncluded && (
                  <p className="menu-index" style={{ marginBottom: '2rem', textTransform: 'uppercase' }}>
                    Included in package pricing
                  </p>
                )}

                {items.map((item) => {
                  const included = !item.priceLabel || isIncluded(item.priceLabel);
                  return (
                    <div key={item.id} className="menu-grid-constraint">
                      {/* The empty first cell keeps the 3-column reading grid
                          aligned; the section header carries the index marker. */}
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
                        <div className="menu-index" style={{ textAlign: 'right', marginTop: '8px', alignSelf: 'start', marginLeft: 'auto' }}>
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

      {/* ===== Services notice ===== */}
      <div style={{ marginTop: '4rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '3rem' }}>
        <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.8, maxWidth: '65ch' }}>
          {disclaimer}
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/contact" className="btn-solid">Book Your Event</Link>
        </div>
      </div>

      {/* Sticky "Get a Quote" CTA, offset so it never collides with the
          scroll-to-top control. */}
      <Link
        href="/contact"
        className="btn-solid btn-solid--stay"
        tabIndex={footerVisible ? -1 : 0}
        aria-hidden={footerVisible}
        style={{
          position: 'fixed',
          bottom: 'calc(2rem + env(safe-area-inset-bottom))',
          right: showScrollTop ? '5.5rem' : '2rem',
          zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          borderRadius: '999px',
          padding: '0.85rem 1.5rem',
          opacity: footerVisible ? 0 : 1,
          visibility: footerVisible ? 'hidden' : 'visible',
          pointerEvents: footerVisible ? 'none' : 'auto',
          transition: 'right 0.25s ease, transform 0.2s ease, opacity 0.3s ease, visibility 0.3s, background-color 0.3s ease, border-color 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        Get a Quote
      </Link>

      {/* Scroll-to-top button stays mounted so it can fade out instead of
          popping. */}
      <button
        onClick={() => {
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        }}
        aria-label="Scroll to top"
        aria-hidden={!showScrollTop || footerVisible}
        tabIndex={showScrollTop && !footerVisible ? 0 : -1}
        style={{
          position: 'fixed',
          bottom: 'calc(2rem + env(safe-area-inset-bottom))',
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
          opacity: showScrollTop && !footerVisible ? 1 : 0,
          visibility: showScrollTop && !footerVisible ? 'visible' : 'hidden',
          pointerEvents: showScrollTop && !footerVisible ? 'auto' : 'none',
          transform: showScrollTop && !footerVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s',
        }}
      >
        ↑
      </button>

    </section>
  );
}
