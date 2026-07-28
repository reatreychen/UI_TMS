import { Star, ShieldCheck } from "lucide-react";
import { REPORTS_KPIS } from "@/src/data/agentReports";

export function ReportsKPIs() {
  return (
    <div className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
      {REPORTS_KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-outline-variant bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex items-start justify-between">
            <span className="font-label-md text-label-md text-secondary">
              {kpi.label}
            </span>
            {kpi.badge && (
              <div
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  kpi.badgeColor === "green"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {kpi.badge}
              </div>
            )}
            {kpi.icon === "star" && (
              <Star
                aria-hidden
                className="size-5 text-yellow-500"
                fill="currentColor"
              />
            )}
            {kpi.icon === "verified" && (
              <ShieldCheck aria-hidden className="size-5 text-primary" />
            )}
          </div>
          <div className="font-display text-display text-on-background">
            {kpi.value}
            {kpi.valueSuffix && (
              <span className="text-headline-md text-secondary">
                {kpi.valueSuffix}
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-secondary">{kpi.footer}</p>
        </div>
      ))}
    </div>
  );
}
