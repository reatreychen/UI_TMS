"use client";

import {
  Archive,
  CheckCircle2,
  Mail,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

import { ticketMetrics } from "@/src/constants/tickets";

const iconMap: Record<(typeof ticketMetrics)[number]["icon"], LucideIcon> = {
  mail: Mail,
  sync: RefreshCw,
  check: CheckCircle2,
  archive: Archive,
};

import { useState, useEffect } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import { fetchMyTickets } from "@/src/services/portalService";

export function MetricCards() {
  const currentUser = useAppSelector(selectUser);
  const [metrics, setMetrics] = useState(ticketMetrics);

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyTickets({ customerId: currentUser.id, limit: 100 }).then((data) => {
        let open = 0, inProgress = 0, resolved = 0, closed = 0;
        data.forEach((t: any) => {
          if (t.status === "OPEN" || t.status === "PENDING") open++;
          else if (t.status === "IN_PROGRESS" || t.status === "ASSIGNED") inProgress++;
          else if (t.status === "RESOLVED") resolved++;
          else if (t.status === "CLOSED") closed++;
        });

        setMetrics([
          { ...ticketMetrics[0], count: open },
          { ...ticketMetrics[1], count: inProgress },
          { ...ticketMetrics[2], count: resolved },
          { ...ticketMetrics[3], label: "Closed", count: closed },
        ]);
      }).catch(err => console.error("Failed to fetch stats", err));
    }
  }, [currentUser]);

  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ label, count, description, icon, iconClass }) => {
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
