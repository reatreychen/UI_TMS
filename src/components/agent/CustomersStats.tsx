import { Users, Zap, UserPlus } from "lucide-react";
import { AGENT_CUSTOMERS_STATS } from "@/src/data/agentCustomers";

export function CustomersStats() {
  return (
    <div className="mb-stack-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
      <div className="group flex items-center justify-between rounded-lg border border-outline-variant bg-white p-gutter shadow-sm transition-colors hover:border-primary">
        <div>
          <p className="mb-1 font-label-md text-on-surface-variant">
            Total Customers
          </p>
          <p className="font-display text-display leading-tight text-on-surface">
            {AGENT_CUSTOMERS_STATS.totalCustomers}
          </p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
          <Users aria-hidden className="size-8" style={{ fontVariationSettings: "'FILL' 1" }} />
        </div>
      </div>
      <div className="group flex items-center justify-between rounded-lg border border-outline-variant bg-white p-gutter shadow-sm transition-colors hover:border-primary">
        <div>
          <p className="mb-1 font-label-md text-on-surface-variant">
            Active Today
          </p>
          <p className="font-display text-display leading-tight text-on-surface">
            {AGENT_CUSTOMERS_STATS.activeToday}
          </p>
        </div>
        <div className="rounded-xl bg-secondary-container/30 p-3 text-secondary transition-transform group-hover:scale-110">
          <Zap aria-hidden className="size-8" style={{ fontVariationSettings: "'FILL' 1" }} />
        </div>
      </div>
      <div className="group flex items-center justify-between rounded-lg border border-outline-variant bg-white p-gutter shadow-sm transition-colors hover:border-primary">
        <div>
          <p className="mb-1 font-label-md text-on-surface-variant">
            New This Week
          </p>
          <p className="font-display text-display leading-tight text-on-surface">
            {AGENT_CUSTOMERS_STATS.newThisWeek}
          </p>
        </div>
        <div className="rounded-xl bg-surface-variant/30 p-3 text-on-surface-variant transition-transform group-hover:scale-110">
          <UserPlus aria-hidden className="size-8" style={{ fontVariationSettings: "'FILL' 1" }} />
        </div>
      </div>
    </div>
  );
}
