import type { Difficulty } from "@vedaai/shared";

const styles: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  hard: "bg-rose-50 text-rose-700 ring-rose-200"
};

const labels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Hard"
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${styles[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
}
