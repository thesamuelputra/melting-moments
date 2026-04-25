import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Catering | Melting Moments Victoria BC',
  description: 'Bespoke wedding catering by Chef Paul. A symphony of taste crafted for your perfect day in Victoria, BC.',
  openGraph: {
    title: 'Wedding Catering | Melting Moments Victoria BC',
    description: 'Bespoke wedding catering by Chef Paul Silletta.',
    images: ['/wedding_entree.jpg'],
  },
};

export default function Weddings() {
  return (
    <div>
        <header className="container" style={{ paddingTop: "calc(80px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Weddings</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '4rem', alignItems: 'center' }}>
              <div>
                <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>A Symphony of Taste</h2>
                <p style={{ fontSize: "var(--text-body)", opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    Your wedding day requires absolute perfection. Chef Paul brings 16 years of elite catering experience to curate a bespoke menu that tells your unique story.
                </p>
                <p style={{ fontSize: "var(--text-body)", opacity: 0.8, marginBottom: '2rem', lineHeight: 1.7 }}>
                    From intimate ceremonies on Vancouver Island to grand receptions for 300+ guests, every detail is orchestrated with obsessive precision — from the first canapé to the final dessert course.
                </p>
                <Link href="/contact" className="btn-solid">Start Planning</Link>
              </div>
              <div className="shape-editorial-tall" style={{ position: 'relative', width: '100%' }}>
                <Image src="/wedding_entree.jpg" alt="Wedding reception lamb with rosemary" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              </div>
            </div>
        </header>

        {/* How It Works — Process Section (#24) */}
        <section className="haus-block-container" style={{ marginTop: 'clamp(2rem, 4vw, 4rem)' }}>
          <div className="container">
            <div className="menu-index" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>The Process</div>
            <h2 className="noire-serif" style={{ color: 'var(--clr-oat)', marginBottom: '4rem' }}>From Vision to Celebration</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
              {[
                { step: '01', title: 'Consultation', desc: 'We discuss your vision, dietary needs, venue logistics, and budget to craft a personalized proposal.' },
                { step: '02', title: 'Private Tasting', desc: 'You and your partner experience the proposed menu firsthand with Chef Paul for final refinements.' },
                { step: '03', title: 'Your Day', desc: 'Our team arrives hours early for seamless setup. You focus on the celebration — we handle everything else.' },
              ].map(item => (
                <div key={item.step}>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--clr-oat)', opacity: 0.3, marginBottom: '1rem' }}>{item.step}</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--clr-oat)', marginBottom: '0.75rem' }}>{item.title}</h3>
                  <p style={{ fontSize: 'var(--text-body)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
    </div>
  );
}
