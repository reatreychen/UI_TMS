"use client";

import { useState, useEffect } from "react";

interface TicketRecord {
  id: string;
  subject: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Pending" | "Resolved";
  assignedTo: string;
  avatar?: string;
  queue: "Technical" | "Billing" | "Support";
  lastUpdated: string;
}

export default function TicketManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Priority");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [queueFilter, setQueueFilter] = useState("Queue");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Modal & Toast States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // New Ticket Form
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState<TicketRecord["priority"]>("Medium");
  const [newQueue, setNewQueue] = useState<TicketRecord["queue"]>("Technical");
  const [newAssignee, setNewAssignee] = useState("Unassigned");

  // Sample dataset matching HTML mockup
  const initialTickets: TicketRecord[] = [
    {
      id: "#TK-8422",
      subject: "System outage in European region-node-4",
      priority: "Critical",
      status: "Open",
      assignedTo: "James Doe",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQgN2p_GQi4r812iMS1wqo7k4wehaY_vtm_NpeZwMgDoXvk54BGBO_QkKjF9OrTmrwBUXNM6cHTpA_uAK43veyrtVwLwJNogaU_17MB4kMviOUoB5t2-05dm65T8Jun0YMVsoczYBubC5-p1VBWhN9X8lzAEFHihwoP32GGJv2uoK1XBNE3A_DXkcZBn3w1lyR3zyfS5uErf4mI876C0zauLGqG5iyClBpbWrOgLpGWoS78MRWXRNE2VdkIMtmc4a75HU-sZvxHaLn",
      queue: "Technical",
      lastUpdated: "2 mins ago",
    },
    {
      id: "#TK-8421",
      subject: "Billing dispute: Invoice #INV-2024-001",
      priority: "High",
      status: "In Progress",
      assignedTo: "Sarah Chen",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcnTsQpNKYt7UPCEr4AD7DgD6P-WGX9mvlFKc6lpiVXp3Dxk6Yr3kFC-Xo-Sk2UkY4HaOJQBAx06G_ve3mFAl61YQDZKs_6joEOxBb0l1CNKxLM9YDEs5O1-4jMut07lFMhVR6acdqx_l0K2slD7vgn6OJz-C4SV4RxV2Vipvcf-pxUYNsp2OiycZ8oSS-eNjKEbdo0BE12xGhWDJ8fA9_FKNmAZQnzE_WDFfIRP3sTXwbmq1T_LKTiKh4MsMBJXJMOEatOxR8tJm0",
      queue: "Billing",
      lastUpdated: "15 mins ago",
    },
    {
      id: "#TK-8420",
      subject: "Password reset request for user admin_01",
      priority: "Medium",
      status: "Pending",
      assignedTo: "Unassigned",
      queue: "Support",
      lastUpdated: "1 hr ago",
    },
    {
      id: "#TK-8419",
      subject: "Mobile app crashing on login screen",
      priority: "High",
      status: "Open",
      assignedTo: "Marcus Kim",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzEFk5q_KnM1Zr0nIPtiVAyyAONMcmXFMp4I2R8xYIOisGmxAuUMK-g-aEroC-oKoVDpQoh3sMQ9H1ppbm4PZVbp40m7Wi0UfQ4nrwQ1i35B2uYnaO9-6g9PxE_x0WAKJAomUGTDWqF_HxtAM0HRvrh55xIQwjQauU0CNv1Z7wicEst0uV2AE3bSV-jKYIFzIo1LbeOwS1gntnXaUIdH6D8dVFhFW2xKGdWa3xU7eCV1jQcgC4uHi5-SPomFykyM3Nx0ZZ78kpWERd",
      queue: "Technical",
      lastUpdated: "2 hrs ago",
    },
    {
      id: "#TK-8418",
      subject: "Account verification required for tier 2 expansion",
      priority: "Low",
      status: "Resolved",
      assignedTo: "Anna Lopez",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNo6vK3rK9C8Pa42J1PAScja7w-PqB0S8hluHjsf2QBrnFPrIGlB1lhRUR4Lk893SE4eo_8zXe9vJQ9ASfQXHvqHotGk_GLBUfcqwzq8-i9ZLd3RPTape_OS_WfwXUkdPq3QUCGTbo6W9emT13ENahq3IqN3FS-xB7wA8cCLpHwyzidpytaIIrirGDHOvFo-8goeGDCVeTkYgAuQxZc14P8U6LOilANkO0cPHA5aF0wNXEoVs-UtWnrdUhTFbBlq3XUNMKY9XODErf",
      queue: "Support",
      lastUpdated: "4 hrs ago",
    },
  ];

  const [tickets, setTickets] = useState<TicketRecord[]>(initialTickets);

  // Global search listener
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      setSearchQuery(customEvt.detail || "");
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      triggerToast("Ticket system dump exported successfully (CSV/JSON).");
    }, 800);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newId = `#TK-${Math.floor(8423 + Math.random() * 100)}`;
    const newRecord: TicketRecord = {
      id: newId,
      subject: newSubject.trim(),
      priority: newPriority,
      status: "Open",
      assignedTo: newAssignee,
      queue: newQueue,
      lastUpdated: "Just now",
    };

    setTickets([newRecord, ...tickets]);
    setNewSubject("");
    setShowCreateModal(false);
    triggerToast(`Ticket ${newId} logged successfully!`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("Priority");
    setStatusFilter("Status");
    setQueueFilter("Queue");
    triggerToast("All ticket filters cleared.");
  };

  // Filtered ticket list
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "Priority" || t.priority === priorityFilter;
    const matchesStatus = statusFilter === "Status" || t.status === statusFilter;
    const matchesQueue = queueFilter === "Queue" || t.queue === queueFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesQueue;
  });

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-display text-on-surface font-bold tracking-tight">
            System Tickets
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Monitor, assign, and manage ticket volume across the organization.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-primary font-semibold rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isExporting ? "animate-spin" : ""}`}>
              {isExporting ? "sync" : "file_download"}
            </span>
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-6 py-2 bg-primary-container text-on-primary-container font-semibold rounded-lg hover:opacity-90 active:opacity-80 transition-opacity flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">stacks</span>
            <span>Bulk Actions</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Total Active */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-primary-fixed text-primary rounded-lg material-symbols-outlined">
              confirmation_number
            </span>
            <span className="text-green-600 font-label-md flex items-center font-bold text-xs bg-green-50 px-2 py-0.5 rounded-full">
              +4.2% <span className="material-symbols-outlined text-[16px] ml-0.5">trending_up</span>
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            Total Active Tickets
          </h3>
          <p className="text-[32px] font-bold text-on-surface mt-1">482</p>
        </div>

        {/* SLA Breaches */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-error-container/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-error-container text-error rounded-lg material-symbols-outlined">
              warning
            </span>
            <span className="px-2 py-0.5 bg-error-container text-error rounded-full text-[10px] font-bold uppercase">
              Critical
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            SLA Breaches
          </h3>
          <p className="text-[32px] font-bold text-error mt-1">12</p>
        </div>

        {/* Unassigned */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-secondary-fixed text-secondary rounded-lg material-symbols-outlined">
              person_off
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            Unassigned
          </h3>
          <p className="text-[32px] font-bold text-on-surface mt-1">28</p>
          <div className="mt-2 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "15%" }} />
          </div>
        </div>

        {/* Avg First Response */}
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="p-2 bg-tertiary-fixed text-tertiary rounded-lg material-symbols-outlined">
              timer
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-semibold">
            Avg. First Response
          </h3>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-[32px] font-bold text-on-surface">42</p>
            <p className="text-on-surface-variant font-label-md">min</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-xs">
        <div className="flex-1 min-w-[240px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ticket ID, Subject..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-white text-body-md focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
          >
            <option value="Priority">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-white text-body-md focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
          >
            <option value="Status">Status: All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={queueFilter}
            onChange={(e) => setQueueFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-white text-body-md focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
          >
            <option value="Queue">Queue: All</option>
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="Support">Support</option>
          </select>

          <button
            onClick={() => triggerToast("Date range filter modal opened.")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant bg-white text-body-md hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <span>Date Range</span>
          </button>

          <button
            onClick={clearFilters}
            className="p-2 rounded-lg border border-outline-variant text-outline hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
            title="Clear all filters"
          >
            <span className="material-symbols-outlined">filter_alt_off</span>
          </button>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                  Queue
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-outline">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-code text-code text-primary-container font-semibold">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {ticket.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 w-fit ${
                          ticket.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : ticket.priority === "High"
                            ? "bg-orange-100 text-orange-700"
                            : ticket.priority === "Medium"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ticket.priority === "Critical" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-700 animate-pulse" />
                        )}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          ticket.status === "Open"
                            ? "bg-blue-100 text-blue-700"
                            : ticket.status === "In Progress"
                            ? "bg-purple-100 text-purple-700"
                            : ticket.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.assignedTo !== "Unassigned" ? (
                        <div className="flex items-center gap-2">
                          {ticket.avatar ? (
                            <img
                              src={ticket.avatar}
                              alt={ticket.assignedTo}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                              {ticket.assignedTo.substring(0, 2)}
                            </div>
                          )}
                          <span className="text-body-md font-medium">{ticket.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-outline italic text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-medium">{ticket.queue}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">{ticket.lastUpdated}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-surface-container rounded-lg transition-all text-outline cursor-pointer"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-md text-outline font-medium">
            Showing <span className="font-semibold text-on-surface">1 - {filteredTickets.length}</span> of{" "}
            <span className="font-semibold text-on-surface">482</span> tickets
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold cursor-pointer ${
                currentPage === 1 ? "bg-primary text-white" : "hover:bg-surface-container text-on-surface"
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold cursor-pointer ${
                currentPage === 2 ? "bg-primary text-white" : "hover:bg-surface-container text-on-surface"
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold cursor-pointer ${
                currentPage === 3 ? "bg-primary text-white" : "hover:bg-surface-container text-on-surface"
              }`}
            >
              3
            </button>
            <span className="px-2 text-outline">...</span>
            <button
              onClick={() => setCurrentPage(97)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold cursor-pointer ${
                currentPage === 97 ? "bg-primary text-white" : "hover:bg-surface-container text-on-surface"
              }`}
            >
              97
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Banner */}
      <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-6 flex items-start gap-4 shadow-xs">
        <span className="material-symbols-outlined text-primary p-2 bg-white rounded-lg shadow-sm">
          info
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-primary text-body-lg">Intelligent Routing Active</h4>
          <p className="text-body-md text-on-surface-variant mt-1">
            Automatic workload balancing is currently assigning new high-priority tickets to available senior agents in the technical queue.
          </p>
        </div>
        <button
          onClick={() => triggerToast("Navigated to Intelligent Routing policy configuration.")}
          className="text-primary font-bold hover:underline cursor-pointer"
        >
          View Policy
        </button>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="font-bold">Create Ticket</span>
        </button>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                Log System Ticket
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Ticket Subject
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. EU Region API latency spike"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketRecord["priority"])}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Target Queue
                </label>
                <select
                  value={newQueue}
                  onChange={(e) => setNewQueue(e.target.value as TicketRecord["queue"])}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Technical">Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Assign Agent
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Unassigned">Unassigned (Auto-Route)</option>
                  <option value="James Doe">James Doe</option>
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="Marcus Kim">Marcus Kim</option>
                  <option value="Anna Lopez">Anna Lopez</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">stacks</span>
                Bulk Operations Console
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  triggerToast("Bulk assignment executed for open unassigned tickets.");
                }}
                className="w-full p-3 border border-outline-variant rounded-lg hover:bg-surface-container-low text-left font-semibold text-body-md flex items-center justify-between cursor-pointer"
              >
                <span>Auto-Assign Open Unassigned Tickets</span>
                <span className="material-symbols-outlined text-primary">auto_mode</span>
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  triggerToast("SLA breach alert notifications dispatched to queue leads.");
                }}
                className="w-full p-3 border border-outline-variant rounded-lg hover:bg-surface-container-low text-left font-semibold text-body-md flex items-center justify-between cursor-pointer"
              >
                <span>Notify Queue Leads of SLA Breaches</span>
                <span className="material-symbols-outlined text-error">warning</span>
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  triggerToast("Resolved tickets archived to storage.");
                }}
                className="w-full p-3 border border-outline-variant rounded-lg hover:bg-surface-container-low text-left font-semibold text-body-md flex items-center justify-between cursor-pointer"
              >
                <span>Archive All Resolved Tickets</span>
                <span className="material-symbols-outlined text-secondary">archive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Preview Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <div>
                <span className="font-code text-primary-container font-bold text-body-md">
                  {selectedTicket.id}
                </span>
                <h3 className="text-headline-md font-bold text-on-surface mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-body-md">
              <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                <div>
                  <p className="text-xs text-outline uppercase font-bold">Priority</p>
                  <p className="font-semibold text-on-surface">{selectedTicket.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-outline uppercase font-bold">Status</p>
                  <p className="font-semibold text-on-surface">{selectedTicket.status}</p>
                </div>
                <div>
                  <p className="text-xs text-outline uppercase font-bold">Assigned To</p>
                  <p className="font-semibold text-on-surface">{selectedTicket.assignedTo}</p>
                </div>
                <div>
                  <p className="text-xs text-outline uppercase font-bold">Queue</p>
                  <p className="font-semibold text-on-surface">{selectedTicket.queue}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const ticketId = selectedTicket.id;
                    setSelectedTicket(null);
                    triggerToast(`Navigating to full thread for ${ticketId}`);
                  }}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  Open Ticket Thread
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
