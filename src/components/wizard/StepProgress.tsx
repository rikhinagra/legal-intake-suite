"use client";

import { useTranslations } from "next-intl";

interface StepProgressProps {
  current: number;
  submitted: boolean;
  caseNumber: string | null;
}

export default function StepProgress({ current, submitted, caseNumber }: StepProgressProps) {
  const t = useTranslations("rail");
  const steps = [t("step0"), t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <div className="mb-6">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-ink">
          {submitted ? t("complete") : steps[current]}
        </span>
        {caseNumber && (
          <span className="mono flex items-center gap-1.5 text-[11.5px] text-charcoal-soft">
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green shadow-[0_0_0_3px_rgba(6,214,75,0.18)]" />
            {caseNumber}
          </span>
        )}
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((label, idx) => (
          <div
            key={label}
            className={`h-[5px] flex-1 rounded-full transition-colors duration-300 ${
              submitted || idx <= current ? "bg-green" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
