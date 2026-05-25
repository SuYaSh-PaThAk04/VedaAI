import type { JobProgressEvent } from "@vedaai/shared";
import { redisPub } from "../db/redis.js";

export const SOCKET_PROGRESS_CHANNEL = "assignment-progress";

export async function publishProgress(event: JobProgressEvent) {
  await redisPub.publish(SOCKET_PROGRESS_CHANNEL, JSON.stringify(event));
}
