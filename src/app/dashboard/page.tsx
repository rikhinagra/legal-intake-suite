import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/supabase/auth-helpers";
import AttorneyDashboard from "@/components/attorney/AttorneyDashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const staff = await getStaffUser();
  if (!staff) redirect("/login");
  if (staff.role !== "attorney" && staff.role !== "admin") redirect("/agent");

  // ?view=business opens the Business Registrations tab, so a link in an
  // email can take an attorney straight to it.
  const { view } = await searchParams;

  return (
    <AttorneyDashboard staff={staff} initialView={view === "business" ? "business" : "accident"} />
  );
}
