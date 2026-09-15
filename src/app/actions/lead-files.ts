"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public-client";
import { getStaffUser } from "@/lib/supabase/auth-helpers";
import { LEAD_FILES_BUCKET } from "@/lib/supabase/storage";

export interface RecordLeadFileInput {
  leadId: string;
  filePath: string;
  fileType: string;
}

export type RecordLeadFileResult = { ok: true } | { ok: false; error: string };

/**
 * Writes the `lead_files` row after the actual bytes are already uploaded to
 * Storage from the browser. Works for both the anonymous public intake form
 * and a logged-in staff member — `getStaffUser()` is checked server-side, so
 * a caller can't spoof which client (and therefore which RLS role) is used.
 */
export async function recordLeadFile(input: RecordLeadFileInput): Promise<RecordLeadFileResult> {
  const staff = await getStaffUser();
  const supabase = staff ? await createServerSupabaseClient() : createPublicClient();

  const { error } = await supabase.from("lead_files").insert({
    lead_id: input.leadId,
    file_path: input.filePath,
    file_type: input.fileType,
    uploaded_by: staff?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export interface LeadFileRow {
  id: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

export async function getLeadFiles(leadId: string): Promise<LeadFileRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lead_files")
    .select("id, file_path, file_type, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Staff-only: a short-lived link to view/download one file. Never a public URL. */
export async function getSignedFileUrl(filePath: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.storage
    .from(LEAD_FILES_BUCKET)
    .createSignedUrl(filePath, 300);

  if (error || !data) return null;
  return data.signedUrl;
}
