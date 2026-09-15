"use client";

import { useTranslations } from "next-intl";
import { IntakeFormData } from "@/lib/types";
import Field from "@/components/ui/Field";
import PillGroup from "@/components/ui/PillGroup";

interface StepAccidentProps {
  data: IntakeFormData;
  update: (patch: Partial<IntakeFormData>) => void;
  invalid: { accDate: boolean; bestTime: boolean; description: boolean };
}

function todayLocalISODate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function StepAccident({ data, update, invalid }: StepAccidentProps) {
  const t = useTranslations("stepAccident");
  const tRail = useTranslations("rail");

  return (
    <div>
      <div className="mb-7">
        <span className="mono mb-2 block text-[11.5px] tracking-[0.1em] text-green-deep uppercase">
          {tRail("stepWord")} 3 {tRail("ofWord")} 5
        </span>
        <h2 className="text-[25px] font-semibold">{t("title")}</h2>
        <p className="mt-2 max-w-[46ch] text-[14.5px] text-charcoal-soft">{t("subtitle")}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Field
          label={t("dateLabel")}
          required
          invalid={invalid.accDate}
          error={t("dateError")}
        >
          <input
            type="date"
            max={todayLocalISODate()}
            value={data.accDate}
            onChange={(e) => update({ accDate: e.target.value })}
          />
        </Field>
        <Field label={t("timeLabel")} optional>
          <input
            type="time"
            value={data.accTime}
            onChange={(e) => update({ accTime: e.target.value })}
          />
        </Field>
      </div>

      <Field
        label={t("bestTimeLabel")}
        required
        invalid={invalid.bestTime}
        error={t("bestTimeError")}
      >
        <PillGroup
          name="besttime"
          value={data.bestTime}
          onChange={(v) => update({ bestTime: v })}
          options={[
            { value: "ASAP", label: t("bestTimeAsap") },
            { value: "Morning", label: t("bestTimeMorning") },
            { value: "Afternoon", label: t("bestTimeAfternoon") },
            { value: "Evening", label: t("bestTimeEvening") },
          ]}
        />
      </Field>

      <Field label={t("policeLabel")} optional>
        <PillGroup
          name="police"
          value={data.policeArrived}
          onChange={(v) => update({ policeArrived: v as IntakeFormData["policeArrived"] })}
          options={[
            { value: "Yes", label: t("policeYes") },
            { value: "No", label: t("policeNo") },
            { value: "Not sure", label: t("policeNotSure") },
          ]}
        />
      </Field>

      <Field
        label={t("descriptionLabel")}
        required
        invalid={invalid.description}
        error={t("descriptionError")}
      >
        <textarea
          placeholder={t("descriptionPlaceholder")}
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </Field>
    </div>
  );
}
