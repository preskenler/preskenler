# PreskEnLer

## Terra Nova / Webcup integration

The app consumes the Ville de Terra Nova demand feed
(`https://24h.webcup.fr/wp-json/webcup/v1/requests`) and persists it in MySQL.

| Variable             | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `WEBCUP_API_KEY`     | API key, sent as `X-Webcup-Api-Key`. **Server-only** (no `NEXT_PUBLIC_`). |
| `WEBCUP_API_URL`     | Override the endpoint (defaults to the official URL).                     |
| `WEBCUP_CRON_SECRET` | Bearer secret guarding `GET /api/webcup/sync`.                            |

Endpoints:

- `GET /api/webcup/requests` — authenticated snapshot for the `/requests` board;
  refreshes from the API in the background.
- `GET /api/webcup/sync` — scheduler entry point, protected by
  `Authorization: Bearer $WEBCUP_CRON_SECRET`.

Continuous capture relies on an external scheduler. On cPanel, add a **Cron
Job** that runs every minute:

```sh
curl -fsS -H "Authorization: Bearer $WEBCUP_CRON_SECRET" https://<host>/api/webcup/sync
```

Requests are keyed on `request_code`, so repeated calls never create duplicates.

## Roles

Profiles and permissions use the Better Auth **admin plugin**: roles are
`citizen`, `agent` or `admin` (comma-separated when combined) and access control
lives in `src/lib/permissions.ts`. Set `STAFF_EMAILS` (comma-separated) to
bootstrap agents at sign-up; create the first admin with
`npx auth@latest create-admin --email … --role admin`. Admins manage every
profile — and can ban/unban accounts — from `/users`. The staff routes
(`/requests`, `/messages`, `/users`) are permission gated.

## Accessibility

The interface targets WCAG AA: the palette in `src/app/globals.css` is tuned so
muted text is ≥ 4.5:1 and borders/focus rings are ≥ 3:1. The header exposes a
**display preferences** menu (theme + text size) — the text size scales the root
font size and is persisted, and form errors/async updates are announced to
assistive technology.

## Deployment

The app is deployed to a cPanel **Setup Node.js App** (`Phusion Passenger`) as a
Next.js [standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
Node.js server. Deploys run automatically from GitHub Actions on every push to
`main` (`.github/workflows/deploy.yml`) and can also be triggered manually with
**Run workflow** (`workflow_dispatch`).

### cPanel application settings

| Setting                  | Value                                             |
| ------------------------ | ------------------------------------------------- |
| Node.js version          | 24                                                |
| Application root         | `preskenler` (`/home/preskenlair/preskenler`)     |
| Application startup file | `server.js`                                       |
| Application URL          | `https://preskenlair.lareunion.webcup.hodi.cloud` |

The virtualenv lives at `/home/preskenlair/nodevenv/preskenler/24` (outside the
application root), so it is left untouched by deploys.

### Required repository secrets

| Secret             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `SSH_HOST`         | cPanel SSH hostname                                |
| `SSH_USER`         | cPanel account username (`preskenlair`)            |
| `SSH_PORT`         | SSH port (optional, defaults to `22`)              |
| `SSH_PRIVATE_KEY`  | Private key authorized in `~/.ssh/authorized_keys` |
| `SSH_KEY_PASSWORD` | Passphrase for the private key, if it is protected |

### How a deploy works

1. Build the app and assemble the standalone output, copying `.next/static` and
   `public` into `.next/standalone` as required by Next.js.
2. Upload the resulting `deploy.tar.gz` to `~/deploy` over SCP.
3. Replace the app's own files in `~/preskenler` (`.next`, `node_modules`,
   `public`, `server.js`, `package.json`), extract the archive and restart
   Passenger via `tmp/restart.txt`.

Files managed by cPanel (`nodevenv/`, `tmp/`, `.htaccess`) are preserved.

### Rollback

No previous builds are kept on the server. To roll back, open the **Deploy**
workflow in the Actions tab, pick the last successful run for the commit you want
to restore and choose **Re-run all jobs**.
