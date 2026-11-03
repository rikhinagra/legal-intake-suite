import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/supabase/auth-helpers";
import AgentPortal from "@/components/agent/AgentPortal";

export default async function AgentPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const staff = await getStaffUser();
  if (!staff) redirect("/login");
  if (staff.role === "attorney") redirect("/dashboard");

  // ?view=business opens the Business Registrations tab, so a link in an
  // email can take an agent straight to it.
  const { view } = await searchParams;

  return <AgentPortal staff={staff} initialView={view === "business" ? "business" : "accident"} />;
}
