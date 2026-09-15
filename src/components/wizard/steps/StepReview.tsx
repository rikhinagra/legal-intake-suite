"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Paperclip, X, ChevronDown } from "lucide-react";
import { IntakeFormData, PendingAttachment } from "@/lib/types";
import { FILE_TYPE_OPTIONS } from "@/lib/supabase/storage";

const FILE_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  FILE_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

/**
 * A native <select>'s open option list is drawn by the phone's own OS, not
 * by us — on some Android/Chrome versions it renders anchored to a stale or
 * wrong position on a long, scrolled page (reported by real-device testing).
 * This is a small custom dropdown instead: fully our own markup, so it's
 * always positioned exactly relative to its own trigger, on every device.
 */
function FileTypeDropdown({
  value,
  onChange,
}: {
  value: PendingAttachment["type"];
  onChange: (value: PendingAttachment["type"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 rounded-[7px] border border-line bg-[#fcfdff] px-2.5 text-[12px] text-charcoal outline-none transition focus:border-blue"
      >
        {FILE_TYPE_LABEL[value]}
        <ChevronDown className="h-3.5 w-3.5 text-charcoal-soft" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 w-40 overflow-hidden rounded-[9px] border border-line bg-card shadow-[var(--shadow-lg)]">
          {FILE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-[13px] transition hover:bg-paper-2 ${
                opt.value === value ? "font-semibold text-blue" : "text-charcoal"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface StepReviewProps {
  data: IntakeFormData;
  consentInvalid: boolean;
  onConsentChange: (checked: boolean) => void;
  attachments: PendingAttachment[];
  onAttachmentsChange: (attachments: PendingAttachment[]) => void;
}

function ReviewValue({ value }: { value: string }) {
  const t = useTranslations("common");
  return value ? (
    <span className="font-medium break-all text-charcoal">{value}</span>
  ) : (
    <span className="font-normal text-[#9AA3B8] italic">{t("notProvided")}</span>
  );
}

function ReviewItem({
  label,
  value,
  style,
}: {
  label: string;
  value: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="text-[13.5px]" style={style}>
      <span className="block text-[11.5px] text-charcoal-soft">{label}</span>
      <ReviewValue value={value} />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mono mb-2.5 text-[11px] tracking-[0.1em] text-green-deep uppercase">
      {children}
    </h4>
  );
}

const CASE_TYPE_KEYS: Record<string, string> = {
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

export default function StepReview({
  data,
  consentInvalid,
  onConsentChange,
  attachments,
  onAttachmentsChange,
}: StepReviewProps) {
  const t = useTranslations("stepReview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      type: file.type.startsWith("image/") ? ("photo" as const) : ("other" as const),
    }));
    onAttachmentsChange([...attachments, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updateAttachmentType(id: string, type: PendingAttachment["type"]) {
    onAttachmentsChange(attachments.map((a) => (a.id === id ? { ...a, type } : a)));
  }

  function removeAttachment(id: string) {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  }
  const tRail = useTranslations("rail");
  const tCommon = useTranslations("common");
  const tCase = useTranslations("stepCase");
  const tAccident = useTranslations("stepAccident");
  const tContact = useTranslations("stepContact");

  const translateYesNo = (value: string) => {
    if (value === "Yes") return tCommon("yes");
    if (value === "No") return tCommon("no");
    return value;
  };

  const translateBestTime = (value: string) => {
    switch (value) {
      case "ASAP":
        return tAccident("bestTimeAsap");
      case "Morning":
        return tAccident("bestTimeMorning");
      case "Afternoon":
        return tAccident("bestTimeAfternoon");
      case "Evening":
        return tAccident("bestTimeEvening");
      default:
        return value;
    }
  };

  const translatePolice = (value: string) => {
    if (value === "Yes") return tAccident("policeYes");
    if (value === "No") return tAccident("policeNo");
    if (value === "Not sure") return tAccident("policeNotSure");
    return value;
  };

  const translatePreferredLanguage = (value: string) => {
    if (value === "English") return tContact("languageEnglish");
    if (value === "Spanish") return tContact("languageSpanish");
    if (value === "Other") return tContact("languageOther");
    return value;
  };

  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const cityStateZip = [data.city, data.state, data.zip].filter(Boolean).join(", ");

  return (
    <div>
      <div className="mb-7">
        <span className="mono mb-2 block text-[11.5px] tracking-[0.1em] text-green-deep uppercase">
          {tRail("stepWord")} 5 {tRail("ofWord")} 5
        </span>
        <h2 className="text-[25px] font-semibold">{t("title")}</h2>
        <p className="mt-2 max-w-[46ch] text-[14.5px] text-charcoal-soft">{t("subtitle")}</p>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-line">
        <div className="border-b border-line-soft px-5 py-[18px]">
          <SectionHeading>{t("sectionYourCase")}</SectionHeading>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-md:grid-cols-1">
            <ReviewItem
              label={t("fieldCaseType")}
              value={
                data.caseType in CASE_TYPE_KEYS
                  ? tCase(CASE_TYPE_KEYS[data.caseType])
                  : data.caseType
              }
            />
            <ReviewItem
              label={t("fieldRepresentedByAttorney")}
              value={translateYesNo(data.hasAttorney)}
            />
            <ReviewItem label={t("fieldOccupation")} value={data.occupation} />
          </div>
        </div>

        <div className="border-b border-line-soft px-5 py-[18px]">
          <SectionHeading>{t("sectionContact")}</SectionHeading>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-md:grid-cols-1">
            <ReviewItem label={t("fieldName")} value={fullName} />
            <ReviewItem label={t("fieldPhone")} value={data.phone} />
            <ReviewItem label={t("fieldAltPhone")} value={data.altPhone} />
            <ReviewItem
              label={t("fieldEmail")}
              value={data.email}
              style={{ gridColumn: "1 / -1" }}
            />
            <ReviewItem
              label={t("fieldPreferredLanguage")}
              value={translatePreferredLanguage(data.language)}
            />
            <ReviewItem label={t("fieldAddress")} value={data.address} />
            <ReviewItem label={t("fieldCityStateZip")} value={cityStateZip} />
          </div>
        </div>

        <div className="border-b border-line-soft px-5 py-[18px]">
          <SectionHeading>{t("sectionWhatHappened")}</SectionHeading>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-md:grid-cols-1">
            <ReviewItem label={t("fieldDate")} value={data.accDate} />
            <ReviewItem label={t("fieldTime")} value={data.accTime} />
            <ReviewItem
              label={t("fieldBestTimeToCall")}
              value={translateBestTime(data.bestTime)}
            />
            <ReviewItem
              label={t("fieldPoliceResponded")}
              value={translatePolice(data.policeArrived)}
            />
          </div>
          <div className="mt-2.5">
            <ReviewItem label={t("fieldDescription")} value={data.description} />
          </div>
        </div>

        <div className="px-5 py-[18px]">
          <SectionHeading>{t("sectionInjuries")}</SectionHeading>
          {data.injuries.length === 0 ? (
            <span className="font-normal text-[#9AA3B8] italic">{t("noInjuries")}</span>
          ) : (
            data.injuries.map((inj, i) => (
              <div
                key={inj.id}
                className="text-[13.5px]"
                style={{ marginBottom: i < data.injuries.length - 1 ? 12 : 0 }}
              >
                <span className="block text-[11.5px] text-charcoal-soft">
                  {inj.name || `${t("personFallback")} ${i + 1}`}
                  {inj.relationship ? ` (${inj.relationship})` : ""}
                </span>
                <ReviewValue value={inj.description} />
                <span className="mt-0.5 block text-[12px] text-charcoal-soft">
                  {t("seenADoctor")}:{" "}
                  {inj.seenDoctor ? translateYesNo(inj.seenDoctor) : tCommon("notProvided")} ·{" "}
                  {t("willingToGo")}:{" "}
                  {inj.willingToSee ? translateYesNo(inj.willingToSee) : tCommon("notProvided")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-[22px]">
        <SectionHeading>{t("sectionAttachments")}</SectionHeading>
        <p className="mb-3 text-[12.5px] text-charcoal-soft">{t("attachmentsHint")}</p>

        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-[9px] border border-line bg-card px-3 py-2"
              >
                <Paperclip className="h-4 w-4 shrink-0 text-charcoal-soft" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-charcoal">
                  {a.file.name}
                </span>
                <FileTypeDropdown
                  value={a.type}
                  onChange={(type) => updateAttachmentType(a.id, type)}
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(a.id)}
                  aria-label={t("removeFile")}
                  className="shrink-0 text-charcoal-soft transition hover:text-clay"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
          id="attachments-input"
        />
        <label
          htmlFor="attachments-input"
          className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border border-dashed border-line px-4 py-2.5 text-[13px] font-medium text-charcoal-soft transition hover:border-blue hover:text-blue"
        >
          <Paperclip className="h-4 w-4" /> {t("addFilesButton")}
        </label>
      </div>

      <div className="mt-[22px] flex items-start gap-[11px] rounded-[10px] bg-paper-2 p-4">
        <input
          type="checkbox"
          checked={data.consent}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue"
        />
        <p className="m-0 text-[12.5px] text-charcoal-soft">{t("consentText")}</p>
      </div>
      {consentInvalid && (
        <span className="mt-2 block text-[12px] text-clay">{t("consentError")}</span>
      )}
    </div>
  );
}
