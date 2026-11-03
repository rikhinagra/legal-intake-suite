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
