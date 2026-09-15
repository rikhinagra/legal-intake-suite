"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  User,
  AlertTriangle,
  ClipboardCheck,
  PhoneCall,
  BadgeCheck,
  Check,
  Paperclip,
  ChevronDown,
} from "lucide-react";
import StaffNav from "@/components/staff/StaffNav";
import AttachmentsPanel from "@/components/shared/AttachmentsPanel";
import Dropdown from "@/components/ui/Dropdown";
import type { StaffProfile } from "@/lib/supabase/auth-helpers";
import {
  getLeadsForSelector,
  getLeadDetail,
  saveAgentReview,
  type LeadListItem,
  type LeadDetail,
} from "@/app/actions/agent-portal";
import { getLeadFiles, type LeadFileRow } from "@/app/actions/lead-files";

const STATUS_LABEL: Record<string, string> = {
  verified: "Verified",
  pending: "Pending",
  followup: "Follow-up",
  rejected: "Rejected",
};

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

const STATUS_BADGE: Record<string, string> = {
  verified: "bg-green-light text-green-deep border-green/30",
  pending: "bg-blue-light text-blue border-blue/25",
  followup: "bg-blue-light text-blue border-blue/25",
  rejected: "bg-clay/10 text-clay border-clay/25",
};

const CALL_OUTCOME_OPTIONS = [
  "Connected & Verified",
  "Voicemail Left",
  "No Answer / Busy",
  "Call Scheduled",
  "Wrong Number",
  "Refused to Speak",
].map((label) => ({ value: label, label }));

const VIABILITY_OPTIONS = [
  "5/5 - High Viability (Clear Liability & Substantial Injury)",
  "4/5 - Strong Viability (Favorable liability, moderate medicals)",
  "3/5 - Moderate / Pending Records",
  "2/5 - Low Merit / Contested Liability",
  "1/5 - Non-viable / High Risk",
].map((label) => ({ value: label, label }));

const SNIPPETS = [
  {
    label: "+ Highly Credible",
    text: "Spoke with claimant directly. Very credible and clear timeline. Severe injuries confirmed with hospital treatment. Ready for immediate retainer.",
  },
  {
    label: "+ Voicemail Left",
    text: "Attempted phone call, reached voicemail. Left reference number and scheduled second contact attempt.",
  },
  {
    label: "+ Commercial Policy",
    text: "Defendant vehicle was commercial truck / commercial policy identified. Substantial property damage.",
  },
  {
    label: "+ Police Cited Fault",
    text: "Police report confirmed other party cited for running red light. No contributory negligence.",
  },
];

function LeadSelectorDropdown({
  leads,
  selectedId,
  onChange,
}: {
  leads: LeadListItem[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = leads.find((l) => l.id === selectedId);

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

  const label = leads.length === 0
    ? "No leads in system"
    : selected
      ? `${selected.case_number ?? selected.id.slice(0, 8)} • ${selected.first_name} ${selected.last_name} (${STATUS_LABEL[selected.status] ?? selected.status})`
      : "Select a lead";

  return (
    <div ref={wrapperRef} className="relative min-w-0 flex-1 sm:flex-none">
      <button
        type="button"
        onClick={() => leads.length > 0 && setOpen((o) => !o)}
        disabled={leads.length === 0}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-[9px] border border-line bg-[#fcfdff] px-2.5 text-[13px] font-medium text-charcoal outline-none transition focus:border-blue disabled:opacity-60 sm:w-auto sm:min-w-[280px]"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-charcoal-soft" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-[9px] border border-line bg-card shadow-[var(--shadow-lg)] sm:w-max sm:min-w-[280px] sm:max-w-[420px]">
          {leads.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                onChange(l.id);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-[13px] transition hover:bg-paper-2 ${
                l.id === selectedId ? "font-semibold text-blue" : "text-charcoal"
              }`}
            >
              {l.case_number ?? l.id.slice(0, 8)} • {l.first_name} {l.last_name} (
              {STATUS_LABEL[l.status] ?? l.status})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentPortal({ staff }: { staff: StaffProfile }) {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  const [callStatus, setCallStatus] = useState("Connected & Verified");
  const [callDuration, setCallDuration] = useState("");
  const [checklist, setChecklist] = useState({
    idVerified: true,
    solValid: true,
    noPriorAttorney: true,
    treatmentDocumented: true,
    liabilityClear: true,
  });
  const [verdict, setVerdict] = useState<"verified" | "followup" | "rejected">("verified");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("high");
  const [viability, setViability] = useState(
    "5/5 - High Viability (Clear Liability & Substantial Injury)"
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [files, setFiles] = useState<LeadFileRow[]>([]);

  function refreshFiles(leadId: string) {
    getLeadFiles(leadId).then(setFiles);
  }

  useEffect(() => {
    getLeadsForSelector().then((data) => {
      setLeads(data);
      if (data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingLead(true);
    setSavedNotice(false);
    setShowSavedBanner(false);
    refreshFiles(selectedId);
    getLeadDetail(selectedId).then((detail) => {
      setLead(detail);
      setLoadingLead(false);
      if (detail?.agent_review) {
        const r = detail.agent_review;
        setCallStatus(r.call_status ?? "Connected & Verified");
        setCallDuration(r.call_duration ?? "");
        setChecklist({
          idVerified: !!r.checklist.idVerified,
          solValid: !!r.checklist.solValid,
          noPriorAttorney: !!r.checklist.noPriorAttorney,
          treatmentDocumented: !!r.checklist.treatmentDocumented,
          liabilityClear: !!r.checklist.liabilityClear,
        });
        setMessage(r.agent_message ?? "");
        setViability(
          r.estimated_viability ?? "5/5 - High Viability (Clear Liability & Substantial Injury)"
        );
        setVerdict(
          (detail.status as "verified" | "followup" | "rejected") ?? "verified"
        );
      } else {
        setCallStatus("Connected & Verified");
        setCallDuration("");
        setChecklist({
          idVerified: true,
          solValid: true,
          noPriorAttorney: true,
          treatmentDocumented: true,
          liabilityClear: true,
        });
        setMessage("");
        setViability("5/5 - High Viability (Clear Liability & Substantial Injury)");
        setVerdict("verified");
      }
      setPriority((detail?.priority as "low" | "medium" | "high") ?? "medium");
    });
  }, [selectedId]);

  function startCall() {
    if (!lead?.phone) return;
    // A tel: link hands off to whatever the device has for calling — the
    // native Phone app on a phone, FaceTime/Skype/etc. on a Mac or PC if
    // one's registered. If nothing is registered, this is a no-op; it never
    // breaks the page. Triggered via a real anchor click (not
    // window.location) since that's the most reliable way to invoke a
    // custom URI scheme without the browser treating it as a real
    // navigation. Call duration is left entirely to the agent to type in —
    // no in-app timer, since there's no way to know from here when the
    // agent's real call (in a separate app) actually ends.
    const link = document.createElement("a");
    link.href = `tel:${lead.phone}`;
    link.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;
    setSaving(true);
    setSaveError(null);
    const result = await saveAgentReview({
      leadId: lead.id,
      caseNumber: lead.case_number,
      claimantName: `${lead.first_name} ${lead.last_name}`.trim(),
      callStatus,
      callDuration,
      checklist,
      verdictStatus: verdict,
      priority,
      viability,
      message,
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setSavedNotice(true);
    setShowSavedBanner(true);
    const refreshed = await getLeadDetail(lead.id);
    setLead(refreshed);
    const refreshedLeads = await getLeadsForSelector();
    setLeads(refreshedLeads);
  }

  // The confirmation banner is a transient toast — it fades on its own
  // after a while, separate from savedNotice (which drives the button and
  // stays "Saved" indefinitely, until the agent actually edits something).
  useEffect(() => {
    if (!showSavedBanner) return;
    const timeout = setTimeout(() => setShowSavedBanner(false), 12000);
    return () => clearTimeout(timeout);
  }, [showSavedBanner]);

  // Once saved, the button switches to a distinct "Saved" state. If the
  // agent then edits anything, this flips savedNotice back off so the
  // button reverts to normal — otherwise it would keep claiming "Saved"
  // even after new, unsaved edits.
  const formSnapshot = JSON.stringify({
    callStatus,
    callDuration,
    checklist,
    verdict,
    priority,
    viability,
    message,
  });
  const lastSavedSnapshot = useRef(formSnapshot);
  useEffect(() => {
    if (lastSavedSnapshot.current !== formSnapshot) {
      lastSavedSnapshot.current = formSnapshot;
      setSavedNotice(false);
      setShowSavedBanner(false);
    }
  }, [formSnapshot]);

  return (
    <div className="min-h-screen bg-paper">
      <StaffNav staff={staff} active="agent" />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-line-soft pb-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green/25 bg-green-light px-2.5 py-1 text-xs font-semibold text-green-deep">
              <ShieldAlert className="h-3.5 w-3.5" /> Agent Verification & Authenticity Screening
            </div>
            <h1 className="text-2xl sm:text-3xl">Claimant Call & Verification Portal</h1>
            <p className="mt-1 text-[14.5px] text-charcoal-soft">
              Conduct claimant phone interview, audit accident credibility, and mark case
              authenticity for attorney review.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-[14px] border border-line bg-card p-2.5 shadow-[var(--shadow)]">
            <label className="shrink-0 text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
              Select Lead:
            </label>
            <LeadSelectorDropdown leads={leads} selectedId={selectedId} onChange={setSelectedId} />
          </div>
        </div>

        {!lead || loadingLead ? (
          <p className="text-[14.5px] text-charcoal-soft">
            {leads.length === 0 ? "No leads submitted yet." : "Loading..."}
          </p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)]">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    STATUS_BADGE[lead.status] ?? "bg-paper-2 text-charcoal-soft border-line"
                  }`}
                >
                  {lead.status}
                </span>
                <span className="text-xs text-charcoal-soft">
                  Submitted: <strong className="text-charcoal">{formatDateTime(lead.created_at)}</strong>
                </span>
                <span className="hidden text-xs text-line sm:inline">|</span>
                <span className="text-xs text-charcoal-soft">
                  Type: <strong className="text-charcoal">{lead.case_type}</strong>
                </span>
              </div>
              <div className="text-xs">
                {lead.agent_review ? (
                  <span className="rounded-[9px] border border-green/25 bg-green-light px-2.5 py-1 font-medium text-green-deep">
                    Verified by {lead.agent_review.agent_name} on{" "}
                    {formatDate(lead.agent_review.reviewed_at)}
                  </span>
                ) : (
                  <span className="rounded-[9px] border border-blue/25 bg-blue-light px-2.5 py-1 font-medium text-blue">
                    Awaiting Telephone Verification
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* LEFT: Dossier */}
              <div className="space-y-5 lg:col-span-5">
                <div className="rounded-[14px] border border-line bg-card p-5 shadow-[var(--shadow)] sm:p-6">
                  <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
                    <h2 className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4 text-blue" /> Claimant Profile
                    </h2>
                    <span className="mono rounded bg-paper-2 px-2 py-0.5 text-xs font-semibold text-charcoal">
                      {lead.case_number ?? lead.id.slice(0, 8)}
                    </span>
                  </div>

                  <div className="space-y-3.5 text-[14.5px]">
                    <div>
                      <div className="text-xs font-medium text-charcoal-soft">Full Name</div>
                      <div className="text-base font-semibold text-ink">
                        {lead.first_name} {lead.last_name}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <div className="text-xs font-medium text-charcoal-soft">Phone Number</div>
                        <div className="mono mt-0.5 font-semibold text-blue">{lead.phone}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-charcoal-soft">Best Time to Call</div>
                        <div className="text-charcoal">{lead.best_time_to_call || "Anytime"}</div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs font-medium text-charcoal-soft">Email Address</div>
                      <div className="break-all text-charcoal">{lead.email || "N/A"}</div>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs font-medium text-charcoal-soft">Occupation</div>
                      <div className="text-charcoal">{lead.occupation || "N/A"}</div>
                    </div>
                    <div className="border-t border-line-soft pt-2">
                      <div className="text-xs font-medium text-charcoal-soft">Mailing Address</div>
                      <div className="mt-0.5 text-charcoal">
                        {[lead.address, lead.mailing_city, lead.mailing_state, lead.mailing_zip]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-line-soft pt-2">
                      <span className="text-xs text-charcoal-soft">Has existing attorney?</span>
                      <span className="rounded bg-paper-2 px-2 py-0.5 text-xs font-semibold text-charcoal">
                        {lead.has_attorney || "No"}
                      </span>
                    </div>
                  </div>

                  <div className="-mx-5 -mb-5 mt-5 flex flex-col gap-2 rounded-b-[14px] border-t border-line-soft bg-paper-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={startCall}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[9px] bg-green-deep px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-xs transition hover:bg-green-deep/90"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      Dial / Start Call
                    </button>
                    <span className="text-[11px] text-charcoal-soft">
                      Opens your device&apos;s dialer. Enter the call duration below yourself.
                    </span>
                  </div>
                </div>

                <div className="space-y-4 rounded-[14px] border border-line bg-card p-5 shadow-[var(--shadow)] sm:p-6">
                  <h2 className="flex items-center gap-2 border-b border-line-soft pb-3 text-base">
                    <AlertTriangle className="h-4 w-4 text-clay" /> Accident & Injuries Summary
                  </h2>
                  <div className="space-y-3 text-[14.5px]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-medium text-charcoal-soft">Accident Date</span>
                        <div className="mt-0.5 font-medium text-ink">
                          {formatDate(lead.accident_date)}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-charcoal-soft">Accident Time</span>
                        <div className="mt-0.5 font-medium text-ink">
                          {lead.accident_time || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-charcoal-soft">Claimant Accident Narrative</span>
                      <p className="mt-1 rounded-[9px] border border-line-soft bg-paper-2 p-3 text-xs leading-relaxed text-charcoal">
                        {lead.accident_description || "No description provided."}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-charcoal-soft">Documented Injured Persons</span>
                      <div className="mt-1.5 space-y-2">
                        {lead.injured_people.length === 0 ? (
                          <div className="text-xs italic text-charcoal-soft">
                            No specific injured persons listed.
                          </div>
                        ) : (
                          lead.injured_people.map((p) => (
                            <div
                              key={p.id}
                              className="rounded-[9px] border border-clay/20 bg-clay/5 p-2.5 text-xs"
                            >
                              <span className="font-bold text-clay">{p.name}:</span>{" "}
                              <span className="text-charcoal">{p.injury_description}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="border-t border-line-soft pt-2">
                      <span className="text-xs font-medium text-charcoal-soft">Additional Info</span>
                      <p className="mt-1 text-xs italic text-charcoal-soft">
                        {lead.additional_notes || "None"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-[14px] border border-line bg-card p-5 shadow-[var(--shadow)] sm:p-6">
                  <h2 className="flex items-center gap-2 border-b border-line-soft pb-3 text-base">
                    <Paperclip className="h-4 w-4 text-blue" /> Attachments
                  </h2>
                  <AttachmentsPanel
                    leadId={lead.id}
                    files={files}
                    onFilesChanged={() => refreshFiles(lead.id)}
                  />
                </div>
              </div>

              {/* RIGHT: Review form */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 rounded-[14px] border border-line bg-card p-6 shadow-[var(--shadow)] sm:p-7"
                >
                  <div className="border-b border-line-soft pb-4">
                    <h2 className="flex items-center gap-2 text-lg">
                      <ClipboardCheck className="h-5 w-5 text-blue" /> Agent Call Screening &
                      Authenticity Audit
                    </h2>
                    <p className="mt-0.5 text-xs text-charcoal-soft">
                      Complete telephone screening to verify identity, confirm injuries, and
                      certify case authenticity.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-soft">
                      1. Call Telephony & Contact Outcome
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-charcoal">
                          Call Outcome
                        </label>
                        <Dropdown
                          value={callStatus}
                          onChange={setCallStatus}
                          wrapperClassName=""
                          triggerClassName="w-full !text-[13px]"
                          options={CALL_OUTCOME_OPTIONS}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-charcoal">
                          Call Duration
                        </label>
                        <input
                          type="text"
                          value={callDuration}
                          onChange={(e) => setCallDuration(e.target.value)}
                          placeholder="e.g. 8 mins"
                          className="!text-[13px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-line-soft pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-soft">
                        2. Verification & Fraud Prevention Checklist
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setChecklist({
                            idVerified: true,
                            solValid: true,
                            noPriorAttorney: true,
                            treatmentDocumented: true,
                            liabilityClear: true,
                          })
                        }
                        className="text-[11px] font-medium text-blue hover:text-ink"
                      >
                        Select All Verified
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 rounded-[9px] border border-line-soft bg-paper-2 p-3.5 sm:grid-cols-2">
                      {(
                        [
                          ["idVerified", "Identity & Contact Match"],
                          ["solValid", "Within Statute of Limitations"],
                          ["noPriorAttorney", "No Existing Attorney Representation"],
                          ["treatmentDocumented", "Medical Treatment Documented"],
                          ["liabilityClear", "Clear Defendant Fault / Viable Liability"],
                        ] as const
                      ).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-start gap-2.5 p-1 text-xs text-charcoal"
                        >
                          <input
                            type="checkbox"
                            checked={checklist[key]}
                            onChange={(e) =>
                              setChecklist((c) => ({ ...c, [key]: e.target.checked }))
                            }
                            className="mt-0.5 h-4 w-4 rounded border-line text-blue focus:ring-blue"
                          />
                          <span className="font-semibold">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-line-soft pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-soft">
                      3. Lead Authenticity Verdict & Priority
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        {(
                          [
                            ["verified", "Mark as Genuine & Authentic", "border-green/30 bg-green-light"],
                            ["followup", "Needs Follow-Up / Records", "border-blue/25 bg-blue-light"],
                            ["rejected", "Flag as Fraud / Rejected", "border-clay/25 bg-clay/5"],
                          ] as const
                        ).map(([value, label, cls]) => (
                          <label
                            key={value}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-[9px] border p-2.5 text-xs ${cls}`}
                          >
                            <input
                              type="radio"
                              name="verdict"
                              checked={verdict === value}
                              onChange={() => setVerdict(value)}
                            />
                            <span className="font-bold text-charcoal">{label}</span>
                          </label>
                        ))}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-charcoal">
                          Case Viability & Value Rating
                        </label>
                        <Dropdown
                          value={viability}
                          onChange={setViability}
                          wrapperClassName=""
                          triggerClassName="w-full !text-[13px] font-medium"
                          options={VIABILITY_OPTIONS}
                        />
                        <div className="mt-4 rounded-[9px] border border-line-soft bg-paper-2 p-3">
                          <div className="mb-1 text-[11px] font-semibold text-charcoal-soft">
                            Priority Level:
                          </div>
                          <div className="flex gap-2">
                            {(["high", "medium", "low"] as const).map((p) => (
                              <label
                                key={p}
                                className={`flex-1 cursor-pointer rounded-[9px] border py-1.5 text-center text-xs font-semibold capitalize transition ${
                                  priority === p
                                    ? p === "high"
                                      ? "border-clay bg-clay text-white"
                                      : p === "medium"
                                        ? "border-blue bg-blue text-white"
                                        : "border-charcoal-soft bg-charcoal-soft text-white"
                                    : "border-line bg-card text-charcoal"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="priority"
                                  className="hidden"
                                  checked={priority === p}
                                  onChange={() => setPriority(p)}
                                />
                                {p}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-line-soft pt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                      4. Agent Post-Call Message & Attorney Hand-off Notes
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SNIPPETS.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() =>
                            setMessage((m) => (m.trim() ? `${m}\n\n${s.text}` : s.text))
                          }
                          className="rounded bg-paper-2 px-2 py-1 text-[10px] text-charcoal-soft transition hover:bg-line-soft hover:text-charcoal"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="Enter full summary of the phone interview with the claimant..."
                      className="!text-[13px] sm:!text-[14px]"
                    />
                  </div>

                  {saveError && (
                    <p className="rounded-[9px] border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay">
                      {saveError}
                    </p>
                  )}
                  {showSavedBanner && !saveError && (
                    <p className="rounded-[9px] border border-green/30 bg-green-light px-3 py-2 text-xs text-green-deep">
                      Saved. Case marked as {verdict}.
                    </p>
                  )}

                  <div className="flex justify-end border-t border-line-soft pt-4">
                    <button
                      type="submit"
                      disabled={saving || savedNotice}
                      className={`inline-flex items-center justify-center gap-2 rounded-[9px] px-6 py-2.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed sm:text-sm ${
                        savedNotice && !saving
                          ? "border border-green/30 bg-green-light text-green-deep disabled:opacity-100"
                          : "bg-green-deep text-white hover:bg-green-deep/90 disabled:opacity-60"
                      }`}
                    >
                      {savedNotice && !saving ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <BadgeCheck className="h-4 w-4" />
                      )}
                      {saving ? "Saving..." : savedNotice ? "Saved" : "Save & Certify Agent Verification"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
