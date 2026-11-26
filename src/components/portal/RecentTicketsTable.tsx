"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  Ticket,
  Trash2,
  UserCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

import { useAppSelector } from "@/src/store/hooks";
import { selectUser, selectRoleName } from "@/src/store/slices/authSlice";
import { fetchMyTickets, deleteTicket } from "@/src/services/portalService";

const statusStyles: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200/80",
  IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-200/80",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200/80",
  ASSIGNED: "bg-teal-50 text-teal-700 border-teal-200/80",
};

const STATUS_TABS = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" },
];

interface TicketRecord {
  id: string;
  ticketNumber?: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  category?: { name?: string };
  assignedAgent?: {
    fullName?: string;
    name?: string;
    avatarUrl?: string;
  };
}

function AgentCell({ ticket }: { ticket: TicketRecord }) {
  if (!ticket.assignedAgent) {
    return (
      <div className="flex items-center gap-2">
        <UserCircle aria-hidden className="size-5 text-slate-400" strokeWidth={1.75} />
        <span className="text-sm text-slate-400">Unassigned</span>
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
          className="size-6 rounded-full object-cover"
        />
      ) : (
        <UserCircle aria-hidden className="size-5 text-blue-600" strokeWidth={1.75} />
      )}
      <span className="text-sm text-slate-700">{agent.fullName || agent.name}</span>
    </div>
  );
}

export function RecentTicketsTable() {
  const router = useRouter();
  const currentUser = useAppSelector(selectUser);
  const roleName = useAppSelector(selectRoleName);
  const canDelete = roleName === "admin";

  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteConfirmTicket, setDeleteConfirmTicket] = useState<TicketRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpen = (id: string) => {
    router.push(`/customer/tickets/${id}`);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmTicket) return;
    const targetId = deleteConfirmTicket.id;
    setIsDeleting(true);
    try {
      await deleteTicket(targetId);
      setTickets((prev) => prev.filter((t) => t.id !== targetId));
      toast.success("Ticket deleted successfully!");
    } catch (err) {
      console.error("Failed to delete ticket", err);
      toast.error("Failed to delete ticket. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTicket(null);
    }
  };

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setIsForbidden(false);
      fetchMyTickets(currentUser?.id ? { customerId: currentUser.id } : undefined)
        .then((data: unknown) => {
          if (!active) return;
          if (data && typeof data === "object" && "isForbidden" in data && (data as { isForbidden?: boolean }).isForbidden) {
            setIsForbidden(true);
            setTickets([]);
          } else {
            setIsForbidden(false);
            setTickets(Array.isArray(data) ? (data as TicketRecord[]) : []);
          }
        })
        .catch((err) => console.error("Failed to fetch tickets", err))
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [currentUser]);

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (t.status || "").toUpperCase().replace(/\s+/g, "_") === statusFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !query ||
      t.subject.toLowerCase().includes(query) ||
      (t.ticketNumber || t.id).toLowerCase().includes(query) ||
      (t.category?.name || "").toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white soft-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your Support Requests</h2>
          <p className="text-xs text-slate-500">
            Click any ticket to view conversation updates or add a reply.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets..."
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50/70">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ticket ID
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Subject
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assigned Agent
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  Loading your tickets...
                </td>
              </tr>
            ) : isForbidden ? (
              <tr>
                <td colSpan={7} className="py-12 text-center bg-slate-50/50">
                  <div className="mx-auto mb-2.5 flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <ShieldAlert className="size-6" />
                  </div>
                  <p className="font-semibold text-base text-slate-900">
                    Ticket Access Restricted
                  </p>
                  <p className="text-slate-600 max-w-md mx-auto mt-1 text-xs">
                    Your role does not have permission to view tickets (
                    <code className="font-mono text-red-600 font-semibold bg-red-50 px-1 py-0.5 rounded">
                      tickets:read
                    </code>{" "}
                    is not granted).
                  </p>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Ticket className="size-8 text-slate-400 mx-auto mb-2" aria-hidden />
                  <p className="text-sm font-semibold text-slate-900">
                    {tickets.length === 0
                      ? "No support tickets yet"
                      : "No tickets match your filter"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    {tickets.length === 0
                      ? "Create a new support request whenever you need help."
                      : "Try clearing the search bar or switching status tabs."}
                  </p>
                  {tickets.length === 0 && (
                    <Link
                      href="/customer/create-ticket"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                    >
                      <Plus className="size-3.5" aria-hidden />
                      New Ticket
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => handleOpen(ticket.id)}
                  className="group transition-colors hover:bg-slate-50/90 cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600 group-hover:text-blue-600">
                    {ticket.ticketNumber || ticket.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-sm text-slate-900 max-w-xs truncate">
                    {ticket.subject}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {ticket.category?.name || "General"}
                  </td>
                  <td className="px-4 py-4">
                    <AgentCell ticket={ticket} />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        statusStyles[ticket.status] ||
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {ticket.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                    {formatDistanceToNow(
                      new Date(ticket.updatedAt || ticket.createdAt),
                      { addSuffix: true }
                    )}
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpen(ticket.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" aria-hidden />
                        View
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTicket(ticket)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Ticket"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirmTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setDeleteConfirmTicket(null)}
        >
          <div
            className="modal-pop bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-full bg-red-50">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Ticket</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete ticket{" "}
              <strong className="text-slate-900 font-mono">
                {deleteConfirmTicket.ticketNumber ||
                  `#${deleteConfirmTicket.id.slice(0, 8)}`}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmTicket(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="size-4 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Delete Ticket"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
