"use client";

import { useState } from "react";

type FilterTab = "Active" | "Pending" | "Resolved" | "All";

export function TicketsFilter() {
  const [activeTab, setActiveTab] = useState<FilterTab>("Active");

  const tabs: FilterTab[] = ["Active", "Pending", "Resolved", "All"];

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="text-headline-lg font-headline-lg text-on-surface">
          My Tickets
        </h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          You have <span className="font-bold text-primary">14 active tickets</span>{" "}
          assigned to you today.
        </p>
      </div>

      <div className="flex w-fit items-center gap-2 rounded-xl bg-surface-container-high p-1">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-label-md transition-all ${
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
  );
}
