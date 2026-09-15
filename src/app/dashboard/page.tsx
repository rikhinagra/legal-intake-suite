import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/supabase/auth-helpers";
import AttorneyDashboard from "@/components/attorney/AttorneyDashboard";

export default async function DashboardPage() {
  const staff = await getStaffUser();
  if (!staff) redirect("/login");
  if (staff.role !== "attorney" && staff.role !== "admin") redirect("/agent");

  return <AttorneyDashboard staff={staff} />;
}
