"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { IntakeFormData, initialFormData, PendingAttachment } from "@/lib/types";
import { submitLead } from "@/app/actions/submit-lead";
import { uploadLeadFilePublic } from "@/lib/upload-lead-file";
import StepRail from "./StepRail";
import StepCase from "./steps/StepCase";
import StepContact from "./steps/StepContact";
import StepAccident from "./steps/StepAccident";
import StepInjuries from "./steps/StepInjuries";
import StepReview from "./steps/StepReview";
import SuccessPanel from "./SuccessPanel";

const TOTAL_STEPS = 5;
const STORAGE_KEY = "claim-intake:draft-v1";

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;
const ZIP_PATTERN = /^\d{5}$/;
const MIN_DESCRIPTION_LENGTH = 10;

function assignCaseNumber(prefix: string) {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix} ${year}-${rand}`;
}

function todayLocalISODate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

export default function IntakeWizard() {
  const t = useTranslations("common");
  const tReview = useTranslations("stepReview");
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<IntakeFormData>(initialFormData);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attorneyTouched, setAttorneyTouched] = useState(false);
  const [contactInvalid, setContactInvalid] = useState<Set<string>>(new Set());
  const [accidentInvalid, setAccidentInvalid] = useState({
    accDate: false,
    bestTime: false,
    description: false,
  });
  const [injuriesInvalid, setInjuriesInvalid] = useState<Set<number>>(new Set());
  const [consentInvalid, setConsentInvalid] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<IntakeFormData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  // Restoring a saved draft from sessionStorage (a browser-only API unavailable
  // during SSR) is the standard exception for setState-in-effect: it syncs React
  // state with external storage exactly once, right after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          data?: Partial<IntakeFormData>;
          current?: number;
          caseNumber?: string | null;
        };
        if (saved.data) setData({ ...initialFormData, ...saved.data });
        if (
          typeof saved.current === "number" &&
          saved.current >= 0 &&
          saved.current < TOTAL_STEPS
        ) {
          setCurrent(saved.current);
        }
        if (saved.caseNumber) setCaseNumber(saved.caseNumber);
      }
    } catch {
      // sessionStorage unavailable (private browsing, etc.) - continue with a blank form
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated || submitted) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, current, caseNumber }));
    } catch {
      // storage write failed (quota, private browsing) - progress just won't be restorable
    }
  }, [data, current, caseNumber, submitted, hydrated]);

  function validateStep(step: number): boolean {
    if (step === 0) {
      const ok = data.hasAttorney !== "";
      setAttorneyTouched(!ok);
      return ok;
    }
    if (step === 1) {
      const invalid = new Set<string>();
      if (!NAME_PATTERN.test(data.firstName.trim())) invalid.add("firstName");
      if (!NAME_PATTERN.test(data.lastName.trim())) invalid.add("lastName");
      if (!isValidPhone(data.phone)) invalid.add("phone");
      if (data.altPhone.trim() && !isValidPhone(data.altPhone)) invalid.add("altPhone");
      if (data.email.trim() && !EMAIL_PATTERN.test(data.email.trim())) invalid.add("email");
      if (!data.city.trim()) invalid.add("city");
      if (!STATE_PATTERN.test(data.state.trim())) invalid.add("state");
      if (!ZIP_PATTERN.test(data.zip.trim())) invalid.add("zip");
      setContactInvalid(invalid);
      return invalid.size === 0;
    }
    if (step === 2) {
      const next = {
        accDate: !data.accDate || data.accDate > todayLocalISODate(),
        bestTime: !data.bestTime,
        description: data.description.trim().length < MIN_DESCRIPTION_LENGTH,
      };
      setAccidentInvalid(next);
      return !next.accDate && !next.bestTime && !next.description;
    }
    if (step === 3) {
      const invalid = new Set<number>();
      data.injuries.forEach((inj) => {
        if (!inj.name.trim() && !inj.description.trim()) invalid.add(inj.id);
      });
      setInjuriesInvalid(invalid);
      return invalid.size === 0;
    }
    if (step === 4) {
      setConsentInvalid(!data.consent);
      return data.consent;
    }
    return true;
  }

  function goTo(step: number) {
    setCurrent(step);
    if (step === 3 && data.injuries.length === 0) {
      update({
        injuries: [
          {
            id: 1,
            name: `${data.firstName} ${data.lastName}`.trim(),
            relationship: "",
            description: "",
            seenDoctor: "No",
            willingToSee: "Yes",
          },
        ],
      });
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleNext() {
    if (!validateStep(current)) return;
    if (current === TOTAL_STEPS - 1) {
      submitCase();
      return;
    }
    if (current === 1 && !caseNumber) {
      setCaseNumber(assignCaseNumber(t("caseNoPrefix")));
    }
    goTo(current + 1);
  }

  async function submitCase() {
    const num = caseNumber ?? assignCaseNumber(t("caseNoPrefix"));
    if (!caseNumber) setCaseNumber(num);

    setSubmitting(true);
    setSubmitError(null);
    setUploadWarning(null);
    const result = await submitLead(data, num);

    if (!result.ok) {
      setSubmitting(false);
      setSubmitError(result.error);
      return;
    }

    if (attachments.length > 0) {
      const uploadResults = await Promise.all(
        attachments.map((a) => uploadLeadFilePublic(result.leadId, a.file, a.type))
      );
      const failedCount = uploadResults.filter((r) => !r.ok).length;
      if (failedCount > 0) {
        setUploadWarning(tReview("uploadPartialError", { count: failedCount }));
      }
    }

    setSubmitting(false);
    setSubmitted(true);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore - nothing to clean up if storage was never available
    }
  }

  function handleBack() {
    goTo(Math.max(0, current - 1));
  }

  function handleStepClick(step: number) {
    if (step < current) goTo(step);
  }

  return (
    <div className="relative z-[2] mx-auto -mt-13 max-w-[980px] px-5 pb-8">
      <div className="grid grid-cols-[230px_1fr] items-start gap-7 max-md:grid-cols-1 max-md:gap-4">
        <StepRail
          current={current}
          caseNumber={caseNumber}
          submitted={submitted}
          onStepClick={handleStepClick}
        />

        <div
          ref={cardRef}
          className="flex min-h-[460px] flex-col rounded-[14px] border border-line-soft bg-card p-[38px_36px_32px] shadow-[var(--shadow)] max-md:min-h-0 max-md:p-[26px_20px_22px]"
        >
          {!submitted ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {current === 0 && (
                    <StepCase data={data} update={update} attorneyInvalid={attorneyTouched} />
                  )}
                  {current === 1 && (
                    <StepContact data={data} update={update} invalidFields={contactInvalid} />
                  )}
                  {current === 2 && (
                    <StepAccident data={data} update={update} invalid={accidentInvalid} />
                  )}
                  {current === 3 && (
                    <StepInjuries data={data} update={update} invalid={injuriesInvalid} />
                  )}
                  {current === 4 && (
                    <StepReview
                      data={data}
                      consentInvalid={consentInvalid}
                      onConsentChange={(checked) => {
                        update({ consent: checked });
                        if (checked) setConsentInvalid(false);
                      }}
                      attachments={attachments}
                      onAttachmentsChange={setAttachments}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {submitError && (
                <p className="mt-4 rounded-[9px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
                  {submitError} Please try again.
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-7">
                <button
                  onClick={handleBack}
                  className={`flex items-center gap-2 rounded-[9px] px-2.5 py-3 text-[14px] font-semibold text-charcoal-soft transition-colors hover:text-ink ${
                    current === 0 ? "invisible" : ""
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> {t("back")}
                </button>
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-[9px] bg-blue px-[26px] py-[13px] text-[14px] font-semibold text-white transition-all hover:bg-ink hover:shadow-[0_6px_16px_rgba(11,76,245,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {current === TOTAL_STEPS - 1
                    ? submitting
                      ? t("submitting")
                      : t("submitMyCase")
                    : t("continue")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <SuccessPanel caseNumber={caseNumber ?? ""} />
              {uploadWarning && (
                <p className="mx-5 mb-5 rounded-[9px] border border-clay/30 bg-clay/10 px-4 py-3 text-center text-[13px] text-clay">
                  {uploadWarning}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
