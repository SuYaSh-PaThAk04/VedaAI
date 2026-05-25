"use client";

import { useRouter } from "next/navigation";
import { DragEvent, FormEvent, useState } from "react";
import { createAssignment } from "@/lib/api";
import { useAssignmentStore } from "@/store/assignment-store";
import { QuestionConfigRow } from "./question-config-row";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["application/pdf", "text/plain"];

function isSupportedFile(file: File) {
  const name = file.name.toLowerCase();
  return ACCEPTED_FILE_TYPES.includes(file.type) || name.endsWith(".pdf") || name.endsWith(".txt");
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateForm(form: ReturnType<typeof useAssignmentStore.getState>["form"]) {
  if (!form.title || !form.subject || !form.grade || !form.dueDate) {
    return "Please fill title, subject, grade, and due date.";
  }

  const invalidConfig = form.questionConfigs.some((config) => config.count <= 0 || config.marks <= 0);
  if (invalidConfig) {
    return "Question count and marks must be positive values.";
  }

  return "";
}

export function AssignmentForm() {
  const router = useRouter();
  const { form, setField, addQuestionConfig, updateQuestionConfig, removeQuestionConfig, setCurrentAssignment } =
    useAssignmentStore();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalQuestions = form.questionConfigs.reduce((sum, config) => sum + config.count, 0);
  const totalMarks = form.questionConfigs.reduce((sum, config) => sum + config.count * config.marks, 0);

  function handleSelectedFile(file?: File) {
    if (!file) {
      return;
    }

    if (!isSupportedFile(file)) {
      setField("file", undefined);
      setError("Please upload a PDF or TXT file.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setField("file", undefined);
      setError("File must be 10MB or smaller.");
      return;
    }

    setField("file", file);
    setError("");
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    handleSelectedFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("subject", form.subject);
      data.append("grade", form.grade);
      data.append("dueDate", form.dueDate);
      data.append("instructions", form.instructions ?? "");
      data.append("sourceText", form.sourceText ?? "");
      data.append("questionConfigs", JSON.stringify(form.questionConfigs));
      if (form.file) {
        data.append("file", form.file);
      }

      const assignment = await createAssignment(data);
      setCurrentAssignment(assignment);
      router.push(`/assignments/${assignment.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create assignment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-[630px] gap-4 md:gap-5">
      <div className="h-1 rounded-full bg-[#dbdbdb]">
        <div className="h-full w-1/2 rounded-full bg-[#383838]" />
      </div>

      <div className="veda-form-card rounded-[22px] bg-[#f4f4f4] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:rounded-[24px] md:p-7">
        <div className="mb-5 md:mb-7">
          <h2 className="text-lg font-extrabold">Assignment Details</h2>
          <p className="text-xs font-medium text-[#8a8a8a]">Basic information about your assignment</p>
        </div>

        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="veda-upload-zone grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[#d5d5d5] bg-white px-4 py-7 text-center transition duration-300 hover:border-[#ff7a4d] hover:shadow-[0_14px_28px_rgba(255,107,61,0.12)] md:px-6 md:py-9"
        >
          <input
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={(event) => {
              handleSelectedFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
            className="sr-only"
          />
          <span className="text-2xl">↥</span>
          <span className="mt-3 text-sm font-extrabold">
            {form.file ? "File ready for upload" : "Choose a file or drag & drop it here"}
          </span>
          <span className="mt-1 text-[10px] font-semibold text-[#aaa]">
            {form.file ? `${form.file.name} (${formatFileSize(form.file.size)})` : "PDF or TXT, up to 10MB"}
          </span>
          <span className="veda-light-control mt-4 rounded-full bg-[#f3f3f3] px-5 py-2 text-xs font-bold">Browse Files</span>
        </label>

        <p className="mt-3 text-center text-xs font-medium text-[#8f8f8f]">Upload a PDF or text file to guide question generation</p>
        {form.file ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-xs font-bold shadow-sm">
            <span className="min-w-0 truncate text-[#2f2f2f]">{form.file.name}</span>
            <button type="button" onClick={() => setField("file", undefined)} className="shrink-0 text-[#ff6b3d]">
              Remove
            </button>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-2 text-xs font-extrabold">
              Title
              <input
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="Quiz on Electricity"
                className="veda-light-control h-9 rounded-full bg-white px-4 text-xs font-semibold outline-none"
              />
            </label>
            <label className="grid gap-2 text-xs font-extrabold">
              Subject
              <input
                value={form.subject}
                onChange={(event) => setField("subject", event.target.value)}
                placeholder="Science"
                className="veda-light-control h-9 rounded-full bg-white px-4 text-xs font-semibold outline-none"
              />
            </label>
            <label className="grid gap-2 text-xs font-extrabold">
              Class
              <input
                value={form.grade}
                onChange={(event) => setField("grade", event.target.value)}
                placeholder="8th"
                className="veda-light-control h-9 rounded-full bg-white px-4 text-xs font-semibold outline-none"
              />
            </label>
          </div>

          <label className="grid gap-2 text-xs font-extrabold">
            Due Date
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => setField("dueDate", event.target.value)}
              className="veda-light-control h-9 rounded-full bg-white px-4 text-xs font-semibold text-[#999] outline-none"
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="mb-2 hidden grid-cols-[1fr_18px_86px_86px] gap-3 text-xs font-extrabold sm:grid">
            <span>Question Type</span>
            <span />
            <span>No. of Questions</span>
            <span>Marks</span>
          </div>

          <div className="grid gap-3">
            {form.questionConfigs.map((config) => (
              <QuestionConfigRow
                key={config.id}
                config={config}
                canRemove={form.questionConfigs.length > 1}
                onChange={(patch) => updateQuestionConfig(config.id, patch)}
                onRemove={() => removeQuestionConfig(config.id)}
              />
            ))}
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <button type="button" onClick={addQuestionConfig} className="flex items-center gap-2 text-xs font-bold">
              <span className="grid size-7 place-items-center rounded-full bg-[#1f1f1f] text-white">+</span>
              Add Question Type
            </button>
            <div className="shrink-0 text-right text-xs font-extrabold leading-5">
              <p>Total Questions : {totalQuestions}</p>
              <p>Total Marks : {totalMarks}</p>
            </div>
          </div>
        </div>

        <label className="mt-6 grid gap-2 text-xs font-extrabold">
          Additional Information (For better output)
          <textarea
            rows={4}
            value={form.instructions}
            onChange={(event) => setField("instructions", event.target.value)}
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            className="resize-none rounded-2xl border border-dashed border-[#d4d4d4] bg-white px-4 py-3 text-xs font-semibold outline-none"
          />
        </label>

        {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
      </div>

      <div className="flex items-center justify-between px-2 md:px-0">
        <button type="button" className="veda-light-control rounded-full bg-white px-5 py-3 text-xs font-extrabold shadow-sm">
          ← Previous
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#111] px-6 py-3 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Next →"}
        </button>
      </div>
    </form>
  );
}
