export const LEAD_FILES_BUCKET = "lead-files";

export const FILE_TYPE_OPTIONS = [
  { value: "photo", label: "Photo" },
  { value: "police_report", label: "Police Report" },
  { value: "medical_record", label: "Medical Record" },
  { value: "other", label: "Other" },
] as const;

export type LeadFileType = (typeof FILE_TYPE_OPTIONS)[number]["value"];

/** One folder per lead, a random id so two same-named files never collide. */
export function buildFilePath(leadId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `${leadId}/${crypto.randomUUID()}-${safeName}`;
}
