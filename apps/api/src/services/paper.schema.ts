import { z } from "zod";

const questionSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    type: z.enum(["multiple-choice", "short-answer", "long-answer", "true-false"]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    marks: z.number().int().positive(),
    options: z.array(z.string().min(1)).optional(),
    answer: z.string().min(1).optional()
  })
  .superRefine((question, ctx) => {
    if (question.type === "multiple-choice") {
      if (!question.options || question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple-choice questions must include at least 2 options.",
          path: ["options"]
        });
      }
    }

    if (question.type === "true-false" && question.options?.length) {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "True/false questions should include True and False options.",
          path: ["options"]
        });
      }
    }
  });

export const generatedPaperSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().min(1),
  totalMarks: z.number().int().positive(),
  duration: z.string().min(1),
  sections: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        instruction: z.string().min(1),
        questions: z.array(questionSchema).min(1)
      })
    )
    .min(1)
});
