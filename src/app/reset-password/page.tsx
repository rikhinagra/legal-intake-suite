import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set New Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only reachable through the emailed link (which signs the person in just
  // long enough to set a new password) — anyone arriving without that gets
  // sent to request a fresh link instead of seeing a form that can't work.
  if (!user) {
    return (
      <AuthShell>
        <h2 className="text-[22px] font-semibold text-ink">Link expired</h2>
        <p className="mt-1.5 text-[14.5px] text-charcoal-soft">
          This password reset link is no longer valid. Request a new one and use it within a
          few minutes.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex w-full items-center justify-center rounded-[9px] bg-blue px-4 py-3 text-[14px] font-semibold text-white transition-all hover:bg-ink"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}
