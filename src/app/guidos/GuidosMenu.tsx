'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { chromeBottom } from '@/lib/fixed-chrome';
import { CATEGORY_ORDER, type GuidosProduct } from './guidos-products';

const money = (n: number) => `$${n.toFixed(2)}`;
const sectionId = (category: string) => `menu-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The Guido's range as a printed list: a sticky index of the categories on
 * desktop, a pinned rail of them on phones, and one hairline row per dish with
 * its sizes and prices in the right column. The scroll spy and the anchor
 * jumps work the same way as on the catering menu.
 */
export default function GuidosMenu({ products }: { products: GuidosProduct[] }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [footerVisible, setFooterVisible] = useState(false);
  const [pastHeader, setPastHeader] = useState(false);
  const railRef = useRef<HTMLElement>(null);

  // The floating order pill waits until the visitor is into the list; the
  // header above already offers the same button
  useEffect(() => {
    const onScroll = () => setPastHeader(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Which of the two section navigations is showing decides whose chip to keep in view
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // The floating order pill steps aside once the footer, with its own order
  // call, scrolls into view
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

  // Categories in the house order, then anything new the owner adds, each
  // with its dishes in the order the admin keeps them
  const sections = useMemo(() => {
    const order = Array.from(new Set([...CATEGORY_ORDER, ...products.map((p) => p.category)]));
    return order
      .map((category) => ({ category, items: products.filter((p) => p.category === category) }))
      .filter((section) => section.items.length > 0);
  }, [products]);

  // Jump from the index to a section, landing it a consistent 16px below the
  // fixed chrome rather than underneath it. The href is the no-script fallback.
  const jumpTo = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    e.preventDefault();
    const el = document.getElementById(sectionId(category));
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (chromeBottom(railRef.current) + 16);
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  // Scroll spy: the lit section is the last header at or above the reading
  // line just under the chrome, so exactly one entry is lit even mid-section
  useEffect(() => {
    const ids = sections.map((s) => sectionId(s.category));
    let ticking = false;
    const update = () => {
      ticking = false;
      const readingLine = chromeBottom(railRef.current) + 30;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= readingLine) current = id;
        else break;
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
  }, [sections]);

  // Keep the lit chip in view inside the phone rail as the visitor scrolls
  useEffect(() => {
    if (isDesktop || !activeSection || !railRef.current) return;
    const rail = railRef.current;
    const chip = rail.querySelector<HTMLAnchorElement>(`a[href="#${activeSection}"]`);
    if (!chip) return;
    const target = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [activeSection, isDesktop]);

  const pillShown = pastHeader && !footerVisible;

  return (
    <section className="container" style={{ paddingTop: 'clamp(1rem, 2vw, 2rem)', paddingBottom: 'clamp(4rem, 8vw, 6rem)' }}>
      {/* Phone rail of section anchors, pinned under the nav; the desktop index below takes over from 901px */}
      <nav ref={railRef} aria-label="Menu sections" className="menu-rail">
        {sections.map(({ category }) => (
          <a
            key={category}
            href={`#${sectionId(category)}`}
            className={activeSection === sectionId(category) ? 'menu-rail__active' : undefined}
            onClick={(e) => jumpTo(e, category)}
          >
            {category}
          </a>
        ))}
      </nav>

      {/* Two columns from 901px: the sticky index in the otherwise empty left
          margin, the list beside it. Below that the index is hidden by CSS and
          the rail above takes over, so nothing moves when the page hydrates. */}
      <div className="g-menu-shell">
        <nav aria-label="Menu sections" className="g-menu-index">
            <div className="menu-index" style={{ marginBottom: '1.5rem' }}>The Menu</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {sections.map(({ category }, i) => {
                const current = activeSection === sectionId(category);
                return (
                  <li key={category} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <span className="menu-index" style={{ opacity: current ? 1 : 0.75 }}>{String(i + 1).padStart(2, '0')}</span>
                    <a
                      href={`#${sectionId(category)}`}
                      onClick={(e) => jumpTo(e, category)}
                      className={`noire-serif menu-index-link${current ? ' is-current' : ''}`}
                    >
                      {category}
                    </a>
                  </li>
                );
              })}
            </ul>
        </nav>

        <div>
          {sections.map(({ category, items }, groupIdx) => (
            <div key={category}>
              <div
                id={sectionId(category)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '3rem',
                  marginTop: groupIdx > 0 ? '4rem' : 0,
                  borderTop: groupIdx > 0 ? '1px solid var(--clr-charcoal)' : 'none',
                  paddingTop: groupIdx > 0 ? '3rem' : 0,
                  scrollMarginTop: 'calc(var(--banner-height) + var(--nav-height) + var(--menu-rail-height) + 16px)',
                }}
              >
                <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>{category}</h2>
                <span className="menu-index">{String(groupIdx + 1).padStart(2, '0')}</span>
              </div>

              {items.map((item) => (
                <div key={item.id} className={`g-menu-row${item.isAvailable ? '' : ' g-menu-row--out'}`}>
                  {/* The empty first cell keeps the reading grid aligned with the catering menu */}
                  <div aria-hidden="true" />
                  <div>
                    <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)' }}>
                      {item.name}
                      {item.isLimitedEdition && <span className="g-menu-tag">Limited edition</span>}
                    </h3>
                  </div>
                  <div className="g-menu-pricing">
                    {!item.isAvailable ? (
                      <span className="menu-index">Sold out</span>
                    ) : item.sizes.length > 0 ? (
                      <dl className="g-menu-sizes">
                        {item.sizes.map((size) => (
                          <div key={size.label}>
                            <dt className="menu-index">{size.label}</dt>
                            <dd className="menu-price">{money(size.price)}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <span className="menu-price">{money(item.priceFrom)}</span>
                    )}
                    {item.isAvailable && (
                      <Link href={`/guidos/order?item=${encodeURIComponent(item.name)}`} className="g-menu-order" aria-label={`Order ${item.name}`}>
                        Order <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating order call, the Guido's twin of the catering menu's quote pill */}
      <Link
        href="/guidos/order"
        className="btn-solid btn-solid--stay"
        tabIndex={pillShown ? 0 : -1}
        aria-hidden={!pillShown}
        style={{
          position: 'fixed',
          bottom: 'calc(2rem + env(safe-area-inset-bottom))',
          right: '2rem',
          zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          borderRadius: '999px',
          padding: '0.85rem 1.5rem',
          opacity: pillShown ? 1 : 0,
          visibility: pillShown ? 'visible' : 'hidden',
          pointerEvents: pillShown ? 'auto' : 'none',
          transform: pillShown ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s, background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        Order now
      </Link>
    </section>
  );
}
