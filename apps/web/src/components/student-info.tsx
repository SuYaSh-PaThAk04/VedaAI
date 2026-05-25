export function StudentInfo() {
  const fields = ["Name", "Roll Number", "Section"];

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-3">
      {fields.map((field) => (
        <div key={field} className="flex items-end gap-3">
          <span className="text-sm font-semibold text-slate-700">{field}:</span>
          <span className="h-px flex-1 bg-slate-400" />
        </div>
      ))}
    </div>
  );
}
