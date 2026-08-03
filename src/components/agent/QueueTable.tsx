"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MessageSquare,
  Minus,
  Phone,
  Zap,
} from "lucide-react";
import type { QueueTicketRow } from "@/src/constants/agentQueue";

interface QueueTableProps {
  tickets: QueueTicketRow[];
  loading: boolean;
  error: string | null;
  claimingTicketId: string | null;
  onClaim: (ticketId: string, event: React.MouseEvent) => void;
}

export function QueueTable({
  tickets,
  loading,
  error,
  claimingTicketId,
  onClaim,
}: QueueTableProps) {
  const getPriorityIcon = (priority: QueueTicketRow["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span
            className="material-symbols-outlined text-error"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            priority_high
          </span>
        );
      case "high":
        return <AlertTriangle aria-hidden className="text-orange-500" />;
      case "normal":
        return <Minus aria-hidden className="text-secondary" strokeWidth={3} />;
      case "low":
        return <div className="material-symbols-outlined text-blue-500">info</div>;
    }
  };

  const getChannelIcon = (channel: QueueTicketRow["channel"]) => {
    switch (channel) {
      case "mail":
        return <Mail aria-hidden className="size-5 text-secondary" />;
      case "chat":
        return <MessageSquare aria-hidden className="size-5 text-secondary" />;
      case "bolt":
        return <Zap aria-hidden className="size-5 text-secondary" />;
      case "call":
        return <Phone aria-hidden className="size-5 text-secondary" />;
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="grid grid-cols-[48px_110px_1fr_120px_80px_140px] items-center gap-4 border-b border-outline-variant bg-surface-container px-6 py-3 text-xs font-bold uppercase tracking-widest text-outline">
        <div />
        <div>Ticket ID</div>
        <div>Subject</div>
        <div>Wait Time</div>
        <div className="text-center">Channel</div>
        <div className="text-right">Actions</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="size-6 animate-spin text-primary" />
            Loading queue...
          </div>
        ) : error ? (
          <div className="m-6 rounded-xl border border-error/30 bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center px-6 text-center text-on-surface-variant">
            No unassigned tickets found.
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="group grid cursor-pointer grid-cols-[48px_110px_1fr_120px_80px_140px] items-center gap-4 border-b border-outline-variant px-6 py-4 transition-colors hover:bg-surface-container-low"
              onClick={() => {
                window.location.href = `/agent/tickets/${ticket.id}`;
              }}
            >
              <div className="flex justify-center">{getPriorityIcon(ticket.priority)}</div>
              <div className="font-code font-bold text-primary">
                #{ticket.ticketNumber || ticket.id}
              </div>
              <div>
                <p className="truncate font-semibold text-on-surface">{ticket.subject}</p>
                <p className="truncate text-xs text-secondary">Reported by: {ticket.requester}</p>
              </div>
              <div
                className={`font-medium ${
                  ticket.priority === "urgent"
                    ? "text-error"
                    : ticket.priority === "high"
                      ? "text-orange-500"
                      : "text-secondary"
                }`}
              >
                {ticket.waitTime}
              </div>
              <div className="flex justify-center">{getChannelIcon(ticket.channel)}</div>
              <div className="overflow-hidden text-right">
                <button
                  onClick={(event) => onClaim(ticket.id, event)}
                  disabled={claimingTicketId === ticket.id}
                  className="translate-x-10 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white opacity-0 transition-all hover:bg-primary-container group-hover:translate-x-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {claimingTicketId === ticket.id ? "Claiming..." : "Claim"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between bg-surface-container-low px-6 py-3">
        <p className="text-xs text-secondary">
          Showing {tickets.length === 0 ? 0 : 1} to {tickets.length} of {tickets.length} unassigned tickets
        </p>
        <div className="flex gap-2">
          <button
            className="rounded border border-outline-variant p-1 hover:bg-surface-container-lowest disabled:opacity-50"
            disabled
          >
            <ChevronLeft aria-hidden className="text-sm" />
          </button>
          <button
            className="rounded border border-outline-variant p-1 hover:bg-surface-container-lowest disabled:opacity-50"
            disabled
          >
            <ChevronRight aria-hidden className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
