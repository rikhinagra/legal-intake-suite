"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { submitBusinessRegistration } from "@/app/actions/submit-business-registration";
import { trackLeadOnce } from "@/lib/meta-pixel";
import Field from "@/components/ui/Field";
import PillGroup from "@/components/ui/PillGroup";
import Dropdown from "@/components/ui/Dropdown";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

interface BusinessFormData {
  company: string;
  contact: string;
  phone: string;
  email: string;
  fleet: string;
  need: string;
  companyType: string;
  role: string;
  dot: string;
  drivers: string;
  states: string;
  carrier: string;
  counsel: string;
  method: string;
  message: string;
  consent: boolean;
}

const initialData: BusinessFormData = {
  company: "",
  contact: "",
  phone: "",
  email: "",
  fleet: "",
  need: "",
  companyType: "",
  role: "",
  dot: "",
  drivers: "",
  states: "",
  carrier: "",
  counsel: "No",
  method: "Phone",
  message: "",
  consent: false,
};

export default function BusinessForm() {
  const t = useTranslations("landing.business");
  const locale = useLocale();
  const [data, setData] = useState<BusinessFormData>(initialData);
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [showMore, setShowMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Blocks a second submit in the very same moment (a fast double tap), which
  // the `submitting` state alone cannot, since it only updates after a render.
  const submittingRef = useRef(false);
  const [submitError, setSubmitError] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);

  const update = (patch: Partial<BusinessFormData>) => setData((prev) => ({ ...prev, ...patch }));
  const has = (id: string) => invalid.has(id);

  const fleetOptions = [
    { value: "", label: t("select") },
    { value: "1 to 5 vehicles", label: t("fleet1") },
    { value: "6 to 25 vehicles", label: t("fleet2") },
    { value: "26 to 100 vehicles", label: t("fleet3") },
    { value: "100 or more vehicles", label: t("fleet4") },
  ];
  const needOptions = [
    { value: "", label: t("select") },
    { value: "Register for future cases (free)", label: t("need1") },
    { value: "Rapid response after a crash", label: t("need2") },
    { value: "Help for our injured drivers", label: t("need3") },
    { value: "Defense and legal support", label: t("need4") },
    { value: "Referral partnership", label: t("need5") },
    { value: "Compliance", label: t("need6") },
    { value: "Other", label: t("need7") },
  ];
  const typeOptions = [
    { value: "", label: t("select") },
    { value: "Trucking carrier", label: t("type1") },
    { value: "Freight broker", label: t("type2") },
    { value: "Logistics / 3PL", label: t("type3") },
    { value: "Towing", label: t("type4") },
    { value: "School / passenger bus", label: t("type5") },
    { value: "Rideshare / delivery fleet", label: t("type6") },
    { value: "Medical transport", label: t("type7") },
    { value: "Other", label: t("type8") },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    const next = new Set<string>();
    if (!data.company.trim()) next.add("company");
    if (!data.contact.trim()) next.add("contact");
    if (!isValidPhone(data.phone)) next.add("phone");
    if (!EMAIL_PATTERN.test(data.email.trim())) next.add("email");
    if (!data.fleet) next.add("fleet");
    if (!data.need) next.add("need");
    if (!data.consent) next.add("consent");
    setInvalid(next);
    if (next.size > 0) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(false);
    // A dropped connection makes the call throw rather than return an error,
    // so it is caught here or the button would stay on "Sending..." forever.
    let result: Awaited<ReturnType<typeof submitBusinessRegistration>>;
    try {
      result = await submitBusinessRegistration({
        company: data.company,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        fleet: data.fleet,
        need: data.need,
        companyType: data.companyType,
        role: data.role,
        dot: data.dot,
        drivers: data.drivers,
        states: data.states,
        carrier: data.carrier,
        counsel: data.counsel,
        method: data.method,
        message: data.message,
        consent: data.consent,
        language: locale === "es" ? "Spanish" : "English",
      });
    } catch {
      result = { ok: false, error: "" };
    }
    submittingRef.current = false;
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(true);
      return;
    }

    trackLeadOnce(result.registrationId);
    setRegistrationNumber(result.registrationNumber);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-line-soft bg-card px-6 py-12 text-center shadow-[var(--shadow-lg)]">
        <div className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#3fe37e,#06d64b_75%)] shadow-[0_0_0_6px_rgba(6,214,75,0.14)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-[24px] font-semibold">{t("successTitle")}</h2>
        <p className="mx-auto mt-3 max-w-[40ch] text-[14.5px] text-charcoal-soft">
          {t("successMessage")}
        </p>
        {registrationNumber && (
          <p className="mono mx-auto mt-5 inline-block rounded-full border border-line-soft bg-paper px-4 py-1.5 text-[12px] tracking-[0.06em] text-charcoal-soft">
            {t("successReference", { number: registrationNumber })}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line-soft bg-card p-[26px_24px_24px] shadow-[var(--shadow-lg)] max-sm:p-[22px_18px_20px]"
    >
      <h2 className="text-[22px] font-semibold">{t("title")}</h2>
      <p className="mt-2 mb-6 text-[14px] text-charcoal-soft">{t("hint")}</p>

      <div className="grid grid-cols-2 gap-x-4 max-sm:grid-cols-1">
        <Field label={t("companyLabel")} required invalid={has("company")} error={t("companyError")}>
          <input
            type="text"
            autoComplete="organization"
            value={data.company}
            onChange={(e) => update({ company: e.target.value })}
          />
        </Field>
        <Field label={t("contactLabel")} required invalid={has("contact")} error={t("contactError")}>
          <input
            type="text"
            autoComplete="name"
            value={data.contact}
            onChange={(e) => update({ contact: e.target.value })}
          />
        </Field>
        <Field label={t("phoneLabel")} required invalid={has("phone")} error={t("phoneError")}>
          <input
            type="tel"
            autoComplete="tel"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </Field>
        <Field label={t("emailLabel")} required invalid={has("email")} error={t("emailError")}>
          <input
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </Field>
        <Field label={t("fleetLabel")} required invalid={has("fleet")} error={t("fleetError")}>
          <Dropdown
            wrapperClassName=""
            value={data.fleet}
            onChange={(v) => update({ fleet: v })}
            options={fleetOptions}
          />
        </Field>
        <Field label={t("needLabel")} required invalid={has("need")} error={t("needError")}>
          <Dropdown
            wrapperClassName=""
            value={data.need}
            onChange={(v) => update({ need: v })}
            options={needOptions}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((open) => !open)}
        aria-expanded={showMore}
        className="mb-4 flex w-full items-center justify-between rounded-[9px] border-[1.5px] border-dashed border-line px-4 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:border-green hover:bg-green-light hover:text-green-deep"
      >
        {t("moreToggle")}
        <span className="flex items-center gap-1.5 text-[12px] font-normal text-charcoal-soft">
          {t("optionalLabel")}
          <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
        </span>
      </button>

      {showMore && (
        <div className="mb-2">
          <div className="grid grid-cols-2 gap-x-4 max-sm:grid-cols-1">
            <Field label={t("companyTypeLabel")}>
              <Dropdown
                wrapperClassName=""
                value={data.companyType}
                onChange={(v) => update({ companyType: v })}
                options={typeOptions}
              />
            </Field>
            <Field label={t("roleLabel")}>
              <input
                type="text"
                placeholder={t("rolePlaceholder")}
                value={data.role}
                onChange={(e) => update({ role: e.target.value })}
              />
            </Field>
            <Field label={t("dotLabel")}>
              <input type="text" value={data.dot} onChange={(e) => update({ dot: e.target.value })} />
            </Field>
            <Field label={t("driversLabel")}>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={data.drivers}
                onChange={(e) => update({ drivers: e.target.value })}
              />
            </Field>
            <Field label={t("statesLabel")}>
              <input
                type="text"
                value={data.states}
                onChange={(e) => update({ states: e.target.value })}
              />
            </Field>
            <Field label={t("carrierLabel")}>
              <input
                type="text"
                value={data.carrier}
                onChange={(e) => update({ carrier: e.target.value })}
              />
            </Field>
          </div>
          <Field label={t("counselLabel")}>
            <PillGroup
              name="biz-counsel"
              value={data.counsel}
              onChange={(v) => update({ counsel: v })}
              options={[
                { value: "No", label: t("counselNo") },
                { value: "Yes", label: t("counselYes") },
              ]}
            />
          </Field>
          <Field label={t("methodLabel")}>
            <PillGroup
              name="biz-method"
              value={data.method}
              onChange={(v) => update({ method: v })}
              options={[
                { value: "Phone", label: t("methodPhone") },
                { value: "Email", label: t("methodEmail") },
                { value: "WhatsApp", label: t("methodWhatsapp") },
              ]}
            />
          </Field>
          <Field label={t("messageLabel")}>
            <textarea value={data.message} onChange={(e) => update({ message: e.target.value })} />
          </Field>
        </div>
      )}

      <label
        className={`mt-1 flex cursor-pointer items-start gap-3 rounded-[10px] border-[1.5px] px-4 py-3.5 text-[13px] leading-snug text-charcoal-soft ${
          has("consent") ? "border-clay bg-red-50" : "border-line-soft bg-blue-light/50"
        }`}
      >
        <input
          type="checkbox"
          checked={data.consent}
          onChange={(e) => {
            update({ consent: e.target.checked });
            if (e.target.checked) {
              setInvalid((prev) => {
                const next = new Set(prev);
                next.delete("consent");
                return next;
              });
            }
          }}
          className="mt-0.5 h-4 w-4 flex-shrink-0 !w-4 accent-[#0b4cf5]"
        />
        <span>{t("consent")}</span>
      </label>
      {has("consent") && <p className="mt-1.5 text-[12px] text-clay">{t("consentError")}</p>}

      {submitError && (
        <p
          role="alert"
          className="mt-4 rounded-[9px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700"
        >
          {t("submitError")}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center rounded-[9px] bg-blue px-[26px] py-[14px] text-[14.5px] font-semibold text-white transition-all hover:bg-ink hover:shadow-[0_6px_16px_rgba(11,76,245,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
