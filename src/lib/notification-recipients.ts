import type { SupabaseClient } from "@supabase/supabase-js";

export const AGENT_NOTIFICATION_CC_KEY = "agent_notification_cc";

/** Trims, lower-cases for comparison, drops blanks and repeats; keeps first-seen spelling. */
export function uniqueEmails(...lists: (string | null | undefined)[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const list of lists) {
    for (const raw of list) {
      const email = (raw ?? "").trim();
      if (!email) continue;
      const key = email.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(email);
    }
  }
  return result;
}

async function getExtraRecipients(admin: SupabaseClient, key: string): Promise<string[]> {
  const { data, error } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.error(`getExtraRecipients(${key}) failed:`, error.message);
    return [];
  }
  const value = data?.value;
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/**
 * Everyone who should get a new-case email: whoever currently holds the
 * agent (or admin) role, plus the configured extra addresses. Takes the
 * client as a parameter so it can be checked against real data without
 * sending anything.
 */
export async function getAgentNotificationRecipients(admin: SupabaseClient): Promise<string[]> {
  const { data, error } = await admin
    .from("profiles")
    .select("email")
    .in("role", ["agent", "admin"]);
  if (error) {
    console.error("getAgentNotificationRecipients failed:", error.message);
    return [];
  }
  const staff = (data ?? []).map((r) => r.email as string | null);
  const extra = await getExtraRecipients(admin, AGENT_NOTIFICATION_CC_KEY);
  return uniqueEmails(staff, extra);
}
