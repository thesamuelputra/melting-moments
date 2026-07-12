# SEO

How metadata, OpenGraph images, structured data, and crawler-facing routes work, and the rules content editors need to follow. For rendering and caching behavior see [architecture.md](architecture.md).

## Metadata system

The root layout (`src/app/layout.tsx`) declares the site-wide defaults:

- **Title template.** The default title is `Melting Moments | Catering & Ready-Made Meals, Victoria BC`; the template is `%s | Melting Moments Catering Victoria BC`. Pages set only their unique phrase (`title: 'Wedding Catering'`) and the template appends the brand and geo suffix. Guido's Gourmet routes carry their own brand and opt out with `title: { absolute: "Guido's Gourmet | ..." }`.
- **Canonical strategy.** `metadataBase` is `https://meltingmoments.ca` (from `SITE.url`) and the root layout sets `alternates: { canonical: './' }`. A relative `'./'` resolves against each route's own path, so every page canonicalizes to itself from a single declaration, with no per-page canonical boilerplate. The same `'./'` is used for `openGraph.url`, so social shares of deep pages do not all collapse onto the homepage URL.
- **Viewport.** `themeColor: '#070707'`, matching the dark brand background.
- **Other defaults.** `twitter: { card: 'summary_large_image' }`, `openGraph.locale: 'en_CA'`, favicon set (32 and 16 pixel PNGs plus an Apple touch icon), and a default OG image (below).

The admin layout sets `robots: { index: false, follow: false }` so admin pages carry a noindex meta tag on top of the robots.txt disallow.

## OpenGraph pipeline

Every OG image is a generated 1200x630 JPEG crop in `public/og/`, produced from the source photography in `public/` by `scripts/generate-og.mjs`. Regenerate whenever a source photo changes:

```bash
node scripts/generate-og.mjs
```

The script uses sharp with `fit: 'cover'` and `position: 'attention'`, which centers the crop on the most visually salient region (this matters for the portrait and square sources), and writes JPEG at quality 80 with mozjpeg. The mapping lives in the `JOBS` array:

| Source (`public/`) | Output (`public/og/`) | Used by |
| --- | --- | --- |
| `hero-main.webp` | `og-default.jpg` | Root layout default, `/contact`, `/catering`, and all `/guidos` routes |
| `catering_menu_hero.webp` | `og-corporate.jpg` | `/corporate` |
| `catering_menu_hero.webp` | `og-menus.jpg` | `/menus` |
| `wedding_entree.webp` | `og-weddings.jpg` | `/weddings` |
| `private_dinner.webp` | `og-private-events.jpg` | `/private-events` |
| `copper_pots.webp` | `og-about.jpg` | `/about` and `/fountains` |
| `macro_roulade.webp` | `og-family-style.jpg` | `/family-style` |
| `chef_plating_sauce.webp` | `og-chef.jpg` | `/chef-paul` |

There is no `og-guidos.jpg` yet because `public/guidos/` has no real hero photograph (only product shots and a placeholder SVG); the Guido's routes intentionally reuse `og-default.jpg`. When real Guido's photography lands, add a job entry and switch those routes over.

## Structured data graph

`src/lib/seo.ts` is the single source of truth for business identity and every JSON-LD builder. Pages must import from it rather than hardcoding the name, address, or phone.

- **`SITE`** holds the NAP (name, address, phone), email, coordinates, description, and Facebook URL. The postal code `V9A 6L2` must match `src/app/contact/page.tsx` and the email templates in `src/app/api/`.
- **`BUSINESS_ID`** is `https://meltingmoments.ca/#business`, the canonical `@id` of the business entity. Every node links back to it, forming one connected graph rather than isolated islands.

The builders, and where each is emitted:

| Builder | Node type | Emitted by |
| --- | --- | --- |
| `catererNode` | `['Caterer', 'FoodEstablishment']` with address, geo, `areaServed`, founder, `hasMenu`, and a `makesOffer` for Guido's | Root layout, so every page |
| `websiteNode` | `WebSite` linking back to the business | Root layout, so every page |
| `breadcrumbList` | `BreadcrumbList` | Nearly every public page |
| `faqPage` | `FAQPage` with all displayed questions | `/faq` |
| `menuNode` | `Menu` > `MenuSection` > `MenuItem`, with an `Offer` only for items that have a numeric `price` (display-only labels like `$8.95/pp` get no Offer) | `/menus` |
| `productNodes` | `ItemList` of `Product` nodes with `AggregateOffer` pricing (low and high computed from `priceFrom` and the sizes array, CAD, `InStock`/`OutOfStock` from `isAvailable`) | `/guidos/menu` |
| `personChefPaul` | `Person` with `worksFor` pointing at `BUSINESS_ID`, reciprocating the business node's `founder` link | `/chef-paul` |
| `reviewNodes` | The business `@id` node carrying `Review` children | `/testimonials` |

Design decisions worth knowing:

- `Caterer` is not a core schema.org type, but answer-engine extractors use it widely; `FoodEstablishment` is a valid `LocalBusiness` subtype that satisfies Google's validators. The business node carries both.
- `reviewNodes` deliberately emits no `aggregateRating`: Google treats self-serving aggregate ratings on a business's own site as a structured-data policy violation.
- The root layout sources `sameAs` and opening-hours from CMS settings (`social_facebook`, `social_instagram`, `social_google_business`, `business_hours_note`), so the owner can grow identity signals without a deploy. With no structured hours, the hours note renders as an `OpeningHoursSpecification` carrying only a `description`, the least-wrong way to express "by appointment".

**Escaping.** The `JsonLd` server component renders `<script type="application/ld+json">` via `dangerouslySetInnerHTML`, serialized with `jsonLdSafe` (`src/lib/sanitize.ts`). `JSON.stringify` alone does not escape `</script>`, so CMS-controlled content (an FAQ answer, a testimonial) could otherwise break out of the script element and execute as stored XSS. `jsonLdSafe` escapes `<`, `>`, and `&` as unicode escapes, which neutralizes the vector while remaining valid JSON-LD. `JsonLd` also adds `@context: 'https://schema.org'` when the node lacks one, so builders can be passed directly.

## llms.txt

`src/app/llms.txt/route.ts` serves a curated plain-text business summary for answer engines (Perplexity, ChatGPT browsing, Claude, and similar). It revalidates on the same 300-second ISR window as the pages and is composed from live CMS content:

- Business summary, website, and the five service lines with URLs.
- The full catering menu grouped by category with price labels, in the same order as `/menus` data.
- Available Guido's products with sizes, prices, and limited-edition flags (unavailable products are excluded).
- Service area, delivery terms, contact details, hours note, and booking terms.
- The complete FAQ list as question and answer pairs.

Each CMS getter degrades independently: if Convex is unreachable, the affected section falls back to a pointer at the live page instead of failing the whole response.

## Sitemap and robots

`src/app/sitemap.ts` lists all indexable routes with tiered priorities: conversion pages (home, `/catering`, `/contact`, `/menus`, `/weddings`, `/corporate`, `/guidos`, `/guidos/menu`) at 0.9 to 1.0, service pages at 0.8, utility pages at 0.6 to 0.7, legal pages at 0.3. `/menus` and `/guidos/menu` are marked `weekly` because their content is CMS-driven.

Two deliberate omissions:

- **No `lastModified`.** Stamping every URL with the build time is fake freshness that Google detects and then ignores; omitting the field entirely is better than an inaccurate one. Do not add it back unless it can carry real per-page modification times.
- **No `/quote`.** That route issues a permanent redirect (308) to `/contact` so link equity consolidates there; redirecting URLs do not belong in a sitemap.

`src/app/robots.ts` allows everything except `/admin`, `/admin-login`, and `/api/`, and points at `https://meltingmoments.ca/sitemap.xml`.

## Content guidelines

Rules for anyone editing copy, whether through the admin console or in code:

**Keep NAP consistent.** The business name, address, and phone must be identical everywhere they appear: `SITE` in `src/lib/seo.ts` (which feeds all structured data and llms.txt), the contact page, the email templates in `src/app/api/`, and external listings (Google Business Profile, Facebook). Inconsistent NAP dilutes local-search trust. If any element changes, update `SITE` first, then search the repository for the old value.

**FAQ categories map to public sections.** An FAQ's category is `catering`, `guidos`, or unset. The public `/faq` page renders two sections: "Catering" (category `catering` plus every uncategorized FAQ) and "Guido's Gourmet" (category `guidos`). All displayed FAQs are emitted together in a single `FAQPage` node. The fallback set in `src/lib/fallback-faqs.ts` renders only when the CMS `faqs` table is empty or unreachable, and it is the same set the admin FAQ module's "Import starter FAQs" button seeds; edit that one file, never fork the copy.

**Menu category order is CMS-managed.** The section order on `/menus` comes from the `businessSettings` key `menu_category_order`, a comma-joined list of category names managed from the admin Menu Editor's "Order categories" panel. When unset, `DEFAULT_CATEGORY_ORDER` in `src/lib/menu-category-order.ts` applies. Categories present in the data but missing from the list are appended alphabetically, so a newly created category never disappears; it appears at the end until explicitly ordered. Because the setting is comma-joined, category names cannot contain commas (the admin action rejects them).

**Page titles.** New pages set a short unique phrase and let the template supply the suffix. Keep the phrase under roughly 30 characters so the combined title stays within display limits. Guido's pages use `title: { absolute: ... }` with the Guido's brand.

**Publishing latency.** Admin saves invalidate the cache immediately, so edits are live on the next request. The 300-second revalidation window only applies to changes made outside the admin console.
