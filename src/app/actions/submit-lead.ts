"use server";

import { randomUUID } from "crypto";
import { createPublicClient } from "@/lib/supabase/public-client";
import { IntakeFormData } from "@/lib/types";
import { notifyAgentsOfNewLead, notifyClaimantOfSubmission } from "@/app/actions/notifications";

export type SubmitLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string };

export async function submitLead(
  data: IntakeFormData,
  caseNumber: string
): Promise<SubmitLeadResult> {
  const supabase = createPublicClient();
  const leadId = randomUUID();

  // No `.select()` here on purpose: anonymous submitters aren't allowed to
  // *read* leads back (staff-only, by RLS policy), and Postgres enforces
  // that same read check on an INSERT's RETURNING clause. Generating the id
  // ourselves avoids needing a read-back at all.
  const { error: leadError } = await supabase.from("leads").insert({
      id: leadId,
      case_number: caseNumber,
      case_type: data.caseType,
      has_attorney: data.hasAttorney,
      occupation: data.occupation.trim() || null,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      phone: data.phone.trim(),
      alt_phone: data.altPhone.trim() || null,
      email: data.email.trim() || null,
      language: data.language || null,
      address: data.address.trim() || null,
      mailing_city: data.city.trim() || null,
      mailing_state: data.state.trim().toUpperCase() || null,
      mailing_zip: data.zip.trim() || null,
      accident_date: data.accDate || null,
      accident_time: data.accTime || null,
      best_time_to_call: data.bestTime || null,
      police_arrived: data.policeArrived || null,
      accident_description: data.description.trim(),
      consent: data.consent,
  });

  if (leadError) {
    return { ok: false, error: leadError.message };
  }

  const injuryRows = data.injuries
    .filter((inj) => inj.name.trim() || inj.description.trim())
    .map((inj) => ({
      lead_id: leadId,
      name: inj.name.trim(),
      relationship: inj.relationship || null,
      injury_description: inj.description.trim() || null,
      seen_doctor: inj.seenDoctor || null,
      willing_to_see: inj.willingToSee || null,
    }));

  if (injuryRows.length > 0) {
    const { error: injuryError } = await supabase.from("injured_people").insert(injuryRows);
    if (injuryError) {
      return { ok: false, error: injuryError.message };
    }
  }

  await notifyClaimantOfSubmission({
    claimantEmail: data.email.trim() || null,
    claimantFirstName: data.firstName.trim(),
    caseNumber,
  });

  await notifyAgentsOfNewLead({
    caseNumber,
    claimantName: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
    caseType: data.caseType,
  });

  return { ok: true, leadId };
}
