import { Share2, UserCheck, CheckCircle2 } from "lucide-react";
import type { AgentTicketDetail } from "@/src/data/agentTicketDetail";

interface AgentTicketHeaderProps {
  ticket: AgentTicketDetail;
}

export function AgentTicketHeader({ ticket }: AgentTicketHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-outline-variant bg-surface-container-lowest px-container-margin py-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-code text-body-md text-on-surface-variant">
            #{ticket.id}
          </span>
          <div className="rounded bg-secondary-container px-2 py-0.5 text-label-md text-on-secondary-container">
            {ticket.status}
          </div>
          {ticket.priority.toLowerCase() === "urgent" && (
            <div className="flex items-center gap-1 rounded bg-error-container px-2 py-0.5 text-label-md text-on-error-container">
              <span className="material-symbols-outlined text-[14px]">
                priority_high
              </span>
              Urgent
            </div>
          )}
        </div>
        <h2 className="text-headline-lg font-headline-lg text-on-surface">
          {ticket.title}
        </h2>
        <div className="flex items-center gap-4 text-body-md text-on-surface-variant">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              calendar_today
            </span>
            Created {ticket.createdAt}
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              person
            </span>
            {ticket.requester}
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              category
            </span>
            {ticket.category}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-body-md font-semibold transition-colors hover:bg-surface-container-low">
          <Share2 aria-hidden className="size-4" /> Share
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-body-md font-semibold transition-colors hover:bg-surface-container-low">
          <UserCheck aria-hidden className="size-4" /> Assign
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-white transition-colors hover:bg-primary-container">
          <CheckCircle2 aria-hidden className="size-4" /> Resolve
        </button>
      </div>
    </div>
  );
}
