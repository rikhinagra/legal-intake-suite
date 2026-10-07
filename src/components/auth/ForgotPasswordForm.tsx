"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { requestPasswordReset, type ForgotPasswordResult } from "@/app/actions/auth";

export default function ForgotPasswordForm({ expired }: { expired: boolean }) {
  const [state, formAction, pending] = useActionState<ForgotPasswordResult, FormData>(
    requestPasswordReset,
    undefined
  );

  if (state && "sent" in state) {
    return (
      <div>
        <h2 className="text-[22px] font-semibold text-ink">Check your email</h2>
        <p className="mt-1.5 text-[14.5px] text-charcoal-soft">
          If that email has a staff account, we&apos;ve sent a link to set a new password. It
          can take a minute to arrive, so check your spam folder too.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-ink">Forgot your password?</h2>
      <p className="mt-1.5 text-[14.5px] text-charcoal-soft">
        Enter your staff email and we&apos;ll send you a link to set a new one.
      </p>

      {expired && (
        <p className="mt-5 rounded-[9px] border border-clay/30 bg-clay/10 px-3 py-2 text-[13px] text-clay">
          That link has expired or was already used. Request a new one below.
        </p>
      )}

      <form action={formAction} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-charcoal">
            Email
          </label>
          <input id="email" type="email" name="email" required autoComplete="email" />
        </div>

        {state && "error" in state && (
          <p className="rounded-[9px] border border-clay/30 bg-clay/10 px-3 py-2 text-[13px] text-clay">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-blue px-4 py-3 text-[14px] font-semibold text-white transition-all hover:bg-ink hover:shadow-[0_6px_16px_rgba(11,76,245,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail className="h-4 w-4" />
          {pending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
