"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Inbox,
  Hourglass,
  BadgeCheck,
  Ban,
  Search,
  Download,
  FolderOpen,
  Eye,
  X,
  Printer,
  Gavel,
  Building2,
  Truck,
  PhoneCall,
  Check,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import {
  getDashboardBusinessRegistrations,
  saveBusinessAttorneyDecision,
  type BusinessDecision,
  type DashboardBusinessRegistration,
} from "@/app/actions/business-registrations";
import {
  BUSINESS_DECISION_LABEL,
  BUSINESS_STAGE_BADGE,
  BUSINESS_STAGE_LABEL,
  businessStage,
  type BusinessStage,
} from "@/lib/business-status";

type StageFilter = "all" | BusinessStage;

const STAGE_FILTER_OPTIONS: { value: StageFilter; label: string }[] = [
  { value: "awaiting_decision", label: "Awaiting My Decision" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "contacted", label: "Contacted by Agent" },
  { value: "new", label: "New, Not Called Yet" },
  { value: "not_a_fit", label: "Not a Fit" },
  { value: "all", label: "All Registrations" },
];

const DECISION_CHOICES: { value: BusinessDecision; label: string; className: string }[] = [
  { value: "approved", label: "Approve", className: "border-green/30 bg-green-light" },
  { value: "declined", label: "Decline", className: "border-clay/25 bg-clay/5" },
  { value: "under_review", label: "Keep under review", className: "border-blue/25 bg-blue-light" },
];

function formatDate(value: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Registrations come from a public form, so a company name like "=HYPERLINK(...)"
// must not run as a formula when the file is opened in a spreadsheet.
function csvCell(value: string | number | null | undefined) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function decisionSnapshot(v: { decision: BusinessDecision; notes: string }) {
  return JSON.stringify(v);
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  const text = value === null || value === undefined || value === "" ? "N/A" : String(value);
  return (
    <div>
      <span className="block text-xs text-charcoal-soft">{label}</span>
      <span className={`font-medium [overflow-wrap:anywhere] text-charcoal ${mono ? "mono" : ""}`}>{text}</span>
    </div>
  );
}

export default function BusinessRegistrationsDashboard({
  onChanged,
}: {
  onChanged?: () => void;
}) {
  const [registrations, setRegistrations] = useState<DashboardBusinessRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("awaiting_decision");

  const [modalId, setModalId] = useState<string | null>(null);
  const [decision, setDecision] = useState<BusinessDecision>("under_review");
  const [notes, setNotes] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Blocks a second save in the very same moment, which the `saving` state
  // alone cannot, since it only updates after a render.
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  useEffect(() => {
    getDashboardBusinessRegistrations()
      .then(setRegistrations)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showSavedBanner) return;
    const timeout = setTimeout(() => setShowSavedBanner(false), 12000);
    return () => clearTimeout(timeout);
  }, [showSavedBanner]);

  const modalReg = registrations.find((r) => r.id === modalId) ?? null;

  const metrics = useMemo(() => {
    const stages = registrations.map((r) => businessStage(r));
    return {
      total: registrations.length,
      awaiting: stages.filter((s) => s === "awaiting_decision").length,
      approved: stages.filter((s) => s === "approved").length,
      declined: stages.filter((s) => s === "declined").length,
    };
  }, [registrations]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return registrations.filter((r) => {
      if (stageFilter !== "all" && businessStage(r) !== stageFilter) return false;
      if (term) {
        const haystack = [
          r.company_name,
          r.contact_name,
          r.phone,
          r.email,
          r.registration_number ?? "",
          r.dot_mc_number ?? "",
          r.states_of_operation ?? "",
          r.need,
          r.agent_notes ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [registrations, search, stageFilter]);

  function openModal(reg: DashboardBusinessRegistration) {
    const loaded = {
      decision: reg.attorney_decision?.decision ?? ("under_review" as BusinessDecision),
      notes: reg.attorney_decision?.notes ?? "",
    };
    setModalId(reg.id);
    setDecision(loaded.decision);
    setNotes(loaded.notes);
    // The form was just filled from what is already saved, so this is the
    // baseline the "Saved" button compares against.
    setSavedSnapshot(decisionSnapshot(loaded));
    setSaveError(null);
    setShowSavedBanner(false);
  }

  function dial(phone: string) {
    // Same tel: hand-off the Agent Portal uses.
    const link = document.createElement("a");
    link.href = `tel:${phone}`;
    link.click();
  }

  const isSaved =
    !!modalReg?.attorney_decision && savedSnapshot === decisionSnapshot({ decision, notes });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!modalReg || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    // Restarts the banner's timer, so a banner from an earlier save cannot
    // expire in the middle of this one.
    setShowSavedBanner(false);
    try {
      const result = await saveBusinessAttorneyDecision({
        registrationId: modalReg.id,
        decision,
        notes,
      });
      if (!result.ok) {
        setSaveError(result.error);
        return;
      }
      const refreshed = await getDashboardBusinessRegistrations();
      setRegistrations(refreshed);
      setSavedSnapshot(decisionSnapshot({ decision, notes }));
      setShowSavedBanner(true);
      onChanged?.();
    } catch {
      // A dropped connection makes the call throw instead of returning an error.
      setSaveError("Could not reach the server. Please check your connection and try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function exportCSV() {
    const headers = [
      "Registration ID",
      "Date",
      "Stage",
      "Company",
      "Contact",
      "Phone",
      "Email",
      "Fleet Size",
      "What They Need",
      "Company Type",
      "Role",
      "DOT / MC",
      "Drivers",
      "States",
      "Insurance Carrier",
      "Has Counsel",
      "Preferred Contact",
      "Language",
      "Their Message",
      "Call Outcome",
      "Agent",
      "Agent Notes",
      "Attorney Decision",
      "Attorney Notes",
    ];
    const rows = registrations.map((r) => [
      r.registration_number ?? r.id,
      r.created_at,
      BUSINESS_STAGE_LABEL[businessStage(r)],
      r.company_name,
      r.contact_name,
      r.phone,
      r.email,
      r.fleet_size,
      r.need,
      r.company_type,
      r.contact_role,
      r.dot_mc_number,
      r.driver_count,
      r.states_of_operation,
      r.insurance_carrier,
      r.has_counsel,
      r.preferred_contact,
      r.language,
      r.message,
      r.call_outcome,
      r.agent_name,
      r.agent_notes,
      r.attorney_decision ? BUSINESS_DECISION_LABEL[r.attorney_decision.decision] : "",
      r.attorney_decision?.notes,
    ]);
    const csv = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `business_registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const metricCards = [
    { label: "Total Registrations", value: metrics.total, icon: Inbox, sub: "All business sign ups" },
    {
      label: "Awaiting Decision",
      value: metrics.awaiting,
      icon: Hourglass,
      sub: "Passed on by an agent",
      tone: "text-blue",
    },
    {
      label: "Approved",
      value: metrics.approved,
      icon: BadgeCheck,
      sub: "Accepted by the firm",
      tone: "text-green-deep",
    },
    {
      label: "Declined",
      value: metrics.declined,
      icon: Ban,
      sub: "Not accepted",
      tone: "text-clay",
    },
  ];

  return (
    <>
      <div id="dashboard-no-print" className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-4">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)] sm:p-5"
          >
            <div
              className={`mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                m.tone ?? "text-charcoal-soft"
              }`}
            >
              <span>{m.label}</span>
              <m.icon className="h-4 w-4 opacity-70" />
            </div>
            <div className={`text-2xl font-bold sm:text-3xl ${m.tone ?? "text-ink"}`}>{m.value}</div>
            <div className="mt-1 text-[11px] text-charcoal-soft">{m.sub}</div>
          </div>
        ))}
      </div>

      <div
        id="dashboard-no-print"
        className="flex flex-col gap-3 rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)] md:flex-row md:items-center md:justify-between"
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-charcoal-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, contact, phone, or keyword..."
            className="!pl-9 !text-[13px]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            value={stageFilter}
            onChange={(v) => setStageFilter(v as StageFilter)}
            wrapperClassName=""
            triggerClassName="w-auto !text-[13px] font-medium"
            options={STAGE_FILTER_OPTIONS}
          />
          <button
            onClick={exportCSV}
            disabled={registrations.length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-line px-3 text-xs font-medium text-charcoal transition hover:bg-paper-2 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-charcoal-soft" /> Export CSV
          </button>
        </div>
      </div>

      <div id="dashboard-no-print" className="rounded-[14px] border border-line bg-card shadow-[var(--shadow)]">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <FolderOpen className="h-4 w-4 text-blue" /> Business & Transport Registrations
          </h2>
          <span className="text-xs font-medium text-charcoal-soft">
            Showing {filtered.length} registration{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-charcoal-soft">Loading...</div>
        ) : loadError ? (
          <div className="px-5 py-8 text-center text-sm text-clay">
            Could not load registrations. Please refresh the page.
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-charcoal-soft">
            {registrations.length === 0
              ? "No business registrations yet."
              : "No registrations match your current filters. Try the filter menu to see all registrations."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((r) => {
              const stage = businessStage(r);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openModal(r)}
                  className="flex min-w-0 flex-col rounded-[12px] border border-line bg-card p-4 text-left shadow-xs transition [overflow-wrap:anywhere] hover:border-blue/40 hover:shadow-[var(--shadow)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="mono block truncate text-xs font-bold text-charcoal-soft">
                        {r.registration_number ?? r.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] text-charcoal-soft">{formatDate(r.created_at)}</span>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${BUSINESS_STAGE_BADGE[stage]}`}
                    >
                      {BUSINESS_STAGE_LABEL[stage]}
                    </span>
                  </div>

                  <div className="mt-3 text-base font-bold break-words text-ink">{r.company_name}</div>
                  <div className="text-[13px] text-charcoal">{r.contact_name}</div>
                  <div className="mono text-[12px] text-charcoal-soft">{r.phone}</div>

                  <div className="mt-3 space-y-0.5 text-[12.5px] text-charcoal">
                    <div>
                      <span className="text-charcoal-soft">Fleet:</span> {r.fleet_size}
                    </div>
                    <div className="break-words">
                      <span className="text-charcoal-soft">Needs:</span> {r.need}
                    </div>
                  </div>

                  <div className="mt-3 flex-1 border-t border-line-soft pt-3 text-xs">
                    {r.call_outcome ? (
                      <div className="text-charcoal">
                        <span className="font-bold text-green-deep">{r.call_outcome}:</span>{" "}
                        <span className="line-clamp-2">&quot;{r.agent_notes}&quot;</span>
                        <span className="mt-0.5 block text-[10px] text-charcoal-soft">
                          {r.agent_name ?? "Agent"}
                        </span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-blue italic">
                        <PhoneCall className="h-3 w-3" /> Awaiting agent call
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-[9px] bg-blue-light px-2.5 py-1.5 text-xs font-semibold text-blue">
                      <Eye className="h-3.5 w-3.5" /> Inspect
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {modalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/60 p-3 backdrop-blur-xs sm:p-6">
          <div
            id="case-modal-content"
            className="my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line-soft bg-paper-2/60 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="mono shrink-0 rounded-lg bg-blue px-2.5 py-1 text-xs font-bold text-white">
                  {modalReg.registration_number ?? modalReg.id.slice(0, 8)}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg leading-tight [overflow-wrap:anywhere]">{modalReg.company_name}</h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-charcoal-soft">
                    <span>Registered: {formatDateTime(modalReg.created_at)}</span>
                    <span>•</span>
                    <span className="font-medium text-charcoal">{modalReg.language || "English"}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2" id="dashboard-no-print">
                <button
                  onClick={() => window.print()}
                  title="Print / Save PDF"
                  className="rounded-lg p-2 text-charcoal-soft transition hover:bg-paper-2 hover:text-ink"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setModalId(null)}
                  aria-label="Close"
                  className="rounded-lg p-2 text-charcoal-soft transition hover:bg-paper-2 hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto p-5 text-xs sm:p-7 sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-line-soft bg-paper-2 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-charcoal-soft">Stage:</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      BUSINESS_STAGE_BADGE[businessStage(modalReg)]
                    }`}
                  >
                    {BUSINESS_STAGE_LABEL[businessStage(modalReg)]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-charcoal-soft">Fleet size:</span>
                  <span className="text-xs font-semibold text-charcoal">{modalReg.fleet_size}</span>
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <Building2 className="h-3.5 w-3.5 text-blue" /> Business Contact
                </h4>
                <div className="grid grid-cols-2 gap-3 rounded-[9px] border border-line-soft bg-paper-2/50 p-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-charcoal-soft">Phone</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono font-semibold text-blue">{modalReg.phone}</span>
                      <button
                        type="button"
                        onClick={() => dial(modalReg.phone)}
                        className="inline-flex items-center gap-1 rounded-[7px] bg-green-deep px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white transition hover:bg-green-deep/90"
                      >
                        <PhoneCall className="h-3 w-3" /> Dial
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <span className="block text-xs text-charcoal-soft">Email</span>
                    <span className="font-medium break-all text-charcoal">{modalReg.email}</span>
                  </div>
                  <Info label="Contact Person" value={modalReg.contact_name} />
                  <Info label="Role" value={modalReg.contact_role} />
                  <div className="col-span-2 border-t border-line-soft pt-2 sm:col-span-6">
                    <Info label="Preferred Contact Method" value={modalReg.preferred_contact} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <Truck className="h-3.5 w-3.5 text-blue" /> Fleet & What They Need
                </h4>
                <div className="space-y-3 rounded-[9px] border border-line-soft bg-paper-2/50 p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Info label="Fleet Size" value={modalReg.fleet_size} />
                    <Info label="Number of Drivers" value={modalReg.driver_count} />
                    <Info label="Company Type" value={modalReg.company_type} />
                    <Info label="DOT / MC Number" value={modalReg.dot_mc_number} mono />
                    <Info label="States of Operation" value={modalReg.states_of_operation} />
                    <Info label="Insurance Carrier" value={modalReg.insurance_carrier} />
                    <Info label="Already Has Legal Counsel?" value={modalReg.has_counsel} />
                    <div className="col-span-2">
                      <Info label="What They Would Like" value={modalReg.need} />
                    </div>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-charcoal-soft">Their Message:</span>
                    <p className="rounded-[9px] border border-line-soft bg-card p-3 text-xs leading-relaxed text-charcoal">
                      {modalReg.message || "No message provided."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <PhoneCall className="h-3.5 w-3.5 text-green-deep" /> Agent Call & Notes
                </h4>
                {modalReg.call_outcome ? (
                  <div className="space-y-3 rounded-[9px] border border-green/25 bg-green-light/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-deep text-xs font-bold text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm font-bold text-ink">
                          Called by {modalReg.agent_name ?? "an agent"}
                        </span>
                      </div>
                      <div className="text-xs text-green-deep">
                        {modalReg.call_outcome} · Updated {formatDate(modalReg.agent_updated_at)}
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="mb-1 block font-bold text-charcoal">Agent Notes:</span>
                      <div className="rounded-[9px] border border-green/20 bg-card p-3 leading-relaxed whitespace-pre-line text-charcoal">
                        {modalReg.agent_notes}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[9px] border border-blue/25 bg-blue-light/40 p-4 text-xs text-blue">
                    <strong>Awaiting agent call:</strong> no agent has called this business yet.
                  </div>
                )}
              </div>

              <div id="dashboard-no-print" className="pt-2">
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <Gavel className="h-3.5 w-3.5 text-blue" /> Attorney Decision
                </h4>
                {modalReg.status !== "ready_for_attorney" ? (
                  <div className="rounded-[9px] border border-line-soft bg-paper-2 p-4 text-xs text-charcoal-soft">
                    You can decide once an agent marks this registration as ready for attorney
                    review.
                  </div>
                ) : (
                  <form
                    onSubmit={handleSave}
                    className="space-y-3 rounded-[9px] border border-blue/20 bg-blue-light/30 p-4"
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {DECISION_CHOICES.map((choice) => (
                        <label
                          key={choice.value}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-[9px] border p-2.5 text-xs ${choice.className} ${
                            decision === choice.value ? "ring-2 ring-blue/40" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="business-decision"
                            checked={decision === choice.value}
                            onChange={() => setDecision(choice.value)}
                          />
                          <span className="font-bold text-charcoal">{choice.label}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <label
                        htmlFor="business-decision-notes"
                        className="mb-1 block text-xs font-medium text-charcoal"
                      >
                        Internal Attorney Notes
                      </label>
                      <textarea
                        id="business-decision-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        maxLength={5000}
                        placeholder="e.g. Fleet qualifies, send engagement terms to the contact..."
                        className="!text-[13px]"
                      />
                    </div>
                    {saveError && (
                      <p className="rounded-[9px] border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay">
                        {saveError}
                      </p>
                    )}
                    {showSavedBanner && isSaved && !saveError && (
                      <p className="rounded-[9px] border border-green/30 bg-green-light px-3 py-2 text-xs text-green-deep">
                        Saved. Decision: {BUSINESS_DECISION_LABEL[decision]}.
                      </p>
                    )}
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={saving || isSaved}
                        className={`inline-flex items-center gap-1.5 rounded-[9px] px-4 py-2 text-xs font-semibold shadow-[var(--shadow)] transition disabled:cursor-not-allowed ${
                          isSaved && !saving
                            ? "border border-green/30 bg-green-light text-green-deep disabled:opacity-100"
                            : "bg-blue text-white hover:bg-ink disabled:opacity-60"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {saving ? "Saving..." : isSaved ? "Saved" : "Save Decision"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
