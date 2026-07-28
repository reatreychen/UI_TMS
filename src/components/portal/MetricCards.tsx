import {
  Archive,
  CheckCircle2,
  Mail,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

import { ticketMetrics } from "@/src/data/tickets";

const iconMap: Record<(typeof ticketMetrics)[number]["icon"], LucideIcon> = {
  mail: Mail,
  sync: RefreshCw,
  check: CheckCircle2,
  archive: Archive,
};

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
      {ticketMetrics.map(({ label, count, description, icon, iconClass }) => {
        const Icon = iconMap[icon];
        return (
          <div
            key={label}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-lg p-2 ${iconClass}`}>
                <Icon aria-hidden className="size-5" strokeWidth={2} />
              </div>
              <span className="text-label-md uppercase tracking-wider text-outline">
                {label}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-headline-lg font-semibold text-on-surface">
                {count.toLocaleString()}
              </p>
              <p className="text-body-md text-on-surface-variant">
                {description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
