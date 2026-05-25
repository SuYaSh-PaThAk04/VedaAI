export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType =
  | "multiple-choice"
  | "short-answer"
  | "long-answer"
  | "true-false";

export interface QuestionConfig {
  id: string;
  type: QuestionType;
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionConfigs: QuestionConfig[];
  instructions?: string;
  sourceText?: string;
}

export interface PaperQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  /** MCQ / true-false choices shown on the question paper */
  options?: string[];
  /** Correct answer for the answer key (not shown inline on student paper) */
  answer?: string;
}

export interface PaperSection {
  id: string;
  title: string;
  instruction: string;
  questions: PaperQuestion[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration: string;
  sections: PaperSection[];
}

export type AssignmentStatus = "queued" | "generating" | "completed" | "failed";

export interface AssignmentRecord extends AssignmentInput {
  id: string;
  status: AssignmentStatus;
  jobId?: string;
  result?: GeneratedPaper;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobProgressEvent {
  assignmentId: string;
  jobId?: string;
  status: AssignmentStatus;
  progress?: number;
  message?: string;
  result?: GeneratedPaper;
  error?: string;
}
