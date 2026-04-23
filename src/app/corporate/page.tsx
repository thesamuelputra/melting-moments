'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Corporate() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div>
      <header className="container page-header-grid" style={{ paddingTop: 'calc(70px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="menu-index" style={{ marginBottom: '2rem' }}>Corporate Functions</div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>
            BOARDROOM <br /> TO BANQUET
          </h1>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '2rem', lineHeight: 1.6 }}>
            You've got less than 24 hours to plan a continental breakfast or a lunch. It has to be good. It has to be quick. It has to be now. Why bother trying to get reservations somewhere, or trying to find something that will please everyone, when we can bring it all right to you?
          </p>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '1rem', lineHeight: 1.6 }}>
            Whether it's that breakfast for 300 in your lobby or a formal boardroom luncheon for 20, a simple brown-bag lunch or a full china and crystal setting we've got it covered.
          </p>
        </div>
        
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '16/9' }}>
          <Image src="/macro_appetizer.webp" alt="Corporate Event Appertizers" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
      </header>

      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '8rem' }}>
        
        {/* INTERACTIVE FILTER */}
        <div className="filter-container">
            <button className={`btn-outline ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>Complete Menu</button>
            <button className={`btn-outline ${filter === 'BREAKFAST' ? 'active' : ''}`} onClick={() => setFilter('BREAKFAST')}>Breakfast Goodies</button>
            <button className={`btn-outline ${filter === 'LUNCH' ? 'active' : ''}`} onClick={() => setFilter('LUNCH')}>Cold Lunch</button>
            <button className={`btn-outline ${filter === 'HOT_LUNCH' ? 'active' : ''}`} onClick={() => setFilter('HOT_LUNCH')}>Hot Lunch</button>
        </div>

        {/* BREAKFAST ALACARTE */}
        {(filter === 'ALL' || filter === 'BREAKFAST') && (
            <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '3rem' : 0 }}>
                    <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Breakfast Goodies</h2>
                    <span className="menu-index">AM</span>
                </div>
        
                <div className="menu-grid-constraint">
                    <div className="menu-index" style={{ marginTop: '6px' }}>01</div>
                    <div>
                        <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Continental</h3>
                        <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>
                        Baskets filled with delicious freshly-baked pastries, danishes and muffins served with cold fruit juices, fresh brewed coffee and hot tea.
                        </p>
                    </div>
                <div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$9.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div>
                </div>
        
                <div className="menu-grid-constraint">
                    <div className="menu-index" style={{ marginTop: '6px' }}>02</div>
                    <div>
                        <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Royal Continental</h3>
                        <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>
                        Freshly-baked pastries, Danishes and muffins served with fresh seasonal sliced fruit as well as cold fruit juices, fresh brewed coffee and hot tea.
                        </p>
                    </div>
                    <div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$12.50<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div>
                </div>
        
                <div className="menu-grid-constraint">
                    <div className="menu-index" style={{ marginTop: '6px' }}>03</div>
                    <div>
                        <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Supreme Continental</h3>
                        <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>
                        Soft bagels, freshly-baked scones, fruit yogurt with granola, seasonal sliced fruit as well as cold fruit juices, fresh brewed coffee and hot tea.
                        </p>
                    </div>
                    <div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$14.50<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>PP</span></div>
                </div>
            </div>
        )}

        {/* COL LUNCH */}
        {(filter === 'ALL' || filter === 'LUNCH') && (
            <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid rgba(0,0,0,0.1)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
                    <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Cold Lunch</h2>
                    <span className="menu-index">PM</span>
                </div>
                <p style={{ marginBottom: '3rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>Our signature specialty sandwiches and wraps can fit almost any event. Add a fresh salad or soup for an additional $2.50 ea.</p>
        
                <div className="menu-grid-constraint">
                    <div className="menu-index" style={{ marginTop: '6px' }}>01</div>
                    <div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>The Picnic</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Cold cut combos sandwich.</p></div>
                    <div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$8.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div>
                </div>
        
                <div className="menu-grid-constraint">
                    <div className="menu-index" style={{ marginTop: '6px' }}>02</div>
                    <div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>The Italian</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Italian meats, Mozzarella cheese, lettuce and tomato, served with a variety of flavored mayonnaises, pesto, and red pepper.</p></div>
                    <div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$9.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div>
                </div>
        
                <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>The Grilled Chicken</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Grilled chicken, goat cheese and pesto mayo with, fresh spinach leaves, red peppers.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$9.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div></div>
                <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>The Grilled Cheese</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Black Forest ham on French bread with cheddar cheese and mayo, Grilled.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$7.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div></div>
                <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>The Roasted Veggie</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Assorted veggies roasted with baby greens and cheese.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$7.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div></div>
            </div>
        )}

        {/* HOT LUNCH */}
        {(filter === 'ALL' || filter === 'HOT_LUNCH') && (
            <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem', marginTop: filter === 'ALL' ? '4rem' : 0, borderTop: filter === 'ALL' ? '1px solid rgba(0,0,0,0.1)' : 'none', paddingTop: filter === 'ALL' ? '3rem' : 0 }}>
                    <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Hot Lunch Packages</h2>
                    <span className="menu-index">HOT</span>
                </div>
        
                <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>01</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Baron of Beef</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Succulent roast beef cooked medium rare served with Au jus on a sub bun.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$11.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div></div>
                <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Traditional BBQ</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Hamburgers, Veggie or Chicken Burgers served with sliced cheese, lettuce, tomato pickles, onions, and a condiment tray.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$12.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div></div>
                <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Chicken, Beef or Veggie Fajitas</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>With warm flour tortillas, Accompanied by Spanish rice, refried beans, lettuce and tomato and topped with salsa, sour cream.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$13.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div></div>
                <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Lasagna</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Traditional meat or veggie lasagna stuffed full of your favorite Italian ingredients.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$12.95<br/><span style={{ fontSize: '0.6em', opacity: 0.5 }}>EA</span></div></div>
            </div>
        )}

      </section>

    </div>
  );
}
