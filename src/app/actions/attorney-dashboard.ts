"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notifyClaimantOfFirmStatus } from "@/app/actions/notifications";
import type { FirmStatus } from "@/emails/FirmStatusUpdateEmail";

export interface DashboardInjuredPerson {
  id: string;
  name: string | null;
  relationship: string | null;
  injury_description: string | null;
  seen_doctor: string | null;
  willing_to_see: string | null;
}

export interface DashboardAgentReview {
  agent_name: string | null;
  call_status: string | null;
  call_duration: string | null;
  is_authentic: boolean;
  checklist: {
    idVerified?: boolean;
    solValid?: boolean;
    noPriorAttorney?: boolean;
    treatmentDocumented?: boolean;
    liabilityClear?: boolean;
  };
  agent_message: string | null;
  estimated_viability: string | null;
  reviewed_at: string;
}

export interface DashboardFirmAction {
  status: string;
  assigned_attorney_id: string | null;
  assigned_attorney_name: string | null;
  notes: string | null;
  updated_at: string;
}

export interface DashboardLead {
  id: string;
  case_number: string | null;
  status: string;
  priority: string;
  case_type: string;
  occupation: string | null;
  has_attorney: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  best_time_to_call: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  address: string | null;
  accident_date: string | null;
  accident_time: string | null;
  accident_description: string | null;
  additional_notes: string | null;
  police_arrived: string | null;
  created_at: string;
  injured_people: DashboardInjuredPerson[];
  agent_review: DashboardAgentReview | null;
  firm_action: DashboardFirmAction | null;
}

type RawRow = Record<string, unknown>;

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getDashboardLeads(): Promise<DashboardLead[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      `*,
      injured_people(id, name, relationship, injury_description, seen_doctor, willing_to_see),
      agent_reviews(agent_id, call_status, call_duration, is_authentic, checklist, agent_message, estimated_viability, reviewed_at, profiles(full_name)),
      law_firm_actions(status, assigned_attorney_id, notes, updated_at, profiles(full_name))`
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: RawRow) => {
    const review = firstOrNull(row.agent_reviews as RawRow | RawRow[] | null);
    const firmAction = firstOrNull(row.law_firm_actions as RawRow | RawRow[] | null);

    const agentReview: DashboardAgentReview | null = review
      ? {
          agent_name:
            (firstOrNull(review.profiles as RawRow | RawRow[] | null)?.full_name as string) ??
            null,
          call_status: review.call_status as string | null,
          call_duration: review.call_duration as string | null,
          is_authentic: !!review.is_authentic,
          checklist: (review.checklist as DashboardAgentReview["checklist"]) ?? {},
          agent_message: review.agent_message as string | null,
          estimated_viability: review.estimated_viability as string | null,
          reviewed_at: review.reviewed_at as string,
        }
      : null;

    const firm: DashboardFirmAction | null = firmAction
      ? {
          status: firmAction.status as string,
          assigned_attorney_id: firmAction.assigned_attorney_id as string | null,
          assigned_attorney_name:
            (firstOrNull(firmAction.profiles as RawRow | RawRow[] | null)?.full_name as string) ??
            null,
          notes: firmAction.notes as string | null,
          updated_at: firmAction.updated_at as string,
        }
      : null;

    return {
      ...(row as unknown as DashboardLead),
      injured_people: (row.injured_people as DashboardInjuredPerson[]) ?? [],
      agent_review: agentReview,
      firm_action: firm,
    };
  });
}

export interface AttorneyOption {
  id: string;
  full_name: string;
}

export async function getAttorneyOptions(): Promise<AttorneyOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["attorney", "admin"])
    .order("full_name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface SaveFirmActionInput {
  leadId: string;
  status: string;
  assignedAttorneyId: string | null;
  notes: string;
  caseNumber: string | null;
  claimantEmail: string | null;
  claimantFirstName: string;
  assignedAttorneyName: string | null;
}

export type SaveFirmActionResult = { ok: true } | { ok: false; error: string };

export async function saveFirmAction(
  input: SaveFirmActionInput
): Promise<SaveFirmActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("law_firm_actions").upsert(
    {
      lead_id: input.leadId,
      status: input.status,
      assigned_attorney_id: input.assignedAttorneyId,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "lead_id" }
  );

  if (error) return { ok: false, error: error.message };

  await notifyClaimantOfFirmStatus({
    claimantEmail: input.claimantEmail,
    claimantFirstName: input.claimantFirstName,
    caseNumber: input.caseNumber ?? input.leadId,
    status: input.status as FirmStatus,
    attorneyName: input.assignedAttorneyName,
  });

  return { ok: true };
}
