import Link from 'next/link';
import Image from 'next/image';

export default function PrivateEvents() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "clamp(8rem, 15vw, 12rem)", paddingBottom: "clamp(4rem, 10vw, 8rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Private Events</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '4rem', alignItems: 'center' }}>
              <div className="shape-editorial-tall" style={{ position: 'relative', width: '100%' }}>
                <Image src="/private_dinner.jpg" alt="Intimate private dinner entree" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>Intimate Excellence</h2>
                <p style={{ fontSize: "var(--text-body)", opacity: 0.8, marginBottom: '2rem' }}>
                    From formal dinner parties to private yacht catering, we deliver discreet, Michelin-level service and unforgettable culinary experiences in the comfort of your own venue.
                </p>
                <Link href="/quote" className="btn-outline">Request Quote</Link>
              </div>
            </div>
        </header>
    </div>
  );
}
