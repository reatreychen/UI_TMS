"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TicketItem {
  id: string;
  subject: string;
  agent: string;
  status: "In Progress" | "Resolved" | "Closed" | "Pending";
  priority: "Low" | "Medium" | "High" | "Critical";
}

interface AgentItem {
  name: string;
  role: string;
  openTickets: number;
  status: "online" | "away" | "offline";
  avatar: string;
  alt: string;
}

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"created" | "resolved">("created");

  // State for agent actions dropdown
  const [activeAgentMenu, setActiveAgentMenu] = useState<string | null>(null);
  const [removedAgentNames, setRemovedAgentNames] = useState<string[]>([]);

  // New ticket form state
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState<TicketItem["priority"]>("Medium");
  const [newAgent, setNewAgent] = useState("Sarah Jenkins");

  // Telemetry metric multipliers based on time range
  const metricsData = {
    "Last 7 Days": { totalTickets: "648", resolution: "96.1%", csat: "4.89", activeAgents: "40", ticketDiff: "+8%" },
    "Last 30 Days": { totalTickets: "2,842", resolution: "94.2%", csat: "4.82", activeAgents: "42", ticketDiff: "+12%" },
    "Last 90 Days": { totalTickets: "8,120", resolution: "93.8%", csat: "4.79", activeAgents: "45", ticketDiff: "+15%" },
    "Year to Date": { totalTickets: "24,510", resolution: "95.0%", csat: "4.85", activeAgents: "48", ticketDiff: "+18%" },
  };

  const currentMetrics = metricsData[timeRange as keyof typeof metricsData] || metricsData["Last 30 Days"];

  // Weekly ticket trend data
  const chartData = [
    { day: "Mon", created: 142, resolved: 120, heightPct: "60%" },
    { day: "Tue", created: 110, resolved: 98, heightPct: "45%" },
    { day: "Wed", created: 185, resolved: 160, heightPct: "75%" },
    { day: "Thu", created: 210, resolved: 195, heightPct: "85%" },
    { day: "Fri", created: 135, resolved: 140, heightPct: "55%" },
    { day: "Sat", created: 230, resolved: 210, heightPct: "90%" },
    { day: "Sun", created: 160, resolved: 155, heightPct: "65%" },
  ];

  const initialTickets: TicketItem[] = [
    { id: "#TK-4821", subject: "Database latency in EU-West cluster", agent: "Sarah Jenkins", status: "In Progress", priority: "High" },
    { id: "#TK-4819", subject: "SSO Authentication failure - Global", agent: "Marcus T.", status: "In Progress", priority: "Critical" },
    { id: "#TK-4815", subject: "Billing mismatch for Tier 2 Subscription", agent: "Elena Rossi", status: "Resolved", priority: "Medium" },
    { id: "#TK-4812", subject: "API Webhook documentation correction", agent: "David Kim", status: "Closed", priority: "Low" },
    { id: "#TK-4809", subject: "SaaS Analytics export feature timeout", agent: "Sarah Jenkins", status: "In Progress", priority: "Medium" },
  ];

  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);

  const agents: AgentItem[] = [
    {
      name: "Sarah Jenkins",
      role: "Technical Tier 2",
      openTickets: 12,
      status: "online",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb32uy6QxBgqqUpCDwVodXPXat9dBOWlO6-EU6u0KjQLAoGUfuD35l12sWlcfVqoj4Tkhv6DIvfI4_Ual2zt8j5M6MoFFxsxPlnugZTtjxz0ORtUgdLSGHVQDwsmvEvfXwJAm5loq06UsjQmI_HuR_WxsKj1uNOzqrdJJ5ILvbHcWXzcTSSgccKZ4QqDHHFQ3r3ElQFSfvzzxbTiIKsskzcCfzKauG7irXutOhccg4POiqm2_tVeQAn3dTO3WmQZ4tkTCM-0ZMNCfA",
      alt: "Sarah Jenkins portrait",
    },
    {
      name: "Marcus T.",
      role: "Security Lead",
      openTickets: 8,
      status: "online",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuATwqQMvuxU0vaQUxyer3FmOXk0-dtqQnOSlwIbwtlDOL1BtGKbvonQ0ixKiDKop3IH0LOXwBGqny5ciyTGa1JTk8fHX-3Wop3sz0fTJ5V80QasjWDRthedJ4sv3-nxFZXWRbpybuUdGft4GqiW8fHrGZAxjeJRLHyUu4sXTCnxrUR7msDUWl6Gpo3TpIQMxzPiEQosb9oyhMkp_zUGxQfbZLjo6ZnawCkKJTqMuig_UKuNn6p6pvZsJ39Q56Zg0gaI89K3zMBongwO",
      alt: "Marcus Thompson portrait",
    },
    {
      name: "Elena Rossi",
      role: "Billing Expert",
      openTickets: 15,
      status: "away",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwbByKHA6I1abuYpQ0D7_xK59XK88k9Yk4a5c2JRTLso0doeShg4bYw8Y4wlYp5UZYXIKq154Pyi5edlm_g33XMDpyODXpOjX6QCNtQxx0EpoZWEf16y5CgYYJAJRIflp1Bohj2UhLgqWuXY65-KelxTpxs6zTgZSXzVGQQ6sQn5i9u5KWOKr20B9_depZVvamHXKrTNY8t0GaL6OnkqFbdmSvhGMjbq8ERLx5PmpGmi0zbVCHzVQcThRsPxM3hb8WjGKQPVUTzYe0",
      alt: "Elena Rossi portrait",
    },
    {
      name: "David Kim",
      role: "API Support",
      openTickets: 0,
      status: "offline",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA71gKLS6EZTtMTlcTlCdtGfwOwB-27D1iPLu_ICjPXSpaH9hFUEwVhVFbjSWLX67W6vyAamkEVOD-Riw_yh9Rcp5oSqVcwZA2kB2l1-TGm2suZihpDdWJVn7XFT-LkivHC5AfwkCbtCBH4qVgtdbWYAIcW9Yi9hF3nu3PSpj733BKBLVjpTHuyvZsVHVO8udjtlP0XBk4b2FbDqFQQrr8WgeJ0C8WF9rFvxzZrSzPfdui2gy33ssOkQbj_vc3PWe7alLl-3GkhG7kF",
      alt: "David Kim portrait",
    },
  ];

  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      setSearchQuery(customEvt.detail || "");
    };

    const handleOpenModal = () => {
      setShowNewTicketModal(true);
    };

    window.addEventListener("admin-search", handleSearch);
    window.addEventListener("open-new-ticket-modal", handleOpenModal);

    return () => {
      window.removeEventListener("admin-search", handleSearch);
      window.removeEventListener("open-new-ticket-modal", handleOpenModal);
    };
  }, []);

  const filteredTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      triggerToast(`Report for ${timeRange} successfully generated and downloaded (PDF/CSV).`);
    }, 1000);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleViewTelemetry = (agentName: string) => {
    setActiveAgentMenu(null);
    triggerToast(`Opening telemetry for ${agentName}.`);
  };

  const handleReassignQueue = (agentName: string) => {
    setActiveAgentMenu(null);
    triggerToast(`Queue reassignment started for ${agentName}.`);
  };

  const handleRemoveAgent = (agentName: string) => {
    if (!window.confirm(`Remove ${agentName} from the active agent list?`)) return;

    setRemovedAgentNames((current) => [...current, agentName]);
    setActiveAgentMenu(null);
    triggerToast(`${agentName} removed from the active agent list.`);
  };

  const visibleAgents = agents.filter((agent) => !removedAgentNames.includes(agent.name));

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newId = `#TK-${Math.floor(4822 + Math.random() * 500)}`;
    const newTicket: TicketItem = {
      id: newId,
      subject: newSubject,
      agent: newAgent,
      status: "In Progress",
      priority: newPriority,
    };

    setTickets([newTicket, ...tickets]);
    setNewSubject("");
    setShowNewTicketModal(false);
    triggerToast(`Ticket ${newId} created and assigned to ${newAgent}!`);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const closeMenus = () => {
      setActiveAgentMenu(null);
    };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Real-time performance metrics and operational telemetry for Kinetic Enterprise TMS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2 cursor-pointer hover:border-primary transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] mr-2 text-outline">
                calendar_today
              </span>
              <span className="text-body-md font-medium text-on-surface">
                {timeRange}
              </span>
              <span className="material-symbols-outlined text-[18px] ml-2 text-outline">
                expand_more
              </span>
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-150">
                {["Last 7 Days", "Last 30 Days", "Last 90 Days", "Year to Date"].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setIsTimeDropdownOpen(false);
                      triggerToast(`Dashboard updated for ${range}`);
                    }}
                    className={`w-full text-left px-3 py-2 text-body-md rounded-lg transition-colors flex items-center justify-between ${
                      timeRange === range
                        ? "bg-secondary-container text-on-secondary-container font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    <span>{range}</span>
                    {timeRange === range && (
                      <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isExporting ? "animate-spin" : ""}`}>
              {isExporting ? "sync" : "download"}
            </span>
            <span>{isExporting ? "Exporting..." : "Export Report"}</span>
          </button>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-stack-md mb-stack-lg">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined p-2 bg-primary-container/10 text-primary rounded-lg group-hover:scale-110 transition-transform">
              confirmation_number
            </span>
            <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
              {currentMetrics.ticketDiff}
            </span>
          </div>
          <p className="text-label-md text-outline font-label-md uppercase tracking-wider">
            Total Tickets
          </p>
          <h3 className="text-display font-display text-on-background mt-1">
            {currentMetrics.totalTickets}
          </h3>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined p-2 bg-secondary-container/30 text-secondary rounded-lg group-hover:scale-110 transition-transform">
              task_alt
            </span>
            <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
              +4%
            </span>
          </div>
          <p className="text-label-md text-outline font-label-md uppercase tracking-wider">
            Resolution Rate
          </p>
          <h3 className="text-display font-display text-on-background mt-1">
            {currentMetrics.resolution}
          </h3>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined p-2 bg-tertiary-container/10 text-tertiary rounded-lg group-hover:scale-110 transition-transform">
              star
            </span>
            <span className="text-[12px] font-bold text-error bg-error-container/20 px-2 py-0.5 rounded-full flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">trending_down</span>
              -2%
            </span>
          </div>
          <p className="text-label-md text-outline font-label-md uppercase tracking-wider">
            CSAT Score
          </p>
          <h3 className="text-display font-display text-on-background mt-1">
            {currentMetrics.csat}
          </h3>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined p-2 bg-on-tertiary-fixed-variant/10 text-on-tertiary-fixed-variant rounded-lg group-hover:scale-110 transition-transform">
              support_agent
            </span>
            <span className="text-[12px] font-bold text-primary bg-primary-fixed-dim/20 px-2 py-0.5 rounded-full">
              89% Util.
            </span>
          </div>
          <p className="text-label-md text-outline font-label-md uppercase tracking-wider">
            Active Agents
          </p>
          <h3 className="text-display font-display text-on-background mt-1">
            {currentMetrics.activeAgents}
          </h3>
        </div>
      </section>

      {/* Charts Grid (Bento Style) */}
      <section className="grid grid-cols-12 gap-stack-md mb-stack-lg">
        {/* Ticket Volume Trends Bar Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-headline-md text-headline-md text-on-background">
                Ticket Volume Trends
              </h4>
              <p className="text-xs text-outline">Daily volume telemetry across the week</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveChartTab(activeChartTab === "created" ? "resolved" : "created")}
                className="flex items-center gap-2 cursor-pointer group hover:opacity-80"
              >
                <span className={`w-3 h-3 rounded-full ${activeChartTab === "created" ? "bg-primary ring-2 ring-primary/30" : "bg-primary/40"}`} />
                <span className="text-label-md font-label-md text-outline">Created</span>
              </button>
              <button
                onClick={() => setActiveChartTab(activeChartTab === "resolved" ? "created" : "resolved")}
                className="flex items-center gap-2 cursor-pointer group hover:opacity-80"
              >
                <span className={`w-3 h-3 rounded-full ${activeChartTab === "resolved" ? "bg-tertiary ring-2 ring-tertiary/30" : "bg-tertiary/40"}`} />
                <span className="text-label-md font-label-md text-outline">Resolved</span>
              </button>
            </div>
          </div>

          {/* Interactive Chart Visualization */}
          <div className="h-64 w-full relative flex items-end justify-between px-4 pb-4">
            <div className="absolute inset-0 border-b border-l border-outline-variant/30 m-4 pointer-events-none" />

            {/* Grid Line Guides */}
            <div className="absolute inset-x-4 top-8 border-b border-dashed border-outline-variant/20 pointer-events-none" />
            <div className="absolute inset-x-4 top-24 border-b border-dashed border-outline-variant/20 pointer-events-none" />
            <div className="absolute inset-x-4 top-40 border-b border-dashed border-outline-variant/20 pointer-events-none" />

            {/* Bar Items */}
            {chartData.map((item) => {
              const val = activeChartTab === "created" ? item.created : item.resolved;
              return (
                <div key={item.day} className="flex-1 h-full flex flex-col justify-end items-center mx-1.5 relative group">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[11px] font-bold py-1 px-2.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap">
                    {val} {activeChartTab}
                  </div>

                  {/* Bar Fill */}
                  <div
                    style={{ height: item.heightPct }}
                    className={`w-full rounded-t-md transition-all duration-300 relative ${
                      activeChartTab === "created"
                        ? "bg-primary/20 group-hover:bg-primary"
                        : "bg-tertiary/20 group-hover:bg-tertiary"
                    }`}
                  >
                    <div
                      className={`absolute top-0 inset-x-0 h-1 rounded-t-md ${
                        activeChartTab === "created" ? "bg-primary" : "bg-tertiary"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between px-8 text-[11px] text-outline font-medium pt-2">
            {chartData.map((d) => (
              <span key={d.day} className="hover:text-primary transition-colors cursor-default">
                {d.day}
              </span>
            ))}
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs flex flex-col">
          <h4 className="font-headline-md text-headline-md text-on-background mb-6">
            Category Breakdown
          </h4>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 rounded-full border-[12px] border-surface-container-high flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
              {/* Simulated Donut Segments */}
              <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent border-b-transparent transform rotate-45" />
              <div className="absolute inset-0 rounded-full border-[12px] border-tertiary border-l-transparent border-t-transparent border-b-transparent transform -rotate-12" />
              <div className="absolute inset-0 rounded-full border-[12px] border-secondary border-l-transparent border-r-transparent border-b-transparent transform rotate-180" />

              <div className="text-center bg-surface-container-lowest p-4 rounded-full shadow-xs">
                <p className="text-display font-display text-on-background leading-none font-bold">
                  842
                </p>
                <p className="text-label-md font-label-md text-outline uppercase mt-1">
                  Total
                </p>
              </div>
            </div>

            <div className="mt-8 w-full space-y-3">
              {[
                { name: "Technical Support", pct: "45%", color: "bg-primary" },
                { name: "Account Access", pct: "32%", color: "bg-tertiary" },
                { name: "Security Alerts", pct: "23%", color: "bg-secondary" },
              ].map((cat) => (
                <div
                  key={cat.name}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.name ? null : cat.name)
                  }
                  className={`flex items-center justify-between text-body-md p-2 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === cat.name
                      ? "bg-surface-container-low font-bold"
                      : "hover:bg-surface-container-low/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="text-on-surface-variant">{cat.name}</span>
                  </div>
                  <span className="font-bold text-on-surface">{cat.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Data Row */}
      <section className="grid grid-cols-12 gap-stack-md">
        {/* Recent System Tickets Table */}
        <div className="col-span-12 xl:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden flex flex-col">
          <div className="p-stack-md border-b border-outline-variant flex items-center justify-between">
            <div>
              <h4 className="font-headline-md text-headline-md text-on-background">
                Recent System Tickets
              </h4>
              {searchQuery && (
                <p className="text-xs text-primary mt-0.5">
                  Filtered by: "{searchQuery}" ({filteredTickets.length} found)
                </p>
              )}
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="text-primary text-body-md font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              New Ticket
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-label-md font-label-md text-outline uppercase tracking-wider">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                </tr>
              </thead>
              <tbody className="text-body-md text-on-surface divide-y divide-outline-variant/30">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-outline">
                      No matching tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-surface-container-low/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-code text-primary font-medium group-hover:underline">
                        {t.id}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate font-medium">{t.subject}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{t.agent}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            t.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : t.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1.5 font-semibold ${
                            t.priority === "Critical" || t.priority === "High"
                              ? "text-error"
                              : t.priority === "Medium"
                              ? "text-secondary"
                              : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              t.priority === "Critical" || t.priority === "High"
                                ? "bg-error"
                                : t.priority === "Medium"
                                ? "bg-secondary"
                                : "bg-gray-400"
                            }`}
                          />
                          {t.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-outline-variant bg-surface-container-low flex justify-between items-center text-xs text-outline">
            <span>Showing {filteredTickets.length} tickets</span>
            <Link href="/admin/categories" className="text-primary font-semibold hover:underline">
              View All Ticket Archives &rarr;
            </Link>
          </div>
        </div>

        {/* Active Agents List */}
        <div className="col-span-12 xl:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs flex flex-col">
          <div className="p-stack-md border-b border-outline-variant flex items-center justify-between">
            <h4 className="font-headline-md text-headline-md text-on-background">
              Active Agents
            </h4>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              42 Online
            </span>
          </div>

          <div className="p-stack-md space-y-4 overflow-y-auto max-h-[400px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Agent</span>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Active Tickets</span>
            </div>
            
            {visibleAgents.map((agent, agentIndex) => {
              const totalCapacity = 20;
              const usagePct = (agent.openTickets / totalCapacity) * 100;
              const barColor = usagePct > 70 ? 'bg-error' : usagePct > 40 ? 'bg-primary' : 'bg-green-500';
              const opensUpward = visibleAgents.length > 1 && agentIndex >= visibleAgents.length - 2;

              return (
                <div
                  key={agent.name}
                  className={`flex items-center justify-between group rounded-lg transition-colors ${
                    agent.status === "offline" ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={agent.avatar}
                        alt={agent.alt}
                        className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant object-cover group-hover:scale-105 transition-transform"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                          agent.status === "online"
                            ? "bg-green-500"
                            : agent.status === "away"
                            ? "bg-yellow-500"
                            : "bg-outline"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-body-md font-bold text-on-surface group-hover:text-primary transition-colors">
                        {agent.name}
                      </p>
                      <p className="text-label-md text-outline font-label-md">{agent.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Active Tickets Progress Bar */}
                    <div className="flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${usagePct}%` }} />
                      </div>
                      <span className={`text-body-md font-bold ${usagePct > 70 ? 'text-error' : 'text-on-surface'}`}>
                        {agent.openTickets}
                      </span>
                    </div>
                    
                    {/* 3-dots Menu */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAgentMenu(activeAgentMenu === agent.name ? null : agent.name);
                        }}
                        className="p-1.5 text-outline hover:bg-surface-container-low rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      
                      {activeAgentMenu === agent.name && (
                        <div
                          className={`absolute right-0 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100 ${
                            opensUpward ? "bottom-full mb-1" : "top-full mt-1"
                          }`}
                        >
                          <Link
                            href={`/admin/dashboard/telemetry?agent=${encodeURIComponent(agent.name)}`}
                            onClick={() => handleViewTelemetry(agent.name)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-body-md text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            View Telemetry
                          </Link>
                          <button
                            onClick={() => handleReassignQueue(agent.name)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-body-md text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">call_split</span>
                            Reassign Queue
                          </button>
                          <div className="my-1 border-t border-outline-variant" />
                          <button
                            onClick={() => handleRemoveAgent(agent.name)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-body-md text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Remove Agent
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-stack-md bg-surface-container-low border-t border-outline-variant">
            <Link
              href="/admin/departments"
              className="w-full block text-center py-2 border border-outline-variant rounded-lg text-body-md font-semibold hover:bg-surface-container-lowest transition-colors cursor-pointer"
            >
              Manage Team & Agents
            </Link>
          </div>
        </div>
      </section>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                Create New Ticket
              </h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Ticket Subject
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Server cluster failover investigation"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Assign Agent
                </label>
                <select
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Technical Tier 2)</option>
                  <option value="Marcus T.">Marcus T. (Security Lead)</option>
                  <option value="Elena Rossi">Elena Rossi (Billing Expert)</option>
                  <option value="David Kim">David Kim (API Support)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Priority Level
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketItem["priority"])}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
