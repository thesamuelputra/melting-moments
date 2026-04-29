'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Guido&apos;s Gourmet</div>
        <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', marginBottom: 'clamp(2rem, 4vw, 4rem)' }}>
          Menu
        </h1>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'category-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`product-card ${!product.isAvailable ? 'product-card--sold-out' : ''}`}
              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
            >
              <div className="product-card__image">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                {product.isLimitedEdition && (
                  <span className="menu-index" style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    color: 'white', backgroundColor: 'var(--clr-ink)',
                    padding: '0.3rem 0.6rem',
                  }}>
                    Limited Edition
                  </span>
                )}
                {!product.isAvailable && (
                  <span className="menu-index" style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    color: 'white', backgroundColor: 'var(--clr-ink)',
                    padding: '0.3rem 0.6rem',
                  }}>
                    Sold Out
                  </span>
                )}
              </div>

              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-body)', fontWeight: 400, marginBottom: '0.25rem' }}>
                {product.name}
              </h3>
              <span style={{ fontSize: 'var(--text-micro)', letterSpacing: '0.1em', opacity: 0.5 }}>
                From ${product.priceFrom.toFixed(2)}
              </span>

              {/* Expanded detail */}
              {expandedProduct === product.id && product.isAvailable && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)', animation: 'fadeIn 0.3s ease' }}>
                  {product.sizes && product.sizes.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      {product.sizes.map((size) => (
                        <div key={size.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: 'var(--text-body)', opacity: 0.7 }}>
                          <span>{size.label}</span>
                          <span>${size.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/guidos/order" className="btn-solid" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.8rem', fontSize: 'var(--text-micro)' }}>
                    Order This
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(3rem, 6vw, 6rem)' }}>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.5, marginBottom: '1.5rem' }}>
            Know what you want? Place your order directly.
          </p>
          <Link href="/guidos/order" className="btn-solid">Place an Order</Link>
        </div>
      </section>

      {/* Cross-sell */}
      <section className="container" style={{ padding: 'clamp(2rem, 4vw, 3rem) 0', textAlign: 'center' }}>
        <span className="menu-index">
          Planning an event? <Link href="/menus" style={{ textDecoration: 'underline' }}>Melting Moments Catering →</Link>
        </span>
      </section>
    </div>
  );
}
