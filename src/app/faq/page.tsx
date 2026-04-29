import type { Metadata } from 'next';
import Script from 'next/script';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/../convex/_generated/api';

export const metadata: Metadata = {
  title: 'FAQ | Melting Moments & Guido\'s Gourmet | Victoria BC',
  description: 'Frequently asked questions about catering bookings, tastings, ready-made meal ordering, delivery, and dietary accommodations.',
};

const GUIDOS_FAQS = [
  { question: "How do I place an order for ready-made meals?", answer: "Visit our Order page and fill out the form with your meal selections. Chef Paul will confirm your order and arrange delivery or pickup within 24 hours." },
  { question: "What is the delivery fee?", answer: "Delivery is a flat rate of $12.50 anywhere in the Greater Victoria area." },
  { question: "Can I pick up my order instead?", answer: "Yes. Pickup is available by appointment at 614 Grenville Ave, Esquimalt. Paul will arrange a time that works when he confirms your order." },
  { question: "How long do the meals last?", answer: "Most meals are fresh and should be consumed within 3-5 days when refrigerated. Soups and stews freeze well for up to 3 months. Reheating instructions are included with each order." },
  { question: "Do you accommodate dietary restrictions for ready-made meals?", answer: "Yes. We offer vegan and vegetarian options. If you have specific allergies, mention them in the order notes and Paul will advise on safe options." },
  { question: "What are Tiramisu Cans?", answer: "Individual-portion tiramisu in sealed cans, available in 5 flavours. They keep refrigerated for up to 2 weeks and make perfect gifts." },
];

const CATERING_FAQS = [
  { question: "How far in advance should I book?", answer: "For weddings, we recommend booking 9-12 months in advance. For corporate and private events, 2-3 months is preferred, though we can sometimes accommodate shorter notices." },
  { question: "Do you provide tastings?", answer: "Yes. Once an initial proposal is approved, we schedule a private tasting with Chef Paul to finalize the menu." },
  { question: "Are staff and rentals included?", answer: "Our proposals are comprehensive and customized. We can include professional waitstaff, bartenders, and coordinate all necessary rentals (linens, glassware, plates) based on your needs." },
  { question: "Do you accommodate dietary restrictions?", answer: "Absolutely. We are highly experienced in creating exceptional vegan, gluten-free, and allergy-safe menus that meet our award-winning standards." },
];

export default async function FAQ() {
  const rawFaqs = await fetchQuery(api.faqs.listActive);

  // Fall back to static defaults if no CMS FAQs exist yet
  const faqs = rawFaqs.length > 0 ? rawFaqs : [...CATERING_FAQS, ...GUIDOS_FAQS];

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

        {/* Catering FAQs */}
        <div style={{ maxWidth: '800px', margin: '3rem auto 0 auto' }}>
          <div className="menu-index" style={{ marginBottom: '1.5rem', fontSize: 'var(--text-micro)' }}>Catering</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem' }}>
            {(rawFaqs.length > 0 ? faqs : CATERING_FAQS).map((faq, i) => (
              <div key={`catering-${i}`} style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>{faq.question}</h3>
                <p style={{ opacity: 0.8 }}>{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Guido's FAQs (only show static section when using fallbacks) */}
          {rawFaqs.length === 0 && (
            <>
              <div className="menu-index" style={{ marginBottom: '1.5rem', fontSize: 'var(--text-micro)' }}>Ready-Made Meals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {GUIDOS_FAQS.map((faq, i) => (
                  <div key={`guidos-${i}`} style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>{faq.question}</h3>
                    <p style={{ opacity: 0.8 }}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
