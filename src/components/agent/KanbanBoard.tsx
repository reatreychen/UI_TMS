"use client";

import { useState, useEffect, useMemo } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { QuickReplyModal } from "./QuickReplyModal";
import { fetchMyTickets } from "@/src/services/portalService";
import type { KanbanColumnData } from "@/src/constants/agentTickets";
import { formatDistanceToNow } from "date-fns";

const COLUMNS_CONFIG = [
  { id: "new", title: "New", colorClass: "bg-blue-500", bgClass: "bg-blue-100", textClass: "text-blue-700", statuses: ["OPEN"] },
  { id: "assigned", title: "Assigned", colorClass: "bg-teal-500", bgClass: "bg-teal-100", textClass: "text-teal-700", statuses: ["ASSIGNED"] },
  { id: "in-progress", title: "In Progress", colorClass: "bg-purple-500", bgClass: "bg-purple-100", textClass: "text-purple-700", statuses: ["IN_PROGRESS", "PENDING"] },
  { id: "resolved", title: "Resolved", colorClass: "bg-green-500", bgClass: "bg-green-100", textClass: "text-green-700", statuses: ["RESOLVED", "CLOSED"] }
];

export function KanbanBoard() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchMyTickets({ limit: 100 })
      .then((data) => setTickets(data))
      .catch((err) => console.error("Failed to load agent tickets", err));
  }, []);

  const columns: KanbanColumnData[] = useMemo(() => {
    return COLUMNS_CONFIG.map(col => {
      const colTickets = tickets.filter(t => col.statuses.includes(t.status));
      return {
        id: col.id,
        title: col.title,
        colorClass: col.colorClass,
        bgClass: col.bgClass,
        textClass: col.textClass,
        count: colTickets.length,
        tickets: colTickets.map(t => ({
          id: t.id,
          title: t.subject,
          priority: (t.priority?.toLowerCase() || "medium") as any,
          requester: {
            name: t.customer?.fullName || "Unknown",
            avatarUrl: t.customer?.avatarUrl,
            initials: (t.customer?.fullName || "U").substring(0, 2).toUpperCase(),
          },
          timeAgo: formatDistanceToNow(new Date(t.createdAt), { addSuffix: true }),
          category: t.category?.name || "Uncategorized"
        }))
      };
    });
  }, [tickets]);

  return (
    <>
      <section className="custom-scrollbar flex-1 overflow-x-auto bg-slate-50 p-container-margin">
        <div className="flex h-full min-w-max gap-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onTicketClick={setSelectedTicketId}
            />
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <button className="group fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95">
        <span
          className="material-symbols-outlined text-[28px]"
          aria-hidden
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
        >
          chat_bubble
        </span>
        <div className="pointer-events-none absolute right-full mr-4 whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5 text-label-md text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100">
          Open Team Chat
        </div>
      </button>

      {/* Quick Reply Modal */}
      <QuickReplyModal
        isOpen={selectedTicketId !== null}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId || ""}
      />
    </>
  );
}
