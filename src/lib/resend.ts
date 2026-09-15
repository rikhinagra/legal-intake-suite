import { Resend } from "resend";

export function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY!);
}

/**
 * Resend's shared sandbox sender — works with no domain setup, but (until a
 * custom domain is verified in Resend) can only actually deliver to the
 * email address on the Resend account itself. Swap this for a real address
 * on your own verified domain (e.g. "no-reply@yourfirm.com") once one exists.
 */
export const EMAIL_FROM = "Legal Intake Suite <onboarding@resend.dev>";
