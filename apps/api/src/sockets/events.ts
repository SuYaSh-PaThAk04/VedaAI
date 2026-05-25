import type { JobProgressEvent } from "@vedaai/shared";

export const ASSIGNMENT_ROOM_PREFIX = "assignment:";
export const JOB_PROGRESS_EVENT = "assignment:progress";

export function assignmentRoom(assignmentId: string) {
  return `${ASSIGNMENT_ROOM_PREFIX}${assignmentId}`;
}

export type ServerToClientEvents = {
  [JOB_PROGRESS_EVENT]: (event: JobProgressEvent) => void;
};

export type ClientToServerEvents = {
  "assignment:subscribe": (assignmentId: string) => void;
};
