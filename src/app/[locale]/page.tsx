import { setRequestLocale } from "next-intl/server";
import UrgencyBar from "@/components/landing/UrgencyBar";
import LandingHero from "@/components/landing/LandingHero";
import Footer from "@/components/Footer";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <UrgencyBar />
      <LandingHero />
      <Footer />
    </main>
  );
}
