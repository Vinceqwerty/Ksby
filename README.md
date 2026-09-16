# Ksby.ph — web MVP

Community carpooling matching platform. Next.js (App Router) + Supabase
(Postgres/PostGIS, Auth, RLS). Deploys free on Vercel + Supabase's free tier.

## What's included (Phase 1 scope)

- Phone OTP login (Supabase Auth)
- Profile setup (name, driver/passenger/both role)
- Driver: post a route (origin, destination, seats, cost share, schedule)
- Passenger: search for a matching route (PostGIS geospatial matching) and
  request a seat
- Row Level Security on every table, so users can only edit their own data

## Not included yet (see the original roadmap)

- In-app chat, escrow payments, ratings UI, Circles, LTFRB portal, panic
  button / live location sharing
- Real turn-by-turn route geometry — routes are stored as a straight line
  between origin and destination (see the comment in
  `supabase/migrations/0001_init.sql`). Swap in a decoded Google/Mapbox
  Directions polyline later; nothing else needs to change.
- Address autocomplete — origin/destination are entered as raw
  latitude/longitude for now. Add Mapbox or OpenStreetMap/Nominatim
  autocomplete on `RouteForm.tsx` and `passenger/search/page.tsx` next.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** (free tier), enable the **PostGIS**
   extension under Database → Extensions.

3. **Run the migration** — open the Supabase SQL editor and paste the
   contents of `supabase/migrations/0001_init.sql`, then run it. This
   creates every table, RLS policy, and the `search_routes` /
   `create_route_straight` matching functions.

4. **Enable phone auth** — in Supabase, go to Authentication → Providers →
   Phone, and configure an SMS provider (Supabase supports Twilio, MessageBird,
   Vonage, and a few others — Twilio is the most common starting point).

5. **Copy environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   from Project Settings → API.

6. **Run locally**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Deploy for free

1. Push this repo to GitHub.
2. Go to vercel.com → New Project → import the repo.
3. Add the same two environment variables in Vercel's project settings.
4. Deploy — you get a free `*.vercel.app` URL.

## File structure

```
sabay-web/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example
├── supabase/
│   └── migrations/
│       └── 0001_init.sql      -- schema, RLS, matching functions
└── src/
    ├── middleware.ts          -- keeps Supabase session fresh
    ├── lib/
    │   ├── types.ts
    │   └── supabase/
    │       ├── client.ts      -- browser client
    │       └── server.ts      -- server component client
    ├── components/
    │   ├── Navbar.tsx
    │   ├── SignOutButton.tsx
    │   ├── AuthForm.tsx       -- phone OTP flow
    │   ├── ProfileForm.tsx
    │   ├── RouteForm.tsx      -- driver: post a route
    │   └── RideCard.tsx       -- passenger: request a seat
    └── app/
        ├── layout.tsx
        ├── globals.css
        ├── page.tsx           -- landing page
        ├── login/page.tsx
        ├── dashboard/page.tsx
        ├── profile/page.tsx
        ├── driver/routes/
        │   ├── page.tsx       -- driver's posted routes
        │   └── new/page.tsx
        └── passenger/search/page.tsx
```
