"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AGENT_MY_TICKETS } from "@/src/constants/agentMyTickets";
import type { AgentTicketRow } from "@/src/constants/agentMyTickets";

import { useState, useEffect } from "react";
import { fetchMyTickets } from "@/src/services/portalService";
import { formatDistanceToNow } from "date-fns";

export function TicketsTable() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets({ limit: 50 })
      .then(data => setTickets(data))
      .catch(err => console.error("Failed to load agent tickets", err))
      .finally(() => setLoading(false));
  }, []);

  const getPriorityIcon = (priority: string = "medium") => {
    switch (priority) {
      case "critical":
        return (
          <AlertCircle
            aria-hidden
            className="size-6 text-error"
            fill="currentColor"
          />
        );
      case "medium":
        return (
          <AlertTriangle
            aria-hidden
            className="size-6 text-[#F59E0B]"
            fill="currentColor"
          />
        );
      case "low":
        return <Info aria-hidden className="size-6 text-outline" />;
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="w-16 px-6 py-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                Prio
              </th>
              <th className="px-6 py-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                Ticket ID
              </th>
              <th className="px-6 py-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                Subject
              </th>
              <th className="px-6 py-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                Customer
              </th>
              <th className="px-6 py-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-6 py-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                Last Activity
              </th>
              <th className="w-10 px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="ticket-row-hover group cursor-pointer transition-colors hover:bg-surface-container-low"
              >
                <td className="px-6 py-4" title={`${ticket.priority} Priority`}>
                  {getPriorityIcon(ticket.priority?.toLowerCase())}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/agent/tickets/${ticket.id}`}
                    className="font-code text-code font-bold text-primary hover:underline"
                  >
                    #{ticket.ticketNumber || ticket.id.slice(0,8)}
                  </Link>
                </td>
                <td className="max-w-xs px-6 py-4">
                  <p className="truncate font-bold text-on-surface">
                    {ticket.subject}
                  </p>
                  <p className="truncate text-label-md text-on-surface-variant">
                    {ticket.category?.name || "Uncategorized"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {ticket.customer?.avatarUrl ? (
                      <Image
                        src={ticket.customer.avatarUrl}
                        alt={ticket.customer.fullName || ticket.customer.name || "Customer"}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
                        {(ticket.customer?.fullName || ticket.customer?.name || "C").substring(0,2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-body-md font-medium">
                      {ticket.customer?.fullName || ticket.customer?.name || "Unknown Customer"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-label-md font-bold bg-surface-container-high text-on-surface-variant`}
                  >
                    {ticket.status?.replace(/_/g, " ") || "UNKNOWN"}
                  </span>
                </td>
                <td className="text-body-md text-on-surface-variant px-6 py-4">
                  {formatDistanceToNow(new Date(ticket.updatedAt || ticket.createdAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-4">
                  <div className="row-actions flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link href={`/agent/tickets/${ticket.id}`} className="p-1 transition-colors hover:text-primary">
                      <Edit aria-hidden className="size-5" />
                    </Link>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-4">
        <p className="text-label-md text-on-surface-variant">
          Showing <span className="font-bold">{tickets.length > 0 ? 1 : 0}-{tickets.length}</span>{" "}
          of {tickets.length} tickets
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-outline-variant p-2 text-on-surface-variant transition-all hover:bg-surface-container-high disabled:opacity-50"
            disabled
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button className="h-10 w-10 rounded-lg bg-primary text-label-md font-bold text-on-primary shadow-sm">
            1
          </button>
          <button className="rounded-lg border border-outline-variant p-2 text-on-surface-variant transition-all hover:bg-surface-container-high">
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
