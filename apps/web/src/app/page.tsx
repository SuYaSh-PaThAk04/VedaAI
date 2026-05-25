import { AssignmentsDashboard } from "@/components/assignments-dashboard";
import { DashboardShell } from "@/components/dashboard-shell";
import { getAssignments } from "@/lib/api";

export default async function HomePage() {
  const assignments = await getAssignments().catch(() => []);

  return (
    <DashboardShell active="assignments" crumb="Assignment">
      <AssignmentsDashboard initialAssignments={assignments} />
    </DashboardShell>
  );
}
