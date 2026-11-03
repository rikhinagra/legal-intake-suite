import { Heading, Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import CasePill from "./components/CasePill";
import { BRAND_COLORS, CONTACT_EMAIL } from "@/lib/site-config";

export type EmailLanguage = "en" | "es";

export interface BusinessRegistrationReceivedEmailProps {
  contactFirstName: string;
  companyName: string;
  registrationNumber: string;
  language: EmailLanguage;
}

const COPY = {
  en: {
    preview: "We received your registration and will call you within 24 hours",
    eyebrow: "Registration Received",
    pillLabel: "Registration No.",
    headline: (name: string) => `Thank you, ${name}. You are registered.`,
    body: (company: string) =>
      `We received the registration for ${company}. A real person will review it and call you within 24 hours. Registering is free and confidential.`,
    after: `If your business has an accident case in the future, you will know who to call. Questions? Email us at ${CONTACT_EMAIL}.`,
  },
  es: {
    preview: "Recibimos tu registro y te llamaremos en 24 horas",
    eyebrow: "Registro Recibido",
    pillLabel: "Registro No.",
    headline: (name: string) => `Gracias, ${name}. Tu negocio está registrado.`,
    body: (company: string) =>
      `Recibimos el registro de ${company}. Una persona real lo revisará y te llamará en 24 horas. Registrarse es gratis y confidencial.`,
    after: `Si tu negocio tiene un caso de accidente en el futuro, sabrás a quién llamar. ¿Preguntas? Escríbenos a ${CONTACT_EMAIL}.`,
  },
} as const;

export function getBusinessRegistrationReceivedSubject(
  registrationNumber: string,
  language: EmailLanguage
) {
  return language === "es"
    ? `Recibimos tu registro (${registrationNumber})`
    : `We received your registration (${registrationNumber})`;
}

export default function BusinessRegistrationReceivedEmail({
  contactFirstName,
  companyName,
  registrationNumber,
  language,
}: BusinessRegistrationReceivedEmailProps) {
  const copy = COPY[language];

  return (
    <EmailLayout preview={copy.preview} lang={language}>
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
        {copy.eyebrow}
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
        {copy.headline(contactFirstName)}
      </Heading>
      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7, margin: "0 0 22px" }}>
        {copy.body(companyName)}
      </Text>

      <CasePill caseNumber={registrationNumber} label={copy.pillLabel} />

      <Text style={{ fontSize: "14px", color: "#1b2333", lineHeight: 1.7 }}>{copy.after}</Text>
    </EmailLayout>
  );
}
