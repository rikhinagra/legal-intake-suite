import type { BusinessStatus } from "@/app/actions/business-registrations";

export const BUSINESS_STATUS_LABEL: Record<BusinessStatus, string> = {
  new: "New",
  contacted: "Contacted",
  not_a_fit: "Not a fit",
  ready_for_attorney: "Ready for attorney",
};

export const BUSINESS_STATUS_BADGE: Record<BusinessStatus, string> = {
  new: "bg-blue-light text-blue border-blue/25",
  contacted: "bg-paper-2 text-charcoal border-line",
  not_a_fit: "bg-clay/10 text-clay border-clay/25",
  ready_for_attorney: "bg-green-light text-green-deep border-green/30",
};

export const BUSINESS_DECISION_LABEL: Record<"under_review" | "approved" | "declined", string> = {
  under_review: "Under attorney review",
  approved: "Approved",
  declined: "Declined",
};

export const BUSINESS_DECISION_BADGE: Record<"under_review" | "approved" | "declined", string> = {
  under_review: "bg-blue-light text-blue border-blue/25",
  approved: "bg-green-light text-green-deep border-green/30",
  declined: "bg-clay/10 text-clay border-clay/25",
};

// The attorney's working view of a registration: a decision wins, otherwise
// a registration the agent passed on is waiting for the attorney.
export type BusinessStage =
  | "new"
  | "contacted"
  | "not_a_fit"
  | "awaiting_decision"
  | "approved"
  | "declined";

export function businessStage(registration: {
  status: BusinessStatus;
  attorney_decision: { decision: "under_review" | "approved" | "declined" } | null;
}): BusinessStage {
  const decision = registration.attorney_decision?.decision;
  if (decision === "approved") return "approved";
  if (decision === "declined") return "declined";
  if (registration.status === "ready_for_attorney") return "awaiting_decision";
  return registration.status;
}

export const BUSINESS_STAGE_LABEL: Record<BusinessStage, string> = {
  new: "New, not called yet",
  contacted: "Contacted by agent",
  not_a_fit: "Not a fit",
  awaiting_decision: "Awaiting your decision",
  approved: "Approved",
  declined: "Declined",
};

export const BUSINESS_STAGE_BADGE: Record<BusinessStage, string> = {
  new: "bg-blue-light text-blue border-blue/25",
  contacted: "bg-paper-2 text-charcoal border-line",
  not_a_fit: "bg-clay/10 text-clay border-clay/25",
  awaiting_decision: "bg-green-light text-green-deep border-green/30",
  approved: "bg-green-deep text-white border-green-deep",
  declined: "bg-clay text-white border-clay",
};
