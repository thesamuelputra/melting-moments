'use client';

import { useState } from 'react';
import Link from 'next/link';
import GuidosImage from '@/components/GuidosImage';

type Product = {
  id: string;
  name: string;
  category: string;
  priceFrom: number;
  sizes: { label: string; price: number }[];
  image: string;
  isAvailable: boolean;
  isLimitedEdition: boolean;
};

export default function GuidosMenuClient({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Derive categories from CMS data
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div>
      <section className="container" style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(4rem, 8vw, 8rem)' }}>
        <div className="g-eyebrow" style={{ marginBottom: '1.5rem' }}>Guido&apos;s Gourmet</div>
        <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', marginBottom: '1.5rem' }}>
          Ready-Made Italian Meals
        </h1>
        {/* The tricolour signature, quiet, capping the header */}
        <div className="g-tricolor g-tricolor--rule" style={{ margin: '0 0 clamp(2rem, 4vw, 4rem)' }} />

        {/* Category Tabs: green underline marks the active filter, quiet ink-soft otherwise */}
        <div className="category-tabs">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                className="category-tab"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(cat)}
                style={{
                  color: isActive ? 'var(--g-ink)' : 'var(--g-ink-soft)',
                  borderBottomWidth: '2px',
                  borderBottomColor: isActive ? 'var(--g-green)' : 'transparent',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`g-card ${!product.isAvailable ? 'product-card--sold-out' : ''}`}
            >
              <button
                type="button"
                aria-expanded={expandedProduct === product.id}
                disabled={!product.isAvailable}
                aria-disabled={!product.isAvailable}
                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  width: '100%',
                  textAlign: 'inherit',
                  cursor: 'pointer',
                  font: 'inherit',
                  color: 'inherit',
                }}
              >
              <div className="g-card__media">
                <GuidosImage
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                {product.isLimitedEdition && (
                  <span className="menu-index" style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    color: 'var(--g-cream)', backgroundColor: 'var(--g-green-deep)',
                    padding: '0.3rem 0.6rem', borderRadius: '2px',
                  }}>
                    Limited Edition
                  </span>
                )}
                {!product.isAvailable && (
                  <span className="menu-index" style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    color: 'var(--g-cream)', backgroundColor: 'var(--g-ink)',
                    padding: '0.3rem 0.6rem', borderRadius: '2px',
                  }}>
                    Sold Out
                  </span>
                )}
              </div>

              <div className="g-card__body">
                <span className="g-card__name">{product.name}</span>
                <span className="g-card__price">From ${product.priceFrom.toFixed(2)}</span>
              </div>
              </button>

              {/* Expanded detail stays in the DOM (CSS-collapsed, not
                  conditionally mounted) so every per-size price ships in the
                  server HTML for crawlers and answer engines. */}
              <div
                style={{
                  display: expandedProduct === product.id && product.isAvailable ? 'block' : 'none',
                  padding: '1rem 1.25rem 1.35rem',
                  borderTop: '1px solid var(--g-line)',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                {product.sizes && product.sizes.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {product.sizes.map((size) => (
                      <div key={size.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: 'var(--text-body)' }}>
                        <span style={{ color: 'var(--g-ink-soft)' }}>{size.label}</span>
                        <span style={{ color: 'var(--g-gold)', fontWeight: 600 }}>${size.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/guidos/order" className="btn-solid" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.8rem', fontSize: 'var(--text-micro)' }}>
                  Order This
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Order CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(3rem, 6vw, 6rem)' }}>
          <p className="g-script g-script--sm" style={{ marginBottom: '0.75rem' }}>Handcrafted in Small Batches</p>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--g-ink-soft)', marginBottom: '1.5rem' }}>
            Know what you want? Place your order directly.
          </p>
          <Link href="/guidos/order" className="btn-solid">Place an Order</Link>
        </div>
      </section>
    </div>
  );
}
