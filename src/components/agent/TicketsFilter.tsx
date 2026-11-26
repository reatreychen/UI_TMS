"use client";

import { Search, Filter } from "lucide-react";

export type FilterTab = "Active" | "Pending" | "Resolved" | "All";

interface TicketsFilterProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  activeCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  priorityFilter: string;
  onPriorityChange: (p: string) => void;
}

export function TicketsFilter({
  activeTab,
  onTabChange,
  activeCount,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
}: TicketsFilterProps) {
  const tabs: FilterTab[] = ["Active", "Pending", "Resolved", "All"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">
            My Tickets
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            You have <span className="font-bold text-primary">{activeCount} active tickets</span>{" "}
            assigned to you today.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl bg-surface-container-high p-1 shadow-xs">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`rounded-lg px-4 py-2 text-label-md transition-all cursor-pointer ${
                  isActive
                    ? "bg-surface-container-lowest font-bold text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-outline-variant shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subject, ticket ID, or customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-body-md text-slate-800 outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="size-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
