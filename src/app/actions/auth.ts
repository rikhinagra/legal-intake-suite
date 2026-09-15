"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStaffUser } from "@/lib/supabase/auth-helpers";

export type SignInResult = { error: string } | undefined;

export async function signIn(
  _prevState: SignInResult,
  formData: FormData
): Promise<SignInResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const staff = await getStaffUser();
  redirect(staff?.role === "attorney" || staff?.role === "admin" ? "/dashboard" : "/agent");
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
