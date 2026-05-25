"use client";

import type { AssignmentRecord, GeneratedPaper, PaperQuestion } from "@vedaai/shared";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAssignmentSocket } from "@/hooks/use-assignment-socket";
import { regenerateAssignment } from "@/lib/api";
import { useAssignmentStore } from "@/store/assignment-store";
import { PaperPreview } from "./paper-preview";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function difficultyLabel(difficulty: PaperQuestion["difficulty"]) {
  if (difficulty === "medium") {
    return "Moderate";
  }

  if (difficulty === "hard") {
    return "Challenging";
  }

  return "Easy";
}

function sectionHeading(question?: PaperQuestion) {
  if (question?.type === "multiple-choice") {
    return "Multiple Choice Questions";
  }

  if (question?.type === "short-answer") {
    return "Short Answer Questions";
  }

  if (question?.type === "true-false") {
    return "True / False Questions";
  }

  return "Questions";
}

function renderQuestion(question: PaperQuestion, index: number) {
  const options = question.options?.length
    ? `<ul class="options">${question.options.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ul>`
    : "";

  return `
    <li class="question">
      <p>${index + 1}. [${difficultyLabel(question.difficulty)}] ${escapeHtml(question.text)} [${question.marks} Marks]</p>
      ${options}
    </li>
  `;
}

function buildPaperPrintHtml(paper: GeneratedPaper) {
  const answers = paper.sections.flatMap((section) => section.questions).filter((question) => question.answer);

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(paper.title)} - Question Paper</title>
    <style>
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #111;
        background: #fff;
        font-family: Inter, Arial, Helvetica, sans-serif;
        font-size: 11px;
        line-height: 1.45;
      }
      .paper { width: 100%; }
      .center { text-align: center; }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 18px; font-weight: 800; }
      .meta-title { margin-top: 2px; font-size: 13px; font-weight: 800; }
      .top-row {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        font-weight: 700;
      }
      .instructions { margin-top: 12px; font-weight: 700; }
      .student-info {
        display: grid;
        gap: 5px;
        width: 230px;
        margin-top: 12px;
        font-weight: 700;
      }
      .line-row { display: flex; gap: 8px; align-items: end; }
      .line { flex: 1; border-bottom: 1px solid #111; height: 14px; }
      section { margin-top: 18px; break-inside: auto; page-break-inside: auto; }
      h2 { text-align: center; font-size: 15px; font-weight: 800; break-after: avoid; page-break-after: avoid; }
      h3 { margin-top: 14px; font-size: 12px; font-weight: 800; break-after: avoid; page-break-after: avoid; }
      .section-instruction { font-size: 11px; font-style: italic; }
      ol { margin: 10px 0 0; padding-left: 18px; }
      .question { margin-bottom: 9px; break-inside: avoid; page-break-inside: avoid; }
      .options {
        display: grid;
        gap: 2px;
        margin: 5px 0 0 22px;
        padding: 0;
        list-style: none;
      }
      .end { margin-top: 10px; font-weight: 800; }
      .answer-key {
        margin-top: 34px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
      }
      .answer-key h2 { text-align: left; }
    </style>
  </head>
  <body>
    <article class="paper">
      <header class="center">
        <h1>Delhi Public School, Sector-4, Bokaro</h1>
        <p class="meta-title">Subject: ${escapeHtml(paper.subject)}</p>
        <p class="meta-title">Class: ${escapeHtml(paper.grade)}</p>
        <p class="meta-title">${escapeHtml(paper.title)}</p>
      </header>

      <div class="top-row">
        <span>Time Allowed: ${escapeHtml(paper.duration)}</span>
        <span>Maximum Marks: ${paper.totalMarks}</span>
      </div>

      <p class="instructions">All questions are compulsory unless stated otherwise.</p>

      <div class="student-info">
        <div class="line-row"><span>Name:</span><span class="line"></span></div>
        <div class="line-row"><span>Roll Number:</span><span class="line"></span></div>
        <div class="line-row"><span>Section:</span><span class="line"></span></div>
      </div>

      ${paper.sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.title)}</h2>
              <h3>${sectionHeading(section.questions[0])}</h3>
              <p class="section-instruction">${escapeHtml(section.instruction)}</p>
              <ol>
                ${section.questions.map((question, index) => renderQuestion(question, index)).join("")}
              </ol>
            </section>
          `
        )
        .join("")}

      <p class="end">End Of Question Paper</p>

      ${
        answers.length
          ? `
            <section class="answer-key">
              <h2>Answer Key</h2>
              <ol>
                ${answers
                  .map((question, index) => `<li class="question">${index + 1}. ${escapeHtml(question.answer ?? "")}</li>`)
                  .join("")}
              </ol>
            </section>
          `
          : ""
      }
    </article>
  </body>
</html>
`;
}

export function AssignmentResultClient({ assignment }: { assignment: AssignmentRecord }) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localAssignment, setLocalAssignment] = useState(assignment);
  const progress = useAssignmentStore((state) => state.progress);
  const setCurrentAssignment = useAssignmentStore((state) => state.setCurrentAssignment);

  useAssignmentSocket(localAssignment.id);

  const paper = useMemo(() => progress?.result ?? localAssignment.result, [localAssignment.result, progress?.result]);

  function handleDownloadPdf() {
    if (!paper) {
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentWindow?.document;
    if (!iframeDocument) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDocument.open();
    iframeDocument.write(buildPaperPrintHtml(paper));
    iframeDocument.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      window.setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  }

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      const nextAssignment = await regenerateAssignment(localAssignment.id);
      setLocalAssignment(nextAssignment);
      setCurrentAssignment(nextAssignment);
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <DashboardShell active="toolkit" crumb="Create Now" ctaLabel="AI Teacher's Toolkit" ctaHref="/create">
      <div className="h-full overflow-y-auto bg-[#d0d0d0] p-2 md:bg-[#e8e8e8] md:p-3 print:bg-white print:p-0">
        <div className="no-print mb-3 rounded-[18px] bg-[#222] px-4 py-4 text-white md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-extrabold leading-5 md:text-sm md:leading-6">
                Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {localAssignment.grade}{" "}
                {localAssignment.subject} classes on the NCERT chapters:
              </p>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!paper}
                className="mt-4 hidden rounded-full bg-white px-5 py-2 text-xs font-extrabold text-[#222] disabled:cursor-not-allowed disabled:opacity-60 md:inline-flex"
              >
                ⇩ Download as PDF
              </button>
            </div>
            <div className="hidden gap-2 md:flex">
              <Link href="/create" className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                New
              </Link>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold disabled:opacity-60"
              >
                {isRegenerating ? "Regenerating" : "Regenerate"}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!paper}
            className="mt-4 grid size-10 place-items-center rounded-full bg-white text-lg text-[#222] disabled:opacity-60 md:hidden"
            aria-label="Download as PDF"
          >
            ⇩
          </button>
        </div>

        {paper ? (
          <PaperPreview paper={paper} />
        ) : (
          <div className="no-print mx-auto grid min-h-[420px] max-w-[820px] place-items-center rounded-t-[18px] bg-white p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.18)] md:min-h-[650px] md:p-8">
            <div>
              <h2 className="text-xl font-extrabold text-[#222]">Generating paper...</h2>
              <p className="mt-2 text-sm font-medium text-[#777]">Keep this page open to receive websocket updates.</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#aaa]">
                {progress?.message ?? localAssignment.status}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
