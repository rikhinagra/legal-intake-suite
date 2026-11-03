import { setRequestLocale } from "next-intl/server";
import UrgencyBar from "@/components/landing/UrgencyBar";
import LandingTabProvider from "@/components/landing/LandingTabProvider";
import LandingHero from "@/components/landing/LandingHero";
import LandingSections from "@/components/landing/LandingSections";
import EmailUsButton from "@/components/landing/EmailUsButton";
import Footer from "@/components/Footer";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <UrgencyBar />
      <LandingTabProvider>
        <LandingHero />
        <LandingSections />
      </LandingTabProvider>
      <Footer />
      <EmailUsButton />
    </main>
  );
}
