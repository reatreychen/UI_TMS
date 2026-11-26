"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface TicketsTableProps {
  tickets?: any[];
  loading?: boolean;
}

export function TicketsTable({ tickets: externalTickets, loading: externalLoading }: TicketsTableProps) {
  const [internalTickets, setInternalTickets] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const tickets = externalTickets !== undefined ? externalTickets : internalTickets;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    if (externalTickets === undefined) {
      const { fetchMyTickets } = require("@/src/services/portalService");
      fetchMyTickets({ limit: 500 })
        .then((data: any) => setInternalTickets(data))
        .catch((err: any) => console.error("Failed to load agent tickets", err))
        .finally(() => setInternalLoading(false));
    }
  }, [externalTickets]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tickets.length]);

  const totalPages = Math.max(1, Math.ceil(tickets.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTickets = tickets.slice(startIndex, startIndex + pageSize);
  const startItem = tickets.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + pageSize, tickets.length);

  const getPriorityIcon = (priority: string = "medium") => {
    switch (priority.toLowerCase()) {
      case "critical":
        return (
          <AlertCircle
            aria-hidden
            className="size-6 text-error"
            fill="currentColor"
          />
        );
      case "high":
      case "medium":
        return (
          <AlertTriangle
            aria-hidden
            className="size-6 text-[#F59E0B]"
            fill="currentColor"
          />
        );
      default:
        return <Info aria-hidden className="size-6 text-outline" />;
    }
  };

  const getStatusBadge = (status: string = "") => {
    const s = status.toUpperCase();
    if (s === "RESOLVED" || s === "CLOSED") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (s === "PENDING") {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (s === "IN_PROGRESS") {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }
    return "bg-slate-100 text-slate-700 border border-slate-200";
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
              paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="ticket-row-hover group cursor-pointer transition-colors hover:bg-surface-container-low"
                >
                  <td className="px-6 py-4" title={`${ticket.priority} Priority`}>
                    {getPriorityIcon(ticket.priority)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/agent/tickets/${ticket.id}`}
                      className="font-code text-code font-bold text-primary hover:underline"
                    >
                      #{ticket.ticketNumber || ticket.id.slice(0, 8)}
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
                          {(ticket.customer?.fullName || ticket.customer?.name || "C").substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-body-md font-medium">
                        {ticket.customer?.fullName || ticket.customer?.name || "Unknown Customer"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-label-md font-bold ${getStatusBadge(ticket.status)}`}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-4 gap-4">
        <p className="text-label-md text-on-surface-variant">
          Showing <span className="font-bold">{startItem} - {endItem}</span> of{" "}
          <span className="font-bold">{tickets.length}</span> tickets
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-outline-variant p-2 text-on-surface-variant transition-all hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            disabled={currentPage <= 1}
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-lg font-label-md text-label-md font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-on-primary shadow-xs"
                    : "hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-outline-variant p-2 text-on-surface-variant transition-all hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            disabled={currentPage >= totalPages}
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
