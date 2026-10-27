#!/usr/bin/env sh
# Zentrion Learntech — one-command Cloudflare deploy.
#
# Prerequisites:
#   1. npm install
#   2. wrangler login
#   3. Create the D1 database:  npx wrangler d1 create zention-db
#      and paste the database_id into wrangler.toml
#   4. Create the R2 bucket:    npx wrangler r2 bucket create zention-assets
#   5. Set secrets:
#        npx wrangler secret put APP_SECRET_KEY
#
# Then:  ./deploy.sh
set -eu

echo "==> Installing dependencies"
npm install --legacy-peer-deps

echo "==> Typechecking"
npm run lint --silent 2>/dev/null || npx tsc --noEmit

echo "==> Building for Cloudflare (OpenNext)"
npm run cf-build

echo "==> Applying D1 migrations (remote)"
npx wrangler d1 migrations apply zention-db --remote

echo "==> Deploying Worker"
npm run deploy

echo ""
echo "Done. Seed the catalogue (optional, first deploy only):"
echo "  npm run db:seed          # seed your local copy first"
echo "  npm run db:dump-sql > seed.sql"
echo "  npx wrangler d1 execute zention-db --remote --file=seed.sql"
