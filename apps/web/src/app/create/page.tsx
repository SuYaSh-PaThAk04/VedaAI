import Link from "next/link";
import { AssignmentForm } from "@/components/assignment-form";
import { DashboardShell } from "@/components/dashboard-shell";

export default function CreateAssignmentPage() {
  return (
    <DashboardShell active="none" crumb="Assignment" ctaLabel="Create Assignment">
      <div className="h-full overflow-y-auto px-3 py-0 md:px-6 md:py-6">
        <div className="flex items-center gap-3 border-b border-[#c8c8c8] bg-[#d0d0d0] px-1 py-3 md:hidden">
          <Link href="/" className="grid size-8 place-items-center rounded-full bg-white text-lg">
            ←
          </Link>
          <h1 className="flex-1 text-center text-sm font-extrabold">Create Assignment</h1>
          <span className="size-8" />
        </div>
        <div className="mb-5 mt-4 flex items-start gap-3 md:mb-6 md:mt-0">
          <span className="mt-2 size-3 rounded-full bg-[#32d873]" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">Create Assignment</h1>
            <p className="text-sm font-medium text-[#9b9b9b]">Set up a new assignment for your students.</p>
          </div>
        </div>

        <AssignmentForm />
      </div>
    </DashboardShell>
  );
}
