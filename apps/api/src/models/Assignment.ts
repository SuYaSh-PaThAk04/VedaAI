import type { AssignmentInput, AssignmentStatus, GeneratedPaper, QuestionConfig } from "@vedaai/shared";
import { model, Schema } from "mongoose";

export interface AssignmentDocument extends AssignmentInput {
  status: AssignmentStatus;
  jobId?: string;
  result?: GeneratedPaper;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionConfigSchema = new Schema<QuestionConfig>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["multiple-choice", "short-answer", "long-answer", "true-false"],
      required: true
    },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const assignmentSchema = new Schema<AssignmentDocument>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    questionConfigs: { type: [questionConfigSchema], required: true },
    instructions: { type: String, default: "" },
    sourceText: { type: String, default: "" },
    status: {
      type: String,
      enum: ["queued", "generating", "completed", "failed"] satisfies AssignmentStatus[],
      default: "queued"
    },
    jobId: { type: String },
    result: { type: Schema.Types.Mixed },
    error: { type: String }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        Reflect.deleteProperty(ret, "_id");
        Reflect.deleteProperty(ret, "__v");
        return ret;
      }
    }
  }
);

export const AssignmentModel = model("Assignment", assignmentSchema);
