"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Scale,
  PlusCircle,
  Inbox,
  BadgeCheck,
  Clock,
  Flame,
  Award,
  Search,
  Download,
  FolderOpen,
  Eye,
  X,
  Printer,
  Gavel,
  User,
  Car,
  PhoneCall,
  Check,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import StaffNav from "@/components/staff/StaffNav";
import AttachmentsPanel from "@/components/shared/AttachmentsPanel";
import Dropdown from "@/components/ui/Dropdown";
import type { StaffProfile } from "@/lib/supabase/auth-helpers";
import {
  getDashboardLeads,
  getAttorneyOptions,
  saveFirmAction,
  type DashboardLead,
  type AttorneyOption,
} from "@/app/actions/attorney-dashboard";
import { getLeadFiles, type LeadFileRow } from "@/app/actions/lead-files";

function buildFirmActionSnapshot(v: {
  firmStatus: string;
  assignedAttorneyId: string;
  firmNotes: string;
}) {
  return JSON.stringify(v);
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  verified: { label: "Genuine & Authentic", cls: "bg-green-light text-green-deep border-green/30" },
  pending: { label: "Pending Agent Review", cls: "bg-blue-light text-blue border-blue/25" },
  followup: { label: "Needs Follow-Up", cls: "bg-blue-light text-blue border-blue/25" },
  rejected: { label: "Flagged / Rejected", cls: "bg-clay/10 text-clay border-clay/25" },
};

const FIRM_STATUS_OPTIONS = [
  "Under Attorney Review",
  "Retained",
  "Police / Medical Records Requested",
  "Pending Client Consultation",
  "Declined / Closed",
] as const;

const FIRM_STATUS_LABEL: Record<string, string> = {
  Retained: "Retained (Agreement Signed)",
  "Declined / Closed": "Declined / Closed File",
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "verified", label: "Genuine & Authentic Only" },
  { value: "pending", label: "Pending Agent Review" },
  { value: "followup", label: "Needs Follow-Up" },
  { value: "rejected", label: "Rejected / Flagged" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High Priority Only" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
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

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function AttorneyDashboard({ staff }: { staff: StaffProfile }) {
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [attorneys, setAttorneys] = useState<AttorneyOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [modalLead, setModalLead] = useState<DashboardLead | null>(null);
  const [firmStatus, setFirmStatus] = useState<string>("Under Attorney Review");
  const [assignedAttorneyId, setAssignedAttorneyId] = useState<string>("");
  const [firmNotes, setFirmNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const lastSavedFirmSnapshot = useRef<string | null>(null);
  const [modalFiles, setModalFiles] = useState<LeadFileRow[]>([]);

  function refreshModalFiles(leadId: string) {
    getLeadFiles(leadId).then(setModalFiles);
  }

  async function loadAll() {
    setLoading(true);
    const [leadData, attorneyData] = await Promise.all([
      getDashboardLeads(),
      getAttorneyOptions(),
    ]);
    setLeads(leadData);
    setAttorneys(attorneyData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const metrics = useMemo(() => {
    return {
      total: leads.length,
      verified: leads.filter((l) => l.status === "verified").length,
      pending: leads.filter((l) => l.status === "pending").length,
      high: leads.filter((l) => l.priority === "high").length,
      retained: leads.filter((l) => l.firm_action?.status === "Retained").length,
    };
  }, [leads]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (priorityFilter !== "all" && l.priority !== priorityFilter) return false;
      if (term) {
        const haystacks = [
          `${l.first_name} ${l.last_name}`,
          l.phone,
          l.case_number ?? "",
          l.accident_description ?? "",
          l.agent_review?.agent_message ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystacks.includes(term)) return false;
      }
      return true;
    });
  }, [leads, search, statusFilter, priorityFilter]);

  function openModal(lead: DashboardLead) {
    const loaded = {
      firmStatus: lead.firm_action?.status ?? "Under Attorney Review",
      assignedAttorneyId: lead.firm_action?.assigned_attorney_id ?? "",
      firmNotes: lead.firm_action?.notes ?? "",
    };
    setModalLead(lead);
    setFirmStatus(loaded.firmStatus);
    setAssignedAttorneyId(loaded.assignedAttorneyId);
    setFirmNotes(loaded.firmNotes);
    setSaveError(null);
    // The form was just populated from what's already saved (or, for a case
    // with no firm action yet, from the same defaults the "unsaved" state
    // would show) — sync the dirty-check baseline to match so the button
    // correctly shows "Saved" immediately for an already-actioned case,
    // instead of momentarily treating this programmatic load as an edit.
    lastSavedFirmSnapshot.current = buildFirmActionSnapshot(loaded);
    setSavedNotice(!!lead.firm_action);
    setShowSavedBanner(false);
    refreshModalFiles(lead.id);
  }

  function dialClaimant(phone: string) {
    // Same tel: hand-off used in the Agent Portal — opens whatever the
    // device has for calling (native Phone app on mobile, FaceTime/Skype
    // etc. on desktop if registered). No-op if nothing's registered.
    const link = document.createElement("a");
    link.href = `tel:${phone}`;
    link.click();
  }

  async function handleSaveFirmAction(e: React.FormEvent) {
    e.preventDefault();
    if (!modalLead) return;
    setSaving(true);
    setSaveError(null);
    const result = await saveFirmAction({
      leadId: modalLead.id,
      status: firmStatus,
      assignedAttorneyId: assignedAttorneyId || null,
      notes: firmNotes,
      caseNumber: modalLead.case_number,
      claimantEmail: modalLead.email,
      claimantFirstName: modalLead.first_name,
      assignedAttorneyName:
        attorneys.find((a) => a.id === assignedAttorneyId)?.full_name ?? null,
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setSavedNotice(true);
    setShowSavedBanner(true);
    const refreshedLeads = await getDashboardLeads();
    setLeads(refreshedLeads);
    setModalLead((current) =>
      current ? (refreshedLeads.find((l) => l.id === current.id) ?? current) : current
    );
  }

  // Same pattern as the Agent Portal's "Save & Certify" button: the "Saved"
  // state persists until the attorney actually edits something, at which
  // point this flips it back off so the button reverts to the normal
  // actionable state instead of falsely claiming "Saved" over new changes.
  // The baseline (lastSavedFirmSnapshot) is set both here and, when the
  // modal opens, in openModal() above — see the comment there for why the
  // open-modal path also needs to sync it.
  const firmActionSnapshot = buildFirmActionSnapshot({
    firmStatus,
    assignedAttorneyId,
    firmNotes,
  });
  useEffect(() => {
    if (lastSavedFirmSnapshot.current === null) {
      // Modal hasn't been opened yet — openModal() will set the real baseline.
      return;
    }
    if (lastSavedFirmSnapshot.current !== firmActionSnapshot) {
      lastSavedFirmSnapshot.current = firmActionSnapshot;
      setSavedNotice(false);
      setShowSavedBanner(false);
    }
  }, [firmActionSnapshot]);

  // The confirmation banner is a short-lived toast, separate from
  // savedNotice (which drives the button and persists until an edit).
  useEffect(() => {
    if (!showSavedBanner) return;
    const timeout = setTimeout(() => setShowSavedBanner(false), 12000);
    return () => clearTimeout(timeout);
  }, [showSavedBanner]);

  function exportCSV() {
    const headers = [
      "Lead ID",
      "Date",
      "Status",
      "Priority",
      "First Name",
      "Last Name",
      "Phone",
      "Email",
      "Case Type",
      "Accident Date",
      "Injuries Count",
      "Agent Verified",
      "Agent Post-Call Notes",
      "Firm Status",
      "Assigned Attorney",
    ];
    const rows = leads.map((l) => [
      l.case_number ?? l.id,
      l.created_at,
      l.status,
      l.priority,
      escapeCsv(l.first_name),
      escapeCsv(l.last_name),
      escapeCsv(l.phone),
      escapeCsv(l.email ?? ""),
      escapeCsv(l.case_type),
      l.accident_date ?? "",
      String(l.injured_people.length),
      l.agent_review ? (l.agent_review.is_authentic ? "YES" : "NO") : "PENDING",
      escapeCsv(l.agent_review?.agent_message ?? ""),
      escapeCsv(l.firm_action?.status ?? "Unassigned"),
      escapeCsv(l.firm_action?.assigned_attorney_name ?? "Unassigned"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `legal_intake_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-paper">
      <div id="dashboard-no-print">
        <StaffNav staff={staff} active="dashboard" />
      </div>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div
          id="dashboard-no-print"
          className="flex flex-col justify-between gap-4 border-b border-line-soft pb-4 sm:flex-row sm:items-center"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue/25 bg-blue-light px-2.5 py-1 text-xs font-semibold text-blue">
              <Scale className="h-3.5 w-3.5" /> Attorney & Partner Portal
            </div>
            <h1 className="text-2xl sm:text-3xl">Legal Intake Command Center</h1>
            <p className="mt-1 text-[14.5px] text-charcoal-soft">
              Monitor incoming client inquiries, review certified agent call screenings, and
              execute retainer decisions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-[9px] bg-blue px-3.5 py-2 text-xs font-semibold text-white shadow-[var(--shadow)] transition hover:bg-ink sm:text-sm"
            >
              <PlusCircle className="h-4 w-4" /> New Client Form
            </Link>
          </div>
        </div>

        <div id="dashboard-no-print" className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-5">
          {[
            { label: "Total Leads", value: metrics.total, icon: Inbox, sub: "All captured intakes" },
            {
              label: "Authentic Leads",
              value: metrics.verified,
              icon: BadgeCheck,
              sub: "Certified by agent call",
              tone: "text-green-deep",
            },
            {
              label: "Pending Call",
              value: metrics.pending,
              icon: Clock,
              sub: "Awaiting agent interview",
              tone: "text-blue",
            },
            {
              label: "High Priority",
              value: metrics.high,
              icon: Flame,
              sub: "Acute injury / Commercial",
              tone: "text-clay",
            },
            {
              label: "Retained",
              value: metrics.retained,
              icon: Award,
              sub: "Representation signed",
              tone: "text-blue",
              wide: true,
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)] sm:p-5 ${
                m.wide ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <div
                className={`mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                  m.tone ?? "text-charcoal-soft"
                }`}
              >
                <span>{m.label}</span>
                <m.icon className="h-4 w-4 opacity-70" />
              </div>
              <div className={`text-2xl font-bold sm:text-3xl ${m.tone ?? "text-ink"}`}>
                {m.value}
              </div>
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
              placeholder="Search by claimant name, phone, or keyword..."
              className="!pl-9 !text-[13px]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown
              value={statusFilter}
              onChange={setStatusFilter}
              wrapperClassName=""
              triggerClassName="w-auto !text-[13px] font-medium"
              options={STATUS_FILTER_OPTIONS}
            />
            <Dropdown
              value={priorityFilter}
              onChange={setPriorityFilter}
              wrapperClassName=""
              triggerClassName="w-auto !text-[13px] font-medium"
              options={PRIORITY_FILTER_OPTIONS}
            />
            <button
              onClick={exportCSV}
              className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-line px-3 text-xs font-medium text-charcoal transition hover:bg-paper-2"
            >
              <Download className="h-3.5 w-3.5 text-charcoal-soft" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-line bg-card shadow-[var(--shadow)]">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <FolderOpen className="h-4 w-4 text-blue" /> Claimant Dossiers & Agent Verification
              Log
            </h2>
            <span className="text-xs font-medium text-charcoal-soft">
              Showing {filtered.length} case{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Mobile/tablet: stacked cards, no horizontal scroll */}
          <div className="divide-y divide-line-soft lg:hidden">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-charcoal-soft">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-charcoal-soft">
                No case records match your current filters.
              </div>
            ) : (
              filtered.map((l) => {
                const badge = STATUS_BADGE[l.status] ?? {
                  label: l.status,
                  cls: "bg-paper-2 text-charcoal-soft border-line",
                };
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => openModal(l)}
                    className="block w-full px-4 py-4 text-left transition hover:bg-paper-2/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="mono block text-sm font-bold text-ink">
                          {l.case_number ?? l.id.slice(0, 8)}
                        </span>
                        <span className="text-[11px] text-charcoal-soft">
                          {formatDate(l.created_at)}
                        </span>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-3 font-bold text-ink">
                      {l.first_name} {l.last_name}
                    </div>
                    <div className="mono text-[12px] text-charcoal-soft">{l.phone}</div>

                    <div className="mt-2 text-[13px] text-charcoal">
                      {l.case_type}{" "}
                      <span className="text-charcoal-soft">
                        · Accident {formatDate(l.accident_date)}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-line-soft pt-3">
                      {l.agent_review ? (
                        <div className="flex items-start gap-1.5 text-xs text-charcoal">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-deep" />
                          <span>
                            <span className="font-bold text-green-deep">
                              {l.agent_review.call_status}:
                            </span>{" "}
                            &quot;{l.agent_review.agent_message}&quot;
                            <span className="mt-0.5 block text-[10px] text-charcoal-soft">
                              {l.agent_review.agent_name} ·{" "}
                              {l.agent_review.call_duration ?? "N/A"}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-blue italic">
                          <PhoneCall className="h-3 w-3" /> Awaiting Agent Call
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-line-soft pt-3">
                      <div>
                        {l.firm_action ? (
                          <>
                            <span
                              className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${
                                l.firm_action.status === "Retained"
                                  ? "bg-blue-light text-blue"
                                  : "bg-paper-2 text-charcoal-soft"
                              }`}
                            >
                              {FIRM_STATUS_LABEL[l.firm_action.status] ?? l.firm_action.status}
                            </span>
                            <div className="mt-0.5 text-[10px] text-charcoal-soft">
                              {l.firm_action.assigned_attorney_name ?? "Unassigned"}
                            </div>
                          </>
                        ) : (
                          <span className="text-[11px] text-charcoal-soft">New / Unassigned</span>
                        )}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-[9px] bg-blue-light px-2.5 py-1.5 text-xs font-semibold text-blue">
                        <Eye className="h-3.5 w-3.5" /> Inspect
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Desktop: full table. table-fixed + explicit column widths keep all
              seven columns inside the card at lg/xl widths instead of letting
              wide content (the post-call quote) push Action off-screen. */}
          <div className="hidden lg:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-soft bg-paper-2 text-[11px] font-bold tracking-wider text-charcoal-soft uppercase">
                  <th className="w-[15%] px-3 py-3">Lead ID / Date</th>
                  <th className="w-[12%] px-3 py-3">Claimant Details</th>
                  <th className="w-[10%] px-3 py-3">Case & Accident</th>
                  <th className="w-[16%] px-3 py-3">Agent Verification</th>
                  <th className="w-[18%] px-3 py-3">Post-Call Message</th>
                  <th className="w-[18%] px-3 py-3">Firm Status</th>
                  <th className="w-[11%] px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-charcoal-soft">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-charcoal-soft">
                      No case records match your current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => {
                    const badge = STATUS_BADGE[l.status] ?? {
                      label: l.status,
                      cls: "bg-paper-2 text-charcoal-soft border-line",
                    };
                    return (
                      <tr
                        key={l.id}
                        onClick={() => openModal(l)}
                        className="cursor-pointer transition hover:bg-paper-2/80"
                      >
                        <td className="px-3 py-3">
                          <span
                            className="mono block truncate font-bold text-ink"
                            title={l.case_number ?? l.id.slice(0, 8)}
                          >
                            {l.case_number ?? l.id.slice(0, 8)}
                          </span>
                          <span className="text-[11px] whitespace-nowrap text-charcoal-soft">
                            {formatDate(l.created_at)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="truncate font-bold text-ink">
                            {l.first_name} {l.last_name}
                          </div>
                          <div className="mono truncate text-[11px] text-charcoal-soft">
                            {l.phone}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="truncate font-medium text-charcoal">{l.case_type}</div>
                          <div className="text-[11px] whitespace-nowrap text-charcoal-soft">
                            Accident: {formatDate(l.accident_date)}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.cls}`}
                            title={badge.label}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {l.agent_review ? (
                            <>
                              <div
                                className="flex items-center gap-1 truncate text-xs font-medium text-charcoal"
                                title={l.agent_review.agent_message ?? ""}
                              >
                                <Check className="h-3 w-3 shrink-0 text-green-deep" />
                                <span className="truncate">
                                  <span className="font-bold text-green-deep">
                                    {l.agent_review.call_status}:
                                  </span>{" "}
                                  &quot;{l.agent_review.agent_message}&quot;
                                </span>
                              </div>
                              <div className="mt-0.5 truncate text-[10px] text-charcoal-soft">
                                {l.agent_review.agent_name} · {l.agent_review.call_duration ?? "N/A"}
                              </div>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-blue italic">
                              <PhoneCall className="h-3 w-3" /> Awaiting Agent Call
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {l.firm_action ? (
                            <>
                              <span
                                className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${
                                  l.firm_action.status === "Retained"
                                    ? "bg-blue-light text-blue"
                                    : "bg-paper-2 text-charcoal-soft"
                                }`}
                              >
                                {FIRM_STATUS_LABEL[l.firm_action.status] ?? l.firm_action.status}
                              </span>
                              <div className="mt-0.5 truncate text-[10px] text-charcoal-soft">
                                {l.firm_action.assigned_attorney_name ?? "Unassigned"}
                              </div>
                            </>
                          ) : (
                            <span className="text-[11px] text-charcoal-soft">New / Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(l);
                            }}
                            className="inline-flex items-center gap-1 rounded-[9px] bg-blue-light px-2.5 py-1.5 text-xs font-semibold text-blue whitespace-nowrap transition hover:bg-blue hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/60 p-3 backdrop-blur-xs sm:p-6">
          <div
            id="case-modal-content"
            className="my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between border-b border-line-soft bg-paper-2/60 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="mono rounded-lg bg-blue px-2.5 py-1 text-xs font-bold text-white">
                  {modalLead.case_number ?? modalLead.id.slice(0, 8)}
                </span>
                <div>
                  <h3 className="text-lg leading-tight">
                    {modalLead.first_name} {modalLead.last_name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-charcoal-soft">
                    <span>Captured: {formatDateTime(modalLead.created_at)}</span>
                    <span>•</span>
                    <span className="font-medium text-charcoal">{modalLead.case_type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2" id="dashboard-no-print">
                <button
                  onClick={() => window.print()}
                  title="Print / Save PDF"
                  className="rounded-lg p-2 text-charcoal-soft transition hover:bg-paper-2 hover:text-ink"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setModalLead(null)}
                  className="rounded-lg p-2 text-charcoal-soft transition hover:bg-paper-2 hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto p-5 text-xs sm:p-7 sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-line-soft bg-paper-2 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-charcoal-soft">
                    Authenticity Status:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      (STATUS_BADGE[modalLead.status] ?? { cls: "bg-paper-2 text-charcoal-soft border-line" }).cls
                    }`}
                  >
                    {(STATUS_BADGE[modalLead.status] ?? { label: modalLead.status }).label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-charcoal-soft">
                    Viability Assessment:
                  </span>
                  <span className="text-xs font-semibold text-charcoal">
                    {modalLead.agent_review?.estimated_viability ?? "Unrated"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <User className="h-3.5 w-3.5 text-blue" /> Claimant Information
                </h4>
                <div className="grid grid-cols-2 gap-3 rounded-[9px] border border-line-soft bg-paper-2/50 p-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-charcoal-soft">Phone</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono font-semibold text-blue">{modalLead.phone}</span>
                      <button
                        type="button"
                        onClick={() => dialClaimant(modalLead.phone)}
                        className="inline-flex items-center gap-1 rounded-[7px] bg-green-deep px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white transition hover:bg-green-deep/90"
                      >
                        <PhoneCall className="h-3 w-3" /> Dial
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <span className="block text-xs text-charcoal-soft">Email</span>
                    <span className="font-medium break-all text-charcoal">
                      {modalLead.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-charcoal-soft">Occupation</span>
                    <span className="font-medium text-charcoal">
                      {modalLead.occupation || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-charcoal-soft">Prior Attorney?</span>
                    <span className="font-semibold text-charcoal">
                      {modalLead.has_attorney || "No"}
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-line-soft pt-2 sm:col-span-6">
                    <span className="block text-xs text-charcoal-soft">Residential Address</span>
                    <span className="text-charcoal">
                      {[
                        modalLead.address,
                        modalLead.mailing_city,
                        modalLead.mailing_state,
                        modalLead.mailing_zip,
                      ]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <Car className="h-3.5 w-3.5 text-blue" /> Incident & Injuries Narrative
                </h4>
                <div className="space-y-3 rounded-[9px] border border-line-soft bg-paper-2/50 p-4">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="font-medium text-charcoal-soft">Accident Date:</span>{" "}
                      <strong className="text-ink">{formatDate(modalLead.accident_date)}</strong>
                    </div>
                    <div>
                      <span className="font-medium text-charcoal-soft">Time:</span>{" "}
                      <strong className="text-ink">{modalLead.accident_time || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="font-medium text-charcoal-soft">Police Responded:</span>{" "}
                      <strong className="text-ink">{modalLead.police_arrived || "N/A"}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-charcoal-soft">
                      Accident Description:
                    </span>
                    <p className="rounded-[9px] border border-line-soft bg-card p-3 text-xs leading-relaxed text-charcoal">
                      {modalLead.accident_description || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-charcoal-soft">
                      Injured Persons & Diagnoses:
                    </span>
                    <div className="space-y-2">
                      {modalLead.injured_people.length === 0 ? (
                        <div className="text-xs text-charcoal-soft italic">
                          No specific injuries registered.
                        </div>
                      ) : (
                        modalLead.injured_people.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-[9px] border border-clay/20 bg-clay/5 p-2.5 text-xs"
                          >
                            <span className="font-bold text-clay">{p.name}:</span>{" "}
                            <span className="text-charcoal">{p.injury_description}</span>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-charcoal-soft">
                              <span>Seen a doctor: {p.seen_doctor || "N/A"}</span>
                              <span>Willing to see a doctor: {p.willing_to_see || "N/A"}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-charcoal-soft">
                      Additional Insurance & Witness Notes:
                    </span>
                    <p className="text-xs text-charcoal italic">
                      {modalLead.additional_notes || "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <Paperclip className="h-3.5 w-3.5 text-blue" /> Attachments
                </h4>
                <div className="rounded-[9px] border border-line-soft bg-paper-2/50 p-4">
                  <AttachmentsPanel
                    leadId={modalLead.id}
                    files={modalFiles}
                    onFilesChanged={() => refreshModalFiles(modalLead.id)}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <PhoneCall className="h-3.5 w-3.5 text-green-deep" /> Agent Phone Screening &
                  Authenticity Audit
                </h4>
                {modalLead.agent_review ? (
                  <div className="space-y-3 rounded-[9px] border border-green/25 bg-green-light/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-deep text-xs font-bold text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm font-bold text-ink">
                          Certified by {modalLead.agent_review.agent_name}
                        </span>
                      </div>
                      <div className="text-xs text-green-deep">
                        {modalLead.agent_review.call_status} (
                        {modalLead.agent_review.call_duration}) · Reviewed{" "}
                        {formatDate(modalLead.agent_review.reviewed_at)}
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="mb-1 block font-bold text-charcoal">
                        Agent Post-Call Notes:
                      </span>
                      <div className="rounded-[9px] border border-green/20 bg-card p-3 leading-relaxed text-charcoal">
                        &quot;{modalLead.agent_review.agent_message}&quot;
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-charcoal-soft sm:grid-cols-5">
                      {(
                        [
                          ["idVerified", "ID Match"],
                          ["solValid", "SOL Valid"],
                          ["noPriorAttorney", "No Prior Rep"],
                          ["treatmentDocumented", "Medical Care"],
                          ["liabilityClear", "Clear Liability"],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1">
                          {modalLead.agent_review!.checklist[key] ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-green-deep" />
                          ) : (
                            <X className="h-3.5 w-3.5 shrink-0 text-clay" />
                          )}
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-[9px] border border-blue/25 bg-blue-light/40 p-4 text-xs text-blue">
                    <div className="flex items-center gap-2">
                      <span>
                        <strong>Pending Intake Verification:</strong> No agent has completed
                        telephone screening yet.
                      </span>
                    </div>
                    <Link
                      href="/agent"
                      className="shrink-0 rounded-[9px] bg-blue px-3 py-1.5 font-semibold text-white transition hover:bg-ink"
                    >
                      Start Agent Review
                    </Link>
                  </div>
                )}
              </div>

              <div id="dashboard-no-print" className="pt-2">
                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-charcoal-soft uppercase">
                  <Gavel className="h-3.5 w-3.5 text-blue" /> Law Firm Retainer & Case Assignment
                </h4>
                <form
                  onSubmit={handleSaveFirmAction}
                  className="space-y-3 rounded-[9px] border border-blue/20 bg-blue-light/30 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-charcoal">
                        Law Firm Status
                      </label>
                      <Dropdown
                        value={firmStatus}
                        onChange={setFirmStatus}
                        wrapperClassName=""
                        triggerClassName="w-full !text-[13px] font-medium"
                        options={FIRM_STATUS_OPTIONS.map((opt) => ({
                          value: opt,
                          label: FIRM_STATUS_LABEL[opt] ?? opt,
                        }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-charcoal">
                        Assign Lead Attorney
                      </label>
                      <Dropdown
                        value={assignedAttorneyId}
                        onChange={setAssignedAttorneyId}
                        wrapperClassName=""
                        triggerClassName="w-full !text-[13px] font-medium"
                        options={[
                          { value: "", label: "Unassigned" },
                          ...attorneys.map((a) => ({ value: a.id, label: a.full_name })),
                        ]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-charcoal">
                      Internal Law Firm Notes / Retainer Directives
                    </label>
                    <input
                      type="text"
                      value={firmNotes}
                      onChange={(e) => setFirmNotes(e.target.value)}
                      autoComplete="off"
                      placeholder="e.g. Sent digital DocuSign retainer, requested CHP traffic collision report..."
                      className="!text-[13px]"
                    />
                  </div>
                  {saveError && (
                    <p className="rounded-[9px] border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay">
                      {saveError}
                    </p>
                  )}
                  {showSavedBanner && !saveError && (
                    <p className="rounded-[9px] border border-green/30 bg-green-light px-3 py-2 text-xs text-green-deep">
                      Saved. Firm status updated.
                    </p>
                  )}
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={saving || savedNotice}
                      className={`inline-flex items-center gap-1.5 rounded-[9px] px-4 py-2 text-xs font-semibold shadow-[var(--shadow)] transition disabled:cursor-not-allowed ${
                        savedNotice && !saving
                          ? "border border-green/30 bg-green-light text-green-deep disabled:opacity-100"
                          : "bg-blue text-white hover:bg-ink disabled:opacity-60"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {saving ? "Saving..." : savedNotice ? "Saved" : "Update Firm Status"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
