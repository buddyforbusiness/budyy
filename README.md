# Buddy

Buddy is a premium, proactive personal-finance companion for UK students, graduates, professionals and families. It combines account aggregation, deterministic cash-flow intelligence, goals and explainable financial coaching.

## Repository

- `app/` — Expo Router mobile/web application
- `src/engines/` — deterministic finance and banking logic
- `buddy-api/` — authenticated Node/Express API and TrueLayer adapter
- `supabase/migrations/` — PostgreSQL schema and Row Level Security

## Local setup

Requirements: Node 20+, npm, an Expo development environment, a Supabase project and TrueLayer sandbox credentials.

```bash
cp .env.example .env
cp buddy-api/.env.example buddy-api/.env
npm ci
cd buddy-api && npm ci
```

Generate the API encryption key with `openssl rand -base64 32`, place it only in `buddy-api/.env`, and apply the SQL migrations through the Supabase CLI or dashboard.

Run the services in separate terminals:

```bash
cd buddy-api && npm run dev
npm start
```

## Security model

- Supabase sessions authenticate every user-owned API request.
- The API derives identity from the verified access token, never the request body.
- TrueLayer access and refresh tokens are AES-256-GCM encrypted before storage.
- Service-role credentials remain server-side.
- RLS isolates profiles, onboarding answers, accounts, transactions and goals.
- Financial calculations are deterministic; AI is used only to explain and personalise results.

Never commit `.env` files or production banking credentials. Rotate credentials immediately if they are exposed.

## Validation

```bash
npm run lint
npx tsc --noEmit
cd buddy-api && npm run build
```

## Current product status

The repository contains the core mobile journeys, Supabase authentication, onboarding, dashboard, goals, insights, chat shell, deterministic safe-to-spend engine and a secured TrueLayer sandbox connection foundation. Live account synchronisation, background jobs, notifications and the AI provider adapter remain subsequent production milestones.
