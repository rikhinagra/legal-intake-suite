"use client";

import { ClipboardCheck, Clock, FileText, Scale, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CONTACT_EMAIL, PRIVACY_POLICY_URL, PARENT_SITE_URL } from "@/lib/site-config";
import { useLandingTab } from "./LandingTabProvider";

interface TitledText {
  title: string;
  text: string;
}

interface Question {
  q: string;
  a: string;
}

interface Stat {
  value: string;
  label: string;
}

const SERVICE_ICONS: Record<"accident" | "business", LucideIcon[]> = {
  accident: [Clock, Users, FileText],
  business: [ClipboardCheck, Clock, Scale],
};

export default function LandingSections() {
  const t = useTranslations("landing.sections");
  const { tab } = useLandingTab();
  const isAccident = tab === "accident";

  const services = t.raw(isAccident ? "servicesAccident" : "servicesBusiness") as TitledText[];
  const steps = t.raw(isAccident ? "howAccident" : "howBusiness") as TitledText[];
  const questions = t.raw(isAccident ? "faqAccident" : "faqBusiness") as Question[];
  const stats = t.raw("stats") as Stat[];
  const icons = SERVICE_ICONS[tab];

  return (
    <div className="mx-auto max-w-[1080px] px-5 pt-16 pb-6 max-sm:pt-12">
      <section>
        <h2 className="mb-7 max-w-[24em] text-[clamp(24px,3vw,32px)] leading-tight font-semibold text-ink">
          {t(isAccident ? "servicesTitleAccident" : "servicesTitleBusiness")}
        </h2>
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {services.map((item, i) => {
            const Icon = icons[i];
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-line-soft bg-card p-6 shadow-[var(--shadow)]"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-light text-blue">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
                </span>
                <h3 className="mb-1.5 text-[18px] leading-snug font-semibold text-ink">{item.title}</h3>
                <p className="text-[15px] text-charcoal-soft">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14 grid grid-cols-4 gap-4 rounded-2xl bg-ink px-6 py-8 max-md:grid-cols-2 max-sm:gap-y-6">
        {stats.map((stat) => (
          <div key={stat.value} className="text-center">
            <b className="block text-[clamp(22px,2.6vw,30px)] leading-tight font-semibold text-white">
              {stat.value}
            </b>
            <span className="mt-1 block text-[13px] text-[#C9CFE0]">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="mb-6 text-[clamp(22px,2.6vw,28px)] font-semibold text-ink">{t("howTitle")}</h2>
        <ol className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-line-soft bg-card p-6 shadow-[var(--shadow)]"
            >
              <span className="mono mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-light text-[13px] font-semibold text-green-deep">
                {i + 1}
              </span>
              <h3 className="mb-1.5 text-[17px] font-semibold text-ink">{step.title}</h3>
              <p className="text-[15px] text-charcoal-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="mb-6 text-[clamp(22px,2.6vw,28px)] font-semibold text-ink">
          {t("attorneyTitle")}
        </h2>
        <div className="flex items-start gap-5 rounded-2xl border border-line-soft bg-green-light/50 p-6 max-sm:flex-col">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-card text-green-deep shadow-[var(--shadow)]">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.6} />
          </span>
          <div className="text-[15px] text-charcoal-soft">
            <h3 className="mb-2 text-[18px] font-semibold text-ink">{t("attorneyHeading")}</h3>
            <p>{t("attorneyText1")}</p>
            <p className="mt-2">{t("attorneyText2")}</p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-6 text-[clamp(22px,2.6vw,28px)] font-semibold text-ink">{t("faqTitle")}</h2>
        <div className="space-y-2.5">
          {questions.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-line-soft bg-card px-5 py-4 open:shadow-[var(--shadow)]"
            >
              <summary className="cursor-pointer list-none text-[15.5px] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-[20px] leading-none text-blue transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2.5 text-[15px] text-charcoal-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-12 text-[12px] leading-relaxed text-charcoal-soft">
        LexGo Solutions &middot;{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-ink">
          {CONTACT_EMAIL}
        </a>{" "}
        &middot;{" "}
        <a
          href={PARENT_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          lexgosolutions.com
        </a>
        <br />
        {t("disclaimer")}
        <br />
        {t("copyright")}{" "}
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          {t("privacy")}
        </a>
      </p>
    </div>
  );
}
