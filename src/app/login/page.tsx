"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { signIn, type SignInResult } from "@/app/actions/auth";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<SignInResult, FormData>(
    signIn,
    undefined
  );

  return (
    <AuthShell>
      <h2 className="text-[22px] font-semibold text-ink">Staff sign in</h2>
      <p className="mt-1.5 text-[14.5px] text-charcoal-soft">
        Agent and attorney access to the case intake system.
      </p>

      <form action={formAction} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-charcoal">
            Email
          </label>
          <input id="email" type="email" name="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-[13px] font-medium text-charcoal">
            Password
          </label>
          <PasswordInput id="password" name="password" autoComplete="current-password" />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-[12.5px] font-medium text-blue hover:text-ink"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {state?.error && (
          <p className="rounded-[9px] border border-clay/30 bg-clay/10 px-3 py-2 text-[13px] text-clay">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-blue px-4 py-3 text-[14px] font-semibold text-white transition-all hover:bg-ink hover:shadow-[0_6px_16px_rgba(11,76,245,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-[12.5px] text-charcoal-soft">
        Staff accounts are provisioned by your firm administrator. There&apos;s no
        self-signup.
      </p>
    </AuthShell>
  );
}
