"use client";

import type { AssignmentInput, AssignmentRecord, JobProgressEvent, QuestionConfig } from "@vedaai/shared";
import { create } from "zustand";

interface AssignmentFormState extends AssignmentInput {
  file?: File;
}

interface AssignmentStore {
  form: AssignmentFormState;
  currentAssignment?: AssignmentRecord;
  progress?: JobProgressEvent;
  setField: <K extends keyof AssignmentFormState>(key: K, value: AssignmentFormState[K]) => void;
  addQuestionConfig: () => void;
  updateQuestionConfig: (id: string, patch: Partial<QuestionConfig>) => void;
  removeQuestionConfig: (id: string) => void;
  setCurrentAssignment: (assignment: AssignmentRecord) => void;
  setProgress: (progress: JobProgressEvent) => void;
}

const initialQuestionConfig: QuestionConfig = {
  id: "short-answer",
  type: "short-answer",
  count: 5,
  marks: 2
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  form: {
    title: "",
    subject: "",
    grade: "",
    dueDate: "",
    questionConfigs: [initialQuestionConfig],
    instructions: "",
    sourceText: ""
  },
  setField: (key, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [key]: value
      }
    })),
  addQuestionConfig: () =>
    set((state) => ({
      form: {
        ...state.form,
        questionConfigs: [
          ...state.form.questionConfigs,
          {
            id: crypto.randomUUID(),
            type: "multiple-choice",
            count: 5,
            marks: 1
          }
        ]
      }
    })),
  updateQuestionConfig: (id, patch) =>
    set((state) => ({
      form: {
        ...state.form,
        questionConfigs: state.form.questionConfigs.map((config) =>
          config.id === id ? { ...config, ...patch } : config
        )
      }
    })),
  removeQuestionConfig: (id) =>
    set((state) => ({
      form: {
        ...state.form,
        questionConfigs: state.form.questionConfigs.filter((config) => config.id !== id)
      }
    })),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  setProgress: (progress) => set({ progress })
}));
