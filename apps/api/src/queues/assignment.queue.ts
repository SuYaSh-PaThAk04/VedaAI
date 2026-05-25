import { Queue } from "bullmq";
import type { AssignmentInput } from "@vedaai/shared";
import { bullmqConnection } from "../db/redis.js";

export const GENERATION_QUEUE = "question-generation";

export interface GenerationJobData {
  assignmentId: string;
  input: AssignmentInput;
}

export const generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE, {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { age: 60 * 60 * 24, count: 1000 },
    removeOnFail: { age: 60 * 60 * 24 * 7 }
  }
});
