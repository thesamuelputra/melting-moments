# Melting Moments

Marketing and intake site for two Victoria, BC food brands: Melting Moments Catering (full-service event catering) and Guido's Gourmet (ready-made meals for delivery or pickup).

## Overview

The site does four things:

- Serves the public marketing pages for both brands (menus, service pages, testimonials, FAQ, service area) with SEO structured data on every page.
- Takes catering quote requests through `/contact` (a JSON POST to `/api/contact`) and Guido's meal orders through `/guidos/order` (`/api/guidos-order`). Both save the lead to Convex first, then send an owner notification and a customer confirmation through Resend.
- Gives the owner a password-protected console at `/admin` for menus, Guido's products and orders, inquiries, FAQs, testimonials, site copy, the announcement banner, and settings.
- Renders public pages as static ISR (`export const revalidate = 300` on every public route). Admin edits do not wait for the window: server actions call `updateTag('cms')`, so content changes appear on the public site immediately.

Data lives in Convex. Public reads go through the cache layer in [`src/lib/cms.ts`](src/lib/cms.ts); every public page has hardcoded fallback copy, so a Convex outage degrades the content rather than failing the build or the request.

## Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16.2.7 |
| UI | React / React DOM | 19.2.4 |
| Language | TypeScript | 5.x |
| Backend and database | Convex | 1.36.1 |
| Transactional email | Resend | 6.12.2 |
| Image processing (OG crops) | sharp | 0.34.5 |
| Admin drag-and-drop reordering | @dnd-kit | core 6.x, sortable 10.x |
| Analytics | @vercel/analytics | 2.x |
| Styling | Hand-written CSS (`src/app/globals.css`, `src/app/admin/admin.css`), no framework | |

Admin sessions are HMAC-SHA256 signed, expiring tokens (not JWTs), verified in both the Node runtime ([`src/lib/auth.ts`](src/lib/auth.ts)) and the proxy runtime ([`src/proxy.ts`](src/proxy.ts)).

## Getting started

Prerequisites: Node 20.9 or newer, npm, and a Convex account (or access to the team's Convex project).

```bash
npm install
cp .env.example .env.local
npx convex dev        # terminal 1: provisions/syncs the dev Convex deployment
npm run dev           # terminal 2: Next.js dev server
```

`npx convex dev` writes `CONVEX_DEPLOYMENT` and the deployment URL into `.env.local`; confirm `NEXT_PUBLIC_CONVEX_URL` ends up set. To use the admin console locally, set `ADMIN_PASSWORD` in `.env.local` and set the identical value on your dev Convex deployment with `npx convex env set ADMIN_PASSWORD <value>`.

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Where to set | Purpose | If missing |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Vercel and `.env.local` | Convex deployment URL | Public pages serve hardcoded fallback copy; admin pages cannot load data |
| `ADMIN_PASSWORD` | Both Vercel and the Convex deployment env (identical values) | Gates `/admin` and all Convex admin functions | Missing: admin fails closed. Mismatched: login works but every admin action returns "Unauthorized" |
| `RESEND_API_KEY` | Vercel | Transactional email (lead notifications and confirmations) | Submissions still save to Convex, but no emails send |
| `RESEND_FROM` | Vercel | Sender address, must be on a Resend-verified domain | Falls back to Resend's test sender, which cannot deliver to customers |
| `OWNER_EMAIL` | Vercel | Recipient for new-lead and new-order notifications | Defaults to info@meltingmoments.ca |

`CONVEX_DEPLOYMENT` also appears in `.env.local`; it is written by `npx convex dev` and only tells the Convex CLI which deployment to target. See [docs/operations.md](docs/operations.md) for the full reference, including exactly where each variable lives per environment.

Note: the Convex backend deploys separately (`npx convex deploy`). Pushing to git or Vercel does not update Convex functions.

## Project structure

```
convex/            Convex backend: schema, queries and mutations per table, guarded seed functions
docs/              Team documentation and owner-facing PDFs
public/            Static assets: photography, OG crops (public/og), favicons
scripts/           generate-og.mjs, regenerates the 1200x630 OpenGraph crops
src/app/           App Router routes: public pages, /admin console, /api routes, sitemap, robots, llms.txt
src/components/    Shared public-site components (nav, footer, shell, banner, transitions)
src/lib/           auth (sessions), cms (cached Convex reads), seo (JSON-LD builders), sanitize
src/proxy.ts       Request proxy: admin gating, session renewal, rate limiting, security headers, domain redirect
```

## Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx convex dev` | Sync `convex/` to the dev deployment on save |
| `npx convex deploy` | Deploy `convex/` to the production deployment |
| `node scripts/generate-og.mjs` | Regenerate OpenGraph crops in `public/og/` from source photography |

## Next.js version note

This project runs a Next.js release whose APIs differ from older documentation and most examples found online (for instance, request middleware lives in `src/proxy.ts` and cache invalidation uses `updateTag`). The authoritative reference is the documentation bundled with the installed release under `node_modules/next/dist/docs`. Read the relevant guide there before writing framework-facing code, and heed its deprecation notices.

## Documentation

- [docs/architecture.md](docs/architecture.md): system design, data flow, auth, and caching in depth
- [docs/operations.md](docs/operations.md): environments, deployment runbook, domain cutover, backups, troubleshooting
- [docs/seo.md](docs/seo.md): structured data, metadata, and search strategy
- [docs/admin-guide.pdf](docs/admin-guide.pdf): owner-facing guide to the admin console
- [docs/technical-documentation.pdf](docs/technical-documentation.pdf): printable technical reference
