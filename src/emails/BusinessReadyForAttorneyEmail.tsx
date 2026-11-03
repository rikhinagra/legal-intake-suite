import { Heading, Text, Button } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import CasePill from "./components/CasePill";
import { BRAND_COLORS } from "@/lib/site-config";

export interface BusinessReadyForAttorneyEmailProps {
  registrationNumber: string;
  companyName: string;
  agentName: string;
  dashboardUrl: string;
}

export default function BusinessReadyForAttorneyEmail({
  registrationNumber,
  companyName,
  agentName,
  dashboardUrl,
}: BusinessReadyForAttorneyEmailProps) {
  return (
    <EmailLayout preview={`Business registration ready: ${companyName} needs an attorney decision`}>
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
        {companyName} is ready for your decision.
      </Heading>
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 22px" }}>
        {agentName} called this business and marked the registration ready for attorney review.
        The call notes are waiting for you in the dashboard.
      </Text>

      <CasePill caseNumber={registrationNumber} label="Registration No." />

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
