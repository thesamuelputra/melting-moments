# Operations

How the site is deployed, configured, and kept healthy. For system design see [architecture.md](architecture.md); for search-facing concerns see [seo.md](seo.md).

## Environments and topology

| Piece | Value |
| --- | --- |
| Vercel project | `melting-moments` (team `samuel-putras-projects-5ae50df2`) |
| Production alias | `melting-moments-seven.vercel.app` (public; unique deployment URLs sit behind Vercel SSO) |
| Convex production deployment | `impartial-woodpecker-979` |
| Convex dev deployment | `impressive-rhinoceros-224` |
| Production domain (target) | `meltingmoments.ca`, DNS not yet cut over to Vercel |
| Secondary domain (target) | `guidosgourmet.ca`, redirects into `/guidos` once attached |

Note that `melting-moments.vercel.app` (without `-seven`) belongs to a different project. Do not use it.

There are two Convex deployments and the Vercel environment decides which one a build talks to:

- Vercel Production env: `NEXT_PUBLIC_CONVEX_URL` points at the prod deployment.
- Vercel Preview env: `NEXT_PUBLIC_CONVEX_URL` points at the dev deployment, so preview branches never touch production data.
- Local dev: `.env.local` (written by `npx convex dev`) points at the dev deployment.

`guidosgourmet.ca` needs no separate site: [`src/proxy.ts`](../src/proxy.ts) 301-redirects any request whose host contains `guidosgourmet` to `https://meltingmoments.ca/guidos`, preserving the path.

## Environment variable reference

| Variable | Vercel | Convex deployment env | `.env.local` | Purpose |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Yes (Production points at prod Convex, Preview at dev) | No | Yes | Convex deployment URL for server reads and the admin client provider |
| `ADMIN_PASSWORD` | Yes | Yes, identical value | Yes, for local admin work (dev Convex must match) | Admin auth on both sides, see below |
| `RESEND_API_KEY` | Yes | No | Optional | Enables transactional email |
| `RESEND_FROM` | Yes | No | Optional | Sender address; must be on a Resend-verified domain, otherwise falls back to `onboarding@resend.dev`, which cannot deliver to customers |
| `OWNER_EMAIL` | Yes | No | Optional | Recipient for new-inquiry and new-order notifications; defaults to `info@meltingmoments.ca` |
| `CONVEX_DEPLOYMENT` | No | No | Yes (written by `npx convex dev`) | Tells the Convex CLI which deployment to target |

Behavior when a variable is missing is covered in the [README table](../README.md#environment-variables); the two tables should be kept in sync.

### ADMIN_PASSWORD lives in two places

The same secret does two independent jobs:

1. On the Next.js side (Vercel env), it is the HMAC key for admin session tokens. [`src/lib/auth.ts`](../src/lib/auth.ts) and [`src/proxy.ts`](../src/proxy.ts) verify the `admin_token` cookie (format `v2.<expiresAtMs>.<hmacHex>`, 7-day lifetime, sliding renewal). The login action compares the submitted password against it.
2. On the Convex side (deployment env), every admin query and mutation calls `assertAdmin` ([`convex/lib.ts`](../convex/lib.ts)), which compares the `adminSecret` argument the Next server passes along against the deployment's own `ADMIN_PASSWORD`. If the deployment variable is unset, every admin call is rejected.

Set both, with identical values:

```bash
# Vercel (Production env), then redeploy for it to take effect
npx vercel env add ADMIN_PASSWORD production

# Convex production deployment (takes effect immediately)
npx convex env set ADMIN_PASSWORD <same value> --prod
```

For local work: put the value in `.env.local` and run `npx convex env set ADMIN_PASSWORD <value>` (no `--prod`) against the dev deployment.

## Deployment runbook

Frontend and backend deploy separately, and forgetting the backend half is the most common mistake.

### Frontend (Vercel)

Push to `main`. Vercel builds and promotes to production automatically; other branches get preview deployments wired to the dev Convex deployment.

### Backend (Convex)

```bash
npx convex deploy
```

This pushes everything in `convex/` (schema, functions) to the production deployment. During development, `npx convex dev` continuously syncs the same files to the dev deployment; nothing reaches prod until you run `deploy`.

### Schema changes: order of operations

Convex validates every existing document against the schema at deploy time, and a deploy that existing rows violate fails. The codebase convention (see comments in [`convex/schema.ts`](../convex/schema.ts)) is to keep row-compatible types in the schema (for example, status fields stay `v.string()`) and enforce enums at mutation args via `v.union(v.literal(...))`.

1. Write the schema change so existing rows remain valid: new fields optional, types widened rather than narrowed.
2. Deploy Convex first (`npx convex deploy`) so new functions and fields exist before any frontend code calls them.
3. Push the frontend change to `main`.
4. Backfill data through a mutation if needed; only then consider tightening the schema, and only after every row conforms.

### Post-deploy verification

1. Load the production alias, confirm real content renders (not fallback copy).
2. Log in at `/admin-login`, make a trivial content edit, confirm it appears on the public page immediately.
3. Revert the edit.

## Domain cutover checklist

DNS for `meltingmoments.ca` currently points at the legacy host, not Vercel. The cutover is the go-live switch.

### meltingmoments.ca

1. Vercel dashboard: project Settings, Domains, add `meltingmoments.ca` and `www.meltingmoments.ca`.
2. At the registrar, set the DNS records Vercel specifies (A or ALIAS for the apex, CNAME for `www`).
3. Wait for Vercel to verify the domain and issue certificates; confirm `https://meltingmoments.ca` serves the site.
4. Spot-check: `/admin-login` loads over the new domain, `/quote` 308-redirects to `/contact`, `/gallery` 301-redirects to `/catering`.
5. Resend dashboard: add and verify `meltingmoments.ca` (publish the DKIM and SPF records Resend provides at the registrar).
6. Vercel env: set `RESEND_FROM` to an address on the verified domain (for example `inquiries@meltingmoments.ca`) and confirm `RESEND_API_KEY` is set. Redeploy.
7. Submit a test inquiry and a test Guido's order; confirm the owner notification and customer confirmation both arrive and the leads appear in `/admin`.

Email verification must come after the domain is live on Vercel only in the sense that there is no point sending from a domain whose site is still elsewhere; the Resend DNS records themselves can be published at any time since they do not conflict with the A/CNAME cutover.

### guidosgourmet.ca

1. Add `guidosgourmet.ca` (and `www`) to the same Vercel project.
2. Update DNS at the registrar as above.
3. Verify `https://guidosgourmet.ca/menu` 301-redirects to `https://meltingmoments.ca/guidos/menu` (handled by `src/proxy.ts`, path-preserving).

No Resend setup is needed for this domain; all email sends from the meltingmoments.ca identity.

## Content seeding

[`convex/seed.ts`](../convex/seed.ts) exposes two guarded mutations, `seedMenuItems` and `seedGuidosProducts`. Guards:

- Both require an `adminSecret` argument matching the deployment's `ADMIN_PASSWORD`.
- Both refuse to touch a non-empty table unless `force: true` is passed.
- `force: true` wipes the table before reinserting the hardcoded data, destroying any owner edits. Treat it as dev-only.

Run against the dev deployment (the CLI targets `CONVEX_DEPLOYMENT` from `.env.local` by default):

```bash
npx convex run seed:seedMenuItems '{"adminSecret":"<dev ADMIN_PASSWORD>"}'
npx convex run seed:seedGuidosProducts '{"adminSecret":"<dev ADMIN_PASSWORD>"}'
```

Adding `--prod` targets production. Only do that for a first-time seed of empty tables; never pass `force: true` against prod without a fresh export in hand.

FAQs have no CLI seed. The first FAQ created through `/admin/faq` on an empty table auto-imports the built-in starter FAQs before inserting the new one (see [`src/app/admin/faq/actions.ts`](../src/app/admin/faq/actions.ts)); this keeps the public `/faq` page whole, because any CMS row replaces all of the hardcoded fallback questions.

## Backup and data notes

- Export: Convex dashboard, Data, export snapshot; or `npx convex export --path backup.zip` (add `--prod` for production). Take an export before any schema deploy or forced reseed.
- Tables (all in [`convex/schema.ts`](../convex/schema.ts)): `menuItems`, `inquiries`, `businessSettings`, `faqs`, `testimonials`, `activityLog`, `guidosProducts`, `siteImages`, `guidosOrders`.
- `siteImages` is dormant: the media module was removed, and the table is retained only so existing rows stay valid.
- `activityLog` self-prunes: each write deletes a bounded batch (25) of entries older than 90 days. Do not expect it to be a permanent record.
- Customer leads (`inquiries`, `guidosOrders`) exist only in Convex plus whatever email copies Resend delivered. They are the data that matters most in an export.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Admin login rejects the correct password | `ADMIN_PASSWORD` unset in the Vercel env, or the login rate limiter is in backoff (5 failures per IP triggers exponential lockout, 30 s doubling up to 32 min) | Set the variable and redeploy; or wait out the lockout (it also resets on instance cold start) |
| Login succeeds but every admin page or action returns "Unauthorized" | `ADMIN_PASSWORD` differs between Vercel and the Convex deployment env, or is unset on Convex (`assertAdmin` fails closed) | `npx convex env set ADMIN_PASSWORD <same value> --prod`; effective immediately, no redeploy needed |
| Everyone was logged out at once | Expected after rotating `ADMIN_PASSWORD`: it is the HMAC key, so all existing session tokens fail verification | Log in again |
| Forms save but no emails arrive | `RESEND_API_KEY` unset; or `RESEND_FROM` unset or not on a Resend-verified domain (the `onboarding@resend.dev` fallback cannot deliver to customers); or the owner notification was turned off via the admin "Email on new inquiry" setting (suppresses the owner email only) | Set both variables, verify the domain in Resend, check the toggle, then check Vercel function logs for `[Contact API]` errors |
| Content edits do not appear on the public site | Editing a different deployment than you are viewing: Preview deployments and local dev point at dev Convex, production points at prod. Cache is not the issue; admin actions call `updateTag('cms')` and `revalidatePath('/', 'layout')`, so edits are immediate on the deployment where they ran | Confirm which site you are viewing and which `NEXT_PUBLIC_CONVEX_URL` it was built with; worst case ISR re-fetches within 300 s |
| Public site shows placeholder or outdated fallback copy everywhere | `NEXT_PUBLIC_CONVEX_URL` missing or empty in the Vercel env (public pages degrade to hardcoded fallbacks instead of failing), or the Convex tables are empty | Set the variable, redeploy, and seed or enter content |
| Local build fails with module or type errors that make no sense | Stale incremental state in `.next` (and sometimes `tsconfig.tsbuildinfo`) after dependency or config changes | `rm -rf .next` and rebuild |
