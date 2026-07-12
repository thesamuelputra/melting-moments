# Architecture

This document describes the system as it exists in the repository. For metadata, structured data, and search-related behavior, see [seo.md](seo.md).

## System overview

The application is built on three managed services:

1. **Vercel** hosts the Next.js App Router application (Next.js 16, installed version 16.2.7, React 19.2.4, TypeScript). It serves the public marketing site as static pages with incremental static regeneration, renders the admin console as dynamic server-rendered routes, runs the middleware in `src/proxy.ts` on every request, and exposes two JSON API routes for the public forms. Vercel Analytics is loaded from the root layout.
2. **Convex** is the system of record. All persistent data (catering menu, CMS copy, FAQs, testimonials, inquiries, Guido's products and orders, the activity log) lives in the tables defined in `convex/schema.ts`. The Next.js server talks to Convex over HTTP using `fetchQuery` and `fetchMutation` from `convex/nextjs`. Public pages never open a Convex websocket; the reactive client (`src/app/ConvexClientProvider.tsx`) wraps only the admin tree.
3. **Resend** sends transactional email: owner notification and customer confirmation for catering inquiries, and owner notification for Guido's orders. Email failures are logged and never fail the request, because the lead is already saved in Convex before any email is attempted.

Request path for a public page: browser, then the proxy middleware (security headers, rate limiting, host redirect), then the ISR cache, then the page render, which reads Convex through the cached getters in `src/lib/cms.ts`.

Request path for an admin write: browser, then a server action, then `requireAdmin()` (session cookie check), then `fetchMutation` carrying `adminSecret`, then the Convex mutation (`assertAdmin`, validation, the write, and the activity-log entry in the same transaction), then cache invalidation (`updateTag` plus `revalidatePath`), then a typed result object back to the client component.

Two brands share the codebase: Melting Moments Catering (most routes) and Guido's Gourmet ready-made meals (the `/guidos` subtree). Requests arriving on a `guidosgourmet` host are 301-redirected by the middleware to `https://meltingmoments.ca/guidos`, preserving the path.

## Rendering strategy

Public routes are static with ISR:

- Every public page, and the `/llms.txt` route handler, exports `export const revalidate = 300`.
- All public-page Convex reads go through `unstable_cache` in `src/lib/cms.ts` with `{ revalidate: 300, tags: ['cms'] }`. The tag constant is `CMS_TAG = 'cms'`. The getters are `getSettings` (business settings), `getTestimonials`, `getMenuItems`, `getFaqs`, and `getGuidosProducts`.
- `getSettings` is outage-safe: a Convex failure returns `{}` and every page renders its hardcoded fallback copy instead of a 500. The other getters are wrapped in `.catch(() => [])` at their call sites.

Admin saves that touch public content invalidate the cache immediately:

- `updateTag('cms')` expires the CMS cache entries at once (the one-argument `revalidateTag` form is deprecated on this Next version; `updateTag` gives read-your-own-writes semantics).
- `revalidatePath('/', 'layout')` refreshes every public route.
- `revalidatePath` of the specific admin page refreshes the server-rendered admin data.

So content edits appear on the public site as soon as the next request comes in; the 300-second window only matters for changes made outside the admin console (for example, edits made directly in the Convex dashboard).

Inquiry and Guido's-order actions hold no public-facing content, so they revalidate only `/admin` paths and skip the `cms` tag (see `src/app/admin/inquiries/actions.ts`).

Admin routes are dynamic. `src/app/admin/layout.tsx` awaits `connection()` (this Next version's replacement for `unstable_noStore`) and calls `requireAdminOrRedirect()`, which reads cookies. Nothing under `/admin` is ever cached.

Route-level redirects: `/quote` calls `permanentRedirect('/contact')` (308, deliberately kept out of the sitemap), and `/gallery` permanently redirects to `/catering` via `next.config.ts`.

## Directory layout

| Path | Purpose |
| --- | --- |
| `convex/` | Convex schema, queries, mutations, and guarded seed scripts. Deployed separately with `npx convex deploy`; pushing to git or Vercel does not update Convex functions. |
| `convex/lib.ts` | Shared backend helpers: `assertAdmin`, status enums, in-transaction activity logging with pruning, and input validators. |
| `convex/seed.ts` | Guarded seeds for `menuItems` and `guidosProducts`, run from the CLI. |
| `src/proxy.ts` | Middleware: security headers (including CSP), admin route protection with sliding session renewal, per-IP rate limiting for the form APIs, and the guidosgourmet.ca host redirect. |
| `src/app/` | Public routes, one directory per page (`about`, `catering`, `menus`, `weddings`, `corporate`, `private-events`, `family-style`, `fountains`, `chef-paul`, `testimonials`, `faq`, `service-area`, `contact`, `guidos`, `guidos/menu`, `guidos/order`, `privacy`, `terms`), plus `sitemap.ts`, `robots.ts`, and the `llms.txt` route handler. |
| `src/app/api/` | `contact` and `guidos-order` POST endpoints: validate, persist to Convex, send Resend email. |
| `src/app/admin/` | Admin console: dashboard plus modules for banner, content, FAQ, menus, testimonials, Guido's products, Guido's orders, inquiries, and settings. Each module is a server-component `page.tsx`, a client component, and a server-action `actions.ts`. |
| `src/app/admin/_components/` | The shared admin UI kit (see [Admin console architecture](#admin-console-architecture)). |
| `src/app/admin-login/` | Login page and the `login`/`logout` server actions, including the login rate limiter. |
| `src/components/` | Public-site shell: `PublicShell` (nav, footer, and page transition wrapper; renders admin routes bare), `GlobalNav`, `Footer`, `BannerWrapper`/`AnnouncementBanner` (CMS-driven announcement banner), `GuidosImage` (product image with placeholder fallback), `PageTransition`, `Preloader`. |
| `src/lib/` | `auth.ts` (session tokens, `requireAdmin`), `cms.ts` (cached Convex getters), `seo.ts` (NAP constant and JSON-LD builders), `sanitize.ts` (HTML, email, and JSON-LD escaping), `fallback-faqs.ts` (shared fallback FAQ copy), `menu-category-order.ts` (default section order and resolution rules). |
| `scripts/` | `generate-og.mjs`, the OpenGraph image generator (see [seo.md](seo.md)). |
| `public/` | Source photography (`.webp`), favicons, generated OG crops in `public/og/`, Guido's product shots in `public/guidos/`. |

## Data model

All tables are defined in `convex/schema.ts`. Convex adds `_id` and `_creationTime` to every document. A recurring convention: fields with a fixed set of values (`status`, `brand`, `deliveryMethod`) are stored as `v.string()` in the schema so existing rows always remain valid, and the allowed values are enforced at mutation arguments instead (`v.union(v.literal(...))` or the enums in `convex/lib.ts`).

### menuItems

Catering menu content for `/menus` and the admin Menu Editor. Index: `by_category`.

| Field | Type | Notes |
| --- | --- | --- |
| `category` | string | Uppercase section name, for example `ENTREES`. |
| `name`, `description` | string | |
| `price` | float, optional | Numeric price when one exists; used for the structured-data Offer. |
| `priceLabel` | string | Display string, for example `$8.95/pp` or `Included`. |
| `orderIndex` | float | Position within the category. |
| `isActive`, `isFeatured` | boolean | Only active items reach the public site. |

### inquiries

Catering leads submitted through `/contact`. Indexes: `by_status`, `by_submittedAt`.

| Field | Type | Notes |
| --- | --- | --- |
| `name`, `email`, `phone`, `eventType`, `guestCount`, `date`, `venue` | string | Customer-submitted. |
| `status` | string | `new`, `contacted`, `booked`, `declined`, `archived` (enforced at args via `INQUIRY_STATUSES`). |
| `notes` | string | Customer-submitted; immutable after create. |
| `adminNotes` | string, optional | Admin-editable internal notes. |
| `archivedFromStatus` | string, optional | The status held before archiving; used by `inquiries.restore`. |
| `submittedAt` | float | Epoch milliseconds. |

### businessSettings

Free-form key-value store, the CMS backbone. Index: `by_key`. Holds page copy overrides (`home_cta_heading` and similar), banner state (`banner_enabled`, `banner_text`, `banner_link`, `banner_style`, `banner_show_on`), business identity (`name`, `owner`, `address`, `phone`, `email`, `website`, `social_*`, `business_hours_note`), the notification preference `emailOnNewInquiry`, and `menu_category_order`. `businessSettings.getAll` is intentionally public-read; `businessSettings.save` is the atomic multi-key upsert used by every settings-style save.

### faqs

CMS-managed FAQ entries. `category` is an optional union of literals `catering` and `guidos`; undefined means a general question, which the public page groups under Catering. Fields: `question`, `answer`, `category?`, `orderIndex`, `isActive`.

### testimonials

CMS-managed reviews. Fields: `author`, `role?`, `text`, `rating?` (an integer 1 to 5, enforced by `normalizeRating` at args), `brand?` (`catering`, `guidos`, or undefined meaning both), `orderIndex`, `isActive`. Note that the public pages (`/`, `/catering`, `/testimonials`) currently render all active testimonials without filtering by `brand`; the field is stored and managed but not yet used for display routing.

### activityLog

Append-only record of CMS changes, shown on the admin dashboard. Fields: `action`, `section`, `details?`, `performedAt`. Index: `by_performedAt`. Retention is 90 days, enforced by bounded pruning on write (see below).

### guidosProducts

Guido's Gourmet product catalog. Index: `by_category`. Fields: `name`, `category`, `priceFrom`, `sizes?` (array of `{ label, price }`), `image?` (path under `public/guidos/`), `isAvailable`, `isLimitedEdition`, `orderIndex`. `guidosProducts.list` is public-read; the public menu renders unavailable products as sold out rather than hiding them.

### siteImages (dormant)

Retained schema for the removed media module: `storageId` (Convex `_storage` reference), `title`, `alt`, `section?`, `orderIndex`, `uploadedAt`, with `by_section` and `by_uploadedAt` indexes. No code reads or writes this table; it exists so any existing rows remain valid. Remove it only after confirming the table is empty in both deployments.

### guidosOrders

Guido's Gourmet orders submitted through `/guidos/order`. Indexes: `by_status`, `by_submittedAt`. Fields: `customerName`, `customerEmail`, `customerPhone`, `items` (free-text order summary), `deliveryMethod` (`delivery` or `pickup`, enforced at args), `deliveryAddress?`, `notes?`, `status` (`received`, `preparing`, `ready`, `delivered`, `picked_up`, via `ORDER_STATUSES`), `submittedAt`.

## Backend conventions

These rules hold across every module in `convex/`:

- **`assertAdmin` on everything non-public.** Every admin query and mutation takes an `adminSecret: v.string()` argument and calls `assertAdmin(args.adminSecret)` first. The check fails closed: if `ADMIN_PASSWORD` is unset on the Convex deployment, every call is rejected. The only public functions are the reads the public site needs (`listActive` variants, `guidosProducts.list`, `businessSettings.getAll`, the `create` mutations behind the public forms, and a few non-PII `count` queries for the dashboard).
- **Partial-patch updates.** `update` mutations build a patch object containing only the fields the caller provided; omitted fields are untouched. Sentinel values handle deletion, for example `price: null` clears a menu item's price by patching `price: undefined`.
- **Append semantics for new rows.** When `orderIndex` is omitted on create, the mutation appends to the end of the relevant group (`max(orderIndex) + 1`). Moving a menu item to a different category without an explicit position also appends to the destination category.
- **Atomic reorders.** Each sortable table has a `reorder` mutation that receives the full ordered id array and patches `orderIndex = array position` for every row inside a single Convex transaction. Any missing id, or an id belonging to a different category, throws and rolls the whole reorder back. There is no client-side sequencing of individual moves.
- **Activity logging inside the mutation.** `logActivity(ctx, entry)` inserts the log row in the calling mutation's transaction, so the log entry and the change it describes commit or fail together. The same call prunes at most 25 entries older than 90 days, keeping log writes bounded.
- **Guarded seeds.** `seed.ts` exposes `seedMenuItems` and `seedGuidosProducts`, run via `npx convex run seed:seedMenuItems '{"adminSecret":"..."}'`. A seed refuses to touch a non-empty table and returns a skip report; passing `force: true` wipes the table and reinserts the hardcoded data.
- **Shared validators.** `requireText`, `assertPrice`, `validateSizes`, `normalizeRating`, `clampLimit`, and `truncateDetail` in `convex/lib.ts` keep validation identical across modules.

## Authentication and sessions

There is a single admin identity, authenticated by password.

**Token format.** The session token is `v2.<expiresAtMs>.<hmacHex>` where `hmacHex = HMAC-SHA256(key = ADMIN_PASSWORD, message = 'melting-moments-admin-session.' + expiresAtMs)`. The format is implemented twice, deliberately in lockstep: `src/lib/auth.ts` uses Node `crypto` for server actions, and `src/proxy.ts` uses WebCrypto because the middleware runtime has no Node `crypto`. Any change to the format must land in both files. Old v1 (non-expiring) tokens fail verification by design; holders log in again.

**Login.** `src/app/admin-login/actions.ts` compares the submitted password against `ADMIN_PASSWORD` in constant time (both sides are SHA-256 hashed first so `timingSafeEqual` sees equal lengths), then mints a 7-day token (`SESSION_DURATION_MS`) and sets it as the `admin_token` cookie: `httpOnly`, `secure` in production, `sameSite: 'strict'`, `path: '/'`.

**Login rate limiting.** An in-memory, per-instance limiter applies exponential backoff per IP after 5 failures (30 seconds, doubling per additional failure, capped at 32 minutes), keyed by `x-forwarded-for`. A global bucket capped at 100 failures backstops distributed guessing across IPs; it is cleared on any successful login so accumulated bot noise can never lock out the real admin. Stale entries are pruned after an hour of inactivity.

**Middleware protection and sliding renewal.** For every `/admin` request (excluding `/admin-login`), `src/proxy.ts` verifies the cookie: format, expiry, and HMAC in constant time. Invalid or missing tokens redirect to `/admin-login`; a valid session visiting `/admin-login` redirects to `/admin`. When a valid token has less than 3.5 days remaining (`RENEWAL_THRESHOLD_MS`), the middleware mints a fresh 7-day token on the response with the same cookie attributes, so an active admin never gets logged out mid-week while an abandoned session still expires.

**Server actions.** Every mutating server action starts with `requireAdmin()` (from `src/lib/auth.ts`), which re-verifies the cookie and throws `AdminAuthError` on failure. Actions catch that error and return `{ success: false, error: 'unauthorized' }`; a missing `ADMIN_PASSWORD` is rethrown as a genuine server misconfiguration instead of being masked as an auth failure.

**Defense in depth.** `src/app/admin/layout.tsx` calls `requireAdminOrRedirect()` on every admin render, so even if a request bypassed the middleware, the layout bounces unauthenticated users to `/admin-login` before any data is fetched.

**The Convex layer verifies independently.** `ADMIN_PASSWORD` must be set to the identical value in both the Vercel environment and the Convex deployment environment. Next.js verifies the session; Convex verifies the `adminSecret` each call carries. A mismatch produces a working login whose every action fails with "Unauthorized".

## Admin console architecture

Each admin module follows the same shape:

- **Server component `page.tsx`** fetches the module's data with `fetchQuery(api.<module>.list, { adminSecret: process.env.ADMIN_PASSWORD! })`, serializes Convex documents into plain client-safe objects (ids as strings, timestamps as ISO strings), and renders the client component inside a `ToastProvider`.
- **Client component** owns the working copy in local state. Writes are optimistic: the UI updates first, the server action runs, and on failure the previous state is restored (deletes reinsert the row at its original index) and an error toast explains what happened.
- **Server action `actions.ts`** guards with `requireAdmin()`, validates input, calls the Convex mutation with `adminSecret`, and invalidates caches.

**Result convention.** Every action returns a discriminated union:

```ts
type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: 'unauthorized' | 'invalid' | 'failed'; message?: string };
```

`unauthorized` comes from two places: `AdminAuthError` thrown by `requireAdmin()`, and Convex errors whose message contains "Unauthorized" (the secret-mismatch case). Clients treat `unauthorized` as session death: they roll back optimistic state and show the persistent `SessionExpiredToast`, whose link performs a full `<a>` navigation to `/admin-login` because the session is dead and a fresh server render is the safest path. `invalid` carries a user-facing validation message; `failed` is a generic server-side failure that has already been logged.

**Shared component kit** (`src/app/admin/_components`, re-exported through `index.ts`):

| Export | Purpose |
| --- | --- |
| `ToastProvider`, `useToast` | Context-based toast stack (success, error, info) with auto-dismiss; errors stay visible longer. |
| `ConfirmDialog` | Modal confirmation; the destructive variant places initial focus on Cancel, and `busy` disables both buttons and Escape dismissal while an action runs. |
| `SlidePanel` | Right-hand edit drawer with a pinned footer for save and cancel; when `dirty`, closing asks for confirmation first. |
| `SortableList`, `DragHandle` | dnd-kit wrapper for drag-to-reorder rows with keyboard support and screen reader announcements. |
| `TextField`, `TextAreaField`, `SelectField`, `NumberField`, `ToggleSwitch`, `parseNumberField` | Labeled form controls with shared help-text and error wiring (`aria-describedby`). |
| `EmptyState` | Title, optional body, and an optional action for empty tables. |
| `SkeletonRows` | Loading skeleton with a deterministic width sequence (SSR and hydration safe). |
| `useDirtyGuard` | Registers unsaved-changes state with the admin shell (sidebar navigation warns before leaving) and adds a `beforeunload` handler. |
| `useAutoRefresh` | Calls `router.refresh()` on an interval while the tab is visible, refreshes immediately on refocus, and returns a manual `refresh` for toolbar buttons. |

`modalBehavior.ts` is internal to the kit (not re-exported): it implements the shared modal stack so that a `ConfirmDialog` layered over a `SlidePanel` wins the Escape key, plus the focus trap and focus restore both components use.

## Security posture

**Headers.** `src/proxy.ts` sets all security headers on every matched response (the matcher covers effectively all routes): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, HSTS for two years with `includeSubDomains; preload`, `X-XSS-Protection: 0` (the legacy auditor is deliberately disabled; CSP is the real defense), `Referrer-Policy: strict-origin-when-cross-origin`, a Permissions-Policy denying camera, microphone, and geolocation, and a CSP restricting scripts to self plus Vercel Analytics, styles and fonts to self plus Google Fonts, and connections to self, `*.convex.cloud` (https and wss), `*.resend.com`, and the Vercel analytics endpoints, with `frame-ancestors 'none'`, `base-uri 'self'`, and `form-action 'self'`. `'unsafe-eval'` is appended to `script-src` only outside production. `next.config.ts` intentionally sets no headers so there is a single source of truth.

**Input validation in layers.** Client-side checks give inline feedback; server actions and API routes enforce the authoritative limits (length caps on every field, email format via `isValidEmail`, enum checks, an allowlist of writable settings keys in `SETTINGS_KEYS`); Convex mutations validate again through argument validators and the helpers in `convex/lib.ts`. The settings and banner modules share one validation module between the client and the action so the two layers cannot drift.

**Public form abuse controls.** Both `/api/contact` and `/api/guidos-order` carry a hidden honeypot field named `website`; a filled honeypot returns a fake success without persisting anything. The middleware applies a sliding-window rate limit of 10 POSTs per minute per IP to both endpoints (in-memory, per instance, with periodic pruning so the map cannot grow without bound). Login attempts have their own limiter, described above.

**Email hardening.** All user input is HTML-escaped with `escapeHtml` before interpolation into email bodies. Values placed in subject lines pass through `clean()`, which strips CR, LF, and tab characters and truncates to 120 characters, preventing header injection.

**CSV export hardening.** The inquiries CSV export quotes every cell, doubles embedded quotes, and prefixes any cell starting with `=`, `+`, `-`, or `@` with an apostrophe (`sanitizeCsvCell`) to neutralize spreadsheet formula injection through customer-controlled fields.

**JSON-LD escaping.** Structured data is serialized with `jsonLdSafe`, which escapes `<`, `>`, and `&` as unicode escapes so CMS-controlled strings cannot close the `<script type="application/ld+json">` element. See [seo.md](seo.md).

**Secrets.** `ADMIN_PASSWORD` serves three roles: the login password, the HMAC key for session tokens, and the shared secret Convex functions verify. It exists only in server environments (Vercel and the Convex deployment) and is passed server-to-server as `adminSecret`; it never reaches the browser. `RESEND_API_KEY` is server-only. The only `NEXT_PUBLIC_` variable is the Convex deployment URL, which is not a secret.

## Deployment topology

- **Vercel** builds and hosts the Next.js app. The production alias is `melting-moments-seven.vercel.app`. The `meltingmoments.ca` DNS has not yet been cut over to Vercel; pointing the domain at the project is the go-live switch. The middleware's `guidosgourmet` redirect likewise becomes active once that domain is attached.
- **Convex** runs as two deployments: production `impartial-woodpecker-979` and development `impressive-rhinoceros-224`. The Vercel Production environment points `NEXT_PUBLIC_CONVEX_URL` at the production deployment; Preview and local development point at the dev deployment. Convex functions deploy separately with `npx convex deploy`; pushing to git or Vercel does not update them.
- **Resend** handles all transactional email and requires domain verification for `meltingmoments.ca` before `RESEND_FROM` can use a real address.

Environment variables, verified against the code:

| Variable | Read by | Behavior when missing |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | The `convex/nextjs` fetch helpers and `ConvexClientProvider` | Public pages render hardcoded fallback copy; the admin tree renders without a reactive client instead of crashing. |
| `ADMIN_PASSWORD` | `src/lib/auth.ts`, `src/proxy.ts`, and independently by `assertAdmin` in Convex | Missing anywhere: admin fails closed. Mismatch between Vercel and Convex: login succeeds but every admin action returns unauthorized. |
| `RESEND_API_KEY` | Both API routes | Submissions still save to Convex; no email sends. |
| `RESEND_FROM` | Both API routes | Falls back to `onboarding@resend.dev`, which cannot deliver to customers. Must be an address on a Resend-verified domain. |
| `OWNER_EMAIL` | Both API routes | Defaults to `info@meltingmoments.ca`. |
