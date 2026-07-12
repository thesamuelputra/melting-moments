/**
 * Single source of truth for the fallback FAQs.
 *
 * These render on the public /faq page whenever the CMS `faqs` table is
 * empty, and seed the CMS via the admin FAQ module's "Import starter FAQs"
 * button. Both surfaces import from here; never duplicate these strings
 * (a copy in the admin module previously drifted from the public page).
 *
 * Categories map to the public page sections:
 *   'catering' → the "Catering" section (uncategorized CMS FAQs land here too)
 *   'guidos'   → the "Guido's Gourmet" ready-made meals section
 */
export type FallbackFaqCategory = 'catering' | 'guidos';

export type FallbackFaq = {
  question: string;
  answer: string;
  category: FallbackFaqCategory;
};

export const FALLBACK_FAQS: FallbackFaq[] = [
  // ===== Catering =====
  {
    question: 'How far in advance should I book?',
    answer:
      'For weddings, we recommend booking 9-12 months in advance. For corporate and private events, 2-3 months is preferred, though we can sometimes accommodate shorter notices.',
    category: 'catering',
  },
  {
    question: 'Do you provide tastings?',
    answer:
      'Yes. Once an initial proposal is approved, we schedule a private tasting with Chef Paul to finalize the menu.',
    category: 'catering',
  },
  {
    question: 'Are staff and rentals included?',
    answer:
      'Our proposals are comprehensive and customized. We can include professional waitstaff, bartenders, and coordinate all necessary rentals (linens, glassware, plates) based on your needs.',
    category: 'catering',
  },
  {
    question: 'Do you accommodate dietary restrictions?',
    answer:
      'Absolutely. We are highly experienced in creating exceptional vegan, gluten-free, and allergy-safe menus that meet our exacting standards.',
    category: 'catering',
  },
  // ===== Guido's Gourmet (ready-made meals) =====
  {
    question: 'How do I place an order for ready-made meals?',
    answer:
      'Visit our Order page and fill out the form with your meal selections. Chef Paul will confirm your order and arrange delivery or pickup within 24 hours.',
    category: 'guidos',
  },
  {
    question: 'What is the delivery fee?',
    answer: 'Delivery is a flat rate of $12.50 anywhere in the Greater Victoria area.',
    category: 'guidos',
  },
  {
    question: 'Can I pick up my order instead?',
    answer:
      'Yes. Pickup is available by appointment at 614 Grenville Ave, Esquimalt. Paul will arrange a time that works when he confirms your order.',
    category: 'guidos',
  },
  {
    question: 'How long do the meals last?',
    answer:
      'Most meals are fresh and should be consumed within 3-5 days when refrigerated. Soups and stews freeze well for up to 3 months. Reheating instructions are included with each order.',
    category: 'guidos',
  },
  {
    question: 'Do you accommodate dietary restrictions for ready-made meals?',
    answer:
      'Yes. We offer vegan and vegetarian options. If you have specific allergies, mention them in the order notes and Paul will advise on safe options.',
    category: 'guidos',
  },
  {
    question: 'What are Tiramisu Cans?',
    answer:
      'Individual-portion tiramisu in sealed cans, available in 5 flavours. They keep refrigerated for up to 2 weeks and make perfect gifts.',
    category: 'guidos',
  },
];
