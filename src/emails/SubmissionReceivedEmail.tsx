import { Heading, Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import StatusTimeline from "./components/StatusTimeline";
import CasePill from "./components/CasePill";
import { BRAND_COLORS } from "@/lib/site-config";

export interface SubmissionReceivedEmailProps {
  claimantFirstName: string;
  caseNumber: string;
}

export default function SubmissionReceivedEmail({
  claimantFirstName,
  caseNumber,
}: SubmissionReceivedEmailProps) {
  return (
    <EmailLayout preview="We've received your case and will call you shortly">
      <Text
        style={{
          fontFamily: "'IBM Plex Mono','Courier New',monospace",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: BRAND_COLORS.blue,
          margin: "0 0 12px",
        }}
      >
        Status Update
      </Text>
      <Heading
        style={{
          fontFamily: "'Inter',Helvetica,Arial,sans-serif",
          fontWeight: 500,
          fontSize: "24px",
          color: BRAND_COLORS.ink,
          margin: "0 0 14px",
          lineHeight: 1.25,
        }}
      >
        You&apos;re on the record, {claimantFirstName}.
      </Heading>
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 6px" }}>
        Your case has been received and is now moving through our intake process. Here&apos;s
        what happens between now and when an attorney reviews your case.
      </Text>

      <StatusTimeline currentIndex={1} />
      <CasePill caseNumber={caseNumber} />

      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7 }}>
        Keep your phone nearby. Most claimants hear from an agent within a few hours. We&apos;ll
        email you again the moment your case moves to the next stage.
      </Text>
    </EmailLayout>
  );
}
