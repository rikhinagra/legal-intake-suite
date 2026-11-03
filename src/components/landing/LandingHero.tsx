"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Clock, Lock, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import IntakeWizard from "@/components/wizard/IntakeWizard";
import HeroBackground from "./HeroBackground";
import BusinessForm from "./BusinessForm";

type Tab = "accident" | "business";

const DEFAULT_TAB: Tab = "business";
const TAB_STORAGE_KEY = "claim-intake:landing-tab";

function isTab(value: string | null): value is Tab {
  return value === "accident" || value === "business";
}

export default function LandingHero() {
  const t = useTranslations("landing");
  const tHero = useTranslations("hero");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB);

  // The tab choice is read from the URL (?tab=) first, then from the last
  // choice in this browser session. It is read here, after mount, instead
  // of with useSearchParams, which would force this whole hero to render
  // on the client only.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("tab");
      if (isTab(fromUrl)) {
        setTab(fromUrl);
        return;
      }
      const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
      if (isTab(saved)) setTab(saved);
    } catch {
      // storage or URL access unavailable: keep the default tab
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function chooseTab(next: Tab) {
    setTab(next);
    try {
      sessionStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      // the choice just won't be remembered
    }
  }

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "es" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  const chips = t.raw(tab === "accident" ? "hero.chipsAccident" : "hero.chipsBusiness") as string[];

  const tabs: { id: Tab; label: string }[] = [
    { id: "accident", label: t("tabs.accident") },
    { id: "business", label: t("tabs.business") },
  ];

  const trust = [
    { icon: Clock, label: t("hero.trustResponse") },
    { icon: ShieldCheck, label: t("hero.trustNoFee") },
    { icon: Lock, label: t("hero.trustConfidential") },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0b1740] px-5 pt-12 pb-16 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,#06d64b,transparent)] after:opacity-50 max-sm:pt-8 max-sm:pb-12">
      <HeroBackground />

      {/* On phones the order is headline, form, then chips and badges, so the
          form is never pushed far down the page. From lg up the copy sits in
          the left column and the form spans both rows on the right. */}
      <div className="relative z-10 mx-auto grid max-w-[1180px] items-start gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:grid-rows-[auto_1fr] lg:gap-y-0">
        <div className="[text-shadow:0_2px_10px_rgba(0,0,0,0.45)] lg:col-start-1 lg:row-start-1">
          <span className="mono mb-6 inline-flex items-center gap-2 rounded-full border border-green/40 bg-ink/25 px-3.5 py-1.5 text-[12px] tracking-[0.14em] text-green uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_0_3px_rgba(6,214,75,0.2)]" />
            {tHero("badge")}
          </span>

          <h1 className="text-[clamp(32px,4.6vw,52px)] leading-[1.08] font-semibold text-[#FBF9F3]">
            {t("hero.headlinePlain")}
            <br />
            <em className="font-medium text-green italic">{t("hero.headlineAccent")}</em>
          </h1>

          <p className="mt-5 max-w-[540px] text-[17px] text-[#C9CFE0] max-sm:text-[15.5px]">
            {tab === "accident" ? t("hero.subAccident") : t("hero.subBusiness")}
          </p>
        </div>

        <div className="[text-shadow:0_2px_10px_rgba(0,0,0,0.45)] max-lg:order-3 lg:col-start-1 lg:row-start-2 lg:pt-6">
          <ul className="flex max-w-[560px] flex-wrap gap-2">
            {chips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[13px] text-[#E4E9F5] backdrop-blur-sm"
              >
                {chip}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {trust.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-[13.5px] text-[#E4E9F5] backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0 text-green" strokeWidth={1.75} />
                {label}
              </span>
            ))}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-green/40 bg-green/10 px-4 py-2.5 text-[13.5px] font-medium text-green backdrop-blur-sm transition-colors hover:bg-green/20"
            >
              <Languages className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
              {locale === "en" ? tHero("switchToSpanish") : tHero("switchToEnglish")}
            </button>
          </div>
        </div>

        <div className="max-lg:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div
            role="tablist"
            aria-label={t("tabs.label")}
            className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-white/15 bg-ink/50 p-1 backdrop-blur-sm"
          >
            {tabs.map(({ id, label }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`landing-tab-${id}`}
                  aria-selected={active}
                  aria-controls={`landing-panel-${id}`}
                  onClick={() => chooseTab(id)}
                  className={`rounded-[9px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors max-sm:text-[13px] ${
                    active
                      ? "bg-white text-ink shadow-sm"
                      : "text-[#C9CFE0] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Both forms stay mounted so switching tabs never loses what was typed. */}
          <div
            role="tabpanel"
            id="landing-panel-accident"
            aria-labelledby="landing-tab-accident"
            hidden={tab !== "accident"}
          >
            <IntakeWizard variant="card" />
          </div>
          <div
            role="tabpanel"
            id="landing-panel-business"
            aria-labelledby="landing-tab-business"
            hidden={tab !== "business"}
          >
            <BusinessForm />
          </div>
        </div>
      </div>
    </section>
  );
}
