import { MoreHorizontal } from "lucide-react";
import { TicketCard } from "./TicketCard";
import type { KanbanColumnData } from "@/src/data/agentTickets";

interface KanbanColumnProps {
  column: KanbanColumnData;
  onTicketClick: (ticketId: string) => void;
}

export function KanbanColumn({ column, onTicketClick }: KanbanColumnProps) {
  const isResolved = column.id === "resolved";

  return (
    <div className="flex w-80 flex-col gap-4">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${column.colorClass}`}></span>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
            {column.title}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${column.bgClass} ${column.textClass}`}
          >
            {column.count}
          </span>
        </div>
        <button className="rounded p-1 transition-colors hover:bg-surface-container-high">
          <MoreHorizontal aria-hidden className="size-5" />
        </button>
      </div>

      {/* Ticket List */}
      <div className="kanban-column flex flex-1 flex-col gap-3">
        {column.tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={onTicketClick}
            isClosed={isResolved}
          />
        ))}
      </div>
    </div>
  );
}
