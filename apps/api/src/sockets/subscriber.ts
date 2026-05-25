import type { JobProgressEvent } from "@vedaai/shared";
import { progressSub } from "../db/redis.js";
import { JOB_PROGRESS_EVENT, assignmentRoom } from "./events.js";
import { getSocketServer } from "./server.js";
import { SOCKET_PROGRESS_CHANNEL } from "./publisher.js";

export async function subscribeToProgressEvents() {
  await progressSub.subscribe(SOCKET_PROGRESS_CHANNEL);

  progressSub.on("message", (_channel: string, payload: string) => {
    const event = JSON.parse(payload) as JobProgressEvent;
    getSocketServer().to(assignmentRoom(event.assignmentId)).emit(JOB_PROGRESS_EVENT, event);
  });

  return progressSub;
}
