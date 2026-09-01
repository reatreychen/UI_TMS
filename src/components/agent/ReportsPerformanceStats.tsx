import type { ReportPerformanceBar } from "@/src/constants/agentReports";

const MAX_BAR_HEIGHT = 160; // px

export function ReportsPerformanceStats({ performance }: { performance: ReportPerformanceBar[] }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <h3 className="mb-6 text-headline-md font-headline-md">
        Performance vs Team Average
      </h3>
      <div className="flex h-[200px] items-end justify-around gap-6 pt-4">
        {performance.map((item) => {
          const teamHeight = Math.max(6, (item.teamAvgHeight / 100) * MAX_BAR_HEIGHT);
          const myHeight = Math.max(6, (item.myHeight / 100) * MAX_BAR_HEIGHT);

          return (
            <div
              key={item.metric}
              className="flex w-full flex-col items-center gap-3"
            >
              <div className="flex h-[160px] w-full items-end justify-center gap-1.5">
                <div
                  className="w-7 rounded-t-md bg-blue-100 transition-all duration-300 hover:bg-blue-200"
                  style={{ height: `${teamHeight}px` }}
                  title={`Team Average: ${item.teamAvgHeight}%`}
                />
                <div
                  className="w-7 rounded-t-md bg-primary transition-all duration-300 hover:brightness-110"
                  style={{ height: `${myHeight}px` }}
                  title={`My Performance: ${item.myHeight}%`}
                />
              </div>
              <span className="font-label-md text-label-md text-secondary font-semibold">
                {item.metric}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          <span className="text-[12px] text-secondary">My Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-blue-100 border border-blue-200" />
          <span className="text-[12px] text-secondary">Team Average</span>
        </div>
      </div>
    </div>
  );
}
