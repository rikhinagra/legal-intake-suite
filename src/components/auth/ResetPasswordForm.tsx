"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { updatePassword, type UpdatePasswordResult } from "@/app/actions/auth";
import PasswordInput from "./PasswordInput";

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<UpdatePasswordResult, FormData>(
    updatePassword,
    undefined
  );

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-ink">Set a new password</h2>
      <p className="mt-1.5 text-[14.5px] text-charcoal-soft">
        Choose a password with at least 8 characters.
      </p>

      <form action={formAction} className="mt-7 space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-[13px] font-medium text-charcoal">
            New password
          </label>
          <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-[13px] font-medium text-charcoal">
            Confirm new password
          </label>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" minLength={8} />
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
          <KeyRound className="h-4 w-4" />
          {pending ? "Saving..." : "Save new password"}
        </button>
      </form>
    </div>
  );
}
