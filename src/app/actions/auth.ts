"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStaffUser } from "@/lib/supabase/auth-helpers";
import { SITE_URL } from "@/lib/site-config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export type SignInResult = { error: string } | undefined;
export type ForgotPasswordResult = { sent: true } | { error: string } | undefined;
export type UpdatePasswordResult = { error: string } | undefined;

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

export async function requestPasswordReset(
  _prevState: ForgotPasswordResult,
  formData: FormData
): Promise<ForgotPasswordResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/confirm`,
  });

  // Supabase reports success whether or not the address has an account, so
  // a real error here means the email genuinely couldn't be sent (rate
  // limit, mail setup) — safe to surface without revealing who has an account.
  if (error) {
    console.error("requestPasswordReset failed:", error.message);
    return {
      error:
        "We couldn't send the email right now. Wait a few minutes and try again, or ask your administrator.",
    };
  }

  return { sent: true };
}

export async function updatePassword(
  _prevState: UpdatePasswordResult,
  formData: FormData
): Promise<UpdatePasswordResult> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password !== confirm) {
    return { error: "The two passwords don't match." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "This reset link has expired. Request a new one from the sign-in page." };
  }

  const { error } = await supabase.auth.updateUser({ password });
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
