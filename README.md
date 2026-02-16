# BOI Reader

A web app for tracking your reading progress through **The Beginning of Infinity** by David Deutsch, with curated companion resources and an AI chat companion.

## Features

- **Reading Progress Tracking** — Mark chapters as not started, reading, or completed
- **Companion Resources** — ToKCast episodes by Brett Hall and other curated materials per chapter
- **AI Reading Companion** — Chat with an AI that embodies Deutsch's thinking style (powered by Claude)
- **Warm, Bookish Design** — Serif headings, earth tones, generous whitespace

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Supabase** (Auth + PostgreSQL database)
- **Claude API** (AI chat companion)
- **Tailwind CSS** (warm/bookish theme)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd boi_reader
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase/schema.sql`
3. Enable Google OAuth in Authentication → Providers (optional)
4. Copy your project URL and anon key from Settings → API

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase and Anthropic API credentials.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx                    — Dashboard with chapter grid
    layout.tsx                  — Root layout with fonts
    login/page.tsx              — Auth page
    auth/callback/route.ts      — OAuth callback
    chapters/[slug]/page.tsx    — Individual chapter page
    api/chat/route.ts           — AI chat endpoint
  components/
    Header.tsx                  — Site header
    ProgressBar.tsx             — Overall reading progress
    ChapterCard.tsx             — Chapter card for dashboard
    ResourceSection.tsx         — Collapsible resource panels
    ChatPanel.tsx               — AI companion chat panel
    StatusToggle.tsx            — Reading status toggle
  lib/
    chapters.ts                 — Chapter metadata (18 chapters)
    types.ts                    — TypeScript types
    supabase/
      client.ts                 — Browser Supabase client
      server.ts                 — Server Supabase client
      middleware.ts             — Auth middleware
supabase/
  schema.sql                    — Database schema
```

## TODO

- [ ] Fill in exact ToKCast episode URLs per chapter
- [ ] Add more curated resources per chapter
- [ ] User notes feature
- [ ] Conversation summarization for AI memory
- [ ] Deploy to Vercel
