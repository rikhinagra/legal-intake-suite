"use server";

import { render } from "@react-email/render";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { getAgentNotificationRecipients } from "@/lib/notification-recipients";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { SITE_URL } from "@/lib/site-config";
import NewLeadEmail from "@/emails/NewLeadEmail";
import LeadVerifiedEmail from "@/emails/LeadVerifiedEmail";
import FirmStatusUpdateEmail, {
  getFirmStatusEmailSubject,
  type FirmStatus,
} from "@/emails/FirmStatusUpdateEmail";
import SubmissionReceivedEmail from "@/emails/SubmissionReceivedEmail";

/**
 * Every function here is deliberately best-effort: notification failures
 * (e.g. Resend sandbox mode blocking a recipient with no verified domain)
 * must never break the underlying action that triggered them — a lead must
 * still save, a review must still save, a retainer must still save, even if
 * the email never sends. Errors are logged, never thrown.
 */

async function getStaffEmails(roles: string[]): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("email").in("role", roles);
  if (error) {
    console.error("getStaffEmails failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.email).filter((e): e is string => !!e);
}

export async function notifyClaimantOfSubmission(input: {
  claimantEmail: string | null;
  claimantFirstName: string;
  caseNumber: string;
}) {
  try {
    if (!input.claimantEmail) return;

    const html = await render(
      SubmissionReceivedEmail({
        claimantFirstName: input.claimantFirstName,
        caseNumber: input.caseNumber,
      })
    );

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.claimantEmail,
      subject: `We've received your case (${input.caseNumber})`,
      html,
    });
    if (error) console.error("notifyClaimantOfSubmission send failed:", error);
  } catch (err) {
    console.error("notifyClaimantOfSubmission failed:", err);
  }
}

export async function notifyAgentsOfNewLead(input: {
  caseNumber: string;
  claimantName: string;
  caseType: string;
}) {
  try {
    const emails = await getAgentNotificationRecipients(createAdminClient());
    if (emails.length === 0) return;

    const html = await render(
      NewLeadEmail({ ...input, agentPortalUrl: `${SITE_URL}/agent` })
    );

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: emails,
      subject: `New case intake: ${input.claimantName} (${input.caseNumber})`,
      html,
    });
    if (error) console.error("notifyAgentsOfNewLead send failed:", error);
  } catch (err) {
    console.error("notifyAgentsOfNewLead failed:", err);
  }
}

export async function notifyAttorneysOfVerifiedLead(input: {
  caseNumber: string;
  claimantName: string;
  agentName: string;
  viability: string;
}) {
  try {
    const emails = await getStaffEmails(["attorney", "admin"]);
    if (emails.length === 0) return;

    const html = await render(
      LeadVerifiedEmail({ ...input, dashboardUrl: `${SITE_URL}/dashboard` })
    );

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: emails,
      subject: `Case verified: ${input.claimantName} (${input.caseNumber})`,
      html,
    });
    if (error) console.error("notifyAttorneysOfVerifiedLead send failed:", error);
  } catch (err) {
    console.error("notifyAttorneysOfVerifiedLead failed:", err);
  }
}

export async function notifyClaimantOfFirmStatus(input: {
  claimantEmail: string | null;
  claimantFirstName: string;
  caseNumber: string;
  status: FirmStatus;
  attorneyName: string | null;
}) {
  try {
    if (!input.claimantEmail) return;

    const html = await render(
      FirmStatusUpdateEmail({
        claimantFirstName: input.claimantFirstName,
        caseNumber: input.caseNumber,
        status: input.status,
        attorneyName: input.attorneyName,
      })
    );

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.claimantEmail,
      subject: getFirmStatusEmailSubject(input.status, input.caseNumber),
      html,
    });
    if (error) console.error("notifyClaimantOfFirmStatus send failed:", error);
  } catch (err) {
    console.error("notifyClaimantOfFirmStatus failed:", err);
  }
}
