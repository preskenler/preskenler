# Agents

PreskEnLer is a Next.js 16 / React 19 App Router site (French UI) with Better
Auth + Prisma 7 on MySQL/MariaDB, Tailwind v4, and shadcn/ui.

## Commands

- `npm run dev` — dev server (Turbopack). `npm run build` forces `--webpack` and
  produces the `output: 'standalone'` bundle used by the cPanel deploy.
- `npm test` — Vitest (jsdom + Testing Library). Tests must live under `src/`
  (`src/**/*.{test,spec}.{ts,tsx}`); colocate them as `*.test.tsx`.
- `npm run type:check` — run `npm run type:gen` first. Next 16 generates global
  route types (`LayoutProps<'/[locale]'>`, `PageProps`, …) into `.next/types`; `tsc`
  fails on a clean tree without them.
- `npm run e2e` — Playwright (chromium only). It starts `npm run dev` itself;
  set `PLAYWRIGHT_BASE_URL` to target an already-running server. One spec:
  `npx playwright test e2e/auth.spec.ts`.
- `npm run lint` / `npm run format` / `npm run format:check` (Prettier: single
  quotes, trailing commas).
- CI (`.github/workflows/next.js.yml`) order: `db:deploy` → Prisma schema-drift
  check → lint → `type:gen` → `type:check` → `format:check` → test → build → e2e.

## Database (Prisma 7)

- MySQL/MariaDB only. The client uses the required v7 driver adapter
  (`@prisma/adapter-mariadb`, wired in `src/lib/prisma.ts`).
- `prisma/schema.prisma` has **no `url`** in its datasource; the connection comes
  from `DATABASE_URL` via `prisma7.config.ts`.
- The client is generated to `src/generated/prisma` (gitignored) and imported as
  `@/generated/prisma/client`. Re-run `npm run db:generate` after schema edits
  (`postinstall` does it on install).
- Migrations: `npm run db:migrate` (dev, creates a migration), `npm run db:deploy`
  (CI/prod). CI fails on schema drift (`prisma migrate diff --exit-code`).
- `npm run db:seed` creates demo accounts (never run automatically): citizens
  `camille.martin@`, `yanis.bernard@`, `louise.petit@terranova.city`; agents
  `agent.etat-civil@`, `agent.proprete@terranova.city`; and `admin@terranova.city`.
  Shared password `PreskEnLer2026!` (override with `SEED_PASSWORD`). Defined in
  `prisma/seed.ts`, wired through `migrations.seed` in `prisma7.config.ts`.
  On cPanel, `npm run db:setup` runs `db:deploy` + `db:seed` in one step
  (`npm run db:setup && npm run build`).
- Local stack: `docker compose up` (db + app, with Compose Watch), or point
  `DATABASE_URL` at a MySQL on `localhost:3306`. Copy `.env.example` to `.env`.

## Auth

- Better Auth. Server config `src/lib/auth.ts`, client `src/lib/auth-client.ts`,
  catch-all route `src/app/api/auth/[...all]/route.ts`.
- `nextCookies()` must stay the **last** plugin so it can set cookies from Server
  Actions/Components.
- Server-side session: `auth.api.getSession({ headers: await headers() })`.
- `sendEmail` (`src/lib/email.ts`) only logs in dev — no mail transport exists, so
  reset/verification links must be read from the server console.
- `src/lib/schemas/` is the source of truth for form rules/types and mirrors
  Better Auth's server rules. UI copy is French; reuse the existing wording.

## Terra Nova API (Webcup)

- Live demand feed in `src/lib/webcup/`: `client.ts` (server-only fetch with the
  `X-Webcup-Api-Key` header), `map.ts` (snake_case → DB normalization + new-code
  detection), `sync.ts` (persist + read snapshots), `types.ts`. `WEBCUP_API_KEY`
  is server-only — never prefix it with `NEXT_PUBLIC_`.
- Persisted in MySQL as `webcup_request` / `webcup_session`, keyed on the stable
  `request_code`; ship schema changes through `db:migrate` / `db:deploy`.
- `GET /api/webcup/requests` (authenticated) returns the persisted snapshot and
  refreshes from the API in the background via `after()`.
- `GET /api/webcup/sync` (Bearer `WEBCUP_CRON_SECRET`, or Vercel's `CRON_SECRET`)
  is the scheduler entry point. On cPanel add a cron job every minute:
  `curl -fsS -H "Authorization: Bearer $WEBCUP_CRON_SECRET" https://<host>/api/webcup/sync`.
- Staff board at `/dashboard/requests` (auth-gated) polls client-side every 30s; new
  arrivals are detected by `request_code`, never by a fixed count.
- `npm run requests` (`scripts/fetch_request.mjs`) lists the live demands as a
  Markdown checklist for `TODO.md`; `npm run requests -- --write` refreshes the
  file and preserves the checked state per `request_code`.

## Roles & staff area

- Profiles use the Better Auth **admin plugin**: `User.role`
  (`citizen` | `agent` | `admin`, comma-separated for multiple roles) plus
  `banned`/`banReason`/`banExpires`. `src/lib/permissions.ts` defines the
  access-control statements (`user`, `session`, `serviceMessage`,
  `webcupRequest`) and the three roles; `src/lib/roles.ts` holds the checks and
  French labels.
- Set `STAFF_EMAILS` (comma-separated) to grant `agent` at sign-up; admins use
  `/dashboard/users` (list, `setRole`, ban/unban). Bootstrap the first admin with
  `npx auth@latest create-admin --email … --role admin`.
- Areas are route groups under `src/app/[locale]/`: `(public)` (portal), `(auth)`
  (sign-in/up) and `(dashboard)` — one authenticated shell shared by citizens, agents
  and admins. Pages live under `/dashboard/*`: `/dashboard` (overview),
  `/dashboard/account/*` (profile, messages, password, email, sessions),
  `/dashboard/requests`, `/dashboard/messages` (staff triage, F22) and
  `/dashboard/users` (admin). The sidebar is filtered by role/permission via
  `hasPermission`; legacy URLs (`/account`, `/agents/requests`, `/admin/users`, …)
  redirect to their `/dashboard` equivalents.

## i18n (next-intl)

- Locale-prefixed routing: `fr` (default) is unprefixed, English lives under
  `/en`. Config `src/i18n/routing.ts`, request config `src/i18n/request.ts`,
  navigation wrappers `src/i18n/navigation.ts`, proxy `src/proxy.ts` (Next 16
  renamed middleware to proxy). The matcher excludes `/api/*`, so Better Auth
  and the Webcup cron stay non-localized.
- `next.config.mjs` resolves `next-intl/config` → `src/i18n/request.ts` with a
  manual webpack/Turbopack alias instead of `createNextIntlPlugin()`, because
  that plugin eagerly imports `@swc/core`, whose native addon the deploy host
  can't load. Restore the plugin (and allowlist `@swc/core`) only if message
  extraction is adopted.
- Pages live under `src/app/[locale]/`; `api/**` and `global-error.tsx` stay at
  `src/app/`. The root layout is `src/app/[locale]/layout.tsx` and mounts
  `NextIntlClientProvider`.
- Messages live in `messages/fr.json` / `messages/en.json` (`en` is provisional).
  Use `getTranslations` in async components and `useTranslations` in Client
  Components. Public copy is namespaced under `Public`; shared strings under
  `Accessibility`, `Errors`, `Validation`.
- Import `Link` and navigation hooks from `@/i18n/navigation`, never `next/link`
  or `next/navigation`, so the active locale is preserved.
- Zod schemas that surface localized messages are factories taking `t`
  (`createContactSchema(t)` in `src/lib/schemas/contact.ts`). Tests rendering
  translated components use the `renderWithIntl` helper in `src/test/render.tsx`.
- Playwright pins `locale: 'fr-FR'` so auto-detection keeps the default-locale
  (unprefixed) URLs stable.
- The whole authenticated area, the auth flows and the transactional auth
  emails are localized with next-intl (`Dashboard`, `Account`, `Agents`,
  `Admin`, `Auth`, `AuthEmails` namespaces plus `Validation.auth`). Auth emails
  render from `src/lib/email-templates.ts`; the locale comes from the request
  (`NEXT_LOCALE` cookie → `Accept-Language` → `fr`) via `src/lib/email-locale.ts`.

## UI / conventions

- Accessibility (demandes F21–F24): `DisplayPreferences`
  (`src/components/accessibility/`) bundles the theme and the text-size choice.
  Text size scales the root font size (Tailwind is rem-based) and is applied
  pre-paint by `textSizeScript` in `src/app/[locale]/layout.tsx`. Keep form errors linked
  with `aria-describedby`, announce async updates with `role="status"`, and mark
  decorative icons `aria-hidden`. The theme tokens in `globals.css` are tuned to
  WCAG AA/1.4.11 (muted text ≥4.5, borders/focus rings ≥3:1) — re-check contrast
  before changing them.

- shadcn/ui uses the `base-nova` style on **Base UI** (`@base-ui/react`), not
  Radix. Use Base UI props/patterns; a `migrate-radix-to-base` skill is available.
- Tailwind v4 is CSS-first: theme lives in `src/app/globals.css`, there is no
  `tailwind.config.*`. `cn` comes from the `cn` npm package (also re-exported as
  `@/lib/utils`).
- React Compiler is enabled (`reactCompiler: true`) — avoid manual memoization.

## Deploy

- `output: 'standalone'`: `next start` is unsupported; the server runs from the
  standalone `server.js`. E2E therefore runs against `npm run dev`.
- README documents automatic deploy from `.github/workflows/deploy.yml`, but that
  workflow no longer exists — CI only runs checks (no deploy job).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
