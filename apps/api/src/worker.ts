import { Worker } from "bullmq";
import { connectMongo } from "./db/mongo.js";
import { bullmqConnection, ensureRedisReady, redisPub } from "./db/redis.js";
import { AssignmentModel } from "./models/Assignment.js";
import { GENERATION_QUEUE, type GenerationJobData } from "./queues/assignment.queue.js";
import { generatePaper } from "./services/gemini.js";
import { publishProgress } from "./sockets/publisher.js";

async function bootstrapWorker() {
  await connectMongo();
  await ensureRedisReady();

  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      const { assignmentId, input } = job.data;

      await job.updateProgress(20);
      await AssignmentModel.findByIdAndUpdate(assignmentId, { status: "generating", error: undefined });
      await redisPub.set(`assignment:${assignmentId}:status`, "generating", "EX", 60 * 60);
      await publishProgress({
        assignmentId,
        jobId: job.id,
        status: "generating",
        progress: 20,
        message: "Gemini is generating a structured paper."
      });

      const result = await generatePaper(input);

      await job.updateProgress(100);
      await AssignmentModel.findByIdAndUpdate(assignmentId, {
        status: "completed",
        result,
        error: undefined
      });
      await redisPub.set(`assignment:${assignmentId}:status`, "completed", "EX", 60 * 60);
      await publishProgress({
        assignmentId,
        jobId: job.id,
        status: "completed",
        progress: 100,
        message: "Question paper is ready.",
        result
      });

      return result;
    },
    {
      connection: bullmqConnection,
      concurrency: 3
    }
  );

  worker.on("failed", async (job, error) => {
    const assignmentId = job?.data.assignmentId;
    if (!assignmentId) {
      return;
    }

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: "failed",
      error: error.message
    });
    await redisPub.set(`assignment:${assignmentId}:status`, "failed", "EX", 60 * 60);
    await publishProgress({
      assignmentId,
      jobId: job?.id,
      status: "failed",
      progress: 100,
      message: "Generation failed.",
      error: error.message
    });
  });

  console.log("Generation worker started.");
}

bootstrapWorker().catch((error) => {
  console.error("Failed to start generation worker", error);
  process.exit(1);
});
