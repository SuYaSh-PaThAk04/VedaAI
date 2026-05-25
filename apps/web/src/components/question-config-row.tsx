"use client";

import type { QuestionConfig, QuestionType } from "@vedaai/shared";

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "multiple-choice", label: "Multiple Choice Questions" },
  { value: "short-answer", label: "Short Questions" },
  { value: "long-answer", label: "Diagram/Graph-Based Questions" },
  { value: "true-false", label: "Numerical Problems" }
];

interface QuestionConfigRowProps {
  config: QuestionConfig;
  canRemove: boolean;
  onChange: (patch: Partial<QuestionConfig>) => void;
  onRemove: () => void;
}

export function QuestionConfigRow({ config, canRemove, onChange, onRemove }: QuestionConfigRowProps) {
  return (
    <div className="veda-light-control grid gap-2 rounded-2xl bg-white p-2 sm:grid-cols-[1fr_18px_86px_86px] sm:items-center sm:bg-transparent sm:p-0">
      <label className="grid gap-1 text-xs font-bold text-[#2f2f2f]">
        <select
          value={config.type}
          onChange={(event) => onChange({ type: event.target.value as QuestionType })}
          className="veda-light-control h-9 rounded-full bg-white px-4 text-xs font-semibold shadow-sm outline-none"
        >
          {questionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-[1fr_1fr_24px] gap-2 sm:contents">
        <button
          type="button"
          disabled={!canRemove}
          onClick={onRemove}
          className="order-3 text-lg font-bold text-[#444] disabled:cursor-not-allowed disabled:opacity-35 sm:order-none"
          aria-label="Remove question type"
        >
          ×
        </button>

        <div className="veda-light-control flex h-9 items-center justify-between rounded-full bg-[#f6f6f6] px-3 text-xs font-bold shadow-sm sm:bg-white">
          <button type="button" onClick={() => onChange({ count: Math.max(1, config.count - 1) })} className="text-[#b8b8b8]">
            −
          </button>
          <span>{config.count}</span>
          <button type="button" onClick={() => onChange({ count: config.count + 1 })} className="text-[#b8b8b8]">
            +
          </button>
        </div>

        <div className="veda-light-control flex h-9 items-center justify-between rounded-full bg-[#f6f6f6] px-3 text-xs font-bold shadow-sm sm:bg-white">
          <button type="button" onClick={() => onChange({ marks: Math.max(1, config.marks - 1) })} className="text-[#b8b8b8]">
            −
          </button>
          <span>{config.marks}</span>
          <button type="button" onClick={() => onChange({ marks: config.marks + 1 })} className="text-[#b8b8b8]">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
