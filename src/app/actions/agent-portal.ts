"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notifyAttorneysOfVerifiedLead } from "@/app/actions/notifications";

export interface LeadListItem {
  id: string;
  case_number: string | null;
  first_name: string;
  last_name: string;
  status: string;
}

export async function getLeadsForSelector(): Promise<LeadListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, case_number, first_name, last_name, status")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface InjuredPersonRow {
  id: string;
  name: string | null;
  relationship: string | null;
  injury_description: string | null;
  seen_doctor: string | null;
  willing_to_see: string | null;
}

export interface AgentReviewRow {
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

export interface LeadDetail {
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
  created_at: string;
  injured_people: InjuredPersonRow[];
  agent_review: AgentReviewRow | null;
}

export async function getLeadDetail(leadId: string): Promise<LeadDetail | null> {
  const supabase = await createServerSupabaseClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();
  if (leadError || !lead) return null;

  const { data: injured } = await supabase
    .from("injured_people")
    .select("id, name, relationship, injury_description, seen_doctor, willing_to_see")
    .eq("lead_id", leadId);

  const { data: review } = await supabase
    .from("agent_reviews")
    .select(
      "agent_id, call_status, call_duration, is_authentic, checklist, agent_message, estimated_viability, reviewed_at, profiles(full_name)"
    )
    .eq("lead_id", leadId)
    .maybeSingle();

  let agentReview: AgentReviewRow | null = null;
  if (review) {
    const profile = review.profiles as unknown as { full_name: string } | null;
    agentReview = {
      agent_name: profile?.full_name ?? null,
      call_status: review.call_status,
      call_duration: review.call_duration,
      is_authentic: review.is_authentic,
      checklist: (review.checklist as AgentReviewRow["checklist"]) ?? {},
      agent_message: review.agent_message,
      estimated_viability: review.estimated_viability,
      reviewed_at: review.reviewed_at,
    };
  }

  return { ...lead, injured_people: injured ?? [], agent_review: agentReview };
}

export interface SaveAgentReviewInput {
  leadId: string;
  caseNumber: string | null;
  claimantName: string;
  callStatus: string;
  callDuration: string;
  checklist: {
    idVerified: boolean;
    solValid: boolean;
    noPriorAttorney: boolean;
    treatmentDocumented: boolean;
    liabilityClear: boolean;
  };
  verdictStatus: "verified" | "followup" | "rejected";
  priority: "low" | "medium" | "high";
  viability: string;
  message: string;
}

export type SaveAgentReviewResult = { ok: true } | { ok: false; error: string };

export async function saveAgentReview(
  input: SaveAgentReviewInput
): Promise<SaveAgentReviewResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error: reviewError } = await supabase.from("agent_reviews").upsert(
    {
      lead_id: input.leadId,
      agent_id: user.id,
      call_status: input.callStatus,
      call_duration: input.callDuration,
      is_authentic: input.verdictStatus === "verified",
      checklist: input.checklist,
      agent_message: input.message,
      estimated_viability: input.viability,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "lead_id" }
  );
  if (reviewError) return { ok: false, error: reviewError.message };

  const { error: leadError } = await supabase
    .from("leads")
    .update({ status: input.verdictStatus, priority: input.priority })
    .eq("id", input.leadId);
  if (leadError) return { ok: false, error: leadError.message };

  if (input.verdictStatus === "verified") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await notifyAttorneysOfVerifiedLead({
      caseNumber: input.caseNumber ?? input.leadId,
      claimantName: input.claimantName,
      agentName: profile?.full_name ?? "An agent",
      viability: input.viability,
    });
  }

  return { ok: true };
}
