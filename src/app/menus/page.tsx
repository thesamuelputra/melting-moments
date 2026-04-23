'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Menus() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div>
      <header className="container page-header-grid" style={{ paddingTop: 'calc(70px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="menu-index" style={{ marginBottom: '1.5rem' }}>Culinary Archive</div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>
            THE <br /> MENUS
          </h1>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '1.5rem', lineHeight: 1.6 }}>
            International cuisine influences many of our flavourful dishes, from Southwest to Italian and everything in between. 25 years of culinary experience — expect the best.
          </p>
        </div>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '4/5' }}>
          <Image src="/menu-pasta.jpg" alt="Penne Alfredo on stainless steel" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
      </header>

      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '8rem' }}>
        
        {/* INTERACTIVE FILTER */}
        <div className="filter-container" style={{ flexWrap: 'wrap' }}>
            <button className={`btn-outline ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
            <button className={`btn-outline ${filter === 'BREADS' ? 'active' : ''}`} onClick={() => setFilter('BREADS')}>Breads</button>
            <button className={`btn-outline ${filter === 'ANTIPASTO' ? 'active' : ''}`} onClick={() => setFilter('ANTIPASTO')}>Antipasto</button>
            <button className={`btn-outline ${filter === 'SALADS' ? 'active' : ''}`} onClick={() => setFilter('SALADS')}>Salads</button>
            <button className={`btn-outline ${filter === 'STARCHES' ? 'active' : ''}`} onClick={() => setFilter('STARCHES')}>Starches</button>
            <button className={`btn-outline ${filter === 'VEGETABLES' ? 'active' : ''}`} onClick={() => setFilter('VEGETABLES')}>Vegetables</button>
            <button className={`btn-outline ${filter === 'SEAFOOD' ? 'active' : ''}`} onClick={() => setFilter('SEAFOOD')}>Gourmet Mirrors</button>
            <button className={`btn-outline ${filter === 'ENTREES' ? 'active' : ''}`} onClick={() => setFilter('ENTREES')}>Chef Carved</button>
            <button className={`btn-outline ${filter === 'PACKAGES' ? 'active' : ''}`} onClick={() => setFilter('PACKAGES')}>Buffet Packages</button>
            <button className={`btn-outline ${filter === 'SOIREE' ? 'active' : ''}`} onClick={() => setFilter('SOIREE')}>Soirée</button>
            <button className={`btn-outline ${filter === 'PEASANO' ? 'active' : ''}`} onClick={() => setFilter('PEASANO')}>Peasano</button>
            <button className={`btn-outline ${filter === 'MEXICAN' ? 'active' : ''}`} onClick={() => setFilter('MEXICAN')}>Mexican Fiesta</button>
            <button className={`btn-outline ${filter === 'BBQ' ? 'active' : ''}`} onClick={() => setFilter('BBQ')}>BBQ</button>
            <button className={`btn-outline ${filter === 'LUNCH' ? 'active' : ''}`} onClick={() => setFilter('LUNCH')}>Lunch</button>
            <button className={`btn-outline ${filter === 'BREAKFAST' ? 'active' : ''}`} onClick={() => setFilter('BREAKFAST')}>Breakfast</button>
            <button className={`btn-outline ${filter === 'BEVERAGES' ? 'active' : ''}`} onClick={() => setFilter('BEVERAGES')}>Beverages</button>
        </div>

        {/* ── 01. BREADS ── */}
        {(filter === 'ALL' || filter === 'BREADS') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Breads</h2>
              <span className="menu-index">01</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Baguettes</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Dinner Rolls</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Focaccia Bread</h3></div></div>
          </div>
        )}

        {/* ── 02. ANTIPASTO ── */}
        {(filter === 'ALL' || filter === 'ANTIPASTO') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Antipasto Platters</h2>
              <span className="menu-index">02</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Assorted Cheeses</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>With Grape Clusters and Nuts.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Deli Meat Mirror</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Oven Fire Roasted Vegetables</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pickled Vegetable Platter</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>European Platter</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Olives, Artichokes and Sun Dried Tomatoes.</p></div></div>
          </div>
        )}

        {/* ── 03. SALADS ── */}
        {(filter === 'ALL' || filter === 'SALADS') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Salads</h2>
              <span className="menu-index">03</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Garden Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Caesar Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Corn Salsa Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Potato Dijon Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tri Color Rotini Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Five Bean Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>07</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Spring Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>08</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Greek Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>09</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Orzo Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>10</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Italian Tomato Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>11</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tomato and Bocconcini</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>12</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Spinach Salad with Crispy Bacon</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>13</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Orange and Beet Salad</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>14</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Spring Salad with Fresh Fruit</h3></div></div>
          </div>
        )}

        {/* ── 04. STARCHES ── */}
        {(filter === 'ALL' || filter === 'STARCHES') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Starches</h2>
              <span className="menu-index">04</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saffron Rice</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Rosemary Red Skin Potatoes</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Herb Potatoes</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Garlic Mashed Potatoes</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Penne Noodles</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>In Alfredo or Tomato Sauce.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pasta Options</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Vegetarian, Meat Lasagna or Cannelloni. Subject to additional charge.</p></div></div>
          </div>
        )}

        {/* ── 05. VEGETABLES ── */}
        {(filter === 'ALL' || filter === 'VEGETABLES') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Vegetables</h2>
              <span className="menu-index">05</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hot Steamed Vegetables</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fiery Green Beans</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Seasonal Vegetables</h3></div></div>
          </div>
        )}

        {/* ── 06. GOURMET MIRRORS ── */}
        {(filter === 'ALL' || filter === 'SEAFOOD') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Gourmet Mirrors</h2>
              <span className="menu-index">06</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Baked Salmon</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mussels and Clams</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>California Roll</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Poached Prawns and Shrimp</h3></div></div>
          </div>
        )}

        {/* ── 07. CHEF CARVED ── */}
        {(filter === 'ALL' || filter === 'ENTREES') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Chef Carved</h2>
              <span className="menu-index">07</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Beef</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Au Jus and Gravy.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Stuffed Pork Tenderloin</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>With Fresh Fruit Chutney.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Boneless Turkey</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>With Cranberry Sauce.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Rosemary Marinated Lamb Legs</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Herb Chicken</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Poached Salmon</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>With Lemon Butter.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>07</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Lemon Ginger Salmon</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Baked or BBQ.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>08</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Veal or Chicken Parm</h3></div></div>
          </div>
        )}

        {/* ── 08. BUFFET PACKAGES ── */}
        {(filter === 'ALL' || filter === 'PACKAGES') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Buffet Packages</h2>
              <span className="menu-index">08</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Basic Buffet</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Antipasto Platter, 4 Salads, 2 Starches, Hot Vegetables, 1 Chef Carved Entrée, Assorted Breads.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$50<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Traditional Buffet</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>2 Antipasto Platters, 5 Salads, 2 Starches, Hot Vegetables, 2 Chefs Carved Entrée, Assorted Breads.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$57<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Gourmet Buffet</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>2 Antipasto Platters, 6 Salads, 2 Starches, Hot Vegetables, 1 Gourmet Mirror, 3 Chefs Carved Entrée, Assorted Breads.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$65<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
          </div>
        )}

        {/* ── 09. SOIRÉE ── */}
        {(filter === 'ALL' || filter === 'SOIREE') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Soirée</h2>
              <span className="menu-index">09</span>
            </div>
            <p style={{ marginBottom: '2rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>Hors d&apos;oeuvre Party — mingle amongst your friends and family while trays of delicious menu items are served.</p>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Gravad Lox</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Thinly Sliced Salmon on a Herb Cream Cheese Wafer.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Skinny Beef Martinis</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Beef Tenderloin with a Fresh Horse Radish Cream.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Flambé</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Flambéed Cognac Prawns.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Lamb Racks</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>A French-Style Rack.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ceviche Spoons</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Marinated Seafood.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Asian Noodle Boxes</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Sautéed Asian Greens with Coconut Curry Chicken.</p></div></div>
            <div className="menu-grid-constraint" style={{ marginTop: '2rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '1.5rem' }}><div></div><div><p style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>Soirée Package</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$52<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
          </div>
        )}

        {/* ── 10. PEASANO DINNER ── */}
        {(filter === 'ALL' || filter === 'PEASANO') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Peasano Dinner</h2>
              <span className="menu-index">10</span>
            </div>
            <p style={{ marginBottom: '2rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>A Traditional Italian Meal, commonly served in any Italian home.</p>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Antipasto Platter</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Sliced Prosciutto, Calabrese Salami, Cheese, Olives, Pearl Onions, Baby Dills, Cantaloupe, Artichoke Quarters.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pasta Di Casa</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Assorted Pasta Styles with Homemade Sauce.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Insalata</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Fresh Arugula tossed with Olive Oil, Vinegar and Fresh Herbs.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Carne</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Veal or Chicken Breaded by Hand, Pan Fried, Topped with Tomato Sauce and Parmesan Cheese.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Patate</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Roasted Red Skin Potatoes Baked with Fresh Herbs.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vegetali</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>An Array of Fresh Steamed Vegetables.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>07</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pane Assortito</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Vienna Loaves, Olive Bread, Sun Dried Tomato Baguettes with Butter.</p></div></div>
            <div className="menu-grid-constraint" style={{ marginTop: '2rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '1.5rem' }}><div></div><div><p style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>1 Carne Option</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$48<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
            <div className="menu-grid-constraint"><div></div><div><p style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>2 Carne Options</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$56<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.5, marginTop: '1rem' }}>Use of plate charge $6 per person. Extra Staff required.</p>
          </div>
        )}

        {/* ── 11. MEXICAN FIESTA ── */}
        {(filter === 'ALL' || filter === 'MEXICAN') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Mexican Fiesta</h2>
              <span className="menu-index">11</span>
            </div>
            <p style={{ marginBottom: '2rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>Traditional Mexican cuisine served with a South Western Flare.</p>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roasted Corn Salad</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Fresh Roasted Corn with Tomato and Fresh Cilantro.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mexican Rice</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Steamed to Perfection with Fresh Tomatoes, Topped with Cilantro.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Carne Asada</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Barbequed Lime Marinated Beef Strips.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mango Chicken Quesadillas</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Sliced Chicken mixed with Mango, Cilantro, Jalapeños, and Cheese baked in a Flour Tortilla.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Corn Fritters</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Hand Made with Roasted Corn, Red Peppers and Onions.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Jalapeño Poppers</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Stuffed with Cream Cheese.</p></div></div>
            <div className="menu-grid-constraint" style={{ marginTop: '2rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '1.5rem' }}><div></div><div><p style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>Mexican Fiesta Package</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$39<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
          </div>
        )}

        {/* ── 12. BBQ ── */}
        {(filter === 'ALL' || filter === 'BBQ') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>BBQ Menus</h2>
              <span className="menu-index">12</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Barbeque Chicken Breasts</h3></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Chicken or Lamb Skewers</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Marinated in Greek seasonings then grilled.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Salmon Filet</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Served with fruit chutney.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sirloin Steak</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>6 oz. steak grilled to perfection.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Baked Potato</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Sour cream, bacon, green onion, cheese.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Seasonal Corn</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Dipped in chili powder with lime and cilantro.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>07</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>5 Salads</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Choose from the buffet salad menu.</p></div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>08</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Assorted Bread</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Mixed bread basket with focaccia and garlic toast.</p></div></div>
            <div className="menu-grid-constraint" style={{ marginTop: '2rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '1.5rem' }}><div></div><div><p style={{ fontSize: 'var(--text-body)', opacity: 0.8 }}>BBQ Package</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$49<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div></div>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.5, marginTop: '1rem' }}>Add meat option $8.50 per selection.</p>
          </div>
        )}

        {/* ── 13. LUNCH ── */}
        {(filter === 'ALL' || filter === 'LUNCH') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Lunch</h2>
              <span className="menu-index">13</span>
            </div>
            <p style={{ marginBottom: '2rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>Our signature specialty sandwiches and wraps — get them warm off the grill, Panini style.</p>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Caprese Chicken</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Roasted Red Pepper Mayo, Grilled Chicken, Sundried Tomato, Provolone, Spring Greens.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$12</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Grilled Veggie</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Pesto, Grilled Red Peppers, Zucchini, Provolone, Spring Greens, Balsamic Glaze.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$11</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Chicken Fig &amp; Bacon</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Fig Jam, Grilled Chicken, Bacon, Brie Cheese.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$13</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sicilian Trio</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>3 Types Italian Meat, Red Peppers, Provolone, Spring Greens.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$12</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sausage Panini</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Tomato Sauce, Italian Sausage, Red Onions, Provolone, Spring Greens.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$15</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Meatball Panini</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Meatballs, Tomato Sauce, Provolone.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$14</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>07</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pulled Pork</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Mixed Cheese, BBQ Sauce.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$12</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>08</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Veggie Wrap</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Mixed Assorted Veggies with Roasted Red Pepper Mayo.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$9</div></div>

            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '2rem' }}>
              <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Traditional BBQ Lunch</h3>
              <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>09</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hamburgers</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Veggie or Chicken Burgers with cheese, lettuce, tomato, pickles. Choice of Fries, Potato Salad or Caesar. Min 12.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$22.95</div></div>
              <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>10</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Fajitas</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Chicken, Beef or Veggie with warm flour tortillas, Spanish rice, refried beans, salsa, sour cream. Min 12.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$23.95</div></div>
              <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>11</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Lasagna</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Traditional meat or veggie lasagna. Min 6.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$12.95</div></div>
            </div>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.5, marginTop: '1.5rem' }}>Add soup or salad to any meal for additional $6.</p>
          </div>
        )}

        {/* ── 14. BREAKFAST ── */}
        {(filter === 'ALL' || filter === 'BREAKFAST') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Breakfast</h2>
              <span className="menu-index">14</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Continental</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Freshly-baked pastries, danishes and muffins. Cold fruit juices, fresh brewed coffee and hot tea.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$17.95</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Royal Continental</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Freshly-baked pastries, Danishes and muffins with fresh seasonal sliced fruit, cold fruit juices, coffee and tea.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$21.50</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Supreme Continental</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Mini Muffins, freshly-baked scones, fruit yogurt with granola, seasonal sliced fruit, juices, coffee and tea.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$24.50</div></div>

            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '2rem' }}>
              <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add-Ons</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Yogurt with Granola — $5</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Seasonal Sliced Fruit — $6</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Scrambled Eggs w Cheese — $4</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Bacon — $4</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Sausage — $3</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>French Toast with Syrup — $6</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Hash Browns — $3</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Freshly Baked Quiche — $6</p>
              </div>
            </div>

            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '2rem' }}>
              <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Bakery</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Assorted Pastries — $40/dz</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Mini-Pastries — $30/dz</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Freshly-Baked Scones — $37/dz</p>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6 }}>Muffins — $36/dz</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 15. BEVERAGES ── */}
        {(filter === 'ALL' || filter === 'BEVERAGES') && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid var(--clr-charcoal)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
              <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Beverages</h2>
              <span className="menu-index">15</span>
            </div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bottled Soft Drinks</h3></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$3</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bottled Fruit Juice</h3></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$3</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bottled Water</h3></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$2</div></div>
            <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Freshly Brewed Premium</h3></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$3</div></div>
          </div>
        )}

        {/* ── SERVICES NOTICE ── */}
        {filter === 'ALL' && (
          <div style={{ marginTop: '4rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '3rem' }}>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.8, maxWidth: '65ch' }}>
              These catering menus are just a sample of what you can expect — we can customize any menu to suit your needs. All 5% taxes and 15% gratuity are extra. A deposit of 25% is required at time of booking. Balance due 7 days prior to function. Guaranteed number of guests required 2 weeks in advance. Per person pricing based on a minimum of 75 guests. Prices may change without notice.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link href="/contact" className="btn-primary">Book Your Event</Link>
            </div>
          </div>
        )}

      </section>
      
    </div>
  );
}
