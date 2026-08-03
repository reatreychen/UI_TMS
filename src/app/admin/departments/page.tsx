"use client";

import { useState, useEffect, useMemo } from "react";
import {
  adminAgentService,
  AgentRecord,
} from "@/src/services/adminAgentService";
import { AdminDepartment } from "@/src/services/adminUserService";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [queueFilter, setQueueFilter] = useState("Queue: All");
  const [statusFilter, setStatusFilter] = useState("Status: All");
  const [sortBy, setSortBy] = useState<"performance" | "tickets" | "name">("performance");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [agentRoleId, setAgentRoleId] = useState<string | null>(null);
  const [rowsPerPage] = useState(10);

  // Add Agent Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Tier I Specialist");
  const [newDepartmentId, setNewDepartmentId] = useState("");

  const [agents, setAgents] = useState<AgentRecord[]>([]);

  const stats = useMemo(() => adminAgentService.computeStats(agents), [agents]);

  useEffect(() => {
    let mounted = true;

    async function loadAgentData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await adminAgentService.getAgentManagementData();
        if (!mounted) return;

        setAgents(data.agents);
        setDepartments(data.departments);
        setAgentRoleId(data.agentRoleId);
        setNewDepartmentId((current) => current || data.departments[0]?.id || "");
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadAgentData();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen to global admin header search
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      setSearchQuery(customEvt.detail || "");
      setCurrentPage(1);
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleExportData = () => {
    setIsExporting(true);

    const headers = ["id", "name", "email", "role", "queue", "status", "activeTickets", "capacityPct"];
    const csv = [
      headers.join(","),
      ...filteredAgents.map((agent) =>
        headers
          .map((header) => `"${String(agent[header as keyof AgentRecord] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agent-management.csv";
    link.click();
    URL.revokeObjectURL(url);

    setIsExporting(false);
    triggerToast("Agent telemetry & workload data exported (CSV).");
  };

  const handleAddAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    setIsSaving(true);
    try {
      const created = await adminAgentService.createAgent(
        {
          fullName: newName.trim(),
          email: newEmail.trim(),
          jobTitle: newRole,
          departmentId: newDepartmentId || undefined,
        },
        agentRoleId
      );

      setAgents((current) => [created, ...current]);
      setNewName("");
      setNewEmail("");
      setShowAddModal(false);
      triggerToast(`Agent ${created.name} onboarded successfully!`);
    } catch (error) {
      triggerToast(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAgent = async (id: string, name: string) => {
    setIsSaving(true);
    try {
      await adminAgentService.removeAgent(id);
      setAgents((current) => current.filter((agent) => agent.id !== id));
      setActiveMenuId(null);
      triggerToast(`Agent ${name} removed from active roster.`);
    } catch (error) {
      triggerToast(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered & Sorted Agents
  const filteredAgents = agents
    .filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.queue.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesQueue =
        queueFilter === "Queue: All" ||
        (queueFilter === "Technical Support" && a.queue.toLowerCase().includes("tech")) ||
        (queueFilter === "Billing & Accounts" && a.queue.toLowerCase().includes("billing")) ||
        (queueFilter === "Enterprise Sales" && a.queue.toLowerCase().includes("critical") || a.queue.toLowerCase().includes("sales"));

      const matchesStatus =
        statusFilter === "Status: All" ||
        (statusFilter === "Online" && a.status === "Online") ||
        (statusFilter === "Away" && a.status.includes("Away")) ||
        (statusFilter === "On Break" && a.status === "On Break") ||
        (statusFilter === "Offline" && a.status === "Offline");

      return matchesSearch && matchesQueue && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "tickets") return b.activeTickets - a.activeTickets;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.capacityPct - a.capacityPct; // Performance/capacity default
    });

  const pageCount = Math.max(1, Math.ceil(filteredAgents.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pagedAgents = filteredAgents.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  return (
    <div className="space-y-stack-lg max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Agent Management
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Monitor and manage support team performance, workload, and live availability from the live API.
          </p>
        </div>
        <div className="flex gap-stack-md">
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-surface rounded-lg font-body-md text-body-md text-secondary hover:bg-surface-container-low transition-colors active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isExporting ? "animate-spin" : ""}`}>
              {isExporting ? "sync" : "file_download"}
            </span>
            <span>{isExporting ? "Exporting..." : "Export Data"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-md text-body-md font-semibold hover:opacity-90 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-error font-body-md">
          {errorMessage}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-lg border border-outline-variant shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            Total Agents
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface font-bold">{stats.totalAgents}</span>
            <span className="text-on-surface-variant font-label-md text-label-md">Live roster</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-lg border border-outline-variant shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            Available Now
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-primary font-bold">{stats.availableNow}</span>
            <span className="text-on-surface-variant font-label-md text-label-md">{stats.availabilityPct}% capacity</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-lg border border-outline-variant shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            Avg. Handle Time
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface font-bold">14m 20s</span>
            <span className="text-error font-label-md text-label-md font-bold">+2% slower</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-lg border border-outline-variant shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
          <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            Avg. CSAT per Agent
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface font-bold">4.82</span>
            <span className="text-green-600 font-label-md text-label-md font-bold">Target: 4.50</span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col md:flex-row gap-stack-md items-center justify-between bg-white p-4 rounded-t-lg border-x border-t border-outline-variant">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Input */}
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Queue Filter Dropdown */}
          <select
            value={queueFilter}
            onChange={(e) => setQueueFilter(e.target.value)}
            className="py-2 pl-3 pr-8 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-secondary focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="Queue: All">Queue: All</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing & Accounts">Billing &amp; Accounts</option>
            <option value="Enterprise Sales">Enterprise Sales / Critical</option>
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-8 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-secondary focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            <option value="Status: All">Status: All</option>
            <option value="Online">Online</option>
            <option value="Away">Away</option>
            <option value="On Break">On Break</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Sort Trigger */}
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant font-label-md text-label-md">Sort by:</span>
          <button
            onClick={() => {
              const nextSort = sortBy === "performance" ? "tickets" : sortBy === "tickets" ? "name" : "performance";
              setSortBy(nextSort);
              triggerToast(`Sorted by ${nextSort.toUpperCase()}`);
            }}
            className="flex items-center gap-1 font-body-md text-body-md font-semibold text-primary cursor-pointer hover:underline"
          >
            <span className="capitalize">{sortBy}</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-b-lg border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3 font-label-md text-label-md uppercase tracking-wider">
                  Agent Name
                </th>
                <th className="px-6 py-3 font-label-md text-label-md uppercase tracking-wider">
                  Role/Tier
                </th>
                <th className="px-6 py-3 font-label-md text-label-md uppercase tracking-wider">
                  Assigned Queue
                </th>
                <th className="px-6 py-3 font-label-md text-label-md uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 font-label-md text-label-md uppercase tracking-wider">
                  Active Tickets
                </th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-outline">
                    Loading agents from API...
                  </td>
                </tr>
              ) : pagedAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-outline">
                    No matching agents found for your search/filters.
                  </td>
                </tr>
              ) : (
                pagedAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-primary/5 transition-colors group relative">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {agent.avatar ? (
                          <img
                            src={agent.avatar}
                            alt={`${agent.name} Avatar`}
                            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-xs">
                            {agent.initials || agent.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {agent.name}
                          </p>
                          <p className="text-[12px] text-on-surface-variant font-mono">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-on-surface-variant">{agent.role}</td>
                    <td className="px-6 py-3 text-on-surface-variant">{agent.queue}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          agent.status === "Online"
                            ? "bg-green-100 text-green-800"
                            : agent.status.includes("Away")
                            ? "bg-yellow-100 text-yellow-800"
                            : agent.status === "On Break"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full ${agent.capacityPct >= 100 ? "bg-error" : "bg-primary"}`}
                            style={{ width: `${Math.min(100, agent.capacityPct)}%` }}
                          />
                        </div>
                        <span
                          className={`font-semibold ${
                            agent.activeTickets >= 10 ? "text-error" : "text-on-surface"
                          }`}
                        >
                          {agent.activeTickets}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === agent.id ? null : agent.id)
                        }
                        className="p-1 hover:bg-surface-container rounded-lg transition-colors group-hover:opacity-100 opacity-80 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-outline">more_vert</span>
                      </button>

                      {/* Dropdown Action Menu */}
                      {activeMenuId === agent.id && (
                        <div className="absolute right-6 mt-1 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 p-1 text-left animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              triggerToast(`Viewing telemetry profile for ${agent.name}`);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            View Telemetry
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              triggerToast(`Queues re-routed for ${agent.name}`);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">alt_route</span>
                            Reassign Queue
                          </button>
                          <div className="my-1 border-t border-outline-variant" />
                          <button
                            onClick={() => handleRemoveAgent(agent.id, agent.name)}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20 rounded-lg flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Remove Agent
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low border-t border-outline-variant">
          <p className="font-label-md text-label-md text-on-surface-variant font-medium">
            Showing {filteredAgents.length === 0 ? 0 : (safeCurrentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(safeCurrentPage * rowsPerPage, filteredAgents.length)} of {filteredAgents.length} agents
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1 rounded-lg border border-outline-variant text-outline hover:bg-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="font-label-md text-label-md text-on-surface-variant">
              Page {safeCurrentPage} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pageCount, safeCurrentPage + 1))}
              disabled={safeCurrentPage === pageCount}
              className="p-1 rounded-lg border border-outline-variant text-outline hover:bg-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-auto py-6 px-gutter border-t border-outline-variant text-center">
        <p className="font-label-md text-label-md text-on-surface-variant">
          Kinetic Enterprise TMS v4.2.1-stable © 2026
        </p>
      </footer>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Onboard New Support Agent
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddAgentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Agent Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Taylor Reed"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="t.reed@kinetic.io"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Tier / Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Senior Specialist">Senior Specialist</option>
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="Tier II Specialist">Tier II Specialist</option>
                  <option value="Associate">Associate</option>
                  <option value="Junior Specialist">Junior Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Assigned Queue
                </label>
                <select
                  value={newDepartmentId}
                  onChange={(e) => setNewDepartmentId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {departments.length === 0 ? (
                    <option value="">No departments available</option>
                  ) : (
                    departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Onboard Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
