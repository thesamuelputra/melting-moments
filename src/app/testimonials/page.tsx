import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

export const metadata: Metadata = {
  title: 'Testimonials | Melting Moments Catering Victoria BC',
  description: 'Read what our clients say about their experience with Melting Moments Catering in Victoria, BC.',
};

export default async function Testimonials() {
  const rawReviews = await fetchQuery(api.testimonials.listActive);

  // Fall back to static defaults if no CMS testimonials exist yet
  const reviews = rawReviews.length > 0 ? rawReviews : [
    { author: "Sarah & James", role: "Wedding Clients", text: "Melting Moments transformed our wedding. The food was not just catering; it was an experience. Guests are still talking about the duck confit.", rating: 5 },
    { author: "Victoria Tech Group", role: "Corporate Client", text: "Chef Paul handled our 300-person corporate gala flawlessly. The execution was punctual, the staff invisible yet attentive, and the flavor profiles were exceptional.", rating: 5 },
    { author: "Elena M.", role: "Private Event Client", text: "The chocolate fountain was the centerpiece of our anniversary. Professional setup, premium ingredients, unparalleled service.", rating: 5 },
  ];

  return (
    <div>
      <header className="container" style={{ paddingTop: "calc(80px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
        <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
        <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Testimonials</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '6rem' }}>
          {reviews.map((rev, i) => (
            <div key={i} className="haus-block-container" style={{ padding: '3rem' }}>
              {rev.rating && (
                <div style={{ color: '#E2C992', fontSize: '1.1rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
                  {'★'.repeat(rev.rating)}
                </div>
              )}
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '2rem', fontStyle: 'italic' }}>"{rev.text}"</p>
              <div>
                <div className="menu-index" style={{ color: 'var(--clr-bone)', opacity: 0.8 }}>— {rev.author}</div>
                {rev.role && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{rev.role}</div>}
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}
