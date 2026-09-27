# PreskEnLer

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
