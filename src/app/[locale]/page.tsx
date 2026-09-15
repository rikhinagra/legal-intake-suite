import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import IntakeWizard from "@/components/wizard/IntakeWizard";
import Footer from "@/components/Footer";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <IntakeWizard />
      <Footer />
    </main>
  );
}
