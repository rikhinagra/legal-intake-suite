import { Heading, Text, Button } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import StatusTimeline from "./components/StatusTimeline";
import CasePill from "./components/CasePill";
import { BRAND_COLORS } from "@/lib/site-config";

export interface NewLeadEmailProps {
  caseNumber: string;
  claimantName: string;
  caseType: string;
  agentPortalUrl: string;
}

export default function NewLeadEmail({
  caseNumber,
  claimantName,
  caseType,
  agentPortalUrl,
}: NewLeadEmailProps) {
  return (
    <EmailLayout preview={`New case intake: ${claimantName} needs a verification call`}>
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
        Action Needed • Verification Call
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
        {claimantName} is waiting on your call.
      </Heading>
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 6px" }}>
        A new {caseType.toLowerCase()} case just cleared intake. It&apos;s parked at the
        verification stage until an agent completes the phone screening.
      </Text>

      <StatusTimeline currentIndex={1} />
      <CasePill caseNumber={caseNumber} />

      <Button
        href={agentPortalUrl}
        style={{
          backgroundColor: BRAND_COLORS.blue,
          color: "#ffffff",
          fontFamily: "'Inter',Helvetica,Arial,sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          borderRadius: "9px",
          padding: "12px 24px",
        }}
      >
        Open Agent Portal
      </Button>
    </EmailLayout>
  );
}
