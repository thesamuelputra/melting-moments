# Full-site audit

Running log. Started 2026-07-18. Auditor acting as senior full-stack engineer, QA lead, performance engineer, and product designer.

## Context (resolved)

| | |
| --- | --- |
| Project root | /Users/samuelputra/Documents/Personals/melting-moments |
| Stack | Next.js 16.2.7 (App Router, Turbopack) · TypeScript 5 · React 19.2 · hand-written CSS (globals.css + admin.css) · Convex 1.36 data layer · Resend email · Vercel hosting |
| Install / dev / build | `npm install` · `npm run dev` · `npm run build` |
| Test / lint / typecheck | no unit-test suite present · `npm run lint` · `npx tsc --noEmit` |
| Local prod URL | http://localhost:3111 (`next start`) |
| Live alias | https://melting-moments-seven.vercel.app (custom domain meltingmoments.ca not yet cut over) |
| Target browsers | latest Chrome, Firefox, Safari; iOS Safari; Android Chrome |
| Two brands | Melting Moments Catering (parent, monochrome) and Guido's Gourmet (`/guidos`, cream/tricolour sub-brand) |
| Out of scope | none stated; admin is password-gated (dev throwaway credential held for testing) |

## Route inventory

Public (static + ISR, revalidate 300s): `/`, `/about`, `/catering`, `/chef-paul`, `/contact`, `/corporate`, `/family-style`, `/faq`, `/fountains`, `/guidos`, `/guidos/menu`, `/guidos/order`, `/menus`, `/privacy`, `/private-events`, `/quote` (redirects to `/contact`), `/service-area`, `/terms`, `/testimonials`, `/weddings`, `/llms.txt`, `/robots.txt`, `/sitemap.xml`.

Admin (dynamic, gated): `/admin`, `/admin-login`, `/admin/banner`, `/admin/content`, `/admin/faq`, `/admin/guidos-orders`, `/admin/guidos-products`, `/admin/inquiries`, `/admin/menus`, `/admin/settings`, `/admin/testimonials`.

API: `POST /api/contact`, `POST /api/guidos-order`.

Primary flows: catering quote request (`/contact` to `/api/contact`), Guido's order request (`/guidos/order` to `/api/guidos-order`), admin login and content CRUD, public browsing of menus/services.

## Phase 1 automated sweep (baseline)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors, 12 warnings (react-hooks/set-state-in-effect x7, unused eslint-disable x4, exhaustive-deps ref-in-cleanup x1) |
| `npm run build` | clean, 39 routes (public static/ISR, admin dynamic) |
| `npm audit` | 3 high: sharp/libvips CVEs, next depends on sharp, brace-expansion DoS (all transitive) |
| Total static JS | ~1.1 MB; largest chunk 227 KB (framework) |
| TS suppressions | 0 `@ts-ignore`, 0 `@ts-expect-error`, 0 `as any` |
| eslint-disable | 7 (5 in Convex generated files, 2 justified `no-img-element` admin thumbnails) |
| Debug leftovers | 0 stray `console.log` in render paths; all `console.*` are server-side error/intrusion logging |
| TODO/FIXME/HACK | 0 |
| Placeholder copy | 0 |
| Hardcoded localhost/secrets in src | none |

## Executive summary

The site is in strong shape: typecheck and build are clean, there are no crashes, no data-loss paths, no exposed secrets, security headers are present on the live alias, structured data is complete on every route, and a mobile sweep found no horizontal overflow and a Cumulative Layout Shift of 0 on the key pages. The exhaustive pass (six code and curl auditors plus a browser sweep, every P0/P1 adversarially verified) surfaced 49 findings and zero false positives. There were no P0s. One functional P1 was real and is fixed: the admin displayed every customer event date one day early because a date-only string was parsed as UTC and formatted in Pacific time, an operational hazard for a catering business. The other P1 is the known go-live item: every SEO signal points at meltingmoments.ca, which still serves the old site because the domain has not been cut over to this deployment. The remaining findings are P2 and P3: accessibility polish (a missing h1 on the Guido's hub, one skipped heading level, low-contrast mobile sub-links, filter buttons that did not expose their selected state), performance nits (a font preloaded site-wide but used only on Guido's, three hero images missing the priority hint, an LCP-deferring image fade), content and consistency issues (a confirmation email that contradicted the stated response time, inconsistent price formatting, a run-on menu line), and code-health items (a few duplicated helpers, one dead component, generated files being linted). Thirty-six were fixed mechanically in this pass; thirteen are flagged for a human decision in FOLLOWUPS.md (domain cutover, dependency CVEs, a handful of refactors, and design or content decisions).

## Findings

Status: `fixed` = corrected and verified in this pass; `flagged` = documented in FOLLOWUPS.md for a human decision.

| ID | Severity | Area | Description | Location / repro | Status |
| --- | --- | --- | --- | --- | --- |
| F01 | P1 | Admin / date handling | Event date displays one day early across the entire admin (UTC parse of a date-only string) | src/app/admin/inquiries/AdminInquiriesClient.tsx:355 | fixed |
| F02 | P1 | SEO / production-readiness / go-li | Canonical domain meltingmoments.ca serves a stale 2023 WordPress site over HTTP and has no worki | DNS/infra + src/lib/seo.ts:14 (SITE.url), src/app/si | flagged |
| F03 | P2 | accessibility / keyboard & focus ( | Admin mobile sidebar stays in the tab order off-screen and traps no focus when open | src/app/admin/admin.css:639-645; src/app/admin/Admin | fixed |
| F04 | P2 | accessibility / state exposure (WC | Category filter buttons don't expose their selected state to assistive tech | src/app/corporate/CorporateMenuClient.tsx:43-57; src | fixed |
| F05 | P2 | accessibility / heading structure  | Contact page skips a heading level (h1 → h3) | src/app/contact/ContactClient.tsx:149,157,165 | fixed |
| F06 | P2 | accessibility / heading structure  | Guido's landing page (/guidos) has no h1 | src/app/guidos/page.tsx:34-41 | fixed |
| F07 | P2 | accessibility / color contrast (WC | Multiple small-text elements below 4.5:1, including mobile nav sub-links | src/components/GlobalNav.tsx:330,356,382; src/app/fo | fixed |
| F08 | P2 | performance / images / LCP | Above-the-fold hero images missing `priority` on family-style, corporate, and private-events | src/app/family-style/page.tsx:43, src/app/corporate/ | fixed |
| F09 | P2 | performance / font loading | Dancing Script font is preloaded high-priority on every route but only used on /guidos | src/app/layout.tsx:25-30 (declaration), src/app/layo | fixed |
| F10 | P2 | hardcoded-values / drift | Human-facing NAP is hardcoded in ~12 places, bypassing the canonical SITE constant; tel: hrefs a | src/lib/seo.ts:12; src/components/Footer.tsx:76; src | fixed |
| F11 | P2 | SEO / accessibility | /guidos landing page renders zero <h1> (hero is a non-semantic SVG wordmark) | src/app/guidos/page.tsx:35-41 | fixed |
| F12 | P2 | Content / expectation-setting (cat | Confirmation email contradicts the site's response-time promise and invents a "concierge team" | src/app/api/contact/route.ts:119 | fixed |
| F13 | P2 | Navigation / conversion (dead-end  | Fountains and Family-Style pages present pricing then dead-end with no in-body CTA | src/app/fountains/page.tsx:108 | fixed |
| F14 | P2 | Error handling / recovery UX | Primary page error boundary uses bare "Something went wrong!" with no way to reach a human | src/app/error.tsx:19 | fixed |
| F15 | P3 | accessibility / landmarks & headin | Admin: h2 precedes the page h1, and the primary sidebar nav is unlabeled | src/app/admin/AdminLayoutClient.tsx:243,247,337 | fixed |
| F16 | P3 | accessibility / images (WCAG 1.1.1 | GuidosImage announces its alt text twice until (or unless) the photo loads | src/components/GuidosImage.tsx:47-73 | fixed |
| F17 | P3 | API routes / email delivery | A thrown Resend error after the lead is saved returns 500, producing duplicate submissions on re | src/app/api/contact/route.ts:80-135 (bubbles to catc | fixed |
| F18 | P3 | Public forms / contact | Event-date `min` is computed in UTC, blocking same-day selection in the evening (Pacific time) | src/app/contact/ContactClient.tsx:207 | fixed |
| F19 | P3 | Security / rate limiting | In-memory contact/order rate limiter is unreliable on the edge/serverless deployment | src/proxy.ts:66-99 | flagged |
| F20 | P3 | Public forms / validation | No client-side maxLength on contact/order text fields; server silently truncates over-length inp | src/app/contact/ContactClient.tsx:227-239; src/app/g | fixed |
| F21 | P3 | performance / images / LCP | GuidosImage renders its priority hero at opacity:0 and fades in on load, deferring the LCP paint | src/components/GuidosImage.tsx:61-73 (opacity:0 + fa | fixed |
| F22 | P3 | performance / React re-renders | MenuClient recomputes derived arrays and re-subscribes the scroll listener on every render | src/app/menus/MenuClient.tsx:68-71, 117-140, 211-212 | flagged |
| F23 | P3 | performance / navigation latency | PageTransition adds a fixed ~300ms artificial delay to every internal navigation | src/components/PageTransition.tsx:14-58 (delay at 42 | flagged |
| F24 | P3 | performance / CSS compositing | Persistent `will-change: transform` on always-mounted page-shutter panels | src/app/globals.css:797-803 (.page-shutter__panel),  | fixed |
| F25 | P3 | lint / dead-config | 4 unused eslint-disable warnings come from convex/_generated (generated files that are being lin | eslint.config.mjs:10; convex/_generated/api.js:1 | fixed |
| F26 | P3 | lint / react-hooks | 7 set-state-in-effect warnings are all benign, intentional patterns (not bugs) | eslint.config.mjs:16; src/components/Footer.tsx:11 | flagged |
| F27 | P3 | duplicated-logic / drift | Admin order/inquiry status enums are re-declared in the Next actions instead of shared with the  | src/app/admin/guidos-orders/actions.ts:16; convex/li | flagged |
| F28 | P3 | error-handling | Admin pages/layout call fetchQuery with no try/catch; a Convex outage crashes the admin section | src/app/admin/layout.tsx:21 | flagged |
| F29 | P3 | hardcoded-values / tokens | AnnouncementBanner uses raw hex colors instead of the design-token CSS variables | src/components/AnnouncementBanner.tsx:41 | fixed |
| F30 | P3 | dead-code | Dormant siteImages Convex table retained after media module removal (documented, no orphaned fun | convex/schema.ts:88 | flagged |
| F31 | P3 | hardcoded-values / drift | Guido's delivery fee $12.50 is a bare literal in 8 files with no shared constant | src/app/api/guidos-order/route.ts:55 | flagged |
| F32 | P3 | duplicated-logic / drift | SessionExpiredToast.tsx is duplicated byte-for-byte across three admin sections | src/app/admin/inquiries/SessionExpiredToast.tsx:1 | fixed |
| F33 | P3 | dead-code | SkeletonRows component is exported from the admin barrel but never used | src/app/admin/_components/SkeletonRows.tsx:11 | fixed |
| F34 | P3 | duplicated-logic | ensureAdmin helper and ActionResult type are copy-pasted across all admin actions files | src/app/admin/guidos-orders/actions.ts:20 | flagged |
| F35 | P3 | lint / react-hooks | exhaustive-deps ref-in-cleanup warning in GlobalNav is benign but has a safe fix | src/components/GlobalNav.tsx:169 | fixed |
| F36 | P3 | security hardening | CSP allows 'unsafe-inline' in script-src (and style-src), weakening XSS defense | src/proxy.ts:119-120 | flagged |
| F37 | P3 | branding / mobile UX | Global dark theme-color (#070707) applied to Guido's light cream-brand pages | src/app/layout.tsx:62-64 (no override in src/app/gui | fixed |
| F38 | P3 | SEO / branding | Guido's pages use the Melting Moments OG image for social shares despite Guido's-specific alt te | src/app/guidos/page.tsx:19, src/app/guidos/menu/layo | flagged |
| F39 | P3 | security / info disclosure | x-powered-by: Next.js header exposed on the live alias | next.config.ts:3 (nextConfig object; poweredByHeader | fixed |
| F40 | P3 | Copy / possible spelling | "Peasano Dinner" is very likely a misspelling of "Paesano" | src/app/family-style/page.tsx:49 | flagged |
| F41 | P3 | Copy / grammar | Family-Style "Carne" add-on line is a run-on with punctuation and casing errors | src/app/family-style/page.tsx:65 | fixed |
| F42 | P3 | NAP consistency | Footer address drops the comma used in every other address rendering | src/components/Footer.tsx:76 | fixed |
| F43 | P3 | Formatting consistency (Guido's pr | Guido's featured prices on the landing don't match the menu's format ("$9" vs "From $9.00") | src/app/guidos/page.tsx:24 | fixed |
| F44 | P3 | Accessibility (Guido's menu fallba | Guido's menu fallback cards expand via a non-keyboard div onClick | src/app/guidos/menu/GuidosMenuFallback.tsx:86 | fixed |
| F45 | P3 | Error handling (Guido's order form | Guido's order form has no rate-limit-specific message; tells a throttled user to "try again" | src/app/guidos/order/page.tsx:41 | fixed |
| F46 | P3 | Admin feedback (capitalization) | Inquiry status toasts surface raw lowercase enum values | src/app/admin/inquiries/AdminInquiriesClient.tsx:157 | fixed |
| F47 | P3 | Formatting consistency (per-person | Per-person price suffix is written three different ways across public pages | src/app/family-style/page.tsx:72 | fixed |
| F48 | P3 | Content consistency (service area) | Service-area metadata claims Tofino coverage; the page body does not | src/app/service-area/page.tsx:6 | fixed |
| F49 | P3 | UI copy consistency (button labels | The quote form's submit button says "Request Quote" while every link to it says "Get a Quote" | src/app/contact/ContactClient.tsx:249 | fixed |
| F50 | P3 | Network / content gap | Guido's pages fire 400s from /_next/image for product and hero photos that do not exist yet in public/guidos (placeholder shows, CLS 0, but failed requests and console noise on every Guido's view) | browser sweep: /guidos, /guidos/menu network tab | flagged |

## Metrics (before to after)

| Metric | Before | After |
| --- | --- | --- |
| `npx tsc --noEmit` | 0 errors | 0 errors |
| `npm run lint` | 0 errors, 12 warnings | 0 errors, 7 warnings (all documented accepted react-hooks patterns) |
| `npm run build` | clean, 39 routes | clean, 39 routes (no regressions) |
| Font preloads on non-Guido's routes | 3 (incl. unused Dancing Script) | 2 |
| Horizontal overflow at 375px | none on all swept routes | none (unchanged) |
| CLS (menus, guidos, local) | 0 | 0 |
| LCP local (menus / guidos) | 240ms / 64ms | comparable; three more heroes now carry the priority hint |
| Console errors per route | analytics 404 (local only) + Guido's photo 400s | unchanged; photo 400s flagged as F50 (content gap) |
| Findings | 49 raised, 0 false positives | 37 fixed, 13 flagged in FOLLOWUPS.md |
| `npm audit` | 3 high (transitive) | unchanged; ticketed as DEP-1 in FOLLOWUPS.md |

## Assumptions and open questions

- Context block was pasted as a template; resolved from full working knowledge of the project (see Context table). Proceeding without blocking.
- No automated test suite exists; functional verification is by browser exercise and code review.
- Admin exercised against the dev Convex deployment with a throwaway credential; production admin data is not touched.
