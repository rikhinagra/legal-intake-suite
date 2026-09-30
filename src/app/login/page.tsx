"use client";

import { useActionState, useState } from "react";
import { LogIn, Check, Eye, EyeOff } from "lucide-react";
import { signIn, type SignInResult } from "@/app/actions/auth";
import Logo from "@/components/staff/Logo";

const PIPELINE = [
  "Claimant submits a case",
  "Agent verifies by phone",
  "Attorney reviews and retains",
];

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<SignInResult, FormData>(
    signIn,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Branding panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-ink px-8 py-10 text-paper sm:px-12 sm:py-12 md:w-[44%] md:px-14 md:py-14 lg:w-2/5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(720px 420px at -10% -15%, rgba(11,76,245,0.35), transparent 60%), radial-gradient(560px 380px at 110% 110%, rgba(6,214,75,0.16), transparent 55%)",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-9 shrink-0" />
            <span className="mono text-[11px] font-medium tracking-[0.14em] text-[#c9cfe0] uppercase">
              Case Intake
            </span>
          </div>

          <h1 className="mt-10 max-w-[15ch] text-[28px] leading-[1.2] font-semibold text-paper sm:text-[32px] md:mt-14 md:text-[34px]">
            Every case verified before it&apos;s retained.
          </h1>
          <p className="mt-4 max-w-[38ch] text-[14.5px] leading-relaxed text-[#c9cfe0]">
            Sign in to conduct claimant verification calls or review certified cases for
            retainer.
          </p>
        </div>

        <ol className="relative mt-10 hidden space-y-4 md:block">
          {PIPELINE.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-green/40 bg-green/10">
                <Check className="h-3 w-3 text-green" />
              </span>
              <span className="text-[13px] text-[#c9cfe0]">
                <span className="mono mr-1.5 text-[11px] text-green">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-paper px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <h2 className="text-[22px] font-semibold text-ink">Staff sign in</h2>
          <p className="mt-1.5 text-[14.5px] text-charcoal-soft">
            Agent and attorney access to the case intake system.
          </p>

          <form action={formAction} className="mt-7 space-y-4">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-charcoal">Email</label>
              <input type="email" name="email" required autoComplete="email" />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-charcoal">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-charcoal-soft hover:text-charcoal"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
        </div>
      </div>
    </main>
  );
}
