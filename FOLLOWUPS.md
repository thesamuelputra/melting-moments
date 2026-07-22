# Follow-ups

Items from the full-site audit that need a human decision because they touch business logic, architecture, infrastructure, dependencies, or a content or design call. Each has a recommended fix and its risk. Nothing here is a crash or data-loss path. See AUDIT.md for the full findings table.

## Priority order

1. F02 (P1) domain cutover, the one launch blocker.
2. DEP-1 dependency CVEs, decide before launch.
3. Everything else is optional hardening or polish.

## Dependencies

### DEP-1 · high · sharp / libvips CVEs and a brace-expansion DoS (npm audit)

**Where:** transitive: `sharp` (build-time OG image generation and Next image optimization), `next` depends on `sharp`, `brace-expansion` (dev tooling).

**Issue:** `npm audit` reports 3 high-severity advisories: four libvips CVEs inherited by `sharp` (CVE-2026-33327/33328/35590/35591), the `next` package depending on the vulnerable `sharp`, and a `brace-expansion` denial-of-service. These are transitive and mostly build-time or dev-time, not directly reachable by end users, but `sharp` does run server-side for image optimization.

**Recommended fix:** run `npm audit fix` (non-breaking) and re-audit; if the `sharp`/`next` advisory only clears with a Next minor bump, evaluate `npm audit fix --force` on a branch and run the full build plus a route sweep before merging. Do not bump majors blindly.

**Risk:** dependency version changes; verify build and image rendering after.

## Findings flagged for decision

### F02 · P1 · Canonical domain meltingmoments.ca serves a stale 2023 WordPress site over HTTP and has no working HTTPS, yet every SEO signal points there

**Where:** DNS/infra + src/lib/seo.ts:14 (SITE.url), src/app/sitemap.ts:37, src/app/robots.ts:10

**Issue:** The entire SEO surface hardcodes the absolute origin https://meltingmoments.ca: canonical tags on all 19 public routes, OG/Twitter og:url, the sitemap URLs, the robots.txt Sitemap directive, all JSON-LD @id/url/image nodes, and the admin/menu links inside the transactional emails. But that host is not the Vercel deployment. Evidence: `dig +short meltingmoments.ca` -> 216.251.32.98 (the Vercel alias resolves to 216.198.79.3 / 64.29.17.3); `curl -I https://meltingmoments.ca/` -> code 000 (TLS handshake never completes, i.e. no working HTTPS); `curl -I http://meltingmoments.ca/` -> HTTP 200 with `X-Powered-By: W3 Total Cache/0.9.6` and `Last-Modified: Fri, 01 Dec 2023` (a legacy WordPress install, not this Next.js build). Consequence if launched as-is: Google follows the canonical from the live vercel.app alias to https://meltingmoments.ca, which either fails to connect (no HTTPS) or, over HTTP, shows a stale 2023 site, so none of this build's pages get indexed under their canonical URLs and social shares/JSON-LD reference a dead/wrong origin. Compounding risk: the live alias already serves `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`; if meltingmoments.ca is ever submitted to the HSTS preload list while its apex HTTPS is broken, the apex becomes unreachable. This is almost certainly the known DNS/TLS cutover gap; it must be completed and verified before go-live. Reproduce: curl -I https://meltingmoments.ca/ ; curl -I http://meltingmoments.ca/

**Recommended fix:** Complete the DNS + TLS cutover so https://meltingmoments.ca serves this Vercel deployment (add the domain in Vercel, point DNS at Vercel, provision the cert) before launch. Verify `curl -I https://meltingmoments.ca/` returns 200 from Vercel and that the old WordPress host is decommissioned. Do not submit the domain to the HSTS preload list until apex HTTPS is confirmed working.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F19 · P3 · In-memory contact/order rate limiter is unreliable on the edge/serverless deployment

**Where:** src/proxy.ts:66-99

**Issue:** The '10 requests/minute per IP' limiter in the proxy keeps timestamps in a module-level Map (contactRateMap). The proxy runs in the Edge runtime (it uses WebCrypto specifically because Node crypto is unavailable there). On Vercel this executes across many distributed, short-lived isolates, so the Map is per-isolate and not shared, a client's requests can land on different isolates and the cap is not enforced globally. It is best-effort only; the honeypot and Convex-side validation are the real abuse defenses. Not a crash, but the stated protection largely does not hold in production.

**Recommended fix:** If a hard cap is required, back the limiter with a shared store keyed by IP (Vercel KV / Upstash Redis / Convex). Otherwise document it explicitly as best-effort. No code change needed if best-effort is acceptable.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F22 · P3 · MenuClient recomputes derived arrays and re-subscribes the scroll listener on every render

**Where:** src/app/menus/MenuClient.tsx:68-71, 117-140, 211-212

**Issue:** In MenuClient, `fullOrder` and `availableCategories` are rebuilt as fresh arrays on every render (lines 68-71). `availableCategories` is then used as the dependency of the scroll-spy effect (dep array at line 140), and because it is a new reference each render, that effect tears down and re-adds its window scroll listener and re-runs update() on every state-driven re-render. The scroll handler itself calls setActiveSection, so each section change triggers a re-render that re-subscribes the listener. Additionally, the per-category `menuItems.filter(...).sort(...)` at line 212 re-executes for all ~15 categories on every render (including scroll-driven ones). Data volume is small so the wall-clock cost is low, but it is avoidable churn on the heaviest interactive public page.

**Recommended fix:** Wrap `fullOrder`, `availableCategories`, and the per-category filtered/sorted lists in useMemo keyed on [menuItems, categoryOrder] so the scroll-spy effect's dependency is referentially stable and the list isn't re-filtered on every scroll frame.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F23 · P3 · PageTransition adds a fixed ~300ms artificial delay to every internal navigation

**Where:** src/components/PageTransition.tsx:14-58 (delay at 42-52)

**Issue:** PageTransition installs a document-level capture-phase click listener that preventDefaults every internal (`href` starting with `/`) link click, fires the shutter, and defers the actual `router.push(href)` by 300ms (setTimeout at PageTransition.tsx:42-44), then holds cleanup until 1250ms. Every route change therefore incurs a mandatory 300ms perceived-latency tax before Next.js even begins navigating, on top of the closest('a') scan run for every click on the page. This is an intentional cinematic transition (reduced-motion users correctly bypass it at line 30), so it is a deliberate design tradeoff rather than a bug, but it is a measurable, site-wide perceived-performance cost worth flagging in a perf audit.

**Recommended fix:** If snappier navigation is desired, reduce the pre-navigation delay (e.g. push earlier / shorten the 300ms) or start the route push in parallel with the shutter cover rather than after it. Otherwise document it as intentional.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F26 · P3 · 7 set-state-in-effect warnings are all benign, intentional patterns (not bugs)

**Where:** eslint.config.mjs:16; src/components/Footer.tsx:11

**Issue:** All 7 react-hooks/set-state-in-effect warnings are accepted sync/reset patterns and are already downgraded to 'warn' with a documented rationale in eslint.config.mjs:16-25. Per-site triage: Footer.tsx:11 setYear(getFullYear()) is a hydration-safe deferral (SSR renders 2026, client corrects) - correct. AdminGuidosOrdersClient.tsx:114 setLastUpdated(Date.now()) is deliberately in an effect because Date.now() is impure in render (comment says so) - correct. Preloader.tsx:15 and AnnouncementBanner.tsx:20 read sessionStorage in an effect (browser-only) - correct. AdminLayoutClient.tsx:114 and GlobalNav.tsx:194 reset menu/drawer open-state on pathname change - standard reset. GlobalNav.tsx:186 setVisible(true) on subpages - could be derived state but is harmless. None cause incorrect behavior; they trigger at most one extra render. Keep as warnings pending the deferred hooks refactor noted in the config.

**Recommended fix:** No code change required. Optionally derive GlobalNav visible/subpage state and Footer year during render in a future hooks pass, but do not touch these now - they are correct and intentional.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F27 · P3 · Admin order/inquiry status enums are re-declared in the Next actions instead of shared with the Convex source of truth

**Where:** src/app/admin/guidos-orders/actions.ts:16; convex/lib.ts:25

**Issue:** convex/lib.ts:16-32 defines INQUIRY_STATUSES and ORDER_STATUSES as the source of truth (enforced at mutation args). These same literal unions are hand-copied into src/app/admin/inquiries/actions.ts:9 and src/app/admin/guidos-orders/actions.ts:16 (the latter's comment even says 'Mirrors ORDER_STATUSES in convex/lib.ts'). If a status is added or renamed in Convex, the frontend validation copy must be manually updated or it silently rejects/accepts the wrong set. convex/lib.ts uses only `import type { MutationCtx }` (erased at build), so these pure const arrays can be safely imported by the app code.

**Recommended fix:** Import ORDER_STATUSES/INQUIRY_STATUSES (and their types) from convex/lib.ts in the actions files instead of re-declaring, so the enum lives in exactly one place.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F28 · P3 · Admin pages/layout call fetchQuery with no try/catch; a Convex outage crashes the admin section

**Where:** src/app/admin/layout.tsx:21

**Issue:** Public pages consistently degrade on Convex failure (cms.ts getSettings catches and returns {}; every getTestimonials/getMenuItems/getFaqs/getGuidosProducts call is wrapped in .catch(() => [])). Admin server components do not: src/app/admin/layout.tsx:21, admin/page.tsx:55-64 (Promise.all of 10 unguarded fetchQuery), settings/page.tsx:7, content/page.tsx:7, banner/page.tsx:8, menus/page.tsx:7-8, guidos-orders/page.tsx:8, guidos-products/page.tsx:26, faq/page.tsx:11, inquiries/page.tsx:17, testimonials/page.tsx:12 all await fetchQuery bare. A Convex outage throws and takes down the whole admin surface. This is materially mitigated by the src/app/admin/error.tsx error boundary (the operator sees an error card, not a white screen) and admin is a gated internal tool, so severity is low - but it does not degrade gracefully the way the public site does. Separately, the public-side .catch(() => []) swallows the error without logging, unlike getSettings which console.errors - a minor observability gap.

**Recommended fix:** Acceptable to leave given the admin error boundary; if graceful admin degradation is wanted, wrap the top-level fetchQuery calls (or add a shared safe fetch) and render an 'admin data temporarily unavailable' state. Optionally log inside the public .catch handlers for parity with getSettings.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F30 · P3 · Dormant siteImages Convex table retained after media module removal (documented, no orphaned functions)

**Where:** convex/schema.ts:88

**Issue:** convex/schema.ts:87-96 keeps the siteImages table (storageId/title/alt/section/orderIndex/uploadedAt) with a comment 'Dormant: the media module was removed; table retained so existing rows stay valid'. Verified there are no orphaned functions: a grep for siteImages/_storage/generateUploadUrl/getUrl across convex and src finds only the schema definition - the media module was cleanly removed and no query/mutation references the table. This is intentional dead schema, not a leak; noted for completeness.

**Recommended fix:** Leave as-is if preserving rows for a future media feature; otherwise, once confirmed no production rows are needed, drop the table (and its two indexes) in a schema migration to reduce surface. This is a data decision, not a mechanical edit.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F31 · P3 · Guido's delivery fee $12.50 is a bare literal in 8 files with no shared constant

**Where:** src/app/api/guidos-order/route.ts:55

**Issue:** The flat delivery fee '$12.50' is hardcoded independently in src/app/llms.txt/route.ts:90, terms/page.tsx:39, guidos/page.tsx:110, guidos/order/layout.tsx:7, guidos/order/page.tsx:150, api/guidos-order/route.ts:55, service-area/page.tsx:103, and src/lib/fallback-faqs.ts:56. It is display copy only (the order form is a request, no total is computed, so there is no calc bug), but a fee change requires editing eight files and any miss produces a page quoting a stale price - including the customer-facing confirmation email (guidos-order/route.ts:55).

**Recommended fix:** Define a single GUIDOS_DELIVERY_FEE constant (e.g. in src/lib/seo.ts alongside SITE, or a small constants module) and interpolate it everywhere, or drive it from a businessSettings CMS value.

**Risk:** touches a decision or asset; left for a human decision.

### F34 · P3 · ensureAdmin helper and ActionResult type are copy-pasted across all admin actions files

**Where:** src/app/admin/guidos-orders/actions.ts:20

**Issue:** The ensureAdmin() wrapper around requireAdmin()/AdminAuthError is redefined in guidos-orders/actions.ts:20, guidos-products/actions.ts:44, and inquiries/actions.ts:32 (inquiries returns AuthFailure while the others return ActionResult - already a minor inconsistency). The ActionResult result-union type is independently declared in six actions.ts files (guidos-orders, testimonials, inquiries, faq, guidos-products, menus). This is boilerplate that drifts; the inconsistent return type in inquiries is early evidence of it.

**Recommended fix:** Extract a shared ensureAdmin() and the ActionResult type into a single module (e.g. src/lib/admin-actions.ts) and import across the actions files; standardize inquiries to the same result shape.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F36 · P3 · CSP allows 'unsafe-inline' in script-src (and style-src), weakening XSS defense

**Where:** src/proxy.ts:119-120

**Issue:** The CSP built in src/proxy.ts sets `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com` and `style-src 'self' 'unsafe-inline' ...`. 'unsafe-inline' in script-src means the CSP does not block injected inline <script> or inline event-handler execution, so it provides little protection against reflected/stored XSS (the site's real XSS defenses are the jsonLdSafe/escapeHtml helpers, which are correctly applied). This is the common Next.js tradeoff (inline bootstrap/runtime scripts), and the code comments acknowledge it; flagged only as a hardening opportunity, not a live bug. All other CSP directives (frame-ancestors 'none', base-uri 'self', form-action 'self', scoped connect-src) are tight and correct.

**Recommended fix:** If/when feasible, migrate to a nonce-based CSP (generate a per-request nonce in the proxy, attach it to Next's inline scripts, and drop 'unsafe-inline' from script-src). Architecture change, low priority.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F38 · P3 · Guido's pages use the Melting Moments OG image for social shares despite Guido's-specific alt text

**Where:** src/app/guidos/page.tsx:19, src/app/guidos/menu/layout.tsx:12, src/app/guidos/order/layout.tsx:13

**Issue:** All three Guido's routes set og:image/twitter:image to /og/og-default.jpg (the Melting Moments crop) while labelling it alt="Guido's Gourmet by Melting Moments Catering". Verified in source at src/app/guidos/page.tsx:19, src/app/guidos/menu/layout.tsx:12, and src/app/guidos/order/layout.tsx:13, and in rendered output (og:image = https://meltingmoments.ca/og/og-default.jpg on /guidos and /guidos/menu). The parent brand already ships per-page OG crops (og-weddings.jpg, og-menus.jpg, etc.) under /public/og, but the newly landed Guido's sub-brand has none, so link previews of Guido's pages show parent-brand imagery, weakening the distinct sub-brand identity the rebrand was built for.

**Recommended fix:** Produce a Guido's-branded 1200x630 OG image (cream/tricolour identity) under /public/og (e.g. og-guidos.jpg) and reference it from the three Guido's metadata blocks.

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F40 · P3 · "Peasano Dinner" is very likely a misspelling of "Paesano"

**Where:** src/app/family-style/page.tsx:49

**Issue:** The family-style menu is titled "Peasano Dinner," and the menus module carries a matching category label "Peasano Dinner" (menus/page.tsx:35 and MenuClient.tsx:84). "Peasano" is not a standard Italian word; the intended term is almost certainly "Paesano" (countryman / rustic-family style). It is spelled the same way in all three spots, so it may be a deliberate house spelling, hence low confidence, but for an Italian-heritage brand it reads as a typo. Repro: read the section heading on /family-style and the category on /menus.

**Recommended fix:** Confirm intended spelling with the owner; if unintended, change the display label to "Paesano Dinner" in family-style/page.tsx:49, menus/page.tsx:35, and MenuClient.tsx:84 (the underlying category key PEASANO can stay).

**Risk:** touches business logic/architecture/infra; left for a human decision.

### F50 · P3 · Guido's pages request product photos that do not exist yet

**Where:** public/guidos/ contains only placeholder.svg; src/app/guidos/page.tsx references guidos-hero.webp and three product .webp files; Convex product rows may also carry image paths.

**Issue:** Every Guido's page view fires 400 responses from the Next image optimizer for the missing files. The UI degrades gracefully (branded placeholder, zero layout shift), but the failed requests are console and network noise, and they will persist on the live site until real photography lands.

**Recommended fix:** the intended resolution is content, not code: add the real product and hero photos to public/guidos/ with the exact referenced filenames and they appear automatically. If photography is far off, the alternative is to blank the hardcoded image paths so no request is attempted, at the cost of re-adding them later.

**Risk:** content decision; blanking paths would need to be reverted when photos arrive.
