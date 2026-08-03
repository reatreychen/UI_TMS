"use client";

import Image from "next/image";
import { UserCircle, Edit, Trash2 } from "lucide-react";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import { fetchMyTickets, deleteTicket } from "@/src/services/portalService";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const statusStyles: Record<string, string> = {
  "OPEN": "bg-blue-100 text-blue-700",
  "IN_PROGRESS": "bg-purple-100 text-purple-700",
  "RESOLVED": "bg-green-100 text-green-700",
  "CLOSED": "bg-gray-100 text-gray-700",
  "PENDING": "bg-orange-100 text-orange-700",
  "ASSIGNED": "bg-teal-100 text-teal-700",
};

function AgentCell({ ticket }: { ticket: any }) {
  if (!ticket.assignedAgent) {
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

  const agent = ticket.assignedAgent;

  return (
    <div className="flex items-center gap-2">
      {agent.avatarUrl ? (
        <Image
          src={agent.avatarUrl}
          alt={`Agent ${agent.fullName || agent.name}`}
          width={24}
          height={24}
          className="size-6 rounded-full"
        />
      ) : (
        <UserCircle
          aria-hidden
          className="size-6 text-primary"
          strokeWidth={1.75}
        />
      )}
      <span className="text-body-md">{agent.fullName || agent.name}</span>
    </div>
  );
}

export function RecentTicketsTable() {
  const router = useRouter();
  const currentUser = useAppSelector(selectUser);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleEdit = (id: string) => {
    // Assuming edit page exists, or generic fallback
    router.push(`/customer/tickets/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await deleteTicket(id);
        setTickets(tickets.filter(t => t.id !== id));
      } catch (err) {
        console.error("Failed to delete ticket", err);
      }
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyTickets({ customerId: currentUser.id })
        .then((data) => setTickets(data))
        .catch((err) => console.error("Failed to fetch tickets", err))
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

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
              <th className="px-container-margin py-3 text-right text-label-md uppercase text-outline">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                className="group transition-colors hover:bg-surface-container-low"
              >
                <td className="px-container-margin py-4 font-mono text-code text-on-surface-variant group-hover:text-primary transition-colors">
                  {ticket.ticketNumber || ticket.id.slice(0,8)}
                </td>
                <td className="px-4 py-4 font-bold text-on-surface">
                  {ticket.subject}
                </td>
                <td className="px-4 py-4">{ticket.category?.name || "Uncategorized"}</td>
                <td className="px-4 py-4">
                  <AgentCell ticket={ticket} />
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-label-md font-semibold ${statusStyles[ticket.status] || "bg-gray-100 text-gray-700"}`}
                  >
                    {ticket.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-container-margin py-4 text-right text-body-md text-on-surface-variant">
                  {formatDistanceToNow(new Date(ticket.updatedAt || ticket.createdAt), { addSuffix: true })}
                </td>
                <td className="px-container-margin py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(ticket.id)}
                      className="rounded-lg p-2 text-primary hover:bg-surface-container-high transition-colors"
                      title="Edit Ticket"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="rounded-lg p-2 text-error hover:bg-error-container transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
