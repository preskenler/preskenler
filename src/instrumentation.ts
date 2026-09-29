// TEMPORARY: prints the runtime environment and probes the database at startup
// so the real connection error appears in the deploy logs. Remove together
// with `src/lib/env-diagnostic.ts` once the production DB issue is resolved.
export async function register(): Promise<void> {
  // `mariadb` is a Node-only package, so only load the diagnostic (and the
  // driver) in the Node.js runtime; the Edge runtime must not see it.
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { logEnvironment, probeDatabase } =
    await import('@/lib/env-diagnostic');
  logEnvironment();
  await probeDatabase();
}
