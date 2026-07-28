"use client";

import { useState, useEffect } from "react";

interface TicketLogRow {
  id: string;
  ticketId: string;
  actor: string;
  actorInitials: string;
  actorColor: string;
  action: "Status Change" | "Priority Change" | "Assignment" | "Closure" | "Comment Added";
  previousValue: string;
  newValue: string;
  date: string;
  time: string;
}

export default function RolesPage() {
  const [ticketSearch, setTicketSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<TicketLogRow | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const initialLogs: TicketLogRow[] = [
    {
      id: "TLOG-101",
      ticketId: "#KIN-4092",
      actor: "Alex Rivera",
      actorInitials: "AR",
      actorColor: "bg-blue-500",
      action: "Status Change",
      previousValue: "In Progress",
      newValue: "Resolved",
      date: "Oct 24, 2026",
      time: "14:22:15 PM",
    },
    {
      id: "TLOG-102",
      ticketId: "#KIN-3881",
      actor: "Sarah Chen",
      actorInitials: "SC",
      actorColor: "bg-purple-500",
      action: "Priority Change",
      previousValue: "Medium",
      newValue: "Urgent",
      date: "Oct 24, 2026",
      time: "13:58:02 PM",
    },
    {
      id: "TLOG-103",
      ticketId: "#KIN-4105",
      actor: "System Bot",
      actorInitials: "SY",
      actorColor: "bg-slate-700",
      action: "Assignment",
      previousValue: "Unassigned",
      newValue: "Alex Rivera",
      date: "Oct 24, 2026",
      time: "13:45:10 PM",
    },
    {
      id: "TLOG-104",
      ticketId: "#KIN-3920",
      actor: "Mark Thompson",
      actorInitials: "MT",
      actorColor: "bg-emerald-500",
      action: "Status Change",
      previousValue: "Open",
      newValue: "In Progress",
      date: "Oct 24, 2026",
      time: "12:30:55 PM",
    },
    {
      id: "TLOG-105",
      ticketId: "#KIN-4050",
      actor: "System Bot",
      actorInitials: "SY",
      actorColor: "bg-slate-700",
      action: "Closure",
      previousValue: "Resolved",
      newValue: "Closed",
      date: "Oct 24, 2026",
      time: "11:15:20 AM",
    },
  ];

  const [logs, setLogs] = useState<TicketLogRow[]>(initialLogs);

  // Global search bar listener
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      setTicketSearch(customEvt.detail || "");
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast("Ticket activity log refreshed.");
    }, 600);
  };

  const handleExportCSV = () => {
    setIsExportingCSV(true);
    setTimeout(() => {
      setIsExportingCSV(false);
      triggerToast("Ticket activity audit trail exported to CSV.");
    }, 800);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.ticketId.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      log.previousValue.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      log.newValue.toLowerCase().includes(ticketSearch.toLowerCase());

    const matchesAgent =
      !agentFilter ||
      (agentFilter === "System (Auto)" ? log.actor.includes("Bot") || log.actor.includes("System") : log.actor === agentFilter);

    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <nav className="flex items-center gap-2 text-secondary mb-2 text-xs">
            <span className="text-label-md">Tickets</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-label-md font-bold text-primary">Activity Log</span>
          </nav>
          <h1 className="font-display font-bold text-display text-on-background">
            Ticket Activity Log
          </h1>
          <p className="text-body-md text-secondary mt-1">
            Audit trail for system changes, ticket state transitions, and user interactions.
          </p>
        </div>
        <div className="flex items-center gap-stack-sm">
          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            className="bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-lg text-label-md font-semibold text-secondary flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isExportingCSV ? "animate-spin" : ""}`}>
              {isExportingCSV ? "sync" : "download"}
            </span>
            <span>{isExportingCSV ? "Exporting..." : "Export CSV"}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-semibold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Bento Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Quick Filters */}
        <div className="md:col-span-2 bg-surface-container-lowest p-gutter rounded-xl border border-outline-variant shadow-xs">
          <div className="text-label-md text-secondary mb-3 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            <span>Quick Filters</span>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            <div className="flex-1 min-w-[180px] relative">
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Ticket # (e.g. KIN-4092)"
                className="w-full pl-3 pr-3 py-2 bg-background border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="flex-1 min-w-[180px] relative">
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full pl-3 pr-3 py-2 bg-background border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                <option value="">Filter by Agent</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Mark Thompson">Mark Thompson</option>
                <option value="System (Auto)">System (Auto)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Today */}
        <div className="bg-surface-container-lowest p-gutter rounded-xl border border-outline-variant shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-label-md text-secondary font-semibold uppercase tracking-wider">
            Logs Today
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display font-bold text-primary leading-none">1,284</span>
            <span className="text-label-md text-green-600 flex items-center font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              12%
            </span>
          </div>
        </div>

        {/* Active Systems */}
        <div className="bg-surface-container-lowest p-gutter rounded-xl border border-outline-variant shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-label-md text-secondary font-semibold uppercase tracking-wider">
            Active Systems
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                AR
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                SC
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                SY
              </div>
            </div>
            <span className="text-body-md font-semibold text-on-background">+4 more</span>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-gutter py-4 font-label-md text-secondary uppercase tracking-wider text-xs font-semibold">
                  Ticket ID
                </th>
                <th className="px-gutter py-4 font-label-md text-secondary uppercase tracking-wider text-xs font-semibold">
                  Actor
                </th>
                <th className="px-gutter py-4 font-label-md text-secondary uppercase tracking-wider text-xs font-semibold">
                  Action
                </th>
                <th className="px-gutter py-4 font-label-md text-secondary uppercase tracking-wider text-xs font-semibold">
                  Previous Value
                </th>
                <th className="px-gutter py-4 font-label-md text-secondary uppercase tracking-wider text-xs font-semibold">
                  New Value
                </th>
                <th className="px-gutter py-4 font-label-md text-secondary uppercase tracking-wider text-xs font-semibold">
                  Timestamp
                </th>
                <th className="px-gutter py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-outline">
                    No activity logs matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                  >
                    <td className="px-gutter py-4 font-code text-primary font-bold">{log.ticketId}</td>
                    <td className="px-gutter py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${log.actorColor} flex items-center justify-center text-[10px] text-white font-bold`}
                        >
                          {log.actorInitials}
                        </div>
                        <span className="text-body-md font-semibold text-on-background group-hover:text-primary transition-colors">
                          {log.actor}
                        </span>
                      </div>
                    </td>
                    <td className="px-gutter py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-tight ${
                          log.action === "Status Change"
                            ? "bg-blue-100 text-blue-700"
                            : log.action === "Priority Change"
                            ? "bg-purple-100 text-purple-700"
                            : log.action === "Assignment"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-gutter py-4">
                      <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded text-xs font-medium">
                        {log.previousValue}
                      </span>
                    </td>
                    <td className="px-gutter py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        {log.newValue}
                      </span>
                    </td>
                    <td className="px-gutter py-4">
                      <div className="text-body-md text-on-background font-medium">{log.date}</div>
                      <div className="text-label-md text-secondary text-xs">{log.time}</div>
                    </td>
                    <td className="px-gutter py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary-container/20 hover:text-primary rounded transition-all cursor-pointer text-outline"
                        title="View Event Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-gutter flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low">
          <div className="text-label-md text-secondary font-medium">
            Showing <span className="font-bold text-on-background">1-5</span> of{" "}
            <span className="font-bold text-on-background">1,284</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-outline-variant rounded bg-surface-container-lowest text-secondary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 flex items-center justify-center rounded font-bold text-label-md cursor-pointer ${
                currentPage === 1 ? "bg-primary text-on-primary" : "hover:bg-surface-container-high"
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 flex items-center justify-center rounded font-bold text-label-md cursor-pointer ${
                currentPage === 2 ? "bg-primary text-on-primary" : "hover:bg-surface-container-high"
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 flex items-center justify-center rounded font-bold text-label-md cursor-pointer ${
                currentPage === 3 ? "bg-primary text-on-primary" : "hover:bg-surface-container-high"
              }`}
            >
              3
            </button>
            <span className="text-secondary px-1">...</span>
            <button
              onClick={() => setCurrentPage(257)}
              className={`w-8 h-8 flex items-center justify-center rounded font-bold text-label-md cursor-pointer ${
                currentPage === 257 ? "bg-primary text-on-primary" : "hover:bg-surface-container-high"
              }`}
            >
              257
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Asymmetric Support Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Banner Card 1 */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-xl h-48 group shadow-md">
          <div className="absolute inset-0 z-0 scale-105 group-hover:scale-100 transition-transform duration-700">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_-bPbTkqnjvI2QsIm2hafhDYcc-2JWK0B2qCYfupkOHUhgoQE98SORM-utP6x3Y_mUrTvFsj3_oF-kZUi7co3en_kRgGoYUVURZUdW0-Idca8M7JAzgeYFijH3LSGoOO_MeIS6-18k8gmRy1PY0psSzeD_FcGt95x3v289ci7VZ61510Dad6syP8ivtg6pCENeu7d2_Pa_Kn6dBJgKtAUuVFOvjzQrUnmQD9K7ZzG2XKsCOa7cJrg5rLMlzQSKwADYxxBQJ7-70Im"
              alt="Automated Audit Analysis Data Center"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-transparent z-10" />
          <div className="relative z-20 h-full p-8 flex flex-col justify-center text-on-primary">
            <h3 className="text-headline-lg font-bold mb-2">Automated Audit Analysis</h3>
            <p className="text-body-md max-w-md opacity-90 leading-relaxed">
              View comprehensive weekly reports on team efficiency, SLA adherence, and state changes across your entire enterprise infrastructure.
            </p>
            <button
              onClick={() => triggerToast("Weekly automated audit analysis report generated.")}
              className="mt-4 self-start bg-on-primary text-primary px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Card 2: Traceability Lock */}
        <div className="bg-surface-container-high p-gutter rounded-xl border border-outline-variant flex flex-col justify-center shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-xs">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <div>
              <div className="text-label-md font-bold text-on-surface">Traceability Lock</div>
              <div className="text-body-md text-secondary text-xs">Security Level: Enterprise</div>
            </div>
          </div>
          <p className="text-body-md text-on-surface-variant mb-4 italic leading-relaxed">
            "Every single ticket action is cryptographically signed, timestamped, and immutable."
          </p>
          <button
            onClick={() => triggerToast("Compliance policy documentation loaded.")}
            className="text-primary font-bold flex items-center gap-2 hover:underline self-start cursor-pointer"
          >
            <span>Learn about Compliance</span>
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </button>
        </div>
      </div>

      {/* Log Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                Activity Event [{selectedLog.ticketId}]
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-body-md">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-outline font-bold">ACTOR:</span>
                  <span className="text-primary font-bold">{selectedLog.actor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">ACTION:</span>
                  <span className="font-bold text-on-surface">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">PREVIOUS STATE:</span>
                  <span className="text-secondary">{selectedLog.previousValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">NEW STATE:</span>
                  <span className="text-green-700 font-bold">{selectedLog.newValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-bold">TIMESTAMP:</span>
                  <span className="text-on-surface">{selectedLog.date} {selectedLog.time}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const ticketId = selectedLog.ticketId;
                    setSelectedLog(null);
                    triggerToast(`Opening full ticket thread for ${ticketId}`);
                  }}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  View Ticket
                </button>
              </div>
            </div>
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
