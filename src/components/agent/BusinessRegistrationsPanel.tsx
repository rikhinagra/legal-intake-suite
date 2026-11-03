"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, ClipboardCheck, Truck, PhoneCall, BadgeCheck, Check, ChevronDown } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import {
  getBusinessRegistrationsForSelector,
  getBusinessRegistrationDetail,
  saveBusinessAgentReview,
  type AgentBusinessStatus,
  type BusinessRegistrationDetail,
  type BusinessRegistrationListItem,
} from "@/app/actions/business-registrations";
import { BUSINESS_STATUS_BADGE, BUSINESS_STATUS_LABEL } from "@/lib/business-status";

const CALL_OUTCOME_OPTIONS = [
  { value: "", label: "Select call outcome" },
  ...[
    "Spoke with Contact",
    "Voicemail Left",
    "No Answer / Busy",
    "Call Scheduled",
    "Wrong Number",
    "Refused to Speak",
  ].map((label) => ({ value: label, label })),
];

const STATUS_CHOICES: { value: AgentBusinessStatus; label: string; className: string }[] = [
  { value: "contacted", label: "Contacted, follow up needed", className: "border-blue/25 bg-blue-light" },
  { value: "ready_for_attorney", label: "Ready for attorney review", className: "border-green/30 bg-green-light" },
  { value: "not_a_fit", label: "Not a fit", className: "border-clay/25 bg-clay/5" },
];

const SNIPPETS = [
  {
    label: "+ Voicemail Left",
    text: "Attempted phone call, reached voicemail. Left reference number and scheduled a second contact attempt.",
  },
  {
    label: "+ Interested",
    text: "Spoke with the contact directly. They operate a fleet and want to be registered for future accident cases.",
  },
  {
    label: "+ Not a Fit",
    text: "Business does not operate vehicles or drivers, so registration does not apply.",
  },
];

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

function formatDate(value: string | null) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function reviewSnapshot(v: { callOutcome: string; status: AgentBusinessStatus; notes: string }) {
  return JSON.stringify(v);
}

function Detail({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  const text = value === null || value === undefined || value === "" ? "N/A" : String(value);
  return (
    <div>
      <div className="text-xs font-medium text-charcoal-soft">{label}</div>
      <div className={`mt-0.5 break-words text-charcoal ${mono ? "mono" : ""}`}>{text}</div>
    </div>
  );
}

function RegistrationSelector({
  items,
  selectedId,
  onChange,
}: {
  items: BusinessRegistrationListItem[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = items.find((i) => i.id === selectedId);
  const describe = (i: BusinessRegistrationListItem) =>
    `${i.registration_number ?? i.id.slice(0, 8)} • ${i.company_name} (${BUSINESS_STATUS_LABEL[i.status] ?? i.status})`;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const label =
    items.length === 0 ? "No registrations yet" : selected ? describe(selected) : "Select a registration";

  return (
    <div ref={wrapperRef} className="relative min-w-0 flex-1 sm:flex-none">
      <button
        type="button"
        onClick={() => items.length > 0 && setOpen((o) => !o)}
        disabled={items.length === 0}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-[9px] border border-line bg-[#fcfdff] px-2.5 text-[13px] font-medium text-charcoal outline-none transition focus:border-blue disabled:opacity-60 sm:w-auto sm:min-w-[280px]"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-charcoal-soft" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-[9px] border border-line bg-card shadow-[var(--shadow-lg)] sm:w-max sm:min-w-[280px] sm:max-w-[420px]">
          {items.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => {
                onChange(i.id);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-[13px] transition hover:bg-paper-2 ${
                i.id === selectedId ? "font-semibold text-blue" : "text-charcoal"
              }`}
            >
              {describe(i)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BusinessRegistrationsPanel({ onChanged }: { onChanged?: () => void }) {
  const [items, setItems] = useState<BusinessRegistrationListItem[]>([]);
  const [listLoaded, setListLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<BusinessRegistrationDetail | null>(null);

  const [callOutcome, setCallOutcome] = useState("");
  const [status, setStatus] = useState<AgentBusinessStatus>("contacted");
  const [notes, setNotes] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  useEffect(() => {
    getBusinessRegistrationsForSelector().then((data) => {
      setItems(data);
      setListLoaded(true);
      if (data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  function applyDetail(d: BusinessRegistrationDetail | null) {
    setDetail(d);
    const loaded = {
      callOutcome: d?.call_outcome ?? "",
      // A registration nobody has worked yet starts on "Contacted", the most
      // common next step, so the agent only changes it when something else is true.
      status: (d && d.status !== "new" ? d.status : "contacted") as AgentBusinessStatus,
      notes: d?.agent_notes ?? "",
    };
    setCallOutcome(loaded.callOutcome);
    setStatus(loaded.status);
    setNotes(loaded.notes);
    // The form was just filled from what is already saved, so this is the
    // baseline the "Saved" button compares against.
    setSavedSnapshot(reviewSnapshot(loaded));
  }

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    getBusinessRegistrationDetail(selectedId).then((d) => {
      if (cancelled) return;
      setSaveError(null);
      setShowSavedBanner(false);
      applyDetail(d);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!showSavedBanner) return;
    const timeout = setTimeout(() => setShowSavedBanner(false), 12000);
    return () => clearTimeout(timeout);
  }, [showSavedBanner]);

  const loading = selectedId !== "" && detail?.id !== selectedId;
  const isSaved =
    !!detail?.agent_updated_at && savedSnapshot === reviewSnapshot({ callOutcome, status, notes });

  function startCall() {
    if (!detail?.phone) return;
    // A tel: link hands off to whatever the device uses for calling. See the
    // same comment in AgentPortal for why it is done through an anchor click.
    const link = document.createElement("a");
    link.href = `tel:${detail.phone}`;
    link.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detail || saving) return;
    if (!callOutcome) {
      setSaveError("Choose the call outcome before saving.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    const result = await saveBusinessAgentReview({
      registrationId: detail.id,
      status,
      callOutcome,
      notes,
    });
    if (!result.ok) {
      setSaving(false);
      setSaveError(result.error);
      return;
    }
    const [refreshed, refreshedList] = await Promise.all([
      getBusinessRegistrationDetail(detail.id),
      getBusinessRegistrationsForSelector(),
    ]);
    applyDetail(refreshed);
    setItems(refreshedList);
    setSaving(false);
    setShowSavedBanner(true);
    onChanged?.();
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-line-soft pb-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-green/25 bg-green-light px-2.5 py-1 text-xs font-semibold text-green-deep">
            <Truck className="h-3.5 w-3.5" /> Business & Transport Registrations
          </div>
          <h1 className="text-2xl sm:text-3xl">Business Registration Call Portal</h1>
          <p className="mt-1 text-[14.5px] text-charcoal-soft">
            Call each business that registered, note what you learn, and pass the good fits to the
            attorney.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-[14px] border border-line bg-card p-2.5 shadow-[var(--shadow)]">
          <label className="shrink-0 text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
            Select:
          </label>
          <RegistrationSelector items={items} selectedId={selectedId} onChange={setSelectedId} />
        </div>
      </div>

      {!detail || loading ? (
        <p className="text-[14.5px] text-charcoal-soft">
          {listLoaded && items.length === 0 ? "No business registrations yet." : "Loading..."}
        </p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)]">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  BUSINESS_STATUS_BADGE[detail.status] ?? "bg-paper-2 text-charcoal-soft border-line"
                }`}
              >
                {BUSINESS_STATUS_LABEL[detail.status] ?? detail.status}
              </span>
              <span className="text-xs text-charcoal-soft">
                Submitted: <strong className="text-charcoal">{formatDateTime(detail.created_at)}</strong>
              </span>
              <span className="hidden text-xs text-line sm:inline">|</span>
              <span className="text-xs text-charcoal-soft">
                Language: <strong className="text-charcoal">{detail.language || "N/A"}</strong>
              </span>
            </div>
            <div className="text-xs">
              {detail.agent_updated_at ? (
                <span className="rounded-[9px] border border-green/25 bg-green-light px-2.5 py-1 font-medium text-green-deep">
                  Updated by {detail.agent_name ?? "an agent"} on {formatDate(detail.agent_updated_at)}
                </span>
              ) : (
                <span className="rounded-[9px] border border-blue/25 bg-blue-light px-2.5 py-1 font-medium text-blue">
                  Awaiting Telephone Contact
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT: Business details */}
            <div className="space-y-5 lg:col-span-5">
              <div className="rounded-[14px] border border-line bg-card p-5 shadow-[var(--shadow)] sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-line-soft pb-3">
                  <h2 className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-blue" /> Business Profile
                  </h2>
                  <span className="mono rounded bg-paper-2 px-2 py-0.5 text-xs font-semibold text-charcoal">
                    {detail.registration_number ?? detail.id.slice(0, 8)}
                  </span>
                </div>

                <div className="space-y-3.5 text-[14.5px]">
                  <div>
                    <div className="text-xs font-medium text-charcoal-soft">Company</div>
                    <div className="text-base font-semibold text-ink">{detail.company_name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Detail label="Contact Person" value={detail.contact_name} />
                    <Detail label="Role" value={detail.contact_role} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-charcoal-soft">Phone Number</div>
                      <div className="mono mt-0.5 font-semibold text-blue">{detail.phone}</div>
                    </div>
                    <Detail label="Preferred Contact" value={detail.preferred_contact} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-charcoal-soft">Email Address</div>
                    <div className="break-all text-charcoal">{detail.email}</div>
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
                    Opens your device&apos;s dialer.
                  </span>
                </div>
              </div>

              <div className="space-y-4 rounded-[14px] border border-line bg-card p-5 shadow-[var(--shadow)] sm:p-6">
                <h2 className="flex items-center gap-2 border-b border-line-soft pb-3 text-base">
                  <Truck className="h-4 w-4 text-blue" /> Fleet & What They Need
                </h2>
                <div className="space-y-3 text-[14.5px]">
                  <div className="grid grid-cols-2 gap-3">
                    <Detail label="Fleet Size" value={detail.fleet_size} />
                    <Detail label="Number of Drivers" value={detail.driver_count} />
                  </div>
                  <Detail label="What They Would Like" value={detail.need} />
                  <div className="grid grid-cols-2 gap-3">
                    <Detail label="Company Type" value={detail.company_type} />
                    <Detail label="DOT / MC Number" value={detail.dot_mc_number} mono />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Detail label="States of Operation" value={detail.states_of_operation} />
                    <Detail label="Insurance Carrier" value={detail.insurance_carrier} />
                  </div>
                  <Detail label="Already Has Legal Counsel?" value={detail.has_counsel} />
                  <div className="border-t border-line-soft pt-3">
                    <span className="text-xs font-medium text-charcoal-soft">Their Message</span>
                    <p className="mt-1 rounded-[9px] border border-line-soft bg-paper-2 p-3 text-xs leading-relaxed text-charcoal">
                      {detail.message || "No message provided."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-line-soft pt-3">
                    <span className="text-xs text-charcoal-soft">Agreed to be contacted</span>
                    <span className="rounded bg-paper-2 px-2 py-0.5 text-xs font-semibold text-charcoal">
                      {detail.consent ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Call form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-[14px] border border-line bg-card p-6 shadow-[var(--shadow)] sm:p-7"
              >
                <div className="border-b border-line-soft pb-4">
                  <h2 className="flex items-center gap-2 text-lg">
                    <ClipboardCheck className="h-5 w-5 text-blue" /> Registration Call & Review
                  </h2>
                  <p className="mt-0.5 text-xs text-charcoal-soft">
                    Record the call, choose the next step, and leave notes for the attorney.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-soft">
                    1. Call Outcome
                  </h3>
                  <Dropdown
                    value={callOutcome}
                    onChange={setCallOutcome}
                    wrapperClassName=""
                    triggerClassName="w-full !text-[13px]"
                    options={CALL_OUTCOME_OPTIONS}
                  />
                </div>

                <div className="space-y-3 border-t border-line-soft pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-soft">
                    2. Status
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {STATUS_CHOICES.map((choice) => (
                      <label
                        key={choice.value}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-[9px] border p-2.5 text-xs ${choice.className} ${
                          status === choice.value ? "ring-2 ring-blue/40" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="business-status"
                          checked={status === choice.value}
                          onChange={() => setStatus(choice.value)}
                        />
                        <span className="font-bold text-charcoal">{choice.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-line-soft pt-4">
                  <label
                    htmlFor="business-agent-notes"
                    className="block text-xs font-bold uppercase tracking-wider text-charcoal"
                  >
                    3. Call Notes & Attorney Hand-off
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SNIPPETS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setNotes((n) => (n.trim() ? `${n}\n\n${s.text}` : s.text))}
                        className="rounded bg-paper-2 px-2 py-1 text-[10px] text-charcoal-soft transition hover:bg-line-soft hover:text-charcoal"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="business-agent-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    rows={6}
                    maxLength={5000}
                    placeholder="Summarize the call with the business contact..."
                    className="!text-[13px] sm:!text-[14px]"
                  />
                </div>

                {saveError && (
                  <p className="rounded-[9px] border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay">
                    {saveError}
                  </p>
                )}
                {showSavedBanner && isSaved && !saveError && (
                  <p className="rounded-[9px] border border-green/30 bg-green-light px-3 py-2 text-xs text-green-deep">
                    Saved. Status: {BUSINESS_STATUS_LABEL[detail.status]}.
                  </p>
                )}

                <div className="flex justify-end border-t border-line-soft pt-4">
                  <button
                    type="submit"
                    disabled={saving || isSaved}
                    className={`inline-flex items-center justify-center gap-2 rounded-[9px] px-6 py-2.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed sm:text-sm ${
                      isSaved && !saving
                        ? "border border-green/30 bg-green-light text-green-deep disabled:opacity-100"
                        : "bg-green-deep text-white hover:bg-green-deep/90 disabled:opacity-60"
                    }`}
                  >
                    {isSaved && !saving ? <Check className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                    {saving ? "Saving..." : isSaved ? "Saved" : "Save Registration Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
