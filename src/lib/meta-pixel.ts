declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

export function trackPageView() {
  fbq("track", "PageView");
}

// A lead id is only ever counted once, so a double click or a retried
// handler can't report the same submission to Meta twice.
const trackedLeadIds = new Set<string>();

export function trackLeadOnce(leadId: string) {
  if (trackedLeadIds.has(leadId)) return;
  trackedLeadIds.add(leadId);
  // No parameters on purpose: nothing about the claimant is sent to Meta.
  fbq("track", "Lead");
}
