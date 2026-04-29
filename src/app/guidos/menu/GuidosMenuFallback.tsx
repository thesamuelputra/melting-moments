'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Product = {
  name: string;
  category: string;
  priceFrom: number;
  sizes?: { label: string; price: number }[];
  image: string;
  isAvailable: boolean;
  isLimitedEdition: boolean;
};

const products: Product[] = [
  // Lasagnes
  { name: 'Beef Bolognese Lasagne', category: 'Lasagnes', priceFrom: 27, sizes: [{ label: 'Family (4-6)', price: 27 }, { label: 'Party (8-10)', price: 45 }], image: '/guidos/beef-bolognese-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Meat Lasagne', category: 'Lasagnes', priceFrom: 16.95, sizes: [{ label: 'Single', price: 16.95 }, { label: 'Family (4-6)', price: 27 }], image: '/guidos/meat-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Veggie Lasagne', category: 'Lasagnes', priceFrom: 14, sizes: [{ label: 'Single', price: 14 }, { label: 'Family (4-6)', price: 24 }], image: '/guidos/veggie-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Vegan Lasagne w/ Roasted Veg', category: 'Lasagnes', priceFrom: 14, image: '/guidos/vegan-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Eggplant Parmesan', category: 'Lasagnes', priceFrom: 14, image: '/guidos/eggplant-parmesan.webp', isAvailable: true, isLimitedEdition: false },
  // Pot Pies
  { name: 'Turkey Pot Pie', category: 'Pot Pies', priceFrom: 9, image: '/guidos/turkey-pot-pie.webp', isAvailable: true, isLimitedEdition: false },
  // Soups
  { name: 'Beef Stew', category: 'Soups', priceFrom: 12, image: '/guidos/beef-stew.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Beef Barley Soup', category: 'Soups', priceFrom: 10, image: '/guidos/beef-barley-soup.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Broccoli Cheddar Soup', category: 'Soups', priceFrom: 10, image: '/guidos/broccoli-cheddar-soup.webp', isAvailable: true, isLimitedEdition: false },
  // Pasta
  { name: 'Spaghetti and Meatballs', category: 'Pasta', priceFrom: 14, image: '/guidos/spaghetti-meatballs.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Pulled Pork Mac & Cheese', category: 'Pasta', priceFrom: 14, image: '/guidos/pulled-pork-mac.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Mac & Cheese', category: 'Pasta', priceFrom: 12, image: '/guidos/mac-cheese.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Peanut Chicken', category: 'Pasta', priceFrom: 14, image: '/guidos/peanut-chicken.webp', isAvailable: true, isLimitedEdition: false },
  // Desserts
  { name: 'Tiramisu', category: 'Desserts', priceFrom: 12, image: '/guidos/tiramisu.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Tiramisu Cans (5 Flavours)', category: 'Desserts', priceFrom: 9.95, image: '/guidos/tiramisu-cans.webp', isAvailable: true, isLimitedEdition: false },
  // Holiday
  { name: 'Turkey Dinner', category: 'Holiday', priceFrom: 25, image: '/guidos/turkey-dinner.webp', isAvailable: true, isLimitedEdition: true },
];

const categories = ['All', 'Lasagnes', 'Pot Pies', 'Soups', 'Pasta', 'Desserts', 'Holiday'];

export default function GuidosMenuFallback() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

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
              key={product.name}
              className={`product-card ${!product.isAvailable ? 'product-card--sold-out' : ''}`}
              onClick={() => setExpandedProduct(expandedProduct === product.name ? null : product.name)}
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
              {expandedProduct === product.name && product.isAvailable && (
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
