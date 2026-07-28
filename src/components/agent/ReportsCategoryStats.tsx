import { REPORTS_CATEGORIES } from "@/src/data/agentReports";

export function ReportsCategoryStats() {
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <h3 className="mb-6 text-headline-md font-headline-md">
        Tickets by Category
      </h3>
      <div className="space-y-5">
        {REPORTS_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="mb-2 flex justify-between font-label-md text-label-md">
              <span>{cat.label}</span>
              <span className="font-bold">{cat.percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                style={{ width: `${cat.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
