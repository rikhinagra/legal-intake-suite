"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tHero = useTranslations("hero");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "es" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <footer className="px-5 pt-4 pb-10 text-center text-[12px] text-charcoal-soft">
      {t("text")} &nbsp;•&nbsp;{" "}
      <button
        type="button"
        onClick={toggleLanguage}
        className="cursor-pointer font-semibold text-green-deep transition-colors hover:text-green"
      >
        {locale === "en" ? t("spanishNote") : tHero("switchToEnglish")}
      </button>
    </footer>
  );
}
