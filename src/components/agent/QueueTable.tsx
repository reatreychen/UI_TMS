"use client";

import {
  AlertTriangle,
  Mail,
  MessageSquare,
  Minus,
  Zap,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AGENT_QUEUE_TICKETS } from "@/src/data/agentQueue";
import type { QueueTicketRow } from "@/src/data/agentQueue";
import toast from "react-hot-toast";

export function QueueTable() {

  const getPriorityIcon = (priority: QueueTicketRow["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
            priority_high
          </span>
        );
      case "high":
        return <AlertTriangle aria-hidden className="text-orange-500" />;
      case "normal":
        return <Minus aria-hidden className="text-secondary" strokeWidth={3} />;
      case "low":
        return <div className="text-blue-500 material-symbols-outlined">info</div>;
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

  const handleClaim = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Ticket #${ticketId} has been assigned to you.`, {
      style: {
        fontWeight: "bold",
      }
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-[48px_110px_1fr_120px_80px_140px] items-center gap-4 border-b border-outline-variant bg-surface-container px-6 py-3 text-xs font-bold uppercase tracking-widest text-outline">
        <div></div>
        <div>Ticket ID</div>
        <div>Subject</div>
        <div>Wait Time</div>
        <div className="text-center">Channel</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        {AGENT_QUEUE_TICKETS.map((ticket) => (
          <div
            key={ticket.id}
            className="group grid cursor-pointer grid-cols-[48px_110px_1fr_120px_80px_140px] items-center gap-4 border-b border-outline-variant px-6 py-4 transition-colors hover:bg-surface-container-low"
            onClick={() => {
              window.location.href = `/agent/tickets/${ticket.id}`;
            }}
          >
            <div className="flex justify-center">
              {getPriorityIcon(ticket.priority)}
            </div>
            <div className="font-code font-bold text-primary">#{ticket.id}</div>
            <div>
              <p className="truncate font-semibold text-on-surface">
                {ticket.subject}
              </p>
              <p className="truncate text-xs text-secondary">
                Reported by: {ticket.requester}
              </p>
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
            <div className="flex justify-center">
              {getChannelIcon(ticket.channel)}
            </div>
            <div className="text-right overflow-hidden">
              <button
                onClick={(e) => handleClaim(ticket.id, e)}
                className="translate-x-10 opacity-0 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-primary-container group-hover:translate-x-0 group-hover:opacity-100"
              >
                Claim
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-surface-container-low px-6 py-3">
        <p className="text-xs text-secondary">
          Showing 1 to {AGENT_QUEUE_TICKETS.length} of 42 unassigned tickets
        </p>
        <div className="flex gap-2">
          <button
            className="rounded border border-outline-variant p-1 hover:bg-surface-container-lowest disabled:opacity-50"
            disabled
          >
            <ChevronLeft aria-hidden className="text-sm" />
          </button>
          <button className="rounded border border-outline-variant p-1 hover:bg-surface-container-lowest">
            <ChevronRight aria-hidden className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
