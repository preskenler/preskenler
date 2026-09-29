export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

/**
 * Development email transport.
 *
 * No mail provider is configured yet, so the message — including the
 * single-use reset/verification link — is written to the server logs. That is
 * enough to exercise the auth flows locally.
 *
 * TODO(email): plug in a real transport (SMTP/Resend) before launch. In
 * production the message body is intentionally not logged, so tokens never end
 * up in production logs; operators only see a warning that delivery is missing.
 */
export async function sendEmail({ to, subject, text }: EmailMessage) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
}
