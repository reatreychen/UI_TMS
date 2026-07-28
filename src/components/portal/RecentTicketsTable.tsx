import Image from "next/image";
import { UserCircle } from "lucide-react";

import type { Ticket, TicketStatus } from "@/src/data/tickets";
import { tickets } from "@/src/data/tickets";

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-purple-100 text-purple-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
};

function AgentCell({ ticket }: { ticket: Ticket }) {
  if (!("avatarUrl" in ticket.agent)) {
    return (
      <div className="flex items-center gap-2">
        <UserCircle
          aria-hidden
          className="size-6 text-outline"
          strokeWidth={1.75}
        />
        <span className="text-body-md italic text-outline">Unassigned</span>
      </div>
    );
  }

  const agent = ticket.agent;

  return (
    <div className="flex items-center gap-2">
      <Image
        src={agent.avatarUrl}
        alt={`Agent ${agent.name}`}
        width={24}
        height={24}
        className="size-6 rounded-full"
      />
      <span className="text-body-md">{agent.name}</span>
    </div>
  );
}

export function RecentTicketsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant px-container-margin py-4">
        <h2 className="text-headline-md font-semibold text-on-surface">
          Recent Tickets
        </h2>
        <button
          type="button"
          className="text-body-md font-bold text-primary hover:underline"
        >
          View All Tickets
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-outline-variant bg-surface-container-low">
            <tr>
              <th className="px-container-margin py-3 text-label-md uppercase text-outline">
                Ticket ID
              </th>
              <th className="px-4 py-3 text-label-md uppercase text-outline">
                Subject
              </th>
              <th className="px-4 py-3 text-label-md uppercase text-outline">
                Category
              </th>
              <th className="px-4 py-3 text-label-md uppercase text-outline">
                Assigned Agent
              </th>
              <th className="px-4 py-3 text-label-md uppercase text-outline">
                Status
              </th>
              <th className="px-container-margin py-3 text-right text-label-md uppercase text-outline">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="group transition-colors hover:bg-surface-container-low"
              >
                <td className="px-container-margin py-4 font-mono text-code text-on-surface-variant group-hover:text-primary transition-colors">
                  {ticket.id}
                </td>
                <td className="px-4 py-4 font-bold text-on-surface">
                  {ticket.subject}
                </td>
                <td className="px-4 py-4">{ticket.category}</td>
                <td className="px-4 py-4">
                  <AgentCell ticket={ticket} />
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-label-md font-semibold ${statusStyles[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-container-margin py-4 text-right text-body-md text-on-surface-variant">
                  {ticket.lastUpdated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
