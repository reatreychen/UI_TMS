"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  BackendCategory,
  fetchPublicCategories,
  fetchQueueTickets,
  QueueTicket,
  assignTicket,
  deleteTicket,
  updateTicketStatus,
  fetchTicketAnalyticsOverview,
  TriageInsightItem,
  UrgentSlaItem,
} from "@/src/services/portalService";
import { adminAgentService, AgentRecord } from "@/src/services/adminAgentService";
import { adminUserService } from "@/src/services/adminUserService";

const ROWS_PER_PAGE = 10;

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error as { response?: { data?: { message?: string | string[] } } };
    const message = response.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }

  if (error instanceof Error) return error.message;
  return "Could not load tickets. Please try again.";
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(milliseconds: number) {
  const minutes = Math.max(1, Math.round(milliseconds / 60000));
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function statusClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-blue-100 text-blue-700";
    case "ASSIGNED":
      return "bg-indigo-100 text-indigo-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "CLOSED":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

function priorityClass(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return { text: "text-error", dot: "bg-error" };
    case "HIGH":
      return { text: "text-orange-600", dot: "bg-orange-500" };
    case "MEDIUM":
      return { text: "text-blue-500", dot: "bg-blue-400" };
    default:
      return { text: "text-gray-500", dot: "bg-gray-400" };
  }
}

function getRequesterName(ticket: QueueTicket) {
  return ticket.customer?.fullName || ticket.customer?.name || "Unknown requester";
}

function getAssigneeName(ticket: QueueTicket) {
  return ticket.assignedAgent?.fullName || ticket.assignedAgent?.name || "Unassigned";
}

export default function TicketManagementPage() {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statsNow, setStatsNow] = useState(0);

  // Bulk Actions & Modals state
  const [activeBulkModal, setActiveBulkModal] = useState<"reassign" | "status" | "delete" | null>(null);
  const [availableAgents, setAvailableAgents] = useState<AgentRecord[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedBulkStatus, setSelectedBulkStatus] = useState("IN_PROGRESS");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTickets = useCallback(() => {
    setRefreshTrigger((c) => c + 1);
  }, []);

  // Analytics Overview state
  const [triageInsights, setTriageInsights] = useState<TriageInsightItem[]>([]);
  const [urgentSlaItems, setUrgentSlaItems] = useState<UrgentSlaItem[]>([]);
  const [atRiskCount, setAtRiskCount] = useState<number>(0);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    setIsLoadingAnalytics(true);
    fetchTicketAnalyticsOverview()
      .then((data) => {
        setTriageInsights(data.triageInsights);
        setUrgentSlaItems(data.urgentSlaWatch.items);
        setAtRiskCount(data.urgentSlaWatch.atRiskCount);
      })
      .catch((err) => console.error("Failed to load analytics overview:", err))
      .finally(() => setIsLoadingAnalytics(false));
  }, [refreshTrigger]);

  useEffect(() => {
    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setCurrentPage(1);
      setSearchQuery(customEvent.detail || "");
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  useEffect(() => {
    fetchPublicCategories().then(setCategories);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetchQueueTickets({
          page: currentPage,
          limit: ROWS_PER_PAGE,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          categoryId: categoryFilter || undefined,
          q: searchQuery.trim() || undefined,
        });

        if (cancelled) return;
        setTickets(response.items);
        setTotalTickets(response.total);
        setSelectedTicketIds([]);
        setStatsNow(Date.now());
      } catch (error) {
        if (!cancelled) setErrorMessage(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTickets();
    return () => {
      cancelled = true;
    };
  }, [currentPage, statusFilter, priorityFilter, categoryFilter, searchQuery, refreshTrigger]);

  const totalPages = Math.max(1, Math.ceil(totalTickets / ROWS_PER_PAGE));
  const allVisibleSelected = tickets.length > 0 && tickets.every((ticket) => selectedTicketIds.includes(ticket.id));

  const stats = useMemo(() => {
    const activeStatuses = new Set(["OPEN", "ASSIGNED", "IN_PROGRESS", "PENDING"]);
    const overdueTickets = tickets.filter(
      (ticket) =>
        ticket.slaDueAt &&
        new Date(ticket.slaDueAt).getTime() < statsNow &&
        activeStatuses.has(ticket.status)
    );
    const resolvedTickets = tickets.filter(
      (ticket) => ticket.resolvedAt && ticket.createdAt
    );
    const averageResolution = resolvedTickets.length
      ? resolvedTickets.reduce(
          (total, ticket) =>
            total + (new Date(ticket.resolvedAt as string).getTime() - new Date(ticket.createdAt).getTime()),
          0
        ) / resolvedTickets.length
      : 0;

    return {
      overdue: overdueTickets.length,
      critical: tickets.filter((ticket) => ticket.priority === "CRITICAL").length,
      averageResolution,
      unassigned: tickets.filter((ticket) => !ticket.assignedAgentId).length,
    };
  }, [statsNow, tickets]);

  const clearFilters = () => {
    setCurrentPage(1);
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setSearchQuery("");
  };

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTicketIds((current) =>
      current.includes(ticketId)
        ? current.filter((id) => id !== ticketId)
        : [...current, ticketId]
    );
  };

  const toggleAllVisibleTickets = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(tickets.map((t) => t.id));
      setSelectedTicketIds((current) => current.filter((id) => !visibleIds.has(id)));
    } else {
      const visibleIds = tickets.map((t) => t.id);
      setSelectedTicketIds((current) => Array.from(new Set([...current, ...visibleIds])));
    }
  };

  useEffect(() => {
    if (activeBulkModal === "reassign") {
      let cancelled = false;
      setIsLoadingAgents(true);
      setSelectedAgentId("");
      setAgentSearchQuery("");

      async function fetchAgents() {
        try {
          const data = await adminAgentService.getAgentManagementData();
          let list = data.agents || [];
          if (list.length === 0) {
            const users = await adminUserService.getUsers();
            list = users.map(
              (u) =>
                ({
                  id: u.id,
                  name: u.fullName,
                  email: u.email,
                  role: u.jobTitle || "Support Agent",
                  status: u.isActive ? "Online" : "Offline",
                  activeTickets: 0,
                  capacityPct: 0,
                } as AgentRecord)
            );
          }
          if (!cancelled) {
            setAvailableAgents(list);
            if (list.length > 0) {
              setSelectedAgentId(list[0].id);
            }
          }
        } catch {
          try {
            const users = await adminUserService.getUsers();
            const list = users.map(
              (u) =>
                ({
                  id: u.id,
                  name: u.fullName,
                  email: u.email,
                  role: u.jobTitle || "Support Agent",
                  status: u.isActive ? "Online" : "Offline",
                  activeTickets: 0,
                  capacityPct: 0,
                } as AgentRecord)
            );
            if (!cancelled) {
              setAvailableAgents(list);
              if (list.length > 0) {
                setSelectedAgentId(list[0].id);
              }
            }
          } catch {
            if (!cancelled) setAvailableAgents([]);
          }
        } finally {
          if (!cancelled) setIsLoadingAgents(false);
        }
      }

      fetchAgents();
      return () => {
        cancelled = true;
      };
    }
  }, [activeBulkModal]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeBulkModal && !isBulkSubmitting) {
        setActiveBulkModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBulkModal, isBulkSubmitting]);

  const filteredAgents = useMemo(() => {
    if (!agentSearchQuery.trim()) return availableAgents;
    const q = agentSearchQuery.toLowerCase().trim();
    return availableAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(q) ||
        agent.email.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q)
    );
  }, [availableAgents, agentSearchQuery]);

  const selectedTicketsList = useMemo(() => {
    return tickets.filter((t) => selectedTicketIds.includes(t.id));
  }, [tickets, selectedTicketIds]);

  const handleBulkReassign = async () => {
    if (!selectedAgentId || selectedTicketIds.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      await Promise.all(
        selectedTicketIds.map((id) => assignTicket(id, selectedAgentId))
      );
      const chosenAgent = availableAgents.find((a) => a.id === selectedAgentId);
      const agentName = chosenAgent?.name || "Selected Agent";
      toast.success(
        `Assigned ${selectedTicketIds.length} ${selectedTicketIds.length === 1 ? "ticket" : "tickets"} to ${agentName}`
      );
      setSelectedTicketIds([]);
      setActiveBulkModal(null);
      refreshTickets();
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to reassign some tickets. Please try again.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleBulkChangeStatus = async () => {
    if (!selectedBulkStatus || selectedTicketIds.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      await Promise.all(
        selectedTicketIds.map((id) => updateTicketStatus(id, selectedBulkStatus))
      );
      toast.success(
        `Updated status to ${formatStatus(selectedBulkStatus)} for ${selectedTicketIds.length} ${selectedTicketIds.length === 1 ? "ticket" : "tickets"}`
      );
      setSelectedTicketIds([]);
      setActiveBulkModal(null);
      refreshTickets();
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to update status for some tickets. Please try again.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTicketIds.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      await Promise.all(
        selectedTicketIds.map((id) => deleteTicket(id))
      );
      toast.success(
        `Deleted ${selectedTicketIds.length} ${selectedTicketIds.length === 1 ? "ticket" : "tickets"}`
      );
      setSelectedTicketIds([]);
      setActiveBulkModal(null);
      refreshTickets();
    } catch (error) {
      toast.error(getErrorMessage(error) || "Failed to delete some tickets. Please try again.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-300">
      {/* Left Side: Main Management Content */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-primary-container text-on-primary-container rounded-lg">
                <span className="material-symbols-outlined">confirmation_number</span>
              </span>
              <span className="text-green-600 font-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> 12%
              </span>
            </div>
            <h4 className="text-on-surface-variant text-label-md uppercase tracking-wider font-bold">Total Tickets</h4>
            <p className="text-headline-md font-bold text-on-surface">{totalTickets}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-error-container text-on-error-container rounded-lg">
                <span className="material-symbols-outlined">timer_off</span>
              </span>
              <span className="text-error font-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">warning</span> Critical
              </span>
            </div>
            <h4 className="text-on-surface-variant text-label-md uppercase tracking-wider font-bold">Open SLA Breaches</h4>
            <p className="text-headline-md font-bold text-on-surface">{stats.overdue}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-lg">
                <span className="material-symbols-outlined">avg_pace</span>
              </span>
            </div>
            <h4 className="text-on-surface-variant text-label-md uppercase tracking-wider font-bold">Avg. Resolution</h4>
            <p className="text-headline-md font-bold text-on-surface">
              {stats.averageResolution ? formatDuration(stats.averageResolution) : "—"}
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="p-2 bg-secondary-container text-on-secondary-container rounded-lg">
                <span className="material-symbols-outlined">person_search</span>
              </span>
            </div>
            <h4 className="text-on-surface-variant text-label-md uppercase tracking-wider font-bold">Unassigned</h4>
            <p className="text-headline-md font-bold text-on-surface">{stats.unassigned}</p>
          </div>
        </div>

        {/* Control Bar: Filters & Bulk Actions */}
        <div className="flex flex-col gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-on-surface">Ticket Registry</h3>
              <span className="bg-surface-container-high px-2 py-0.5 rounded text-label-md font-bold text-on-surface-variant">
                {totalTickets} Tickets
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Create Ticket
              </button>
              <button className="border border-outline-variant px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">file_download</span>
                Export
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant">
              <span className="text-label-md text-on-surface-variant">Status:</span>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setStatusFilter(event.target.value);
                }}
                className="bg-transparent border-none p-0 text-label-md font-bold focus:ring-0 cursor-pointer outline-none"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant">
              <span className="text-label-md text-on-surface-variant">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setPriorityFilter(event.target.value);
                }}
                className="bg-transparent border-none p-0 text-label-md font-bold focus:ring-0 cursor-pointer outline-none"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant">
              <span className="text-label-md text-on-surface-variant">Category:</span>
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setCategoryFilter(event.target.value);
                }}
                className="bg-transparent border-none p-0 text-label-md font-bold focus:ring-0 cursor-pointer outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={clearFilters} className="text-primary font-label-md hover:underline">Clear all filters</button>
            
            <div className="ml-auto flex items-center gap-2 border-l pl-3 border-outline-variant">
              {selectedTicketIds.length === 0 ? (
                <>
                  <p className="text-label-md text-on-surface-variant font-medium">Bulk Actions:</p>
                  <button
                    disabled
                    className="text-on-surface-variant p-1.5 rounded hover:bg-surface-container-high transition-colors disabled:opacity-30 cursor-not-allowed"
                    title="Select tickets to Reassign"
                  >
                    <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                  </button>
                  <button
                    disabled
                    className="text-on-surface-variant p-1.5 rounded hover:bg-surface-container-high transition-colors disabled:opacity-30 cursor-not-allowed"
                    title="Select tickets to Change Status"
                  >
                    <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
                  </button>
                  <button
                    disabled
                    className="text-on-surface-variant p-1.5 rounded hover:bg-surface-container-high transition-colors disabled:opacity-30 cursor-not-allowed"
                    title="Select tickets to Delete"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in duration-200">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-md font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {selectedTicketIds.length} selected
                  </span>
                  <button
                    onClick={() => setSelectedTicketIds([])}
                    className="text-on-surface-variant hover:text-on-surface text-label-sm font-medium underline mr-1 hover:no-underline"
                    title="Clear selection"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setActiveBulkModal("reassign")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-md transition-all duration-200 shadow-sm active:scale-95"
                    title="Reassign selected tickets"
                  >
                    <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                    <span>Reassign</span>
                  </button>
                  <button
                    onClick={() => setActiveBulkModal("status")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-md transition-all duration-200 shadow-sm active:scale-95"
                    title="Change status for selected tickets"
                  >
                    <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                    <span>Status</span>
                  </button>
                  <button
                    onClick={() => setActiveBulkModal("delete")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-label-md transition-all duration-200 shadow-sm active:scale-95"
                    title="Delete selected tickets"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisibleTickets}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider">Ticket ID</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider">Subject</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider">Requester</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider">Priority</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider">Assigned</th>
                  <th className="py-3 px-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                      Loading tickets...
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-error">
                      {errorMessage}
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                      No tickets match the selected filters.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const priority = priorityClass(ticket.priority);
                    const requester = getRequesterName(ticket);
                    const assignee = getAssigneeName(ticket);

                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => toggleTicketSelection(ticket.id)}
                        className={`transition-colors group cursor-pointer ${
                          selectedTicketIds.includes(ticket.id)
                            ? "bg-primary-container/20 hover:bg-primary-container/30"
                            : "hover:bg-surface-container-low"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTicketIds.includes(ticket.id)}
                            onChange={() => toggleTicketSelection(ticket.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="rounded border-outline-variant text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="py-4 px-4 font-code text-primary font-bold">
                          {ticket.ticketNumber || ticket.id}
                        </td>
                        <td className="py-4 px-4 font-semibold text-on-surface">{ticket.subject}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
                              {requester.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="text-body-md">{requester}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter ${statusClass(ticket.status)}`}>
                            {formatStatus(ticket.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`flex items-center gap-1.5 font-bold text-label-md ${priority.text}`}>
                            <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                            {formatStatus(ticket.priority)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-body-md ${ticket.assignedAgentId ? "text-on-surface-variant" : "italic text-on-surface-variant opacity-60"}`}>
                            {assignee}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-label-md text-on-surface-variant">
                          {formatDate(ticket.updatedAt || ticket.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-surface-container-low flex items-center justify-between border-t border-outline-variant">
            <p className="text-label-md text-on-surface-variant">
              Showing {totalTickets === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1}-
              {Math.min(currentPage * ROWS_PER_PAGE, totalTickets)} of {totalTickets} tickets
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-1 hover:bg-surface-container-high rounded disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="px-2 text-label-md text-on-surface-variant">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1 hover:bg-surface-container-high rounded disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Triage Insights Sidebar */}
      <aside className="xl:w-[400px] flex flex-col gap-6 shrink-0 w-full">
        {/* Category Breakdown Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-headline-md text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pie_chart</span>
            Triage Insights
          </h3>
          <div className="space-y-4">
            {isLoadingAnalytics ? (
              <div className="py-6 text-center text-on-surface-variant text-body-sm">
                Loading insights...
              </div>
            ) : (
              triageInsights.map((item, idx) => (
                <div key={item.name || idx}>
                  <div className="flex justify-between text-label-md font-bold text-on-surface-variant mb-1">
                    <span>{item.name}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`${item.color || "bg-primary"} h-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-6 py-2 border border-outline-variant rounded-lg text-label-md font-bold text-primary hover:bg-surface-container-low transition-colors">
            View Detailed Analytics
          </button>
        </div>

        {/* Urgent Action List */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-headline-md text-on-surface mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">priority_high</span>
              Urgent SLA Watch
            </div>
            <span className="text-label-md text-error-container bg-error font-bold px-2 py-0.5 rounded-full">
              {isLoadingAnalytics ? "..." : `${atRiskCount} AT RISK`}
            </span>
          </h3>
          <div className="space-y-3 pr-2 flex-1">
            {isLoadingAnalytics ? (
              <div className="py-8 text-center text-on-surface-variant text-body-sm">
                Loading SLA watch list...
              </div>
            ) : urgentSlaItems.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-body-sm">
                No tickets at SLA risk right now.
              </div>
            ) : (
              urgentSlaItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleTicketSelection(item.id)}
                  className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                    item.remainingLabel.includes("OVERDUE") || item.remainingLabel.includes("15M") || item.remainingLabel.includes("12M")
                      ? "border-error-container bg-red-50 hover:border-error"
                      : "border-outline-variant hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-code text-[11px] font-bold text-primary">
                      {item.ticketNumber}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.remainingColorClass}`}>
                      {item.remainingLabel}
                    </span>
                  </div>
                  <p className="text-body-md font-bold text-on-surface leading-snug">
                    {item.subject}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Agent: {item.agentName}
                  </p>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-2 text-on-surface-variant p-3 bg-surface-container rounded-lg">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <p className="text-label-md">Next automated triage sweep in <strong>4m 12s</strong>.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>

      {/* Bulk Action Modals Backdrop */}
      {activeBulkModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isBulkSubmitting && setActiveBulkModal(null)}
        >
          {/* Reassign Modal */}
          {activeBulkModal === "reassign" && (
            <div
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">assignment_ind</span>
                  </span>
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface">
                      Bulk Reassign Tickets
                    </h3>
                    <p className="text-label-md text-on-surface-variant">
                      Assigning {selectedTicketIds.length} {selectedTicketIds.length === 1 ? "ticket" : "tickets"} to an agent
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isBulkSubmitting && setActiveBulkModal(null)}
                  disabled={isBulkSubmitting}
                  className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Agent search input */}
              <div className="my-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search agents by name, email, or role..."
                    value={agentSearchQuery}
                    onChange={(e) => setAgentSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Agent selection list */}
              <div className="flex-1 overflow-y-auto max-h-72 space-y-2 pr-1">
                {isLoadingAgents ? (
                  <div className="py-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[28px] text-primary">
                      progress_activity
                    </span>
                    <p className="text-body-md">Loading available agents...</p>
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant">
                    <p className="text-body-md">No agents match your search.</p>
                  </div>
                ) : (
                  filteredAgents.map((agent) => {
                    const isSelected = selectedAgentId === agent.id;
                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-primary bg-primary-container/20 shadow-sm"
                            : "border-outline-variant hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-label-md shrink-0">
                            {agent.initials || agent.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-on-surface text-body-md truncate">
                                {agent.name}
                              </p>
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  agent.status === "Online"
                                    ? "bg-green-500"
                                    : agent.status === "Away (Lunch)" || agent.status === "On Break"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                                }`}
                                title={agent.status}
                              />
                            </div>
                            <p className="text-label-sm text-on-surface-variant truncate">
                              {agent.role} &bull; {agent.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {agent.activeTickets !== undefined && (
                            <span className="text-label-sm bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-medium">
                              {agent.activeTickets} active
                            </span>
                          )}
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-primary bg-primary text-on-primary"
                                : "border-outline-variant"
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-[14px]">
                                check
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-outline-variant">
                <button
                  onClick={() => setActiveBulkModal(null)}
                  disabled={isBulkSubmitting}
                  className="px-4 py-2 rounded-lg border border-outline-variant font-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkReassign}
                  disabled={!selectedAgentId || isBulkSubmitting || isLoadingAgents}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isBulkSubmitting && (
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                  )}
                  <span>Reassign {selectedTicketIds.length} {selectedTicketIds.length === 1 ? "Ticket" : "Tickets"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Change Status Modal */}
          {activeBulkModal === "status" && (
            <div
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">published_with_changes</span>
                  </span>
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface">
                      Bulk Change Status
                    </h3>
                    <p className="text-label-md text-on-surface-variant">
                      Updating {selectedTicketIds.length} {selectedTicketIds.length === 1 ? "ticket" : "tickets"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isBulkSubmitting && setActiveBulkModal(null)}
                  disabled={isBulkSubmitting}
                  className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Status selection grid */}
              <div className="my-5 grid grid-cols-2 gap-2.5">
                {[
                  { value: "OPEN", label: "Open", icon: "inbox", colorClass: "bg-blue-100 text-blue-700" },
                  { value: "ASSIGNED", label: "Assigned", icon: "assignment_ind", colorClass: "bg-indigo-100 text-indigo-700" },
                  { value: "IN_PROGRESS", label: "In Progress", icon: "pending_actions", colorClass: "bg-purple-100 text-purple-700" },
                  { value: "PENDING", label: "Pending", icon: "schedule", colorClass: "bg-yellow-100 text-yellow-800" },
                  { value: "RESOLVED", label: "Resolved", icon: "check_circle", colorClass: "bg-green-100 text-green-700" },
                  { value: "CLOSED", label: "Closed", icon: "lock", colorClass: "bg-slate-100 text-slate-600" },
                ].map((statusObj) => {
                  const isSelected = selectedBulkStatus === statusObj.value;
                  return (
                    <div
                      key={statusObj.value}
                      onClick={() => setSelectedBulkStatus(statusObj.value)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary-container/20 shadow-sm"
                          : "border-outline-variant hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                          {statusObj.icon}
                        </span>
                        <span className="font-bold text-body-md text-on-surface">
                          {statusObj.label}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant"
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px]">
                            check
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected tickets preview */}
              <div className="mb-4">
                <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Selected Tickets ({selectedTicketIds.length})
                </p>
                <div className="max-h-32 overflow-y-auto divide-y divide-outline-variant bg-surface-container-low rounded-lg p-2 border border-outline-variant">
                  {selectedTicketsList.map((ticket) => (
                    <div key={ticket.id} className="py-1.5 px-2 flex items-center justify-between">
                      <span className="font-code font-bold text-primary text-label-md">
                        {ticket.ticketNumber || ticket.id}
                      </span>
                      <span className="text-body-sm text-on-surface truncate max-w-[200px]">
                        {ticket.subject}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusClass(ticket.status)}`}>
                        {formatStatus(ticket.status)}
                      </span>
                    </div>
                  ))}
                  {selectedTicketIds.length > selectedTicketsList.length && (
                    <div className="py-1.5 px-2 text-label-sm text-on-surface-variant italic">
                      + {selectedTicketIds.length - selectedTicketsList.length} more selected tickets
                    </div>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  onClick={() => setActiveBulkModal(null)}
                  disabled={isBulkSubmitting}
                  className="px-4 py-2 rounded-lg border border-outline-variant font-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkChangeStatus}
                  disabled={!selectedBulkStatus || isBulkSubmitting}
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isBulkSubmitting && (
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                  )}
                  <span>Apply Status</span>
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {activeBulkModal === "delete" && (
            <div
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">delete_forever</span>
                  </span>
                  <div>
                    <h3 className="font-headline-sm font-bold text-on-surface">
                      Delete Selected Tickets
                    </h3>
                    <p className="text-label-md text-on-surface-variant">
                      Permanent deletion of {selectedTicketIds.length} {selectedTicketIds.length === 1 ? "ticket" : "tickets"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isBulkSubmitting && setActiveBulkModal(null)}
                  disabled={isBulkSubmitting}
                  className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="my-4 space-y-4">
                <div className="p-4 bg-error-container/40 border border-error/20 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-error text-[24px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <div className="text-body-md text-on-surface">
                    <p className="font-bold text-error">
                      This action cannot be undone
                    </p>
                    <p className="text-on-surface-variant text-label-md mt-1">
                      Deleting these tickets will remove all associated comments, attachments, SLA history, and customer interactions permanently from the database.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Tickets to be deleted ({selectedTicketIds.length})
                  </p>
                  <div className="max-h-40 overflow-y-auto divide-y divide-outline-variant bg-surface-container-low rounded-lg p-2 border border-outline-variant">
                    {selectedTicketsList.map((ticket) => (
                      <div key={ticket.id} className="py-2 px-3 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <span className="font-code font-bold text-error text-label-md mr-2">
                            {ticket.ticketNumber || ticket.id}
                          </span>
                          <span className="text-body-sm font-medium text-on-surface truncate">
                            {ticket.subject}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusClass(ticket.status)} shrink-0`}>
                          {formatStatus(ticket.status)}
                        </span>
                      </div>
                    ))}
                    {selectedTicketIds.length > selectedTicketsList.length && (
                      <div className="py-2 px-3 text-label-sm text-on-surface-variant italic">
                        + {selectedTicketIds.length - selectedTicketsList.length} more selected tickets
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  onClick={() => setActiveBulkModal(null)}
                  disabled={isBulkSubmitting}
                  className="px-4 py-2 rounded-lg border border-outline-variant font-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkSubmitting}
                  className="px-5 py-2 rounded-lg bg-error text-on-error font-label-md hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isBulkSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  )}
                  <span>Delete {selectedTicketIds.length} {selectedTicketIds.length === 1 ? "Ticket" : "Tickets"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
