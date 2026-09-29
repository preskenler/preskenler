import { z } from 'zod';

/**
 * Waitlist sign-up rules. There is no backend endpoint yet (see the `TODO(api)`
 * in `WaitlistForm`), so this schema is only used client-side for now. When the
 * endpoint is added, reuse this schema to validate again at the server boundary.
 */
export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'Cette adresse email ne semble pas valide.' })),
});

export type WaitlistValues = z.infer<typeof waitlistSchema>;
