"use client";

import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { CONTACT_EMAIL } from "@/lib/site-config";

export default function EmailUsButton() {
  const t = useTranslations("landing.sections");

  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="fixed right-3.5 bottom-3.5 z-20 flex items-center gap-2 rounded-full bg-blue px-5 py-3 text-[14px] font-semibold text-white shadow-[0_6px_20px_rgba(11,23,64,0.35)] transition-colors hover:bg-ink max-sm:px-4 max-sm:py-2.5 max-sm:text-[13px]"
    >
      <Mail className="h-4 w-4" strokeWidth={1.8} />
      {t("emailUs")}
    </a>
  );
}
