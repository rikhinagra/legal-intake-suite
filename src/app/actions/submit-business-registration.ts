"use server";

import { randomUUID } from "crypto";
import { createPublicClient } from "@/lib/supabase/public-client";
import {
  notifyAgentsOfNewBusinessRegistration,
  notifyBusinessOfRegistration,
} from "@/lib/business-notifications";

export interface BusinessRegistrationInput {
  company: string;
  contact: string;
  phone: string;
  email: string;
  fleet: string;
  need: string;
  companyType: string;
  role: string;
  dot: string;
  drivers: string;
  states: string;
  carrier: string;
  counsel: string;
  method: string;
  message: string;
  consent: boolean;
  language: string;
}

export type SubmitBusinessRegistrationResult =
  | { ok: true; registrationId: string; registrationNumber: string }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SHORT_TEXT = 200;
const MAX_MESSAGE = 2000;
const MAX_REGISTRATION_NUMBER_ATTEMPTS = 3;
// Postgres "unique_violation": the random registration number was already taken.
const UNIQUE_VIOLATION = "23505";

function assignRegistrationNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REG ${year}-${rand}`;
}

function clean(value: string, max: number) {
  return value.trim().slice(0, max) || null;
}

export async function submitBusinessRegistration(
  input: BusinessRegistrationInput
): Promise<SubmitBusinessRegistrationResult> {
  // The form validates this too, but the server is the one that has to be
  // sure: anyone can call a server action directly.
  const company = clean(input.company, MAX_SHORT_TEXT);
  const contact = clean(input.contact, MAX_SHORT_TEXT);
  const phone = clean(input.phone, 40);
  const email = clean(input.email, MAX_SHORT_TEXT);
  const fleet = clean(input.fleet, MAX_SHORT_TEXT);
  const need = clean(input.need, MAX_SHORT_TEXT);

  if (
    !company ||
    !contact ||
    !phone ||
    phone.replace(/\D/g, "").length < 10 ||
    !email ||
    !EMAIL_PATTERN.test(email) ||
    !fleet ||
    !need ||
    !input.consent
  ) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const driverCount = Number.parseInt(input.drivers, 10);

  const supabase = createPublicClient();
  const registrationId = randomUUID();

  for (let attempt = 0; attempt < MAX_REGISTRATION_NUMBER_ATTEMPTS; attempt++) {
    const registrationNumber = assignRegistrationNumber();

    // No `.select()` on purpose: anonymous submitters are not allowed to read
    // registrations back (staff only, by RLS policy), and Postgres applies
    // that same read check to an INSERT's RETURNING clause.
    const { error } = await supabase.from("business_registrations").insert({
      id: registrationId,
      registration_number: registrationNumber,
      company_name: company,
      contact_name: contact,
      phone,
      email,
      fleet_size: fleet,
      need,
      company_type: clean(input.companyType, MAX_SHORT_TEXT),
      contact_role: clean(input.role, MAX_SHORT_TEXT),
      dot_mc_number: clean(input.dot, MAX_SHORT_TEXT),
      driver_count: Number.isFinite(driverCount) && driverCount >= 0 ? driverCount : null,
      states_of_operation: clean(input.states, MAX_SHORT_TEXT),
      insurance_carrier: clean(input.carrier, MAX_SHORT_TEXT),
      has_counsel: clean(input.counsel, 10),
      preferred_contact: clean(input.method, 20),
      message: clean(input.message, MAX_MESSAGE),
      consent: input.consent,
      language: clean(input.language, 20),
    });

    if (!error) {
      // Best-effort: these never throw, so a failed email cannot fail the registration.
      await Promise.all([
        notifyBusinessOfRegistration({
          contactName: contact,
          companyName: company,
          email,
          registrationNumber,
          language: input.language,
        }),
        notifyAgentsOfNewBusinessRegistration({
          registrationNumber,
          companyName: company,
          contactName: contact,
          fleetSize: fleet,
        }),
      ]);
      return { ok: true, registrationId, registrationNumber };
    }
    if (error.code !== UNIQUE_VIOLATION) {
      console.error("submitBusinessRegistration insert failed:", error);
      return { ok: false, error: "We could not save your registration. Please try again." };
    }
  }

  return { ok: false, error: "We could not save your registration. Please try again." };
}
