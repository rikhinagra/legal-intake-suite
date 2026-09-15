import { Html, Head, Body, Container, Section, Text, Hr, Preview } from "@react-email/components";
import { BRAND_COLORS, SITE_NAME } from "@/lib/site-config";

export default function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head>
        {/* Clients that support @font-face (most modern webmail/desktop/mobile) get the real
            brand faces; unsupported ones (chiefly Outlook desktop) fall back to the Helvetica/
            Courier stacks set on each element below. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: BRAND_COLORS.paper,
          fontFamily: "'Inter',Helvetica,Arial,sans-serif",
        }}
      >
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 20px" }}>
          <Text
            style={{
              fontFamily: "'IBM Plex Mono','Courier New',monospace",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: BRAND_COLORS.blue,
              margin: "0 0 20px",
            }}
          >
            {SITE_NAME}
          </Text>

          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              padding: "36px 34px",
              border: `1px solid ${BRAND_COLORS.mist}`,
            }}
          >
            {children}
          </Section>

          <Hr style={{ borderColor: BRAND_COLORS.mist, margin: "24px 0" }} />
          <Text style={{ fontSize: "12px", color: "#5b6478" }}>
            This is an automated notification from {SITE_NAME}. Please do not reply directly to
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
