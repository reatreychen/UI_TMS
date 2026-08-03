import type { ReportPerformanceBar } from "@/src/constants/agentReports";

const MAX_BAR_HEIGHT = 160; // px

export function ReportsPerformanceStats({ performance }: { performance: ReportPerformanceBar[] }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <h3 className="mb-6 text-headline-md font-headline-md">
        Performance vs Team Average
      </h3>
      <div className="flex h-[180px] items-end justify-around gap-8">
        {performance.map((item) => (
          <div
            key={item.metric}
            className="flex w-full flex-col items-center gap-4"
          >
            <div className="flex w-full justify-center gap-1">
              <div
                className="w-8 rounded-t-sm bg-surface-dim"
                style={{
                  height: `${(item.teamAvgHeight / 100) * MAX_BAR_HEIGHT}px`,
                }}
                title="Team Avg"
              />
              <div
                className="w-8 rounded-t-sm bg-primary"
                style={{
                  height: `${(item.myHeight / 100) * MAX_BAR_HEIGHT}px`,
                }}
                title="You"
              />
            </div>
            <span className="font-label-md text-label-md text-secondary">
              {item.metric}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          <span className="text-[12px] text-secondary">My Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-surface-dim" />
          <span className="text-[12px] text-secondary">Team Average</span>
        </div>
      </div>
    </div>
  );
}
