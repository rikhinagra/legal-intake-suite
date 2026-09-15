"use client";

import { useTranslations } from "next-intl";
import { IntakeFormData, CASE_TYPES } from "@/lib/types";
import Field from "@/components/ui/Field";
import PillGroup from "@/components/ui/PillGroup";
import Dropdown from "@/components/ui/Dropdown";

interface StepCaseProps {
  data: IntakeFormData;
  update: (patch: Partial<IntakeFormData>) => void;
  attorneyInvalid: boolean;
}

const CASE_TYPE_KEYS: Record<(typeof CASE_TYPES)[number], string> = {
  "Automobile Accident": "caseTypeAutomobile",
  "Truck Accident": "caseTypeTruck",
  "Motorcycle Accident": "caseTypeMotorcycle",
  "Rideshare Accident": "caseTypeRideshare",
  "Pedestrian Accident": "caseTypePedestrian",
  "Slip & Fall": "caseTypeSlipFall",
  "Dog Bite": "caseTypeDogBite",
  "Wrongful Death": "caseTypeWrongfulDeath",
  Other: "caseTypeOther",
};

export default function StepCase({ data, update, attorneyInvalid }: StepCaseProps) {
  const t = useTranslations("stepCase");
  const tRail = useTranslations("rail");

  return (
    <div>
      <div className="mb-7">
        <span className="mono mb-2 block text-[11.5px] tracking-[0.1em] text-green-deep uppercase">
          {tRail("stepWord")} 1 {tRail("ofWord")} 5
        </span>
        <h2 className="text-[25px] font-semibold">{t("title")}</h2>
        <p className="mt-2 max-w-[46ch] text-[14.5px] text-charcoal-soft">{t("subtitle")}</p>
      </div>

      <Field label={t("caseTypeLabel")} required>
        <select
          className="hidden md:block"
          value={data.caseType}
          onChange={(e) => update({ caseType: e.target.value })}
        >
          {CASE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(CASE_TYPE_KEYS[type])}
            </option>
          ))}
        </select>
        <Dropdown
          value={data.caseType}
          onChange={(v) => update({ caseType: v })}
          options={CASE_TYPES.map((type) => ({ value: type, label: t(CASE_TYPE_KEYS[type]) }))}
        />
      </Field>

      <Field
        label={t("attorneyLabel")}
        required
        invalid={attorneyInvalid}
        error={t("attorneyError")}
      >
        <PillGroup
          name="attorney"
          value={data.hasAttorney}
          onChange={(v) => update({ hasAttorney: v as IntakeFormData["hasAttorney"] })}
          options={[
            { value: "No", label: t("attorneyNo") },
            { value: "Yes", label: t("attorneyYes") },
          ]}
        />
      </Field>

      <Field label={t("occupationLabel")} optional>
        <input
          type="text"
          placeholder={t("occupationPlaceholder")}
          value={data.occupation}
          onChange={(e) => update({ occupation: e.target.value })}
        />
      </Field>
    </div>
  );
}
