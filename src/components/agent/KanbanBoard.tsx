"use client";

import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { QuickReplyModal } from "./QuickReplyModal";
import { KANBAN_COLUMNS } from "@/src/data/agentTickets";

export function KanbanBoard() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  return (
    <>
      <section className="custom-scrollbar flex-1 overflow-x-auto bg-slate-50 p-container-margin">
        <div className="flex h-full min-w-max gap-6">
          {KANBAN_COLUMNS.map((column) => (
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
