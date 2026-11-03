import "server-only";

import { render } from "@react-email/render";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { getAgentNotificationRecipients, uniqueEmails } from "@/lib/notification-recipients";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { SITE_URL } from "@/lib/site-config";
import { firstName, oneLine, toEmailLanguage } from "@/lib/business-notification-rules";
import BusinessRegistrationReceivedEmail, {
  getBusinessRegistrationReceivedSubject,
} from "@/emails/BusinessRegistrationReceivedEmail";
import NewBusinessRegistrationEmail from "@/emails/NewBusinessRegistrationEmail";
import BusinessReadyForAttorneyEmail from "@/emails/BusinessReadyForAttorneyEmail";
import BusinessDecisionEmail, {
  getBusinessDecisionSubject,
  type BusinessEmailDecision,
} from "@/emails/BusinessDecisionEmail";

/**
 * Emails for business registrations. Like the accident emails, every
 * function is best-effort: a failed email is logged and never thrown, so a
 * registration, a call review or a decision always saves even if the email
 * does not go out.
 *
 * This is deliberately NOT a "use server" file: functions exported from one
 * are callable straight from a browser, and these must only ever run from
 * our own server code (the save actions).
 */

async function getAttorneyEmails(): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email")
    .in("role", ["attorney", "admin"]);
  if (error) {
    console.error("getAttorneyEmails failed:", error.message);
    return [];
  }
  return uniqueEmails((data ?? []).map((r) => r.email as string | null));
}

async function send(label: string, message: { to: string | string[]; subject: string; html: string }) {
  const { error } = await getResendClient().emails.send({ from: EMAIL_FROM, ...message });
  if (error) console.error(`${label} send failed:`, error);
}

// 1. To the business that just registered.
export async function notifyBusinessOfRegistration(input: {
  contactName: string;
  companyName: string;
  email: string;
  registrationNumber: string;
  language: string | null;
}) {
  try {
    if (!input.email) return;
    const language = toEmailLanguage(input.language);
    const html = await render(
      BusinessRegistrationReceivedEmail({
        contactFirstName: firstName(input.contactName),
        companyName: input.companyName,
        registrationNumber: input.registrationNumber,
        language,
      })
    );
    await send("notifyBusinessOfRegistration", {
      to: input.email,
      subject: getBusinessRegistrationReceivedSubject(input.registrationNumber, language),
      html,
    });
  } catch (err) {
    console.error("notifyBusinessOfRegistration failed:", err);
  }
}

// 2. To the agents (plus the configured extra addresses): a new registration to call.
export async function notifyAgentsOfNewBusinessRegistration(input: {
  registrationNumber: string;
  companyName: string;
  contactName: string;
  fleetSize: string;
}) {
  try {
    const emails = await getAgentNotificationRecipients(createAdminClient());
    if (emails.length === 0) return;
    const html = await render(
      NewBusinessRegistrationEmail({
        ...input,
        agentPortalUrl: `${SITE_URL}/agent?view=business`,
      })
    );
    await send("notifyAgentsOfNewBusinessRegistration", {
      to: emails,
      subject: `New business registration: ${oneLine(input.companyName)} (${input.registrationNumber})`,
      html,
    });
  } catch (err) {
    console.error("notifyAgentsOfNewBusinessRegistration failed:", err);
  }
}

// 3. To the attorneys: an agent passed a registration on.
export async function notifyAttorneysOfReadyBusiness(input: {
  registrationNumber: string;
  companyName: string;
  agentName: string;
}) {
  try {
    const emails = await getAttorneyEmails();
    if (emails.length === 0) return;
    const html = await render(
      BusinessReadyForAttorneyEmail({
        ...input,
        dashboardUrl: `${SITE_URL}/dashboard?view=business`,
      })
    );
    await send("notifyAttorneysOfReadyBusiness", {
      to: emails,
      subject: `Business registration ready: ${oneLine(input.companyName)} (${input.registrationNumber})`,
      html,
    });
  } catch (err) {
    console.error("notifyAttorneysOfReadyBusiness failed:", err);
  }
}

// 4. To the business: the attorney approved or declined the registration.
export async function notifyBusinessOfDecision(input: {
  contactName: string;
  companyName: string;
  email: string;
  registrationNumber: string;
  language: string | null;
  decision: BusinessEmailDecision;
}) {
  try {
    if (!input.email) return;
    const language = toEmailLanguage(input.language);
    const html = await render(
      BusinessDecisionEmail({
        contactFirstName: firstName(input.contactName),
        companyName: input.companyName,
        registrationNumber: input.registrationNumber,
        decision: input.decision,
        language,
      })
    );
    await send("notifyBusinessOfDecision", {
      to: input.email,
      subject: getBusinessDecisionSubject(input.decision, input.registrationNumber, language),
      html,
    });
  } catch (err) {
    console.error("notifyBusinessOfDecision failed:", err);
  }
}
