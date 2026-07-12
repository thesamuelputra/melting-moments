import { createElement, type ReactElement } from 'react';
import { jsonLdSafe } from '@/lib/sanitize';

/**
 * Single source of truth for business identity (NAP) and schema.org JSON-LD
 * builders. Every page that emits structured data or references the business
 * name/address/phone should import from here — never hardcode NAP again.
 *
 * Postal code V9A 6L2 verified against src/app/contact/page.tsx and the
 * transactional email templates in src/app/api/*.
 */
export const SITE = {
  name: 'Melting Moments Catering',
  url: 'https://meltingmoments.ca',
  phone: '+1-250-385-2462',
  email: 'info@meltingmoments.ca',
  street: '614 Grenville Ave',
  locality: 'Esquimalt',
  region: 'BC',
  postal: 'V9A 6L2',
  country: 'CA',
  geo: { latitude: 48.4304, longitude: -123.4183 },
  description:
    'Melting Moments provides completely custom catering, corporate setups, and specialized buffet installations across Victoria, BC. A symphony of taste for weddings, private events, and formal dining.',
  facebook: 'https://www.facebook.com/MeltingMomentsCatering',
} as const;

/** Canonical @id for the business entity — every node links back to this. */
export const BUSINESS_ID = `${SITE.url}/#business`;

/** The eight communities named on /service-area (keep the two in sync). */
export const SERVICE_COMMUNITIES = [
  'Victoria',
  'Esquimalt',
  'Oak Bay',
  'Saanich',
  'Langford',
  'Colwood',
  'View Royal',
  'Sidney',
] as const;

/** areaServed nodes: the 8 Greater Victoria communities + Vancouver Island. */
export const AREA_SERVED: Record<string, unknown>[] = [
  ...SERVICE_COMMUNITIES.map((name) => ({ '@type': 'City', name })),
  { '@type': 'AdministrativeArea', name: 'Vancouver Island' },
];

const SERVES_CUISINE = ['Italian', 'International', 'Buffet', 'West Coast'];

function postalAddress(): Record<string, unknown> {
  return {
    '@type': 'PostalAddress',
    streetAddress: SITE.street,
    addressLocality: SITE.locality,
    addressRegion: SITE.region,
    postalCode: SITE.postal,
    addressCountry: SITE.country,
  };
}

// ---------------------------------------------------------------------------
// Input shapes (structural — CMS docs from src/lib/cms.ts satisfy them as-is)
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  /** Path starting with '/', e.g. '/guidos/menu'. '' or '/' for home. */
  path: string;
}

export interface FaqInput {
  question: string;
  answer: string;
}

export interface MenuItemInput {
  name: string;
  description?: string;
  /** Numeric price in CAD — omitted/null items get no Offer node. */
  price?: number | null;
}

export interface MenuSectionInput {
  name: string;
  items: MenuItemInput[];
}

export interface ProductInput {
  name: string;
  category?: string;
  priceFrom: number;
  sizes?: { label: string; price: number }[];
  isAvailable?: boolean;
  image?: string;
}

export interface TestimonialInput {
  author: string;
  text: string;
  rating?: number | null;
}

export interface CatererOptions {
  /** Defaults to SITE.description. */
  description?: string;
  /** Absolute image URL; defaults to the branded 1200x630 OG crop. */
  image?: string;
  /** Social/profile URLs (Facebook, Instagram, Google Business Profile, …). */
  sameAs?: string[];
  /** Structured OpeningHoursSpecification nodes, when real hours exist. */
  openingHours?: Record<string, unknown>[];
  /** Fallback free-text note, e.g. 'Consultations & tastings by appointment'. */
  hoursNote?: string;
}

// ---------------------------------------------------------------------------
// Node builders — plain objects WITHOUT '@context' (JsonLd adds it)
// ---------------------------------------------------------------------------

/**
 * The site-wide business entity. 'Caterer' is not a core schema.org type but
 * is widely used by LLM/GEO extractors; 'FoodEstablishment' (a valid
 * LocalBusiness subtype) carries validation for Google's parsers.
 */
export function catererNode(opts: CatererOptions = {}): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@type': ['Caterer', 'FoodEstablishment'],
    '@id': BUSINESS_ID,
    name: SITE.name,
    alternateName: "Guido's Gourmet",
    description: opts.description ?? SITE.description,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    address: postalAddress(),
    geo: { '@type': 'GeoCoordinates', ...SITE.geo },
    priceRange: '$$',
    servesCuisine: SERVES_CUISINE,
    areaServed: AREA_SERVED,
    founder: {
      '@type': 'Person',
      '@id': `${SITE.url}/chef-paul#person`,
      name: 'Paul Silletta',
      jobTitle: 'Executive Chef & Owner',
      url: `${SITE.url}/chef-paul`,
    },
    image: opts.image ?? `${SITE.url}/og/og-default.jpg`,
    hasMenu: `${SITE.url}/menus`,
    makesOffer: {
      '@type': 'Offer',
      name: "Guido's Gourmet Ready-Made Meals",
      description:
        'Homemade Italian meals ready to heat and serve. Delivery available in Victoria, BC.',
      url: `${SITE.url}/guidos`,
    },
  };
  if (opts.sameAs && opts.sameAs.length > 0) node.sameAs = opts.sameAs;
  if (opts.openingHours && opts.openingHours.length > 0) {
    node.openingHoursSpecification = opts.openingHours;
  } else if (opts.hoursNote) {
    // No fixed retail hours — an OpeningHoursSpecification with only a
    // description is the least-wrong way to say 'by appointment'.
    node.openingHoursSpecification = {
      '@type': 'OpeningHoursSpecification',
      description: opts.hoursNote,
    };
  }
  return node;
}

/** WebSite node linking back to the business entity. */
export function websiteNode(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'en-CA',
    publisher: { '@id': BUSINESS_ID },
  };
}

export function breadcrumbList(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

export function faqPage(faqs: FaqInput[]): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** schema.org Menu > MenuSection > MenuItem (+Offer) for /menus. */
export function menuNode(sections: MenuSectionInput[]): Record<string, unknown> {
  return {
    '@type': 'Menu',
    '@id': `${SITE.url}/menus#menu`,
    name: `${SITE.name} Menu`,
    inLanguage: 'en-CA',
    provider: { '@id': BUSINESS_ID },
    hasMenuSection: sections.map((section) => ({
      '@type': 'MenuSection',
      name: section.name,
      hasMenuItem: section.items.map((item) => {
        const node: Record<string, unknown> = { '@type': 'MenuItem', name: item.name };
        if (item.description) node.description = item.description;
        if (typeof item.price === 'number') {
          node.offers = {
            '@type': 'Offer',
            price: item.price.toFixed(2),
            priceCurrency: 'CAD',
          };
        }
        return node;
      }),
    })),
  };
}

/** ItemList of Guido's Product nodes with AggregateOffer pricing. */
export function productNodes(
  products: ProductInput[],
  pageUrl: string = `${SITE.url}/guidos/menu`
): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => {
      const sizePrices = (p.sizes ?? []).map((s) => s.price);
      const low = sizePrices.length > 0 ? Math.min(p.priceFrom, ...sizePrices) : p.priceFrom;
      const high = sizePrices.length > 0 ? Math.max(p.priceFrom, ...sizePrices) : p.priceFrom;
      const offers: Record<string, unknown> = {
        '@type': 'AggregateOffer',
        lowPrice: low.toFixed(2),
        priceCurrency: 'CAD',
        offerCount: Math.max(sizePrices.length, 1),
        availability:
          p.isAvailable === false
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
        url: pageUrl,
      };
      if (high > low) offers.highPrice = high.toFixed(2);
      const product: Record<string, unknown> = {
        '@type': 'Product',
        name: p.name,
        brand: { '@type': 'Brand', name: "Guido's Gourmet" },
        offers,
      };
      if (p.category) product.category = p.category;
      if (p.image) product.image = p.image;
      return { '@type': 'ListItem', position: i + 1, item: product };
    }),
  };
}

/** Person node for /chef-paul — reciprocates catererNode's founder link. */
export function personChefPaul(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': `${SITE.url}/chef-paul#person`,
    name: 'Paul Silletta',
    jobTitle: 'Executive Chef & Owner',
    url: `${SITE.url}/chef-paul`,
    worksFor: { '@id': BUSINESS_ID },
    knowsAbout: SERVES_CUISINE,
  };
}

/**
 * Business @id node carrying Review children for /testimonials.
 * Deliberately NO aggregateRating — Google treats self-serving aggregate
 * ratings on a business's own site as a structured-data policy violation.
 */
export function reviewNodes(testimonials: TestimonialInput[]): Record<string, unknown> {
  return {
    '@type': ['Caterer', 'FoodEstablishment'],
    '@id': BUSINESS_ID,
    name: SITE.name,
    url: SITE.url,
    review: testimonials.map((t) => {
      const review: Record<string, unknown> = {
        '@type': 'Review',
        author: { '@type': 'Person', name: t.author },
        reviewBody: t.text,
      };
      if (typeof t.rating === 'number') {
        review.reviewRating = {
          '@type': 'Rating',
          ratingValue: t.rating,
          bestRating: 5,
        };
      }
      return review;
    }),
  };
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

/**
 * Server component: renders a JSON-LD <script>, XSS-safe via jsonLdSafe.
 * Adds '@context' if the node doesn't already carry one, so builders above
 * can be passed directly: <JsonLd data={faqPage(faqs)} />
 * (createElement instead of JSX so this file can stay .ts)
 */
export function JsonLd({ data }: { data: object }): ReactElement {
  const payload = '@context' in data ? data : { '@context': 'https://schema.org', ...data };
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: jsonLdSafe(payload) },
  });
}
