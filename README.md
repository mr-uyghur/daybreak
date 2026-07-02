# Daybreak 🌅

> *"The world is better than your feed says."*

Daybreak is a positive-only news web app featuring a TikTok-style, full-screen, infinite-scroll feed of genuinely uplifting news from around the globe. Designed to combat doomscrolling, Daybreak helps you spend a few minutes scrolling and feel genuinely better about the world.

---

## ✨ Features

- 📱 **Full-Screen Scroll-Snap Feed**: Mobile-first, immersive TikTok-style card feed with auto-fetching infinite pagination.
- 📖 **In-App Expanded View**: Tap any card to open a detailed view with the full summary and direct link to the original publisher.
- 🎯 **Positivity Scoring & Ranking**: AI-powered pipeline scores article positivity and ranks feed items by a freshness + positivity algorithm (`positivity * recency_decay`).
- 🏷️ **Category Filtering**: Filter news across Science, Conservation, Health, Community, Technology, and acts of Generosity.
- 💖 **Interactive Reactions**: Express reactions (Heart, Praise, Sparkles, Mind Blown, Warmth) with atomic counter tracking.
- 🔖 **Bookmark & Save**: Bookmark stories locally to revisit anytime on the `/saved` page.
- 🤖 **Automated AI Ingestion**: Scheduled background job (via GitHub Actions) fetches curated RSS feeds, filters for positive news, and summarizes them using Claude 3.5 Haiku.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling & Motion**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://motion.dev/)
- **Database**: [Neon Serverless Postgres](https://neon.tech/) with [Drizzle ORM](https://orm.drizzle.team/)
- **AI Pipeline**: [Anthropic Claude SDK](https://www.anthropic.com/) (`claude-haiku-4-5`)
- **RSS Parser**: `rss-parser`
- **Automation**: GitHub Actions (Cron schedule ~4×/day)

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 20+
- `pnpm` (or `npm` / `yarn`)
- Neon Postgres database connection string
- Anthropic API key (for AI ingestion)

### 2. Environment Setup

Copy `.env.local` or create one with the following variables:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
ANTHROPIC_API_KEY=your_anthropic_api_key
CRON_SECRET=your_generated_cron_secret
```

### 3. Installation & Database Setup

```bash
# Install dependencies
pnpm install

# Push database schema to Neon
pnpm db:push

# (Optional) Seed database with initial stories
pnpm seed
```

### 4. Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## ⚙️ Ingestion Pipeline & Scripts

- `pnpm dev` — Run development server
- `pnpm build` — Build production application
- `pnpm db:push` — Push Drizzle schema changes to database
- `pnpm db:studio` — Open Drizzle Studio to inspect database records
- `pnpm seed` — Run local seed script to inject test stories

To manually trigger the content ingestion endpoint:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📄 License

MIT
