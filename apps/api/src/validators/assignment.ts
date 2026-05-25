import { z } from "zod";

export const assignmentInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  grade: z.string().trim().min(1, "Grade is required"),
  dueDate: z.string().trim().min(1, "Due date is required"),
  instructions: z.string().optional().default(""),
  sourceText: z.string().optional().default(""),
  questionConfigs: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(["multiple-choice", "short-answer", "long-answer", "true-false"]),
        count: z.coerce.number().int().positive(),
        marks: z.coerce.number().int().positive()
      })
    )
    .min(1, "Add at least one question type")
});

export type AssignmentInputDto = z.infer<typeof assignmentInputSchema>;
