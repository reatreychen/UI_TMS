import { Star, MoreVertical, ChevronRight } from "lucide-react";
import { REPORTS_CONTRIBUTORS } from "@/src/data/agentReports";

export function ReportsContributorsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5">
        <h3 className="text-headline-md font-headline-md">
          Top Performance Contributors
        </h3>
        <button className="flex items-center font-label-md text-label-md font-bold text-primary hover:underline">
          View Full Rankings
          <ChevronRight aria-hidden className="ml-1 size-5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-secondary">
                Agent Name
              </th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-secondary">
                Tickets Resolved
              </th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-secondary">
                Average Rating
              </th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider text-secondary">
                SLA Met
              </th>
              <th className="px-6 py-4 text-right font-label-md text-label-md uppercase tracking-wider text-secondary">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {REPORTS_CONTRIBUTORS.map((agent) => (
              <tr
                key={agent.name}
                className="group transition-colors hover:bg-surface-container-low"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${agent.avatarColor}`}
                    >
                      {agent.initials}
                    </div>
                    <div>
                      <p className="font-body-md text-body-md font-semibold">
                        {agent.name}
                      </p>
                      <p className="text-[11px] text-secondary">{agent.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-body-md">
                  {agent.resolved}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star
                      aria-hidden
                      className="size-5 text-yellow-500"
                      fill="currentColor"
                    />
                    <span className="font-body-md text-body-md font-semibold">
                      {agent.rating}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded px-2 py-1 text-[11px] font-bold ${agent.slaColor}`}
                  >
                    {agent.slaMet}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-secondary opacity-0 transition-all hover:text-primary group-hover:opacity-100">
                    <MoreVertical aria-hidden className="size-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
