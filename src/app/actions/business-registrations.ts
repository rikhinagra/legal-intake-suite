"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BusinessStatus = "new" | "contacted" | "not_a_fit" | "ready_for_attorney";

// The statuses an agent can set. "new" is only ever the starting state.
export type AgentBusinessStatus = Exclude<BusinessStatus, "new">;

const AGENT_STATUSES: AgentBusinessStatus[] = ["contacted", "not_a_fit", "ready_for_attorney"];
const MAX_CALL_OUTCOME = 100;
const MAX_NOTES = 5000;

export interface BusinessRegistrationListItem {
  id: string;
  registration_number: string | null;
  company_name: string;
  contact_name: string;
  status: BusinessStatus;
}

export async function getBusinessRegistrationsForSelector(): Promise<
  BusinessRegistrationListItem[]
> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("business_registrations")
    .select("id, registration_number, company_name, contact_name, status")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BusinessRegistrationListItem[];
}

export async function getNewBusinessRegistrationCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("business_registrations")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export interface BusinessRegistrationDetail {
  id: string;
  registration_number: string | null;
  status: BusinessStatus;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  fleet_size: string;
  need: string;
  company_type: string | null;
  contact_role: string | null;
  dot_mc_number: string | null;
  driver_count: number | null;
  states_of_operation: string | null;
  insurance_carrier: string | null;
  has_counsel: string | null;
  preferred_contact: string | null;
  message: string | null;
  consent: boolean;
  language: string | null;
  call_outcome: string | null;
  agent_notes: string | null;
  agent_name: string | null;
  agent_updated_at: string | null;
  created_at: string;
}

export async function getBusinessRegistrationDetail(
  registrationId: string
): Promise<BusinessRegistrationDetail | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("business_registrations")
    .select("*, profiles(full_name)")
    .eq("id", registrationId)
    .single();
  if (error || !data) return null;

  const { profiles, agent_id: _agentId, ...registration } = data as typeof data & {
    profiles: { full_name: string } | null;
  };
  void _agentId;

  return {
    ...(registration as Omit<BusinessRegistrationDetail, "agent_name">),
    agent_name: profiles?.full_name ?? null,
  };
}

export interface SaveBusinessAgentReviewInput {
  registrationId: string;
  status: AgentBusinessStatus;
  callOutcome: string;
  notes: string;
}

export type SaveBusinessAgentReviewResult = { ok: true } | { ok: false; error: string };

export async function saveBusinessAgentReview(
  input: SaveBusinessAgentReviewInput
): Promise<SaveBusinessAgentReviewResult> {
  const callOutcome = input.callOutcome.trim();
  const notes = input.notes.trim();

  // The form checks this too, but a server action can be called directly.
  if (!AGENT_STATUSES.includes(input.status)) {
    return { ok: false, error: "Choose a valid status." };
  }
  if (!callOutcome || callOutcome.length > MAX_CALL_OUTCOME) {
    return { ok: false, error: "Choose the call outcome." };
  }
  if (!notes || notes.length > MAX_NOTES) {
    return { ok: false, error: "Add your call notes (up to 5000 characters)." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // `.select()` so a save that matched no row (for example if the signed-in
  // user's role doesn't allow it) is reported instead of silently doing nothing.
  const { data, error } = await supabase
    .from("business_registrations")
    .update({
      status: input.status,
      call_outcome: callOutcome,
      agent_notes: notes,
      agent_id: user.id,
      agent_updated_at: new Date().toISOString(),
    })
    .eq("id", input.registrationId)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "Could not save. The registration was not found." };
  }

  return { ok: true };
}
