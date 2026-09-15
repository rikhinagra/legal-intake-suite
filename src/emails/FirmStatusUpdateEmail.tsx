import { Heading, Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import StatusTimeline from "./components/StatusTimeline";
import CasePill from "./components/CasePill";
import { BRAND_COLORS } from "@/lib/site-config";

export type FirmStatus =
  | "Under Attorney Review"
  | "Retained"
  | "Police / Medical Records Requested"
  | "Pending Client Consultation"
  | "Declined / Closed";

export interface FirmStatusUpdateEmailProps {
  claimantFirstName: string;
  caseNumber: string;
  status: FirmStatus;
  attorneyName: string | null;
}

interface StatusContent {
  eyebrow: string;
  eyebrowColor: string;
  headline: string;
  body: string;
  /** Omit to skip the timeline entirely (used for Declined — showing forward
   * progress toward a retainer would be misleading for a case that isn't
   * moving forward). */
  timelineIndex?: number;
  showAttorney?: boolean;
}

function getContent(status: FirmStatus, name: string): StatusContent {
  switch (status) {
    case "Under Attorney Review":
      return {
        eyebrow: "Status Update",
        eyebrowColor: BRAND_COLORS.blue,
        headline: `Your case is now with our attorneys, ${name}.`,
        body: "An attorney is reviewing everything gathered so far to decide on next steps. We'll be in touch as soon as there's an update.",
        timelineIndex: 2,
      };
    case "Police / Medical Records Requested":
      return {
        eyebrow: "Status Update",
        eyebrowColor: BRAND_COLORS.blue,
        headline: `We're gathering more records for your case, ${name}.`,
        body: "Our team has requested additional police or medical records to help strengthen your case. We'll reach out directly if we need anything from you.",
        timelineIndex: 2,
      };
    case "Pending Client Consultation":
      return {
        eyebrow: "Action Needed",
        eyebrowColor: BRAND_COLORS.blue,
        headline: `Let's schedule a time to talk, ${name}.`,
        body: "Before we finalize next steps, we'd like to schedule a consultation with you. Someone from our team will reach out shortly to find a time that works.",
        timelineIndex: 2,
      };
    case "Retained":
      return {
        eyebrow: "You're Retained",
        eyebrowColor: BRAND_COLORS.green,
        headline: `Welcome, ${name}. We're officially representing you.`,
        body: "Thank you for trusting us with your case. After reviewing everything you shared with us, we've decided to move forward and formally represent you.",
        timelineIndex: 3,
        showAttorney: true,
      };
    case "Declined / Closed":
      return {
        eyebrow: "Case Update",
        eyebrowColor: "#5b6478",
        headline: `An update on your case, ${name}.`,
        body: "After a careful review, we've decided we're not able to move forward with representation on this matter. This isn't necessarily a reflection of the merits of your case. Firms decline cases for many reasons, including scope and capacity.",
        // No timelineIndex — a progress bar toward retainer would be misleading here.
      };
  }
}

export function getFirmStatusEmailSubject(status: FirmStatus, caseNumber: string): string {
  switch (status) {
    case "Under Attorney Review":
      return `Status update on your case (${caseNumber})`;
    case "Police / Medical Records Requested":
      return `We're requesting additional records (${caseNumber})`;
    case "Pending Client Consultation":
      return `Let's schedule a consultation (${caseNumber})`;
    case "Retained":
      return "You're officially our client";
    case "Declined / Closed":
      return "An update on your case";
  }
}

export default function FirmStatusUpdateEmail({
  claimantFirstName,
  caseNumber,
  status,
  attorneyName,
}: FirmStatusUpdateEmailProps) {
  const content = getContent(status, claimantFirstName);

  return (
    <EmailLayout preview={content.headline}>
      <Text
        style={{
          fontFamily: "'IBM Plex Mono','Courier New',monospace",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: content.eyebrowColor,
          margin: "0 0 12px",
        }}
      >
        {content.eyebrow}
      </Text>
      <Heading
        style={{
          fontFamily: "'Inter',Helvetica,Arial,sans-serif",
          fontWeight: 600,
          fontSize: "24px",
          color: BRAND_COLORS.ink,
          margin: "0 0 14px",
          lineHeight: 1.25,
        }}
      >
        {content.headline}
      </Heading>
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 6px" }}>
        {content.body}
      </Text>

      {content.timelineIndex !== undefined && <StatusTimeline currentIndex={content.timelineIndex} />}

      <div style={{ marginTop: content.timelineIndex !== undefined ? 0 : "20px" }}>
        <CasePill caseNumber={caseNumber} />
      </div>

      {content.showAttorney && attorneyName && (
        <Text style={{ fontSize: "13px", color: "#5b6478", margin: "0 0 22px" }}>
          Your attorney:{" "}
          <span style={{ fontWeight: 700, color: BRAND_COLORS.ink }}>{attorneyName}</span>
        </Text>
      )}

      {status === "Declined / Closed" && (
        <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7 }}>
          Because legal deadlines (statutes of limitations) may apply to your situation, we
          encourage you to consult with another attorney as soon as possible.
        </Text>
      )}
      {status === "Retained" && (
        <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7 }}>
          Someone from our team will reach out shortly with next steps.
        </Text>
      )}
    </EmailLayout>
  );
}
