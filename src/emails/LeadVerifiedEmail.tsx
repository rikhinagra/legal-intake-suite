import { Heading, Text, Button } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import StatusTimeline from "./components/StatusTimeline";
import CasePill from "./components/CasePill";
import { BRAND_COLORS } from "@/lib/site-config";

export interface LeadVerifiedEmailProps {
  caseNumber: string;
  claimantName: string;
  agentName: string;
  viability: string;
  dashboardUrl: string;
}

export default function LeadVerifiedEmail({
  caseNumber,
  claimantName,
  agentName,
  viability,
  dashboardUrl,
}: LeadVerifiedEmailProps) {
  return (
    <EmailLayout preview={`Case verified: ${claimantName} is ready for attorney review`}>
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
        Action Needed • Attorney Review
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
        {claimantName}&apos;s case just cleared verification.
      </Heading>
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 6px" }}>
        {agentName} completed the phone screening and certified this case as genuine. It&apos;s
        now waiting on a retainer decision.
      </Text>

      <StatusTimeline currentIndex={2} />
      <CasePill caseNumber={caseNumber} />

      <Text style={{ fontSize: "13px", color: "#5b6478", margin: "0 0 22px" }}>
        Viability assessment:{" "}
        <span style={{ fontWeight: 700, color: BRAND_COLORS.green }}>{viability}</span>
      </Text>

      <Button
        href={dashboardUrl}
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
        Open Attorney Dashboard
      </Button>
    </EmailLayout>
  );
}
