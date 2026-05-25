import { AssignmentResultClient } from "@/components/assignment-result-client";
import { getAssignment } from "@/lib/api";

interface AssignmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const { id } = await params;
  const assignment = await getAssignment(id);

  return <AssignmentResultClient assignment={assignment} />;
}
