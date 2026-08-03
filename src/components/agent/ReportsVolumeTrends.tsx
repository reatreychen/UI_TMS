"use client";

import { useState } from "react";
import type { ReportVolumeWeek } from "@/src/constants/agentReports";

export function ReportsVolumeTrends({ weeks }: { weeks: ReportVolumeWeek[] }) {
  const [tooltip, setTooltip] = useState<{ index: number } | null>(null);
  const maxVal = Math.max(
    1,
    ...weeks.map((w) => Math.max(w.resolved, w.newTickets))
  );

  return (
    <div className="mb-stack-lg rounded-xl border border-outline-variant bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-headline-md font-headline-md">
          Ticket Volume Trends
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary"></span>
            <span className="font-label-md text-label-md uppercase text-secondary">
              Resolved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-surface-dim"></span>
            <span className="font-label-md text-label-md uppercase text-secondary">
              New
            </span>
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="flex h-[300px] w-full items-end justify-between gap-2 px-2">
          {weeks.length === 0 ? (
            <p className="self-center text-body-md text-secondary">No ticket volume data available.</p>
          ) : weeks.map((week, index) => (
            <div
              key={week.week}
              className="group relative flex h-full flex-1 cursor-pointer items-end justify-center"
              onMouseEnter={() => setTooltip({ index })}
              onMouseLeave={() => setTooltip(null)}
            >
              {tooltip?.index === index && (
                <div className="absolute -top-12 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-inverse-surface px-2 py-1 text-[10px] text-white shadow-xl">
                  Resolved: {week.resolved}
                  <br />
                  New: {week.newTickets}
                </div>
              )}
              <div
                className="w-full max-w-[12px] rounded-t-sm bg-surface-dim transition-all group-hover:opacity-80"
                style={{ height: `${(week.newTickets / maxVal) * 100}%` }}
              />
              <div
                className="-ml-1 w-full max-w-[12px] rounded-t-sm bg-primary transition-all group-hover:scale-y-105"
                style={{ height: `${(week.resolved / maxVal) * 100}%` }}
              />
            </div>
          ))}
        </div>
        {/* X-axis labels */}
        <div className="mt-3 flex justify-between px-4 text-[11px] font-label-md text-secondary">
          {weeks.map((w) => (
            <span key={w.week}>{w.week}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
