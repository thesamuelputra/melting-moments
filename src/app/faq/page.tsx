import { Metadata } from 'next';
import Script from 'next/script';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

export const metadata: Metadata = {
  title: 'FAQ | Melting Moments Catering Victoria BC',
  description: 'Frequently asked questions about booking, tastings, dietary accommodations, and catering services at Melting Moments.',
};

export default async function FAQ() {
  const rawFaqs = await fetchQuery(api.faqs.listActive);

  // Fall back to static defaults if no CMS FAQs exist yet
  const faqs = rawFaqs.length > 0 ? rawFaqs : [
    { question: "How far in advance should I book?", answer: "For weddings, we recommend booking 9-12 months in advance. For corporate and private events, 2-3 months is preferred, though we can sometimes accommodate shorter notices." },
    { question: "Do you provide tastings?", answer: "Yes. Once an initial proposal is approved, we schedule a private tasting with Chef Paul to finalize the menu." },
    { question: "Are staff and rentals included?", answer: "Our proposals are comprehensive and customized. We can include professional waitstaff, bartenders, and coordinate all necessary rentals (linens, glassware, plates) based on your needs." },
    { question: "Do you accommodate dietary restrictions?", answer: "Absolutely. We are highly experienced in creating exceptional vegan, gluten-free, and allergy-safe menus that meet our award-winning standards." }
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <div>
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header className="container" style={{ paddingTop: "calc(80px + 3vw)", paddingBottom: "clamp(2rem, 4vw, 4rem)" }}>
        <div className="menu-index" style={{ marginBottom: "2rem" }}>Information</div>
        <h1 className="haus-display" style={{ textTransform: "uppercase" }}>FAQ</h1>

        <div style={{ maxWidth: '800px', margin: '3rem auto 0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>{faq.question}</h3>
              <p style={{ opacity: 0.8 }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}
