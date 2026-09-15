"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  invalid?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function Field({
  label,
  required,
  optional,
  error,
  invalid,
  children,
  style,
  className,
}: FieldProps) {
  const t = useTranslations("common");
  return (
    <div className={`mb-4 flex flex-col gap-[7px] ${className ?? ""}`} style={style}>
      <label className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
        {label}
        {required && <span className="text-clay text-[13px]">*</span>}
        {optional && (
          <span className="text-[11.5px] font-normal text-charcoal-soft">
            {t("optional")}
          </span>
        )}
      </label>
      <div
        className={
          invalid
            ? "[&_input]:border-clay [&_input]:bg-red-50 [&_select]:border-clay [&_textarea]:border-clay [&_textarea]:bg-red-50"
            : ""
        }
      >
        {children}
      </div>
      {invalid && error && (
        <span className="mt-0.5 block text-[12px] text-clay">{error}</span>
      )}
    </div>
  );
}
