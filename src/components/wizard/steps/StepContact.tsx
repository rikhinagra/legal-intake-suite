"use client";

import { useTranslations } from "next-intl";
import { IntakeFormData } from "@/lib/types";
import Field from "@/components/ui/Field";
import Dropdown from "@/components/ui/Dropdown";

interface StepContactProps {
  data: IntakeFormData;
  update: (patch: Partial<IntakeFormData>) => void;
  invalidFields: Set<string>;
}

export default function StepContact({ data, update, invalidFields }: StepContactProps) {
  const t = useTranslations("stepContact");
  const tRail = useTranslations("rail");
  const has = (id: string) => invalidFields.has(id);

  return (
    <div>
      <div className="mb-7">
        <span className="mono mb-2 block text-[11.5px] tracking-[0.1em] text-green-deep uppercase">
          {tRail("stepWord")} 2 {tRail("ofWord")} 5
        </span>
        <h2 className="text-[25px] font-semibold">{t("title")}</h2>
        <p className="mt-2 max-w-[46ch] text-[14.5px] text-charcoal-soft">{t("subtitle")}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Field
          label={t("firstNameLabel")}
          required
          invalid={has("firstName")}
          error={t("firstNameError")}
        >
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </Field>
        <Field
          label={t("lastNameLabel")}
          required
          invalid={has("lastName")}
          error={t("lastNameError")}
        >
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </Field>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Field
          label={t("phoneLabel")}
          required
          invalid={has("phone")}
          error={t("phoneError")}
        >
          <input
            type="tel"
            placeholder={t("phonePlaceholder")}
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </Field>
        <Field
          label={t("altPhoneLabel")}
          optional
          invalid={has("altPhone")}
          error={t("phoneError")}
        >
          <input
            type="tel"
            value={data.altPhone}
            onChange={(e) => update({ altPhone: e.target.value })}
          />
        </Field>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Field
          label={t("emailLabel")}
          optional
          invalid={has("email")}
          error={t("emailError")}
        >
          <input
            type="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </Field>
        <Field label={t("preferredLanguageLabel")} required>
          <select
            className="hidden md:block"
            value={data.language}
            onChange={(e) => update({ language: e.target.value })}
          >
            <option value="English">{t("languageEnglish")}</option>
            <option value="Spanish">{t("languageSpanish")}</option>
            <option value="Other">{t("languageOther")}</option>
          </select>
          <Dropdown
            value={data.language}
            onChange={(v) => update({ language: v })}
            options={[
              { value: "English", label: t("languageEnglish") },
              { value: "Spanish", label: t("languageSpanish") },
              { value: "Other", label: t("languageOther") },
            ]}
          />
        </Field>
      </div>

      <Field label={t("streetAddressLabel")} optional>
        <input
          type="text"
          placeholder={t("streetAddressPlaceholder")}
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
        />
      </Field>

      <div className="mb-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Field label={t("cityLabel")} required invalid={has("city")} error={t("cityError")}>
          <input
            type="text"
            value={data.city}
            onChange={(e) => update({ city: e.target.value })}
          />
        </Field>
        <Field
          label={t("stateLabel")}
          required
          invalid={has("state")}
          error={t("stateError")}
        >
          <input
            type="text"
            maxLength={2}
            placeholder="CA"
            value={data.state}
            onChange={(e) => update({ state: e.target.value })}
          />
        </Field>
      </div>

      <Field
        label={t("zipLabel")}
        required
        invalid={has("zip")}
        error={t("zipError")}
      >
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          style={{ maxWidth: 160 }}
          value={data.zip}
          onChange={(e) => update({ zip: e.target.value })}
        />
      </Field>
    </div>
  );
}
