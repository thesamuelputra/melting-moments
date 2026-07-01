# Melting Moments Catering

An award-winning, high-fashion editorial digital experience and catering platform for **Melting Moments** in Victoria, BC.

![Melting Moments Catering](public/hero-main.webp)

## 📖 Overview

Melting Moments is a premier catering service offering exquisite Italian family-style dinners, corporate luncheons, and elegant wedding packages. This repository houses the frontend and backend systems powering the modern, responsive web application designed with a "Split Monolith" architecture and brutalist, monochromatic design system that prioritizes performance, narrative motion, and visual integrity.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Backend/Database:** [Convex](https://www.convex.dev/)
- **Language:** TypeScript
- **Styling:** Custom CSS, Brutalist Design System
- **Animation:** GSAP / Native CSS for editorial scroll interactions
- **Authentication:** Edge-runtime compatible secure JWT/HMAC sessions

## 🚀 Getting Started

Copy `.env.example` to `.env.local` and fill in the values. The full inventory:

| Variable | Where to set | Purpose | If missing |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Vercel + `.env.local` | Convex deployment URL | Content pages serve hardcoded fallbacks; admin media library breaks |
| `ADMIN_PASSWORD` | **Both** Vercel **and** the Convex deployment env (identical values) | Gates `/admin` and all Convex admin functions | Missing: admin fails closed. Mismatch: login works but every admin action returns "Unauthorized" |
| `RESEND_API_KEY` | Vercel | Transactional email (lead notifications + confirmations) | Submissions still save to Convex, but no emails send |
| `RESEND_FROM` | Vercel | Sender address — must be on a Resend-verified domain | Falls back to Resend's test sender, which cannot deliver to customers |
| `OWNER_EMAIL` | Vercel | Recipient for new-lead notifications | Defaults to info@meltingmoments.ca |

Note: the Convex backend deploys separately — `npx convex deploy` — pushing to git/Vercel does **not** update Convex functions.

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the site.

## ⚙️ Architecture & Features

- **Brutalist Monolithic Design**: Focuses on large typography, robust margin systems, and high-fidelity 50mm-lens-style editorial photography.
- **Admin Dashboard**: Full CMS capabilities for updating menus, reviewing inquiries, and managing platform KPIs.
- **Dynamic SEO**: Complete Schema.org JSON-LD structured data and dynamic metadata generation across all pages for world-class search visibility.

## 🚢 Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new). The codebase is structured for zero-configuration deployments on Vercel Edge networks.

---

*Designed and developed to elevate digital culinary experiences.*
