import { Share2, UserCheck, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import type { AgentTicketDetail } from "@/src/constants/agentTicketDetail";

interface AgentTicketHeaderProps {
  ticket: AgentTicketDetail;
  onAssign?: () => void;
  onResolve?: () => void;
  onStatusChange?: (status: string) => void;
  isAssigning?: boolean;
  isResolving?: boolean;
  isUpdatingStatus?: boolean;
}

const TICKET_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open", style: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "ASSIGNED", label: "Assigned", style: "bg-teal-100 text-teal-700 border-teal-300" },
  { value: "IN_PROGRESS", label: "In Progress", style: "bg-purple-100 text-purple-700 border-purple-300" },
  { value: "PENDING", label: "Pending", style: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "RESOLVED", label: "Resolved", style: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { value: "CLOSED", label: "Closed", style: "bg-slate-100 text-slate-700 border-slate-300" },
];

export function AgentTicketHeader({
  ticket,
  onAssign,
  onResolve,
  onStatusChange,
  isAssigning,
  isResolving,
  isUpdatingStatus,
}: AgentTicketHeaderProps) {
  const normalizedStatus = ticket.status?.toUpperCase().replace(/\s+/g, "_") || "OPEN";
  const currentStatusObj = TICKET_STATUS_OPTIONS.find((s) => s.value === normalizedStatus) || {
    value: normalizedStatus,
    label: ticket.status,
    style: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <div className="flex items-start justify-between border-b border-outline-variant bg-surface-container-lowest px-container-margin py-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-code text-body-md text-on-surface-variant">
            #{ticket.id}
          </span>
          
          {/* Status Dropdown Selector */}
          <div className="relative inline-flex items-center">
            <select
              value={normalizedStatus}
              onChange={(e) => onStatusChange?.(e.target.value)}
              disabled={isUpdatingStatus || isAssigning || isResolving}
              className={`appearance-none cursor-pointer rounded-full border px-3 py-1 pr-7 text-label-md font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 ${currentStatusObj.style}`}
            >
              {TICKET_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-gray-900 font-medium">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3.5 opacity-70" />
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
        <button
          onClick={onAssign}
          disabled={isAssigning || isResolving || isUpdatingStatus}
          className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-body-md font-semibold transition-colors hover:bg-surface-container-low disabled:opacity-50"
        >
          {isAssigning ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <UserCheck aria-hidden className="size-4" />}
          Assign
        </button>
        <button
          onClick={onResolve}
          disabled={isResolving || isAssigning || isUpdatingStatus || normalizedStatus === "RESOLVED"}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-white transition-colors hover:bg-primary-container disabled:opacity-50"
        >
          {isResolving ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <CheckCircle2 aria-hidden className="size-4" />}
          {normalizedStatus === "RESOLVED" ? "Resolved" : "Resolve"}
        </button>
      </div>
    </div>
  );
}
