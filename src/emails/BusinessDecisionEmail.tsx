import { Heading, Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import CasePill from "./components/CasePill";
import { BRAND_COLORS } from "@/lib/site-config";
import type { EmailLanguage } from "./BusinessRegistrationReceivedEmail";

export type BusinessEmailDecision = "approved" | "declined";

export interface BusinessDecisionEmailProps {
  contactFirstName: string;
  companyName: string;
  registrationNumber: string;
  decision: BusinessEmailDecision;
  language: EmailLanguage;
}

interface DecisionContent {
  preview: string;
  eyebrow: string;
  eyebrowColor: string;
  headline: string;
  body: string;
}

const PILL_LABEL: Record<EmailLanguage, string> = {
  en: "Registration No.",
  es: "Registro No.",
};

function getContent(
  decision: BusinessEmailDecision,
  language: EmailLanguage,
  name: string,
  company: string
): DecisionContent {
  if (language === "es") {
    return decision === "approved"
      ? {
          preview: "Tu registro fue aprobado",
          eyebrow: "Registro Aprobado",
          eyebrowColor: BRAND_COLORS.green,
          headline: `Buenas noticias, ${name}. Tu registro fue aprobado.`,
          body: `Después de revisar ${company}, nuestros abogados aprobaron tu registro. Alguien de nuestro equipo se comunicará contigo con los siguientes pasos.`,
        }
      : {
          preview: "Una actualización sobre tu registro",
          eyebrow: "Actualización de Registro",
          eyebrowColor: "#5b6478",
          headline: `Una actualización sobre tu registro, ${name}.`,
          body: `Después de una revisión cuidadosa, no podemos continuar con el registro de ${company} por ahora. Esto no es un juicio sobre tu negocio. Las firmas rechazan registros por muchas razones, incluyendo el alcance y la capacidad.`,
        };
  }
  return decision === "approved"
    ? {
        preview: "Your registration was approved",
        eyebrow: "Registration Approved",
        eyebrowColor: BRAND_COLORS.green,
        headline: `Good news, ${name}. Your registration is approved.`,
        body: `After reviewing ${company}, our attorneys approved your registration. Someone from our team will contact you with the next steps.`,
      }
    : {
        preview: "An update on your registration",
        eyebrow: "Registration Update",
        eyebrowColor: "#5b6478",
        headline: `An update on your registration, ${name}.`,
        body: `After a careful review, we are not able to move forward with the registration for ${company} at this time. This is not a judgment about your business. Firms decline registrations for many reasons, including scope and capacity.`,
      };
}

export function getBusinessDecisionSubject(
  decision: BusinessEmailDecision,
  registrationNumber: string,
  language: EmailLanguage
) {
  if (language === "es") {
    return decision === "approved"
      ? `Tu registro fue aprobado (${registrationNumber})`
      : `Una actualización sobre tu registro (${registrationNumber})`;
  }
  return decision === "approved"
    ? `Your registration was approved (${registrationNumber})`
    : `An update on your registration (${registrationNumber})`;
}

export default function BusinessDecisionEmail({
  contactFirstName,
  companyName,
  registrationNumber,
  decision,
  language,
}: BusinessDecisionEmailProps) {
  const content = getContent(decision, language, contactFirstName, companyName);

  return (
    <EmailLayout preview={content.preview} lang={language}>
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
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 22px" }}>
        {content.body}
      </Text>

      <CasePill caseNumber={registrationNumber} label={PILL_LABEL[language]} />
    </EmailLayout>
  );
}
