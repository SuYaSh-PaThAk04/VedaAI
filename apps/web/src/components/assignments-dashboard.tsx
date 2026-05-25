"use client";

import type { AssignmentRecord } from "@vedaai/shared";
import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteAssignment } from "@/lib/api";

function formatDate(date?: string) {
  if (!date) {
    return "--";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB").replaceAll("/", "-");
}

function EmptyAssignments() {
  return (
    <div className="grid h-full place-items-center px-5 py-10 pb-28 text-center md:py-16 md:pb-10">
      <div className="grid max-w-md justify-items-center">
        <div className="relative mb-7 size-40 md:size-44">
          <div className="absolute inset-3 rounded-full bg-white" />
          <div className="absolute left-14 top-8 h-24 w-20 rounded-2xl bg-white shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
            <div className="mx-auto mt-6 h-2 w-10 rounded-full bg-[#0d3046]" />
            <div className="mx-auto mt-5 h-2 w-12 rounded-full bg-[#d9d9d9]" />
            <div className="mx-auto mt-4 h-2 w-12 rounded-full bg-[#d9d9d9]" />
          </div>
          <div className="absolute right-12 top-14 grid size-20 place-items-center rounded-full border-[7px] border-[#d6d2eb] bg-white text-5xl font-black text-[#ff2f2f] shadow-lg">
            ×
          </div>
          <div className="absolute bottom-9 right-7 h-12 w-4 rotate-[-38deg] rounded-full bg-[#d6d2eb]" />
          <div className="absolute right-4 top-8 h-8 w-14 rounded-md bg-white shadow-sm">
            <div className="ml-2 mt-2 inline-block size-2 rounded-full bg-[#c8c8d0]" />
            <div className="ml-2 inline-block h-2 w-7 rounded-full bg-[#c8c8d0]" />
          </div>
          <div className="absolute left-3 top-7 h-12 w-10 rounded-full border-4 border-transparent border-t-[#25313d] rotate-[-28deg]" />
          <div className="absolute bottom-10 left-9 text-3xl text-[#2b82aa]">✧</div>
          <div className="absolute right-0 bottom-16 size-3 rounded-full bg-[#3b89a9]" />
        </div>

        <h1 className="text-lg font-extrabold md:text-xl">No assignments yet</h1>
        <p className="mt-2 text-xs leading-5 text-[#777] md:text-sm md:leading-6">
          Create your first assignment to start collecting and grading student submissions. You can set up rubrics,
          define marking criteria, and let AI assist with grading.
        </p>
        <Link
          href="/create"
          className="mt-7 rounded-full bg-[#111] px-6 py-3 text-xs font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] md:px-8 md:text-sm"
        >
          + Create Your First Assignment
        </Link>
      </div>
    </div>
  );
}

function AssignmentCard({
  assignment,
  onDelete
}: {
  assignment: AssignmentRecord;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="veda-card relative min-h-[118px] rounded-[20px] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(0,0,0,0.12)] md:min-h-[142px] md:rounded-[22px] md:p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="absolute right-5 top-5 grid size-8 place-items-center rounded-full text-2xl leading-none text-[#aaa] hover:bg-[#f2f2f2]"
        aria-label="Open assignment menu"
      >
        ⋮
      </button>

      {open ? (
        <div className="veda-dropdown absolute right-12 top-11 z-10 grid w-36 overflow-hidden rounded-xl bg-white p-1 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <Link href={`/assignments/${assignment.id}`} className="rounded-lg px-3 py-3 font-semibold hover:bg-[#f5f5f5]">
            View Assignment
          </Link>
          <button
            type="button"
            onClick={() => onDelete(assignment.id)}
            className="rounded-lg px-3 py-3 text-left font-semibold text-[#df4338] hover:bg-[#f5f5f5]"
          >
            Delete
          </button>
        </div>
      ) : null}

      <Link href={`/assignments/${assignment.id}`} className="block pr-8">
        <h2 className="text-base font-extrabold tracking-tight text-[#252525] md:text-2xl">
          {assignment.title || "Untitled Assignment"}
        </h2>
        <div className="mt-7 flex flex-wrap justify-between gap-2 text-xs text-[#7d7d7d] md:mt-14 md:gap-4 md:text-sm">
          <p>
            <span className="font-extrabold text-[#333]">Assigned on :</span> {formatDate(assignment.createdAt)}
          </p>
          <p>
            <span className="font-extrabold text-[#333]">Due :</span> {formatDate(assignment.dueDate)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function AssignmentsDashboard({ initialAssignments }: { initialAssignments: AssignmentRecord[] }) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [query, setQuery] = useState("");

  const filteredAssignments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return assignments;
    }

    return assignments.filter((assignment) =>
      [assignment.title, assignment.subject, assignment.grade].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [assignments, query]);

  async function handleDelete(id: string) {
    await deleteAssignment(id);
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
  }

  if (!assignments.length) {
    return (
      <>
        <div className="veda-mobile-title flex items-center gap-3 border-b border-[#c8c8c8] bg-[#d0d0d0] px-4 py-3 md:hidden">
          <Link href="/" className="veda-icon-btn grid size-8 place-items-center rounded-full bg-white text-lg">
            ←
          </Link>
          <h1 className="flex-1 text-center text-sm font-extrabold">Assignments</h1>
          <span className="size-8" />
        </div>
        <EmptyAssignments />
      </>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto px-3 pb-28 pt-0 md:px-5 md:pb-24 md:pt-6">
      <div className="veda-mobile-title flex items-center gap-3 border-b border-[#c8c8c8] bg-[#d0d0d0] px-2 py-3 md:hidden">
        <Link href="/" className="veda-icon-btn grid size-8 place-items-center rounded-full bg-white text-lg">
          ←
        </Link>
        <h1 className="flex-1 text-center text-sm font-extrabold">Assignments</h1>
        <span className="size-8" />
      </div>
      <div className="mb-4 hidden items-start gap-3 md:flex">
        <span className="mt-2 size-3 rounded-full bg-[#32d873]" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Assignments</h1>
          <p className="text-sm font-medium text-[#9b9b9b]">Manage and create assignments for your classes.</p>
        </div>
      </div>

      <div className="veda-card mb-4 flex flex-row items-center gap-3 rounded-[16px] bg-white p-3 shadow-sm md:rounded-[22px] md:flex-row md:justify-between">
        <button type="button" className="flex shrink-0 items-center gap-2 rounded-full px-1 text-xs font-semibold text-[#aaa] md:text-sm">
          ▽ <span className="hidden sm:inline">Filter By</span><span className="sm:hidden">Filter</span>
        </button>
        <label className="relative block min-w-0 flex-1 md:w-[360px] md:flex-none">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#bbb]">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Assignment"
            className="h-11 w-full rounded-full border border-[#dddddd] bg-white pl-11 pr-4 text-sm font-semibold outline-none placeholder:text-[#b7b7b7]"
          />
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} onDelete={handleDelete} />
        ))}
      </div>

      <Link
        href="/create"
        className="fixed bottom-24 right-5 z-20 grid size-12 place-items-center rounded-full bg-white text-2xl font-normal text-[#ff6b3d] shadow-[0_10px_25px_rgba(0,0,0,0.22)] md:bottom-7 md:left-1/2 md:right-auto md:size-auto md:-translate-x-1/2 md:bg-[#111] md:px-8 md:py-3 md:text-sm md:font-bold md:text-white"
      >
        <span className="md:hidden">+</span>
        <span className="hidden md:inline">+ Create Assignment</span>
      </Link>
    </div>
  );
}
