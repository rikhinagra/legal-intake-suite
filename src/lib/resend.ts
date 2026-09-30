import { Resend } from "resend";

export function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export const EMAIL_FROM = "Legal Intake Suite <notifications@send.lexgosolutions.com>";
