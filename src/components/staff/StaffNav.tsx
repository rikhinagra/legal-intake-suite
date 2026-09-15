import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import type { StaffProfile } from "@/lib/supabase/auth-helpers";
import Logo from "./Logo";

export default function StaffNav({
  staff,
  active,
}: {
  staff: StaffProfile;
  active: "agent" | "dashboard";
}) {
  // Only admins move between both portals — agents and attorneys each have exactly
  // one workspace, so a nav pill for them would just repeat the page's own heading
  // with nowhere else to go (and would let an attorney wander into agent tooling).
  const canSeeDashboard = staff.role === "admin";

  return (
    <div className="sticky top-0 z-40 border-b border-line bg-card shadow-[var(--shadow)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center">
          <Logo className="h-8 w-8 shrink-0" />
        </div>

        {canSeeDashboard && (
          <nav className="flex flex-wrap items-center gap-1.5">
            <Link
              href="/agent"
              className={`rounded-[9px] px-3 py-1.5 text-[13px] font-semibold transition sm:text-[14px] ${
                active === "agent"
                  ? "bg-blue text-white shadow-[0_2px_8px_rgba(11,76,245,0.25)]"
                  : "text-charcoal-soft hover:bg-paper-2 hover:text-ink"
              }`}
            >
              Agent Portal
            </Link>
            <Link
              href="/dashboard"
              className={`rounded-[9px] px-3 py-1.5 text-[13px] font-semibold transition sm:text-[14px] ${
                active === "dashboard"
                  ? "bg-blue text-white shadow-[0_2px_8px_rgba(11,76,245,0.25)]"
                  : "text-charcoal-soft hover:bg-paper-2 hover:text-ink"
              }`}
            >
              Attorney Dashboard
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          <span className="hidden text-[13px] text-charcoal-soft sm:inline">
            {staff.full_name} <span className="text-line">·</span>{" "}
            <span className="capitalize">{staff.role}</span>
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-[9px] border border-line px-2.5 py-1.5 text-[13px] font-medium text-charcoal-soft transition hover:bg-paper-2 hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
