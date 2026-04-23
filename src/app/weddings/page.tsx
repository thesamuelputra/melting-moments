import Link from 'next/link';
import Image from 'next/image';

export default function Weddings() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "calc(70px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Weddings</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '4rem', alignItems: 'center' }}>
              <div>
                <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>A Symphony of Taste</h2>
                <p style={{ fontSize: "var(--text-body)", opacity: 0.8, marginBottom: '2rem' }}>
                    Your wedding day requires absolute perfection. Chef Paul brings 16 years of elite catering experience to curate a bespoke menu that tells your unique story.
                </p>
                <Link href="/contact" className="btn-solid">Start Planning</Link>
              </div>
              <div className="shape-editorial-tall" style={{ position: 'relative', width: '100%' }}>
                <Image src="/macro_fountain.webp" alt="Wedding Fountain" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              </div>
            </div>
        </header>
    </div>
  );
}
