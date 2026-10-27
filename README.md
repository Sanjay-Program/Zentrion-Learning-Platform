# Zentrion Learntech

An integrated learning platform for AI, prompt engineering, agentic AI, application development and cybersecurity — structured courses, project-based evaluation, simulated security labs and an AI workspace, deployable to Cloudflare Workers with zero external API keys.

## Features

- **Catalogue** — courses, learning paths, capstone projects, live sessions
- **Hands-on** — simulated cybersecurity labs and CTF challenges (zero real-world risk)
- **AI workspace** — AI tutor (built-in offline mode), prompt studio, agents, knowledge bases, evaluation harness
- **Commerce** — checkout with a simulated payment provider, orders, entitlements, coupons
- **Institutions** — organisations, cohorts, RBAC, audit events
- **No API keys required** — labs, payments, email and the AI tutor all run in simulated/offline modes out of the box

## Quickstart (local)

```sh
# Node 22+ required
npm install --legacy-peer-deps

# Set up the local database and seed demo content
npm run db:migrate
npm run db:seed

# Run the dev server
npm run dev          # http://localhost:3000
```

Demo accounts (seeded):

| Email | Password | Role |
| --- | --- | --- |
| `admin@zentrion.dev` | `Admin12345678!` | Platform admin |
| `instructor@zentrion.dev` | `Instructor123!` | Instructor |
| `learner@zentrion.dev` | `Learner12345!` | Learner |

## Deploying to Cloudflare

One command (after the one-time setup below):

```sh
./deploy.sh
```

### One-time Cloudflare setup

```sh
# 1. Authenticate
npx wrangler login

# 2. Create the D1 database and paste its id into wrangler.toml
npx wrangler d1 create zention-db

# 3. Create the R2 bucket
npx wrangler r2 bucket create zention-assets

# 4. Set the app secret (generates a random key if you don't have one)
npx wrangler secret put APP_SECRET_KEY
```

Then edit `wrangler.toml` and replace `database_id` / `preview_database_id` with the IDs shown by `wrangler d1 create`.

### Manual deploy steps

```sh
npm run cf-build                          # OpenNext Cloudflare build
npx wrangler d1 migrations apply zention-db --remote
npm run deploy                            # deploys the Worker

# Seed remote content (optional, first deploy only)
npm run db:seed                           # seed your local copy first
npm run db:dump-sql > seed.sql            # export content tables
npx wrangler d1 execute zention-db --remote --file=seed.sql
```

### Local Cloudflare preview

```sh
npm run cf-build
npm run cf-dev        # preview at http://127.0.0.1:3001
npx wrangler d1 migrations apply zention-db --local
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Standard Next.js build |
| `npm run cf-build` | OpenNext build for Cloudflare |
| `npm run cf-dev` | Local Workers preview (wrangler) |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npm run db:migrate` | Apply migrations to the local libsql file |
| `npm run db:seed` | Seed demo content (idempotent) |
| `npm run db:migrate:cf` | Apply migrations to remote D1 |
| `npm run db:dump-sql` | Export content tables as SQL for remote D1 |

## Configuration

All configuration is via environment variables (see `.env.example` and `wrangler.toml`):

- `APP_SECRET_KEY` — session signing secret (required in production)
- `AI_PROVIDER` / `AI_BASE_URL` / `AI_API_KEY` — optional OpenAI-compatible provider; when unset, the built-in offline tutor answers from the curriculum
- `STORAGE_BACKEND` — `r2` (production) or `local`
- `LAB_EXECUTOR` — `simulated` (default; safe, in-process)
- SMTP_* — optional email gateway; when unset, emails are logged

## Architecture

- Next.js 15 (App Router, TypeScript, strict) + React 19
- Drizzle ORM + SQLite (local libsql file; Cloudflare D1 in production)
- OpenNext (`@opennextjs/cloudflare`) for Workers deployment
- R2 for media/assets, D1 for data, all simulated executors for labs/payments/AI

## Project layout

```
src/app            # Pages and API routes (/api/v1/*)
src/components     # UI primitives, layout, interactive widgets
src/lib            # Domain services (auth, catalogue, ai, labs, commerce, …)
src/db             # Drizzle schema, client, migrations
scripts            # migrate, seed, dump-seed-sql
```
