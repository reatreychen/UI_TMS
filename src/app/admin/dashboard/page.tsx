"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";

interface TicketItem {
  id: string;
  rawId?: string;
  subject: string;
  agent: string;
  status: "In Progress" | "Resolved" | "Closed" | "Pending";
  priority: "Low" | "Medium" | "High" | "Critical";
  createdAt?: string;
}

interface AgentItem {
  id?: string;
  name: string;
  role: string;
  openTickets: number;
  status: "online" | "away" | "offline";
  avatar: string;
  alt: string;
}

interface BackendTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  createdAt?: string;
  assignedAgent?: {
    id: string;
    fullName: string;
    email: string;
    jobTitle?: string;
    avatarUrl?: string;
  };
  customer?: {
    id: string;
    fullName: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  jobTitle?: string;
  isActive?: boolean;
  avatarUrl?: string;
  role?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

interface CategoryItem {
  id: string;
  name: string;
}

interface AnalyticsData {
  totalTickets: number;
  triageInsights: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  urgentSlaWatch?: {
    atRiskCount: number;
    items: Array<any>;
  };
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

  // API State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [backendUsers, setBackendUsers] = useState<BackendUser[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // State for agent actions dropdown
  const [activeAgentMenu, setActiveAgentMenu] = useState<string | null>(null);
  const [removedAgentNames, setRemovedAgentNames] = useState<string[]>([]);

  // New ticket form state
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TicketItem["priority"]>("Medium");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Helpers to map backend statuses and priorities to UI formats
  const formatStatus = (status: string): TicketItem["status"] => {
    const s = status ? status.toUpperCase() : "";
    if (s === "IN_PROGRESS" || s === "IN PROGRESS") return "In Progress";
    if (s === "RESOLVED") return "Resolved";
    if (s === "CLOSED") return "Closed";
    return "Pending";
  };

  const formatPriority = (priority: string): TicketItem["priority"] => {
    const p = priority ? priority.toUpperCase() : "";
    if (p === "CRITICAL") return "Critical";
    if (p === "HIGH") return "High";
    if (p === "LOW") return "Low";
    return "Medium";
  };

  const toBackendPriority = (priority: TicketItem["priority"]): string => {
    return priority.toUpperCase();
  };

  // Initial Mock Fallbacks if backend has no data yet
  const initialFallbackTickets: TicketItem[] = [
    { id: "#TK-4821", subject: "Database latency in EU-West cluster", agent: "Sarah Jenkins", status: "In Progress", priority: "High" },
    { id: "#TK-4819", subject: "SSO Authentication failure - Global", agent: "Marcus T.", status: "In Progress", priority: "Critical" },
    { id: "#TK-4815", subject: "Billing mismatch for Tier 2 Subscription", agent: "Elena Rossi", status: "Resolved", priority: "Medium" },
    { id: "#TK-4812", subject: "API Webhook documentation correction", agent: "David Kim", status: "Closed", priority: "Low" },
    { id: "#TK-4809", subject: "SaaS Analytics export feature timeout", agent: "Sarah Jenkins", status: "In Progress", priority: "Medium" },
  ];

  const initialFallbackAgents: AgentItem[] = [
    {
      name: "Sarah Jenkins",
      role: "Technical Tier 2",
      openTickets: 12,
      status: "online",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      alt: "Sarah Jenkins portrait",
    },
    {
      name: "Marcus T.",
      role: "Security Lead",
      openTickets: 8,
      status: "online",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      alt: "Marcus Thompson portrait",
    },
    {
      name: "Elena Rossi",
      role: "Billing Expert",
      openTickets: 15,
      status: "away",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      alt: "Elena Rossi portrait",
    },
    {
      name: "David Kim",
      role: "API Support",
      openTickets: 0,
      status: "offline",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      alt: "David Kim portrait",
    },
  ];

  // Load Dashboard Data from Backend API
  const fetchDashboardData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    else setIsLoading(true);
    setApiError(null);

    try {
      // 1. Fetch Ticket Analytics Overview
      try {
        const analyticsRes = await api.get("/tickets/analytics/overview");
        if (analyticsRes.data?.data) {
          setAnalyticsData(analyticsRes.data.data);
        }
      } catch (err: any) {
        console.warn("Analytics endpoint returned non-200 or errored:", err?.message);
      }

      // 2. Fetch Recent System Tickets
      let rawTickets: BackendTicket[] = [];
      try {
        const ticketsRes = await api.get("/tickets?limit=50");
        rawTickets = ticketsRes.data?.data?.data || ticketsRes.data?.data || [];
      } catch (err: any) {
        console.warn("Tickets endpoint failed:", err?.message);
      }

      if (Array.isArray(rawTickets) && rawTickets.length > 0) {
        const formatted: TicketItem[] = rawTickets.map((t) => ({
          id: t.ticketNumber || `#TK-${t.id.slice(0, 5).toUpperCase()}`,
          rawId: t.id,
          subject: t.subject,
          agent: t.assignedAgent?.fullName || "Unassigned",
          status: formatStatus(t.status),
          priority: formatPriority(t.priority),
          createdAt: t.createdAt,
        }));
        setTickets(formatted);
      } else {
        setTickets(initialFallbackTickets);
      }

      // 3. Fetch Users / Active Agents List
      let usersList: BackendUser[] = [];
      try {
        const usersRes = await api.get("/users");
        usersList = usersRes.data?.data || [];
        if (Array.isArray(usersList)) {
          setBackendUsers(usersList);
          if (usersList.length > 0 && !selectedAgentId) {
            setSelectedAgentId(usersList[0].id);
          }
        }
      } catch (err: any) {
        console.warn("Users endpoint failed:", err?.message);
      }

      // 4. Fetch Categories for Ticket Creation / Filtering
      try {
        const catRes = await api.get("/categories/public");
        const cats = catRes.data?.data?.data || catRes.data?.data || [];
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          if (!selectedCategoryId) {
            setSelectedCategoryId(cats[0].id);
          }
        }
      } catch (err: any) {
        console.warn("Categories public endpoint failed:", err?.message);
      }

    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setApiError("Unable to reach TMS backend API. Displaying operational view with fallback values.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedAgentId, selectedCategoryId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  // Compute Active Agents based on backend users or fallback
  const computedAgents: AgentItem[] = backendUsers.length > 0
    ? backendUsers.map((user) => {
        const agentTicketsCount = tickets.filter(
          (t) => t.agent.toLowerCase() === user.fullName.toLowerCase() && t.status !== "Closed"
        ).length;

        return {
          id: user.id,
          name: user.fullName,
          role: user.jobTitle || user.role?.name || "Support Specialist",
          openTickets: agentTicketsCount,
          status: user.isActive !== false ? "online" : "offline",
          avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D8ABC&color=fff`,
          alt: `${user.fullName} avatar`,
        };
      })
    : initialFallbackAgents;

  const visibleAgents = computedAgents.filter((agent) => !removedAgentNames.includes(agent.name));

  // Compute dynamic KPIs
  const totalTicketsCount = analyticsData?.totalTickets ?? (tickets.length > 0 ? tickets.length : 2842);
  const resolvedCount = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
  const computedResolutionRate = tickets.length > 0
    ? `${Math.round((resolvedCount / tickets.length) * 100)}%`
    : "94.2%";

  const currentMetrics = {
    totalTickets: totalTicketsCount.toLocaleString(),
    resolution: computedResolutionRate,
    csat: "4.82",
    activeAgents: visibleAgents.filter((a) => a.status === "online").length || visibleAgents.length,
    ticketDiff: "+12%",
  };

  // Dynamic Weekly Ticket Trend Data based on real system tickets
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayIndexMap: Record<number, string> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  const ticketDayCounts: Record<string, { created: number; resolved: number }> = {
    Mon: { created: 0, resolved: 0 },
    Tue: { created: 0, resolved: 0 },
    Wed: { created: 0, resolved: 0 },
    Thu: { created: 0, resolved: 0 },
    Fri: { created: 0, resolved: 0 },
    Sat: { created: 0, resolved: 0 },
    Sun: { created: 0, resolved: 0 },
  };

  if (tickets.length > 0) {
    tickets.forEach((t) => {
      let dayName = "Mon";
      if (t.createdAt) {
        const d = new Date(t.createdAt);
        if (!isNaN(d.getTime())) {
          dayName = dayIndexMap[d.getDay()] || "Mon";
        }
      } else {
        const dIndex = Math.abs((t.subject?.length || 0) + (t.id?.charCodeAt(t.id.length - 1) || 0)) % 7;
        dayName = daysOfWeek[dIndex];
      }

      if (ticketDayCounts[dayName]) {
        ticketDayCounts[dayName].created += 1;
        if (t.status === "Resolved" || t.status === "Closed") {
          ticketDayCounts[dayName].resolved += 1;
        }
      }
    });
  }

  const baseVolume = daysOfWeek.map((day) => ({
    day,
    created: ticketDayCounts[day].created,
    resolved: ticketDayCounts[day].resolved,
  }));

  const maxWeeklyVal = Math.max(...baseVolume.map((b) => Math.max(b.created, b.resolved)), 1);

  const chartData = baseVolume.map((item) => {
    const createdPct = item.created > 0 ? `${Math.max(12, Math.min(100, Math.round((item.created / maxWeeklyVal) * 100)))}%` : "4%";
    const resolvedPct = item.resolved > 0 ? `${Math.max(12, Math.min(100, Math.round((item.resolved / maxWeeklyVal) * 100)))}%` : "4%";
    return {
      ...item,
      createdPct,
      resolvedPct,
    };
  });

  // Category breakdown insights
  const triageInsights = analyticsData?.triageInsights && analyticsData.triageInsights.length > 0
    ? analyticsData.triageInsights
    : [
        { name: "Technical Support", count: 12, percentage: 45, color: "bg-primary" },
        { name: "Account Access", count: 8, percentage: 32, color: "bg-tertiary" },
        { name: "Security Alerts", count: 5, percentage: 23, color: "bg-secondary" },
      ];

  const colorHexMap: Record<string, string> = {
    "bg-primary": "#0256B4",
    "bg-blue-400": "#60A5FA",
    "bg-green-400": "#34D399",
    "bg-purple-400": "#A78BFA",
    "bg-amber-400": "#FBBF24",
    "bg-secondary": "#4A627D",
    "bg-tertiary": "#6C5CE7",
    "bg-outline-variant": "#C4C6D0",
  };

  const paletteColors = ["#0256B4", "#6C5CE7", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#60A5FA"];

  let accumPct = 0;
  const conicStops = triageInsights.map((cat, idx) => {
    const hexColor = colorHexMap[cat.color] || paletteColors[idx % paletteColors.length];
    const startPct = accumPct;
    accumPct += cat.percentage;
    const endPct = Math.min(100, accumPct);
    return `${hexColor} ${startPct}% ${endPct}%`;
  });

  const conicGradientBg = conicStops.length > 0
    ? `conic-gradient(${conicStops.join(", ")})`
    : `conic-gradient(#0256B4 0% 100%)`;

  const totalDonutCount = triageInsights.reduce((sum, item) => sum + (item.count || 0), 0) || totalTicketsCount;

  const filteredTickets = tickets.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.priority.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      try {
        await api.post("/reports", {
          title: `TMS Admin Dashboard Report (${timeRange})`,
          type: "TICKET_SUMMARY",
          exportFormat: "CSV",
        });
      } catch (err) {
        console.warn("Backend report creation skipped:", err);
      }

      const headers = ["Ticket ID", "Subject", "Assigned Agent", "Status", "Priority"];
      const rows = tickets.map((t) => [
        `"${(t.id || '').replace(/"/g, '""')}"`,
        `"${(t.subject || '').replace(/"/g, '""')}"`,
        `"${(t.agent || '').replace(/"/g, '""')}"`,
        `"${(t.status || '').replace(/"/g, '""')}"`,
        `"${(t.priority || '').replace(/"/g, '""')}"`,
      ]);

      const csvHeader = `# Kinetic Enterprise TMS - Operational Report (${timeRange})\n# Generated At: ${new Date().toLocaleString()}\n# Total Tickets: ${currentMetrics.totalTickets} | Resolution Rate: ${currentMetrics.resolution} | CSAT: ${currentMetrics.csat} | Active Agents: ${currentMetrics.activeAgents}\n\n`;
      const csvBody = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const csvContent = csvHeader + csvBody;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const sanitizedRange = timeRange.toLowerCase().replace(/[^a-z0-9]/g, "_");
      link.setAttribute("download", `TMS_Dashboard_Report_${sanitizedRange}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerToast(`Report for ${timeRange} successfully generated and downloaded (CSV).`);
    } catch (err: any) {
      console.error("Failed to export report:", err);
      triggerToast("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to convert UI status to backend status
  const toBackendStatus = (statusStr: string): string => {
    if (statusStr === "In Progress") return "IN_PROGRESS";
    if (statusStr === "Resolved") return "RESOLVED";
    if (statusStr === "Closed") return "CLOSED";
    return "PENDING";
  };

  // Ticket Edit / Detail Modal State
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [editStatus, setEditStatus] = useState<TicketItem["status"]>("In Progress");
  const [editPriority, setEditPriority] = useState<TicketItem["priority"]>("Medium");
  const [editAgentId, setEditAgentId] = useState<string>("");
  const [isSavingTicket, setIsSavingTicket] = useState(false);

  // Reassign Queue Modal State
  const [reassignAgent, setReassignAgent] = useState<AgentItem | null>(null);
  const [targetAgentId, setTargetAgentId] = useState<string>("");
  const [isReassigning, setIsReassigning] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleViewTelemetry = (agentName: string) => {
    setActiveAgentMenu(null);
    triggerToast(`Opening telemetry for ${agentName}.`);
  };

  // Save Ticket Updates via Backend API
  const handleSaveTicketUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSavingTicket(true);
    try {
      if (selectedTicket.rawId) {
        const rawId = selectedTicket.rawId;

        // 1. Update Status via PATCH /tickets/:id/status
        try {
          await api.patch(`/tickets/${rawId}/status`, {
            status: toBackendStatus(editStatus),
          });
        } catch (statusErr: any) {
          console.warn("Status update endpoint note:", statusErr?.response?.data?.message || statusErr.message);
        }

        // 2. Update Priority & Agent via PATCH /tickets/:id
        const payload: any = {
          priority: toBackendPriority(editPriority),
        };
        if (editAgentId) {
          payload.assignedAgentId = editAgentId;
        }
        await api.patch(`/tickets/${rawId}`, payload);
      }

      triggerToast(`Ticket ${selectedTicket.id} updated successfully!`);
      setSelectedTicket(null);
      await fetchDashboardData(true);
    } catch (err: any) {
      console.error("Failed to update ticket:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to update ticket";
      triggerToast(`Update failed: ${Array.isArray(errMsg) ? errMsg.join(", ") : errMsg}`);
    } finally {
      setIsSavingTicket(false);
    }
  };

  // Reassign Agent Queue via Backend API
  const handleConfirmReassignQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignAgent) return;

    setIsReassigning(true);
    try {
      const agentTickets = tickets.filter(
        (t) => t.agent.toLowerCase() === reassignAgent.name.toLowerCase() && t.rawId
      );

      if (agentTickets.length > 0 && targetAgentId) {
        await Promise.all(
          agentTickets.map((t) =>
            api.patch(`/tickets/${t.rawId}`, {
              assignedAgentId: targetAgentId,
            })
          )
        );
      }

      const targetUser = backendUsers.find((u) => u.id === targetAgentId);
      triggerToast(`Reassigned queue of ${reassignAgent.name} to ${targetUser?.fullName || "new agent"}!`);
      setReassignAgent(null);
      await fetchDashboardData(true);
    } catch (err: any) {
      console.error("Reassign queue failed:", err);
      triggerToast(`Queue reassign failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsReassigning(false);
    }
  };

  const handleRemoveAgent = (agentName: string) => {
    if (!window.confirm(`Remove ${agentName} from the active agent list?`)) return;

    setRemovedAgentNames((current) => [...current, agentName]);
    setActiveAgentMenu(null);
    triggerToast(`${agentName} removed from the active agent list.`);
  };

  // Submit ticket creation to Backend API
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    setIsSubmitting(true);
    try {
      const customerId = backendUsers[0]?.id || "a0000000-0000-0000-0000-000000000001";
      const payload: any = {
        subject: newSubject.trim(),
        description: newDescription.trim() || newSubject.trim(),
        priority: toBackendPriority(newPriority),
        customerId,
      };

      if (selectedAgentId) {
        payload.assignedAgentId = selectedAgentId;
      }
      if (selectedCategoryId) {
        payload.categoryId = selectedCategoryId;
      }

      const res = await api.post("/tickets", payload);
      const createdTicket = res.data?.data;
      const createdNum = createdTicket?.ticketNumber || `#TK-${Math.floor(4822 + Math.random() * 500)}`;

      const assignedAgentObj = backendUsers.find((u) => u.id === selectedAgentId);
      const assignedName = assignedAgentObj?.fullName || "Assigned Agent";

      triggerToast(`Ticket ${createdNum} created and assigned to ${assignedName}!`);
      setNewSubject("");
      setNewDescription("");
      setShowNewTicketModal(false);

      // Refresh dashboard data
      await fetchDashboardData(true);
    } catch (err: any) {
      console.error("Failed to create ticket:", err);
      const errDetail = err.response?.data?.message || err.message || "Failed to create ticket";
      triggerToast(`Error creating ticket: ${Array.isArray(errDetail) ? errDetail.join(", ") : errDetail}`);
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Top Banner Warning if Backend Error */}
      {apiError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between text-body-md shadow-xs mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <span>{apiError}</span>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background font-bold tracking-tight flex items-center gap-2">
            <span>Dashboard Overview</span>
            {isRefreshing && (
              <span className="material-symbols-outlined text-[20px] text-primary animate-spin">
                sync
              </span>
            )}
          </h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Real-time performance metrics and operational telemetry for Kinetic Enterprise TMS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isLoading || isRefreshing}
            title="Refresh Live Data"
            className="bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-outline hover:text-primary hover:border-primary transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>

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
                      fetchDashboardData(true);
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
            {isLoading ? "..." : currentMetrics.totalTickets}
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
            {isLoading ? "..." : currentMetrics.resolution}
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
            Customer Rating (CSAT)
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
            {isLoading ? "..." : currentMetrics.activeAgents}
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
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-label-md font-label-md text-outline">Created</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-label-md font-label-md text-outline">Resolved</span>
              </div>
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
            {chartData.map((item) => (
              <div key={item.day} className="flex-1 h-full flex items-end justify-center gap-1.5 mx-1 relative group">
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[11px] font-bold py-1 px-2.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap">
                  {item.created} Created · {item.resolved} Resolved
                </div>

                {/* Created Bar (Blue) */}
                <div
                  style={{ height: item.createdPct }}
                  className="w-1/2 max-w-[22px] bg-primary/20 group-hover:bg-primary transition-all duration-300 rounded-t-md relative"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-primary rounded-t-md" />
                </div>

                {/* Resolved Bar (Gray / Slate) */}
                <div
                  style={{ height: item.resolvedPct }}
                  className="w-1/2 max-w-[22px] bg-slate-200 group-hover:bg-slate-400 transition-all duration-300 rounded-t-md relative"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-slate-500 rounded-t-md" />
                </div>
              </div>
            ))}
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
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105 shadow-inner">
              <div
                className="absolute inset-0 rounded-full transition-all duration-700"
                style={{
                  background: conicGradientBg,
                  mask: "radial-gradient(transparent 58%, black 59%)",
                  WebkitMask: "radial-gradient(transparent 58%, black 59%)",
                }}
              />

              <div className="text-center bg-surface-container-lowest p-4 rounded-full shadow-md z-10 w-28 h-28 flex flex-col items-center justify-center border border-outline-variant/20">
                <p className="text-display font-display text-on-background leading-none font-bold">
                  {isLoading ? "..." : totalDonutCount}
                </p>
                <p className="text-label-md font-label-md text-outline uppercase mt-1">
                  Total
                </p>
              </div>
            </div>

            <div className="mt-8 w-full space-y-3">
              {triageInsights.map((cat, idx) => {
                const colorClass = cat.color || (idx === 0 ? "bg-primary" : idx === 1 ? "bg-tertiary" : "bg-secondary");
                const pctStr = typeof cat.percentage === "number" ? `${cat.percentage}%` : cat.percentage;
                return (
                  <div
                    key={cat.name ? `${cat.name}-${idx}` : `insight-${idx}`}
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
                      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      <span className="text-on-surface-variant">{cat.name}</span>
                    </div>
                    <span className="font-bold text-on-surface">{pctStr}</span>
                  </div>
                );
              })}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-outline">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                        <span>Loading live tickets...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-outline">
                      No matching tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t, index) => (
                    <tr
                      key={t.rawId ? t.rawId : `${t.id}-${index}`}
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
              {visibleAgents.filter((a) => a.status === "online").length || visibleAgents.length} Online
            </span>
          </div>

          <div className="p-stack-md space-y-4 overflow-y-auto max-h-[400px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Agent</span>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Active Tickets</span>
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center text-outline flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                <span>Fetching team...</span>
              </div>
            ) : (
              visibleAgents.map((agent, agentIndex) => {
                const totalCapacity = 20;
                const usagePct = Math.min(100, (agent.openTickets / totalCapacity) * 100);
                const barColor = usagePct > 70 ? 'bg-error' : usagePct > 40 ? 'bg-primary' : 'bg-green-500';
                const opensUpward = visibleAgents.length > 1 && agentIndex >= visibleAgents.length - 2;

                return (
                  <div
                    key={agent.id ? agent.id : `${agent.name}-${agentIndex}`}
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
                              onClick={() => {
                                setActiveAgentMenu(null);
                                setReassignAgent(agent);
                                const otherAgent = backendUsers.find((u) => u.fullName.toLowerCase() !== agent.name.toLowerCase());
                                setTargetAgentId(otherAgent?.id || backendUsers[0]?.id || "");
                              }}
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
              })
            )}
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
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide additional issue context..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Assign Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                >
                  {backendUsers.length > 0 ? (
                    backendUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.jobTitle || user.role?.name || "Agent"})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="">Sarah Jenkins (Technical Tier 2)</option>
                      <option value="">Marcus T. (Security Lead)</option>
                      <option value="">Elena Rossi (Billing Expert)</option>
                      <option value="">David Kim (API Support)</option>
                    </>
                  )}
                </select>
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-outline uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  disabled={isSubmitting}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  )}
                  <span>{isSubmitting ? "Creating..." : "Submit Ticket"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details & Quick Edit Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                Ticket {selectedTicket.id}
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTicketUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Subject
                </label>
                <p className="bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md font-medium text-on-surface">
                  {selectedTicket.subject}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Status Transition
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TicketItem["status"])}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none font-medium"
                >
                  <option value="Pending">Pending / Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Priority Level
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as TicketItem["priority"])}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Assigned Agent
                </label>
                <select
                  value={editAgentId}
                  onChange={(e) => setEditAgentId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none font-medium"
                >
                  <option value="">Unassigned</option>
                  {backendUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.jobTitle || user.role?.name || "Agent"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  disabled={isSavingTicket}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTicket}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingTicket && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  )}
                  <span>{isSavingTicket ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Agent Queue Modal */}
      {reassignAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">call_split</span>
                Reassign Queue for {reassignAgent.name}
              </h3>
              <button
                onClick={() => setReassignAgent(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmReassignQueue} className="space-y-4">
              <p className="text-body-md text-on-surface-variant">
                Transfer all active tickets assigned to <strong className="text-on-surface">{reassignAgent.name}</strong> ({reassignAgent.openTickets} tickets) to another team agent:
              </p>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Target Agent
                </label>
                <select
                  value={targetAgentId}
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none font-medium"
                >
                  {backendUsers
                    .filter((u) => u.fullName.toLowerCase() !== reassignAgent.name.toLowerCase())
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.jobTitle || user.role?.name || "Agent"})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setReassignAgent(null)}
                  disabled={isReassigning}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReassigning}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isReassigning && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  )}
                  <span>{isReassigning ? "Reassigning..." : "Confirm Reassign"}</span>
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
