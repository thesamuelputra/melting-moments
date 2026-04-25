import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Chocolate Fountains | Victoria BC Catering',
  description: 'Architectural chocolate and champagne fountains crafted for immersive luxury events.',
}

export default function Fountains() {
  return (
    <div>
      <header className="container page-header-grid" style={{ paddingTop: 'calc(70px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="menu-index" style={{ marginBottom: '1.5rem' }}>Fountains</div>
          <h1 className="haus-display" style={{ fontSize: 'clamp(3rem, 6vw, 6rem)' }}>
            CHOCOLATE <br /> CASCADES
          </h1>
          <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, maxWidth: '40ch', marginTop: '1.5rem', lineHeight: 1.6 }}>
            The largest supplier of chocolate fountains on Vancouver Island. Fountains can be used for any event, from 20 to 1,000 guests. Pure Belgian chocolate cascading over tiers of perfection.
          </p>
        </div>
        <div className="shape-editorial-tall" style={{ width: '100%', position: 'relative', aspectRatio: '4/5' }}>
          <Image src="/chocolate_fountain.jpg" alt="Chocolate fountain at event with strawberry dipping" fill sizes="100vw" quality={90} unoptimized style={{ objectFit: 'cover' }} />
        </div>
      </header>

      <section className="container" style={{ paddingTop: 'clamp(2rem, 4vw, 4rem)', paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4rem' }}>
          <h2 className="noire-serif" style={{ color: 'var(--clr-pine)' }}>Chocolate Fountains</h2>
          <span className="menu-index">SIZES</span>
        </div>
        
        <div className="pricing-grid">
            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>XL — 30 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Extra Large Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Good for groups over 250 guests, or for those extreme chocolate lovers!</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$750</div>
            </div>
            
            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>L — 20 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Large Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Served with 20 lbs of chocolate. Serves up to 250 guests.</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$550</div>
            </div>

            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>S — 10 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Small Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Serves up to 125 guests.</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$350</div>
            </div>

            <div className="pricing-card">
                <div className="menu-index" style={{ marginBottom: '1rem' }}>XS — 5 LBS</div>
                <h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '1rem' }}>Mini Fountain</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, marginBottom: '2rem' }}>Serves up to 30 guests.</p>
                <div className="menu-price" style={{ fontSize: '1.5rem' }}>$150</div>
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', marginTop: '6rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '4rem' }}>
          <h2 className="noire-serif" style={{ color: 'var(--clr-ink)' }}>Dipping Goodies</h2>
        </div>
        <div style={{ padding: '2rem', backgroundColor: 'var(--clr-ink)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ maxWidth: '50ch', lineHeight: 1.6, opacity: 0.8 }}>Strawberries, pineapples, cantaloupe, marshmallows, graham crackers, angel food cake, pound cake, chocolate chip cookies, sugar and shortbread cookies, Oreo cookies, cream puffs, Rice Krispies, and lady fingers.</p>
            <div className="menu-price" style={{ color: 'white', fontSize: '1.5rem' }}>$5.50<span style={{ fontSize: '0.8rem', opacity: 0.5 }}> / PP</span></div>
        </div>
        <p style={{ fontSize: 'var(--text-body)', opacity: 0.5, marginTop: '1.5rem', lineHeight: 1.6 }}>All rentals include 4 hours of enjoyment, skewers, napkins. Delivery fees apply within the Victoria area — $30 per trip. Lindt chocolate in milk or dark. White chocolate and other colours available upon request.</p>
      </section>

      <section className="container" style={{ paddingBottom: '10rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', borderTop: '1px solid var(--clr-charcoal)', paddingTop: '4rem' }}>
          <h2 className="noire-serif" style={{ color: 'var(--clr-pine)' }}>Champagne Fountain</h2>
        </div>
        <p style={{ marginBottom: '4rem', opacity: 0.6, maxWidth: '50ch', lineHeight: 1.6 }}>Create lasting memories with an elegant Champagne fountain which provides the ambiance of a cascading waterfall complete with lights. The fountain may be embellished with fresh flowers nestled in the crown.</p>

        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>AU</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Gold Package</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Includes a Melting Moments attendant, fresh flower display, a platter of fresh strawberries, fluted glasses and seven litres of your preferred non-alcoholic beverage. (Our specialty is a fruit punch). Serves up to 100.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$549</div></div>
        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>AG</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Silver Package</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Includes a fresh flower display and a platter of fresh strawberries for your champagne glass.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$349</div></div>
        <div className="menu-grid-constraint"><div className="menu-index" style={{ marginTop: '6px' }}>CU</div><div><h3 className="noire-serif" style={{ fontSize: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Bronze Package</h3><p style={{ fontSize: 'var(--text-body)', opacity: 0.6, lineHeight: 1.6, maxWidth: '45ch' }}>Champagne Fountain delivery and pick up service only. The fountain is simple to operate.</p></div><div className="menu-price" style={{ textAlign: 'right', marginTop: '6px' }}>$199</div></div>
      </section>

    </div>
  );
}
