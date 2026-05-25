import type { AssignmentRecord } from "@vedaai/shared";
import { API_URL } from "./config";

export async function createAssignment(formData: FormData) {
  const response = await fetch(`${API_URL}/api/assignments`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create assignment." }));
    throw new Error(error.message ?? "Failed to create assignment.");
  }

  return (await response.json()) as AssignmentRecord;
}

export async function getAssignments() {
  const response = await fetch(`${API_URL}/api/assignments`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load assignments.");
  }

  return (await response.json()) as AssignmentRecord[];
}

export async function getAssignment(id: string) {
  const response = await fetch(`${API_URL}/api/assignments/${id}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Assignment not found.");
  }

  return (await response.json()) as AssignmentRecord;
}

export async function deleteAssignment(id: string) {
  const response = await fetch(`${API_URL}/api/assignments/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Failed to delete assignment.");
  }
}

export async function regenerateAssignment(id: string) {
  const response = await fetch(`${API_URL}/api/assignments/${id}/regenerate`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to regenerate assignment.");
  }

  return (await response.json()) as AssignmentRecord;
}
