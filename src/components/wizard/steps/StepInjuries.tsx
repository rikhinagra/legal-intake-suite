"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { InjuryEntry, IntakeFormData } from "@/lib/types";
import Field from "@/components/ui/Field";
import PillGroup from "@/components/ui/PillGroup";

interface StepInjuriesProps {
  data: IntakeFormData;
  update: (patch: Partial<IntakeFormData>) => void;
  invalid: Set<number>;
}

export default function StepInjuries({ data, update, invalid }: StepInjuriesProps) {
  const t = useTranslations("stepInjuries");
  const tRail = useTranslations("rail");
  const injuries = data.injuries;

  const updateInjury = (id: number, patch: Partial<InjuryEntry>) => {
    update({
      injuries: injuries.map((inj) => (inj.id === id ? { ...inj, ...patch } : inj)),
    });
  };

  const removeInjury = (id: number) => {
    update({ injuries: injuries.filter((inj) => inj.id !== id) });
  };

  const addInjury = () => {
    const nextId = (injuries[injuries.length - 1]?.id ?? 0) + 1;
    update({
      injuries: [
        ...injuries,
        {
          id: nextId,
          name: "",
          relationship: "",
          description: "",
          seenDoctor: "No",
          willingToSee: "Yes",
        },
      ],
    });
  };

  return (
    <div>
      <div className="mb-7">
        <span className="mono mb-2 block text-[11.5px] tracking-[0.1em] text-green-deep uppercase">
          {tRail("stepWord")} 4 {tRail("ofWord")} 5
        </span>
        <h2 className="text-[25px] font-semibold">{t("title")}</h2>
        <p className="mt-2 max-w-[46ch] text-[14.5px] text-charcoal-soft">{t("subtitle")}</p>
      </div>

      <AnimatePresence initial={false}>
        {injuries.map((inj, idx) => {
          const isInvalid = invalid.has(inj.id);
          return (
          <motion.div
            key={inj.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`mb-[18px] overflow-hidden rounded-[10px] border-[1.5px] border-l-[3px] bg-[#fcfdff] px-5 pt-5 pb-1.5 ${
              isInvalid ? "border-clay border-l-clay bg-red-50" : "border-line border-l-green"
            }`}
          >
            <div className="mb-3.5 flex items-center justify-between">
              <h3 className="mono text-[12.5px] font-semibold tracking-[0.08em] text-charcoal-soft uppercase">
                {t("personLabel")} {idx + 1}
              </h3>
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removeInjury(inj.id)}
                  className="flex items-center gap-1 rounded px-1.5 py-1 text-[12px] font-medium text-clay"
                >
                  <X className="h-3 w-3" /> {t("remove")}
                </button>
              )}
            </div>

            {isInvalid && (
              <p className="-mt-1.5 mb-3.5 text-[12.5px] text-clay">{t("invalidMessage")}</p>
            )}

            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <Field label={t("fullNameLabel")}>
                <input
                  type="text"
                  placeholder={
                    idx === 0 ? t("fullNamePlaceholderSelf") : t("fullNamePlaceholderOther")
                  }
                  value={inj.name}
                  onChange={(e) => updateInjury(inj.id, { name: e.target.value })}
                />
              </Field>
              <Field label={t("relationshipLabel")}>
                <input
                  type="text"
                  placeholder={
                    idx === 0
                      ? t("relationshipPlaceholderSelf")
                      : t("relationshipPlaceholderOther")
                  }
                  value={inj.relationship}
                  onChange={(e) => updateInjury(inj.id, { relationship: e.target.value })}
                />
              </Field>
            </div>

            <Field label={t("descriptionLabel")}>
              <input
                type="text"
                placeholder={t("descriptionPlaceholder")}
                value={inj.description}
                onChange={(e) => updateInjury(inj.id, { description: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <Field label={t("seenDoctorLabel")}>
                <PillGroup
                  name={`seen-${inj.id}`}
                  value={inj.seenDoctor}
                  onChange={(v) => updateInjury(inj.id, { seenDoctor: v as InjuryEntry["seenDoctor"] })}
                  options={[
                    { value: "Yes", label: t("seenDoctorYes") },
                    { value: "No", label: t("seenDoctorNotYet") },
                  ]}
                />
              </Field>
              <Field label={t("willingLabel")}>
                <PillGroup
                  name={`willing-${inj.id}`}
                  value={inj.willingToSee}
                  onChange={(v) => updateInjury(inj.id, { willingToSee: v as InjuryEntry["willingToSee"] })}
                  options={[
                    { value: "Yes", label: t("willingYes") },
                    { value: "No", label: t("willingNo") },
                  ]}
                />
              </Field>
            </div>
          </motion.div>
          );
        })}
      </AnimatePresence>

      <button
        type="button"
        onClick={addInjury}
        className="flex w-full items-center justify-center gap-2 rounded-[9px] border-[1.5px] border-dashed border-line py-3 text-[13.5px] font-semibold text-ink transition-all hover:border-green hover:bg-green-light hover:text-green-deep"
      >
        <Plus className="h-4 w-4" /> {t("addAnother")}
      </button>
    </div>
  );
}
