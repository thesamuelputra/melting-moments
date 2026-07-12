import type { Metadata } from 'next';
import { getFaqs } from '@/lib/cms';
import { FALLBACK_FAQS } from '@/lib/fallback-faqs';
import { JsonLd, breadcrumbList, faqPage } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  // Layout template appends ' | Melting Moments Catering Victoria BC'.
  title: 'FAQ',
  description:
    'Frequently asked questions about catering bookings, tastings, ready-made meal ordering, delivery, and dietary accommodations.',
};

type PublicFaq = {
  question: string;
  answer: string;
  category?: 'catering' | 'guidos';
};

function FaqSection({ heading, faqs, keyPrefix }: { heading: string; faqs: PublicFaq[]; keyPrefix: string }) {
  return (
    <>
      <h2 className="menu-index" style={{ marginBottom: '1.5rem', fontSize: 'var(--text-micro)' }}>
        {heading}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {faqs.map((faq, i) => (
          <div key={`${keyPrefix}-${i}`} style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>
              {faq.question}
            </h3>
            <p style={{ opacity: 0.8 }}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default async function FAQ() {
  const cmsFaqs: PublicFaq[] = await getFaqs().catch(() => []);

  // CMS-first: sections are built from the live faqs by category. Only when
  // the CMS is completely empty (or unreachable) do the shared fallbacks
  // render, the same ones the admin module offers to import.
  const source: PublicFaq[] = cmsFaqs.length > 0 ? cmsFaqs : FALLBACK_FAQS;
  const cateringFaqs = source.filter((f) => f.category !== 'guidos'); // 'catering' + uncategorized
  const guidosFaqs = source.filter((f) => f.category === 'guidos');
  const allDisplayed = [...cateringFaqs, ...guidosFaqs];

  return (
    <div>
      <JsonLd data={faqPage(allDisplayed)} />
      <JsonLd
        data={breadcrumbList([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ])}
      />
      <header
        className="container"
        style={{ paddingTop: 'calc(80px + 3vw)', paddingBottom: 'clamp(2rem, 4vw, 4rem)' }}
      >
        <div className="menu-index" style={{ marginBottom: '2rem' }}>
          Questions
        </div>
        <h1 className="haus-display" style={{ textTransform: 'uppercase' }}>
          FAQ
        </h1>
        <div className="spacer-large">
          <div className="noire-divider"></div>
        </div>

        <div style={{ maxWidth: '800px', margin: '3rem auto 0 auto' }}>
          {cateringFaqs.length > 0 && (
            <div style={{ marginBottom: guidosFaqs.length > 0 ? '4rem' : 0 }}>
              <FaqSection heading="Catering" faqs={cateringFaqs} keyPrefix="catering" />
            </div>
          )}
          {guidosFaqs.length > 0 && (
            <FaqSection heading={"Guido's Gourmet"} faqs={guidosFaqs} keyPrefix="guidos" />
          )}
        </div>
      </header>
    </div>
  );
}
