import { Check } from "lucide-react";
import Logo from "@/components/staff/Logo";

const PIPELINE = [
  "Claimant submits a case",
  "Agent verifies by phone",
  "Attorney reviews and retains",
];

export default function AuthShell({ children }: { children: React.ReactNode }) {
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
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
