import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/supabase/auth-helpers";
import AgentPortal from "@/components/agent/AgentPortal";

export default async function AgentPage() {
  const staff = await getStaffUser();
  if (!staff) redirect("/login");
  if (staff.role === "attorney") redirect("/dashboard");

  return <AgentPortal staff={staff} />;
}
