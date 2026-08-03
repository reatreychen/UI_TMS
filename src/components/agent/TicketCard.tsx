import Image from "next/image";
import type { TicketCardData } from "@/src/constants/agentTickets";

interface TicketCardProps {
  ticket: TicketCardData;
  onClick: (ticketId: string) => void;
  isClosed?: boolean;
}

export function TicketCard({ ticket, onClick, isClosed }: TicketCardProps) {
  // Mapping priority to styles
  const getPriorityStyle = (priority: TicketCardData["priority"]) => {
    if (isClosed) {
      return "border-slate-200 bg-slate-100 text-on-surface-variant";
    }
    switch (priority) {
      case "urgent":
        return "border-red-100 bg-red-50 text-error";
      case "high":
        return "border-amber-100 bg-amber-50 text-amber-600";
      case "medium":
        return "border-blue-100 bg-blue-50 text-blue-600";
      case "low":
      default:
        return "border-slate-200 bg-slate-100 text-on-surface-variant";
    }
  };

  const getPriorityDotStyle = (priority: TicketCardData["priority"]) => {
    if (isClosed) return "bg-on-surface-variant";
    switch (priority) {
      case "urgent":
        return "bg-error";
      case "high":
        return "bg-amber-600";
      case "medium":
        return "bg-blue-600";
      case "low":
      default:
        return "bg-on-surface-variant";
    }
  };

  const priorityLabel = isClosed
    ? "Closed"
    : ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);

  return (
    <div
      onClick={() => onClick(ticket.id)}
      draggable
      className={`ticket-card group cursor-grab rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-all active:cursor-grabbing ${
        isClosed ? "opacity-70 hover:opacity-100" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <span
          className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityStyle(
            ticket.priority,
          )}`}
        >
          <span
            className={`h-1 w-1 rounded-full ${getPriorityDotStyle(
              ticket.priority,
            )}`}
          ></span>
          {priorityLabel}
        </span>
        <span className="font-code font-medium text-on-surface-variant">
          #{ticket.id}
        </span>
      </div>

      <h4 className="mb-3 font-bold text-on-surface transition-colors group-hover:text-primary">
        {ticket.title}
      </h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ticket.requester.avatarUrl ? (
            <Image
              src={ticket.requester.avatarUrl}
              alt={ticket.requester.name}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-on-secondary-container">
              {ticket.requester.initials}
            </div>
          )}
          <span className="text-label-md text-on-surface-variant">
            {ticket.requester.name}
          </span>
        </div>
        <span className="text-[10px] font-medium text-outline">
          {ticket.timeAgo}
        </span>
      </div>

      <div className="mt-3 flex gap-2 border-t border-outline-variant pt-3">
        <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-medium text-on-secondary-container">
          {ticket.category}
        </span>
      </div>
    </div>
  );
}
