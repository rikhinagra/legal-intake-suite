import type { BusinessDecision, BusinessStatus } from "@/app/actions/business-registrations";

// The attorneys are emailed when an agent passes a registration on, not
// every time the agent saves it again while it is already passed on.
export function shouldNotifyAttorneys(
  previousStatus: BusinessStatus | null,
  newStatus: BusinessStatus
): boolean {
  return newStatus === "ready_for_attorney" && previousStatus !== "ready_for_attorney";
}

// The business is emailed when the attorney's decision actually changes to
// approved or declined. Editing notes, or leaving it under review, is silent.
export function shouldEmailBusinessOfDecision(
  previousDecision: BusinessDecision | null,
  newDecision: BusinessDecision
): newDecision is "approved" | "declined" {
  return (newDecision === "approved" || newDecision === "declined") && newDecision !== previousDecision;
}

export function toEmailLanguage(language: string | null | undefined): "en" | "es" {
  return language?.trim().toLowerCase() === "spanish" ? "es" : "en";
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

// Company names come from a public form; keep them on one line in a subject.
export function oneLine(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}
