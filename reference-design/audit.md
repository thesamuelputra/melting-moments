# Melting Moments — World-Class Audit

> Full codebase + visual audit performed 2026-04-25

---

## 🔴 P0 — Critical Errors

### 1. Contact API is a mock — no emails are sent
The `/api/contact/route.ts` only `console.log`s the submission. Users fill out a 3-step form and get a "Request Received" confirmation, but **no email is actually delivered** to Chef Paul or the client. This is a broken conversion funnel.

> [!CAUTION]
> Every quote submission is silently lost. This needs Resend/SendGrid integration immediately.

### 2. Three images are **10MB each** — catastrophic LCP
| File | Size |
|---|---|
| `hero-main.jpg` | **9.9 MB** |
| `menu-pasta.jpg` | **11 MB** |
| `family-spread.jpg` | **10 MB** |

These are raw camera files being served directly. On 4G mobile, the hero alone takes **8+ seconds** to load. Core Web Vitals will fail hard. They need to be converted to WebP at ~200KB each.

### 3. 11 of 17 pages have **no `<title>` or `<meta description>`**
Missing SEO metadata:
- `/contact`, `/corporate`, `/faq`, `/menus`, `/privacy`, `/private-events`, `/quote`, `/service-area`, `/terms`, `/testimonials`, `/weddings`

Google will show "Melting Moments | Award Winning Catering Victoria BC" for *every single page*. This kills SEO badly — each page should have a unique, keyword-targeted title.

---

## 🟠 P1 — Missing Elements

### 4. 10 orphaned images wasting ~2.1MB in `/public`
Previously-swapped images still sit in the bundle:
`macro_entree.jpg`, `salmon_plating_hq.jpg`, `salmon_plating_wide.jpg`, `chef_plating.webp`, `fountain_prep.webp`, `hero_prep.webp`, `macro_chocolate.webp`, `macro_harvest.webp`, `macro_olive_oil.webp`, `macro_steak.webp`

### 5. Gallery page has zero height images
The gallery uses `fill` with no explicit `height` on the container, and `shape-oval`/`shape-editorial-tall` rely on `aspect-ratio` but the parent has no fixed dimension. Images may collapse to 0px on some browsers.

### 6. No `robots.txt` customization
`robots.ts` exists but doesn't block `/api/`, `/quote/`, or other non-public routes from crawling.

### 7. Contact form has no client-side validation
- Step 1 doesn't require `eventType` selection before proceeding
- No email format validation beyond HTML5 `type="email"`
- No loading state on submit button (user can double-submit)

### 8. No `<link rel="canonical">` on subpages
Without canonical URLs, duplicate content issues can arise, especially with trailing slashes.

---

## 🟡 P2 — Improvement Opportunities

### 9. `next.config.ts` is completely empty
No image optimization config, no security headers, no redirects. At minimum:
- Add `images.formats: ['image/avif', 'image/webp']`
- Add security headers (X-Frame-Options, CSP, HSTS)
- Add trailing slash normalization

### 10. No scroll-driven animations or entrance effects
For a "world-class editorial" site, content appears instantly with zero motion. Award-winning sites use:
- Intersection Observer fade-ins on sections
- Parallax on hero images
- Staggered text reveals

The CSS has a `fadeIn` keyframe but it's only used on filter toggle, not on page sections.

### 11. Footer is minimal — missing phone number, email, business hours
The footer has nav links but doesn't surface the phone number `250.385.2462` or email `info@meltingmoments.ca`. These are buried in the Contact page only. A catering business *needs* phone access from every page.

### 12. No `loading.tsx` or `Suspense` boundaries
Next.js 16 supports per-route loading states. Currently, route transitions rely solely on the shutter animation — if the destination page has heavy images, the user sees a blank white flash after the shutter opens.

### 13. Testimonials are hardcoded with only 3 reviews
For credibility, this should either pull from Google Reviews or have at least 6-8 testimonials with verified sources.

### 14. Mobile nav doesn't show current page indicator
Desktop links don't highlight the active page either. Users have no orientation signal of where they are in the site.

### 15. `dangerouslySetInnerHTML` used for inline styles
Both `GlobalNav.tsx` and `gallery/page.tsx` inject raw CSS via `dangerouslySetInnerHTML`. This is a security anti-pattern and should use Next.js CSS Modules or `styled-jsx`.

### 16. No Open Graph images for subpages
Only the root layout sets an OG image. Social shares from `/weddings`, `/corporate`, etc. will show a generic fallback.

### 17. Quote page exists in sitemap but purpose is unclear
`/quote` appears in the sitemap but seems to duplicate `/contact`. Either consolidate or differentiate.

---

## Summary Priority Matrix

| Priority | Count | Impact |
|---|---|---|
| 🔴 P0 Critical | 3 | Broken conversions, 10s load times, invisible to Google |
| 🟠 P1 Missing | 4 | Wasted bandwidth, broken gallery, no validation |
| 🟡 P2 Improve | 9 | No motion, no security headers, weak footer, no OG images |

---

## Recommended Action Order

1. **Compress the 3 giant images** → WebP, ~200KB each (instant LCP win)
2. **Wire up contact API** → Resend/SendGrid with real email delivery
3. **Add metadata to all 11 pages** → unique `<title>` + `<meta description>`
4. **Delete 10 orphan images** → clean bundle
5. **Add `next.config.ts` headers + image optimization**
6. **Add scroll-driven entrance animations** → world-class motion
7. **Surface phone/email in footer**
8. **Add form validation + loading states**
9. **Clean up `dangerouslySetInnerHTML`**
