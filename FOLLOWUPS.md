# Follow-ups

What remains after the full-site audit and its two fix passes. Of the 50 findings, 44 are fixed and verified. The six below are left deliberately: three are intentional or accepted as-is, and three need the owner or an architectural decision. See AUDIT.md for the complete findings table and metrics.

## Needs the owner or an architectural decision

### F02 (P1) · Cut the domain over to this deployment

**Where:** DNS and Vercel; every canonical, OG url, sitemap entry, and JSON-LD @id in the code already points at https://meltingmoments.ca.

**Why it is not done here:** it is an infrastructure and DNS action, not a code change. Today meltingmoments.ca still serves the old 2023 site over HTTP, while the new site lives at the melting-moments-seven.vercel.app alias.

**Recommended:** add meltingmoments.ca (and guidosgourmet.ca if used) as domains on the Vercel project, point the DNS records at Vercel, let the certificate provision, then confirm `curl -I https://meltingmoments.ca` returns the new site over HTTPS. This is the single launch blocker.

### F40 (P3) · Confirm the "Peasano" spelling

**Where:** src/app/family-style/page.tsx, src/app/menus/page.tsx, src/app/menus/MenuClient.tsx (display label "Peasano Dinner").

**Why it is not done here:** "Peasano" is not standard Italian (the usual word is "Paesano"), but it may be the owner's deliberate house spelling, so it is not safe to change unilaterally.

**Recommended:** confirm the intended spelling with Chef Paul. If it should be "Paesano", change the three display labels only; the internal category key PEASANO can stay.

### F36 (P3) · Migrate the CSP off 'unsafe-inline'

**Where:** src/proxy.ts (Content-Security-Policy: script-src and style-src include 'unsafe-inline').

**Why it is not done here:** dropping 'unsafe-inline' safely means moving to a per-request nonce that is threaded through Next's inline scripts and the app's many inline styles. That is an architecture change with real regression risk that needs its own careful test pass, not a mechanical edit.

**Recommended:** when there is room to test it, generate a nonce in the proxy, attach it to Next's inline scripts, and drop 'unsafe-inline' from script-src (style-src is harder given the heavy inline styling; consider it a later step).

## Intentional or accepted (no change recommended)

### F23 (P3) · Page-transition timing

The shutter transition adds a deliberate pause before navigation as part of the site's editorial feel. It is a design choice, not a defect. Left as-is; it can be shortened later if snappier navigation is preferred.

### F26 (P3) · Seven set-state-in-effect lint warnings

All seven are correct, intentional patterns (hydration-safe year, sessionStorage reads, menu-state resets on route change) and are already downgraded to warnings with a documented rationale in eslint.config.mjs. No code change; they can fold into a future hooks refactor.

### F30 (P3) · Dormant siteImages Convex table

Retained on purpose after the media module was removed so any existing rows stay valid. There are no orphaned functions referencing it. Dropping it is a data decision for a future migration, not an audit fix.
