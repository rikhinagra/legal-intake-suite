"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface StepRailProps {
  current: number;
  caseNumber: string | null;
  submitted: boolean;
  onStepClick: (step: number) => void;
}

export default function StepRail({
  current,
  caseNumber,
  submitted,
  onStepClick,
}: StepRailProps) {
  const t = useTranslations("rail");
  const steps = [t("step0"), t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <aside className="sticky top-5 rounded-[14px] border border-line-soft bg-card p-[22px_18px] shadow-[var(--shadow)] max-md:static max-md:p-4">
      <div className="mb-4 min-h-[52px] border-b border-dashed border-line pb-4 max-md:hidden">
        <span className="text-[10.5px] tracking-[0.12em] text-charcoal-soft uppercase">
          {t("caseReference")}
        </span>
        <AnimatePresence mode="wait">
          {caseNumber ? (
            <motion.div
              key="num"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mono mt-1 flex items-center gap-1.5 text-[15px] text-ink"
            >
              <span className="h-4 w-4 flex-shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#3fe37e,#06d64b_70%)] shadow-[0_0_0_3px_rgba(6,214,75,0.18)]" />
              <span className="mono">{caseNumber}</span>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1 font-serif text-[13px] text-charcoal-soft italic"
            >
              {t("assignedAfterContactInfo")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden max-md:block">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <span className="mono text-[11px] tracking-[0.1em] text-green-deep uppercase">
            {t("stepWord")} {current + 1} {t("ofWord")} {steps.length}
          </span>
          <span className="text-[12.5px] font-semibold text-ink">
            {submitted ? t("complete") : steps[current]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((label, idx) => {
            const filled = submitted || idx <= current;
            return (
              <div
                key={label}
                className={`h-[5px] flex-1 rounded-full transition-colors duration-300 ${
                  filled ? "bg-green" : "bg-line"
                }`}
              />
            );
          })}
        </div>
      </div>

      <ol className="flex flex-col gap-0.5 max-md:hidden">
        {steps.map((label, idx) => {
          const isDone = submitted || idx < current;
          const isActive = !submitted && idx === current;
          const clickable = !submitted && idx < current;
          return (
            <li
              key={label}
              onClick={() => clickable && onStepClick(idx)}
              className={`flex items-center gap-3 rounded-lg px-2 py-[11px] text-[13.5px] transition-colors ${
                clickable ? "cursor-pointer" : ""
              } ${
                isActive
                  ? "bg-paper-2 font-semibold text-ink"
                  : isDone
                    ? "text-charcoal"
                    : "text-charcoal-soft"
              }`}
            >
              <span
                className={`mono flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11px] transition-all ${
                  isActive
                    ? "border-blue bg-blue text-white"
                    : isDone
                      ? "border-green bg-green text-white"
                      : "border-line text-charcoal-soft"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : idx + 1}
              </span>
              {label}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
