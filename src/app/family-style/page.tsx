import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Family Style Service | Victoria BC Catering',
  description: 'Communal, immersive dining experiences featuring traditional family style meals.',
}

export default function FamilyStyle() {
  return (
    <div>
      <header className="container" style={{ paddingTop: 'calc(70px + 3vw)', paddingBottom: 'clamp(1rem, 2vw, 2rem)' }}>
        <div className="menu-index" style={{ marginBottom: '2rem' }}>Family Style Service</div>
        <h1 className="haus-display" style={{ marginBottom: '4rem' }}>
          COMMUNAL <br /> IMMERSION
        </h1>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '16/9', marginBottom: '4rem' }}>
          <Image src="/family-spread.jpg" alt="Italian family style dining spread" fill sizes="(max-width: 768px) 100vw, 100vw" style={{ objectFit: 'cover' }} />
        </div>
      </header>

      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4rem' }}>
          <h2 className="noire-serif" style={{ color: 'var(--clr-pine)' }}>Peasano Dinner</h2>
          <span className="menu-index">ITALIAN</span>
        </div>
        <p style={{ marginBottom: '3rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>A Traditional Italian Meal. This is commonly served in any Italian home.</p>

        <div className="menu-grid-constraint">
          <div className="menu-index" style={{ marginTop: '6px' }}>01</div>
          <div>
            <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Antipasto Platter</h3>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Sliced Prosciutto, Calabrese Salami, Cheese, Black and Green Olives, Pearl Onions, Baby Dills, Cantaloupe and Artichokes Quarters</p>
          </div>
        </div>

        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>02</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pasta Di Casa</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Assorted Pasta Styles with Homemade Sauce</p></div></div>
        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>03</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Insalata</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Fresh Arugula tossed with Olive Oil, Vinegar and Fresh Herbs</p></div></div>
        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>04</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Carne</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Roasted Chicken or Veal or Chicken Parmesan, Pan Fried and Topped with Tomato Sauce. (Optional add on Salmon or Beef Strip loin Add $2 per person)</p></div></div>
        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>05</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Patate</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Roasted Potatoes with Fresh Herbs</p></div></div>
        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>06</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vegetali</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>An Array of Fresh Roasted Vegetables</p></div></div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '4rem', padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="noire-serif" style={{ fontSize: '1.5rem' }}>One Carne Option</span>
                <span className="menu-price">$33.50 PP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="noire-serif" style={{ fontSize: '1.5rem' }}>Two Meat Options</span>
                <span className="menu-price">$36.50 PP</span>
            </div>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '1rem' }}>Use of plate charge required for this option. On average $3 per serving.</p>
        </div>
      </section>
    </div>
  );
}
