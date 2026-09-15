import { createServerSupabaseClient } from "./server";

export type StaffRole = "agent" | "attorney" | "admin";

export interface StaffProfile {
  id: string;
  full_name: string;
  role: StaffRole;
}

/** Returns the logged-in staff member's profile, or null if not logged in. */
export async function getStaffUser(): Promise<StaffProfile | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  return (profile as StaffProfile) ?? null;
}
