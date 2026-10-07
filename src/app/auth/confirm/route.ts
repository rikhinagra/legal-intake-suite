import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Landing point for the link in the password-reset email. Only the recovery
// type is accepted, so this route can never be used to sign someone in any
// other way. The token_hash path works even if the email is opened on a
// different device than the one that requested it; the code path is the
// fallback if the email template hasn't been switched to token_hash yet.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  const supabase = await createServerSupabaseClient();
  let ok = false;

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  redirect(ok ? "/reset-password" : "/forgot-password?error=expired");
}
