"use client";

import { useState, useEffect } from "react";
import {
  Archive,
  CheckCircle2,
  Mail,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { ticketMetrics } from "@/src/constants/tickets";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import { fetchMyTickets } from "@/src/services/portalService";

const iconMap: Record<(typeof ticketMetrics)[number]["icon"], LucideIcon> = {
  mail: Mail,
  sync: RefreshCw,
  check: CheckCircle2,
  archive: Archive,
};

export function MetricCards() {
  const currentUser = useAppSelector(selectUser);
  const [metrics, setMetrics] = useState(ticketMetrics);

  useEffect(() => {
    fetchMyTickets(
      currentUser?.id ? { customerId: currentUser.id, limit: 100 } : { limit: 100 }
    )
      .then((data) => {
        let open = 0,
          inProgress = 0,
          resolved = 0,
          closed = 0;
        if (Array.isArray(data)) {
          data.forEach((t) => {
            const st = (t.status || "").toUpperCase();
            if (st === "OPEN" || st === "PENDING") open++;
            else if (
              st === "IN_PROGRESS" ||
              st === "ASSIGNED" ||
              st === "IN PROGRESS"
            )
              inProgress++;
            else if (st === "RESOLVED") resolved++;
            else if (st === "CLOSED") closed++;
          });
        }

        setMetrics([
          { ...ticketMetrics[0], count: open },
          { ...ticketMetrics[1], count: inProgress },
          { ...ticketMetrics[2], count: resolved },
          { ...ticketMetrics[3], label: "Closed", count: closed },
        ]);
      })
      .catch((err) => console.error("Failed to fetch stats", err));
  }, [currentUser]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ label, count, description, icon, iconClass }) => {
        const Icon = iconMap[icon];
        return (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 soft-shadow transition-colors hover:border-slate-300"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
              </span>
              <div className={`rounded-lg p-2 ${iconClass}`}>
                <Icon aria-hidden className="size-4" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {count.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
