"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface SuccessPanelProps {
  caseNumber: string;
}

export default function SuccessPanel({ caseNumber }: SuccessPanelProps) {
  const t = useTranslations("successPanel");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-5 py-[50px] text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="mx-auto mb-6 flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#3fe37e,#06d64b_75%)] shadow-[0_0_0_6px_rgba(6,214,75,0.14),var(--shadow-lg)]"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-white">
          <motion.path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
      <h2 className="text-[26px] font-semibold">{t("title")}</h2>
      <p className="mx-auto mt-3.5 max-w-[44ch] text-[14.5px] text-charcoal-soft">
        {t("message")}
      </p>
      <div className="mono mt-[22px] inline-block rounded-[9px] border border-dashed border-line bg-paper-2 px-5 py-2.5 text-[14px] text-ink">
        {caseNumber}
      </div>
    </motion.div>
  );
}
