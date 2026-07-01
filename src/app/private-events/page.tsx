import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getCmsContent } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Private Events | Melting Moments Catering Victoria BC',
  description: 'Intimate, fine-dining private event catering, from formal dinners to yacht catering in Victoria, BC.',
  openGraph: {
    url: '/private-events',
    siteName: 'Melting Moments Catering',
    locale: 'en_CA',
    type: 'website',
    title: 'Private Events | Melting Moments Catering Victoria BC',
    description: 'Intimate, fine-dining private event catering in Victoria, BC.',
    images: ['/private_dinner.webp'],
  },
};

export const revalidate = 300;

export default async function PrivateEvents() {
  const cms = await getCmsContent();

  const subtitle = cms('events_header_subtitle', 'Information');
  const title = cms('events_header_title', 'Private Events');
  const heading = cms('events_heading', 'Dinner, In Good Hands');
  const body1 = cms('events_body_1', 'From a formal dinner party to catering aboard a yacht, we bring the kitchen to you and serve a proper meal in your own space, without the fuss.');
  const body2 = cms('events_body_2', "Whether it's an anniversary dinner for 12 or a milestone birthday for 80, Chef Paul builds every course around the host and the guests at the table.");
  const ctaButton = cms('events_cta_button', 'Plan Your Event');

  const cards = [
    { title: cms('events_card1_title', 'Your Venue, Our Craft'), desc: cms('events_card1_desc', 'We bring a full-service kitchen to any location: your home, a vineyard, a yacht, or a heritage venue.') },
    { title: cms('events_card2_title', 'Tailored Menus'), desc: cms('events_card2_desc', 'No templates. Every menu is designed from scratch after a personal consultation with Chef Paul.') },
    { title: cms('events_card3_title', 'Service That Stays Out of the Way'), desc: cms('events_card3_desc', 'Our staff are attentive without hovering, so your guests remember the food and the night, not the logistics.') },
  ];

  return (
    <div>
        <header className="container" style={{ paddingTop: "calc(80px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
            <div className="menu-index" style={{ marginBottom: "2rem" }}>{subtitle}</div>
            <h1 className="haus-display" style={{ textTransform: "uppercase" }}>{title}</h1>
            <div className="spacer-large">
                <div className="noire-divider"></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '4rem', alignItems: 'center' }}>
              <div className="shape-editorial-tall" style={{ position: 'relative', width: '100%' }}>
                <Image src="/private_dinner.webp" alt="Intimate private dinner entree" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <h2 className="noire-serif" style={{ marginBottom: '2rem' }}>{heading}</h2>
                <p style={{ fontSize: "var(--text-body)", opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    {body1}
                </p>
                <p style={{ fontSize: "var(--text-body)", opacity: 0.8, marginBottom: '2rem', lineHeight: 1.7 }}>
                    {body2}
                </p>
                <Link href="/contact" className="btn-solid">{ctaButton}</Link>
              </div>
            </div>
        </header>

        {/* Why Choose Private Catering (#24) */}
        <section className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
          <div className="noire-divider" style={{ marginBottom: '3rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
            {cards.map(item => (
              <div key={item.title} style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1rem' }}>{item.title}</h3>
                <p style={{ fontSize: 'var(--text-body)', opacity: 0.7, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
    </div>
  );
}
