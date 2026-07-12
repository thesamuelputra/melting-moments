import { Metadata } from 'next';
import Link from 'next/link';
import { getTestimonials } from '@/lib/cms';
import { JsonLd, breadcrumbList, reviewNodes } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  // Layout template appends ' | Melting Moments Catering Victoria BC'.
  title: 'Testimonials',
  description:
    'Read what our clients say about their experience with Melting Moments Catering in Victoria, BC.',
};

/** Only whole-number 1–5 ratings render stars / structured data. */
const isValidRating = (r: unknown): r is number =>
  typeof r === 'number' && Number.isInteger(r) && r >= 1 && r <= 5;

export default async function Testimonials() {
  const reviews = await getTestimonials().catch(() => []);

  return (
    <div>
      {reviews.length > 0 && (
        <JsonLd
          data={reviewNodes(
            reviews.map((rev) => ({
              author: rev.author,
              text: rev.text,
              rating: isValidRating(rev.rating) ? rev.rating : null,
            }))
          )}
        />
      )}
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'Testimonials', path: '/testimonials' },
        ])}
      />
      <header className="container" style={{ paddingTop: "calc(80px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
        <div className="menu-index" style={{ marginBottom: "2rem" }}>Kind Words</div>
        <h1 className="haus-display" style={{ textTransform: "uppercase" }}>Testimonials</h1>
        <div className="spacer-large">
          <div className="noire-divider"></div>
        </div>

        {reviews.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            {reviews.map((rev, i) => (
              <div key={i} className="haus-block-container" style={{ padding: '3rem' }}>
                {isValidRating(rev.rating) && (
                  <div role="img" aria-label={`${rev.rating} out of 5 stars`} style={{ color: '#E2C992', fontSize: '1.1rem', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
                    {'★'.repeat(rev.rating)}
                  </div>
                )}
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', lineHeight: 1.4, marginBottom: '2rem', fontStyle: 'italic' }}>&ldquo;{rev.text}&rdquo;</p>
                <div>
                  <div className="menu-index" style={{ color: 'var(--clr-bone)', opacity: 0.8 }}>— {rev.author}</div>
                  {rev.role && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{rev.role}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: '3rem', maxWidth: '55ch' }}>
            <p style={{ fontSize: 'var(--text-body)', opacity: 0.8, lineHeight: 1.7, marginBottom: '2rem' }}>
              We&apos;re gathering words from recent clients. In the meantime, we&apos;d be glad to tell you about our work directly.
            </p>
            <Link href="/contact" className="btn-solid">Get in Touch</Link>
          </div>
        )}
      </header>
    </div>
  );
}
