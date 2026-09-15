import { createPublicClient } from "@/lib/supabase/public-client";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { LEAD_FILES_BUCKET, buildFilePath } from "@/lib/supabase/storage";
import { recordLeadFile } from "@/app/actions/lead-files";

export type UploadResult = { ok: true } | { ok: false; error: string };

/** Used by the public intake form — uploads as the anonymous role. */
export async function uploadLeadFilePublic(
  leadId: string,
  file: File,
  fileType: string
): Promise<UploadResult> {
  const supabase = createPublicClient();
  return doUpload(supabase, leadId, file, fileType);
}

/** Used by the agent portal / attorney dashboard — uploads as the logged-in staff member. */
export async function uploadLeadFileStaff(
  leadId: string,
  file: File,
  fileType: string
): Promise<UploadResult> {
  const supabase = createBrowserSupabaseClient();
  return doUpload(supabase, leadId, file, fileType);
}

async function doUpload(
  supabase: ReturnType<typeof createPublicClient>,
  leadId: string,
  file: File,
  fileType: string
): Promise<UploadResult> {
  const path = buildFilePath(leadId, file.name);
  const { error: uploadError } = await supabase.storage
    .from(LEAD_FILES_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) return { ok: false, error: uploadError.message };

  return recordLeadFile({ leadId, filePath: path, fileType });
}
