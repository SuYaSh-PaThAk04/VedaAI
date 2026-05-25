import { Router } from "express";
import multer from "multer";
import { ZodError } from "zod";
import type { AssignmentInput } from "@vedaai/shared";
import { AssignmentModel } from "../models/Assignment.js";
import { generationQueue } from "../queues/assignment.queue.js";
import { publishProgress } from "../sockets/publisher.js";
import { readUploadedSource } from "../utils/file-text.js";
import { assignmentInputSchema } from "../validators/assignment.js";

export const assignmentsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

assignmentsRouter.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      questionConfigs:
        typeof req.body.questionConfigs === "string"
          ? JSON.parse(req.body.questionConfigs)
          : req.body.questionConfigs
    };

    const parsed = assignmentInputSchema.parse(body);
    const uploadedText = await readUploadedSource(req.file);
    const input: AssignmentInput = {
      ...parsed,
      sourceText: [parsed.sourceText, uploadedText].filter(Boolean).join("\n\n")
    };

    const assignment = await AssignmentModel.create({
      ...input,
      status: "queued"
    });

    const job = await generationQueue.add("generate-paper", {
      assignmentId: assignment.id,
      input
    });

    assignment.jobId = job.id;
    await assignment.save();

    await publishProgress({
      assignmentId: assignment.id,
      jobId: job.id,
      status: "queued",
      progress: 5,
      message: "Assignment queued for AI generation."
    });

    res.status(202).json(assignment.toJSON());
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Invalid assignment input.", issues: error.flatten() });
      return;
    }
    next(error);
  }
});

assignmentsRouter.get("/", async (_req, res, next) => {
  try {
    const assignments = await AssignmentModel.find().sort({ createdAt: -1 }).limit(20);
    res.json(assignments.map((assignment) => assignment.toJSON()));
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.get("/:id", async (req, res, next) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found." });
      return;
    }

    res.json(assignment.toJSON());
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.delete("/:id", async (req, res, next) => {
  try {
    const assignment = await AssignmentModel.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

assignmentsRouter.post("/:id/regenerate", async (req, res, next) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found." });
      return;
    }

    assignment.status = "queued";
    assignment.error = undefined;
    assignment.result = undefined;
    await assignment.save();

    const input: AssignmentInput = {
      title: assignment.title,
      subject: assignment.subject,
      grade: assignment.grade,
      dueDate: assignment.dueDate,
      questionConfigs: assignment.questionConfigs,
      instructions: assignment.instructions,
      sourceText: assignment.sourceText
    };

    const job = await generationQueue.add("generate-paper", {
      assignmentId: assignment.id,
      input
    });

    assignment.jobId = job.id;
    await assignment.save();

    await publishProgress({
      assignmentId: assignment.id,
      jobId: job.id,
      status: "queued",
      progress: 5,
      message: "Regeneration queued."
    });

    res.status(202).json(assignment.toJSON());
  } catch (error) {
    next(error);
  }
});
