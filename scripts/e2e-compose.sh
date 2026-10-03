#!/usr/bin/env bash
set -euo pipefail

# Run the Playwright e2e suite against the Docker Compose stack.
#
# Brings up `db` + `app` (migrations + `next dev`), runs the specs from the host
# against the running app, then tears the stack down. The `db_data` volume is
# kept, so the next run is fast.
#
# Extra arguments are forwarded to `playwright test`, e.g.
#   npm run e2e:compose -- e2e/auth.spec.ts
#
# Requires Chromium once: `npx playwright install chromium`.

cd "$(dirname "$0")/.."

cleanup() {
  docker compose down
}
trap cleanup EXIT

echo "Starting db + app…"
docker compose up -d --build --wait

echo "Running Playwright against http://localhost:3000…"
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test "$@"
