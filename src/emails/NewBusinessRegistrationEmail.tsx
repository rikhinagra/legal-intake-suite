import { Heading, Text, Button } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import CasePill from "./components/CasePill";
import { BRAND_COLORS } from "@/lib/site-config";

export interface NewBusinessRegistrationEmailProps {
  registrationNumber: string;
  companyName: string;
  contactName: string;
  fleetSize: string;
  agentPortalUrl: string;
}

export default function NewBusinessRegistrationEmail({
  registrationNumber,
  companyName,
  contactName,
  fleetSize,
  agentPortalUrl,
}: NewBusinessRegistrationEmailProps) {
  return (
    <EmailLayout preview={`New business registration: ${companyName} needs a call`}>
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
        Action Needed • Registration Call
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
        {companyName} is waiting on your call.
      </Heading>
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 22px" }}>
        A new business registration just came in from {contactName}. Fleet size: {fleetSize}.
        Call the contact to confirm their details and note the outcome in the portal.
      </Text>

      <CasePill caseNumber={registrationNumber} label="Registration No." />

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
        Open Business Registrations
      </Button>
    </EmailLayout>
  );
}
