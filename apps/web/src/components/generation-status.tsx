"use client";

import type { AssignmentRecord } from "@vedaai/shared";
import { useAssignmentStore } from "@/store/assignment-store";

export function GenerationStatus({ assignment }: { assignment: AssignmentRecord }) {
  const progress = useAssignmentStore((state) => state.progress);
  const status = progress?.status ?? assignment.status;
  const value = progress?.progress ?? (status === "completed" ? 100 : status === "generating" ? 50 : 10);
  const message =
    progress?.message ??
    (status === "completed" ? "Question paper is ready." : "Waiting for realtime generation updates.");

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Generation status</p>
          <h2 className="mt-1 text-xl font-bold capitalize text-slate-950">{status}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{value}%</span>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${value}%` }} />
      </div>

      <p className="mt-3 text-sm text-slate-600">{message}</p>
      {progress?.error ?? assignment.error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{progress?.error ?? assignment.error}</p>
      ) : null}
    </div>
  );
}
