"use client";

import { useState, useEffect } from "react";
import {
  downloadReport,
  fetchAdminReportAnalytics,
  generateReport,
  type AdminReportAnalytics,
} from "@/src/services/reportService";

function formatHours(hours: number | null) {
  if (hours === null) return "—";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
}

function buildChartPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [department, setDepartment] = useState("All Departments");
  const [appliedDateRange, setAppliedDateRange] = useState("Last 30 Days");
  const [appliedDepartment, setAppliedDepartment] = useState("All Departments");
  const [isApplying, setIsApplying] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; volume: number; resolved: number; x: number; y: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [reportData, setReportData] = useState<AdminReportAnalytics | null>(null);
  const [reportError, setReportError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const totalTickets = reportData?.totalTickets ?? 0;
  const slaComplianceValue = reportData?.slaCompliance;

  const currentKPI = {
    sla: slaComplianceValue !== null && slaComplianceValue !== undefined
      ? `${slaComplianceValue}%`
      : "—",
    slaDiff: reportData?.slaDiff || "+0.0%",
    resTime: reportData?.averageResolutionHours !== null && reportData?.averageResolutionHours !== undefined
      ? formatHours(reportData.averageResolutionHours)
      : "—",
    resDiff: reportData?.resolutionDiff || "0m",
    ticketDiff: reportData?.ticketDiff || "+0%",
    csat: reportData?.avgRating !== null && reportData?.avgRating !== undefined
      ? String(reportData.avgRating)
      : "—",
    csatTrend: reportData?.csatTrend || "Stable",
  };

  // Data points for interactive SVG chart
  const maxVolume = Math.max(...(reportData?.volume.map((point) => point.newTickets) || [1]), 1);
  const dataPoints = reportData?.volume.map((point, index, points) => ({
    day: point.label,
    volume: point.newTickets,
    resolved: point.resolved,
    x: points.length > 1 ? (index / (points.length - 1)) * 1000 : 0,
    y: 260 - (point.newTickets / maxVolume) * 220,
    resolvedY: 260 - (point.resolved / maxVolume) * 220,
  })) || [];
  const volumePath = buildChartPath(dataPoints);
  const resolvedPath = buildChartPath(dataPoints.map((point) => ({ x: point.x, y: point.resolvedY })));

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Fetch report data
  const loadReportData = async (silent = false) => {
    if (!silent) setIsApplying(true);
    setReportError("");

    try {
      const data = await fetchAdminReportAnalytics(appliedDateRange, appliedDepartment);
      setReportData(data);
      setLastRefreshed(new Date());
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "Could not load report data.");
    } finally {
      if (!silent) setIsApplying(false);
    }
  };

  // Initial and on applied filter change
  useEffect(() => {
    void loadReportData(false);
  }, [appliedDateRange, appliedDepartment]);

  // Real-time Auto-Polling (every 30 seconds if tab is active)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void loadReportData(true);
      }
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [appliedDateRange, appliedDepartment]);

  // Listen to global admin header search
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      if (customEvt.detail) {
        triggerToast(`Filtering report view for "${customEvt.detail}"`);
      }
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const handleApplyFilters = () => {
    setAppliedDateRange(dateRange);
    setAppliedDepartment(department);
    triggerToast(`Applying filters for ${dateRange} (${department})...`);
  };

  const handleExportCSV = () => {
    void generateAndDownloadReport("CSV");
  };

  const handleExportPDF = () => {
    void generateAndDownloadReport("PDF");
  };  const generateAndDownloadReport = async (format: "CSV" | "PDF") => {
    if (format === "CSV") setIsExportingCSV(true);
    else setIsExportingPDF(true);

    try {
      if (format === "CSV") {
        const csvRows = [
          ["PERFORMANCE ANALYTICS REPORT"],
          ["Period", dateRange],
          ["Department Filter", department],
          ["Generated At", new Date().toLocaleString()],
          [""],
          ["KEY PERFORMANCE INDICATORS"],
          ["Metric", "Value", "Trend"],
          ["Total System Tickets", totalTickets, "+12%"],
          ["SLA Compliance", currentKPI.sla, currentKPI.slaDiff],
          ["Avg. Resolution Time", currentKPI.resTime, currentKPI.resDiff],
          ["Customer Rating (CSAT)", currentKPI.csat, "High Stability"],
          [""],
          ["EFFICIENCY BY DEPARTMENT"],
          ["Department", "Resolution Efficiency (%)"],
          ...(reportData?.departmentPerformance.map((d) => [d.department, `${d.percentage}%`]) || []),
          [""],
          ["SLA PERFORMANCE BY PRIORITY"],
          ["Priority", "Met", "Breached", "Success Rate (%)"],
          ...(reportData?.slaByPriority.map((s) => [s.priority, s.met, s.breached, `${s.successRate ?? 0}%`]) || []),
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `performance_analytics_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast("CSV performance report generated & downloaded.");
      } else {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Performance Analytics Report - ${dateRange}</title>
                <style>
                  @page { size: A4; margin: 20mm; }
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #0f172a; line-height: 1.5; }
                  .header { border-bottom: 2px solid #004ac6; padding-bottom: 15px; margin-bottom: 25px; }
                  h1 { color: #004ac6; margin: 0; font-size: 24px; }
                  .subtitle { color: #64748b; font-size: 13px; margin-top: 5px; }
                  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-between: 25px; margin-bottom: 25px; }
                  .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; }
                  .kpi-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
                  .kpi-val { font-size: 26px; font-weight: 800; margin-top: 6px; color: #0f172a; }
                  section { margin-bottom: 30px; }
                  h2 { font-size: 16px; color: #1e293b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 13px; }
                  th { background: #f1f5f9; font-weight: 700; color: #334155; }
                  tr:nth-child(even) { background: #f8fafc; }
                  .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Performance Analytics Executive Report</h1>
                  <div class="subtitle">Generated on ${new Date().toLocaleString()} | Period: ${dateRange} | Department: ${department}</div>
                </div>

                <div class="kpi-grid">
                  <div class="kpi-card"><div class="kpi-title">SLA Compliance</div><div class="kpi-val">${currentKPI.sla}</div></div>
                  <div class="kpi-card"><div class="kpi-title">Avg. Resolution Time</div><div class="kpi-val">${currentKPI.resTime}</div></div>
                  <div class="kpi-card"><div class="kpi-title">Total Tickets</div><div class="kpi-val">${totalTickets}</div></div>
                  <div class="kpi-card"><div class="kpi-title">Customer Rating</div><div class="kpi-val">${currentKPI.csat} / 5.0</div></div>
                </div>

                <section>
                  <h2>Efficiency by Department</h2>
                  <table>
                    <thead><tr><th>Department</th><th>Resolution Efficiency Rate</th></tr></thead>
                    <tbody>
                      ${(reportData?.departmentPerformance || []).map((d) => `<tr><td><strong>${d.department}</strong></td><td>${d.percentage}%</td></tr>`).join("")}
                    </tbody>
                  </table>
                </section>

                <section>
                  <h2>SLA Performance by Priority</h2>
                  <table>
                    <thead><tr><th>Priority Tier</th><th>Met (On-Time)</th><th>Breached (Overdue)</th><th>Success Rate</th></tr></thead>
                    <tbody>
                      ${(reportData?.slaByPriority || []).map((s) => `<tr><td><strong>${s.priority}</strong></td><td>${s.met}</td><td>${s.breached}</td><td><strong>${s.successRate ?? 0}%</strong></td></tr>`).join("")}
                    </tbody>
                  </table>
                </section>

                <div class="footer">
                  Confidential System Report &bull; Generated by Ticket Management System (TMS) &bull; All Rights Reserved
                </div>

                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                    }, 250);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
        triggerToast("PDF Performance Report opened for print / Save as PDF.");
      }
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "Could not export report.");
    } finally {
      if (format === "CSV") setIsExportingCSV(false);
      else setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Filter Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Performance Analytics & Reports
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-secondary font-body-md mt-1">
            Real-time analytics and audit metrics from <span className="font-bold text-primary">{totalTickets} system tickets</span>.
            {lastRefreshed && (
              <span className="text-xs text-outline ml-2">
                (Synced {lastRefreshed.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-outline-variant shadow-xs">
          {/* Manual Refresh */}
          <button
            onClick={() => void loadReportData(false)}
            disabled={isApplying}
            title="Refresh Live Data"
            className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors border-r border-outline-variant pr-3 cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <span className={`material-symbols-outlined text-[18px] ${isApplying ? "animate-spin text-primary" : ""}`}>
              sync
            </span>
          </button>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 px-3 py-2 border-r border-outline-variant">
            <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-body-md font-medium text-on-surface cursor-pointer outline-none"
            >
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Quarter">Last Quarter</option>
              <option value="Year to Date">Year to Date</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          {/* Department Selector */}
          <div className="flex items-center gap-2 px-3 py-2 border-r border-outline-variant">
            <span className="material-symbols-outlined text-secondary text-sm">filter_list</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-body-md text-secondary cursor-pointer outline-none"
            >
              <option value="All Departments">All Departments</option>
              <option value="Support">Support</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
            </select>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyFilters}
            disabled={isApplying}
            className="bg-primary text-white px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isApplying && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
            <span>{isApplying ? "Updating..." : "Apply Filters"}</span>
          </button>
        </div>
      </section>

      {reportError && (
        <div className="bg-error-container/20 border border-error/30 text-error px-4 py-3 rounded-lg text-body-md">
          {reportError}
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: SLA Compliance */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-blue-50 text-primary rounded-lg">
              verified_user
            </span>
            <span className={`font-bold text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${
              currentKPI.slaDiff.startsWith("-")
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {currentKPI.slaDiff.startsWith("-") ? "trending_down" : "trending_up"}
              </span>{" "}
              {currentKPI.slaDiff}
            </span>
          </div>
          <p className="text-secondary font-label-md mb-1 uppercase tracking-tight font-semibold">
            SLA Compliance
          </p>
          <p className="font-display text-display text-on-surface font-bold">{currentKPI.sla}</p>
        </div>

        {/* Card 2: Resolution Time */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-purple-50 text-purple-600 rounded-lg">
              timer
            </span>
            <span className={`font-bold text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${
              currentKPI.resDiff.startsWith("+")
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {currentKPI.resDiff.startsWith("+") ? "trending_up" : "trending_down"}
              </span>{" "}
              {currentKPI.resDiff}
            </span>
          </div>
          <p className="text-secondary font-label-md mb-1 uppercase tracking-tight font-semibold">
            Avg. Resolution Time
          </p>
          <p className="font-display text-display text-on-surface font-bold">{currentKPI.resTime}</p>
        </div>

        {/* Card 3: Total Tickets */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-green-50 text-green-600 rounded-lg">
              confirmation_number
            </span>
            <span className={`font-bold text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${
              currentKPI.ticketDiff.startsWith("-")
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {currentKPI.ticketDiff.startsWith("-") ? "trending_down" : "trending_up"}
              </span>{" "}
              {currentKPI.ticketDiff}
            </span>
          </div>
          <p className="text-secondary font-label-md mb-1 uppercase tracking-tight font-semibold">
            Total Tickets
          </p>
          <p className="font-display text-display text-on-surface font-bold">{totalTickets}</p>
        </div>

        {/* Card 4: CSAT Index */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-amber-50 text-amber-600 rounded-lg">
              star
            </span>
            <span className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
              {currentKPI.csatTrend}
            </span>
          </div>
          <p className="text-secondary font-label-md mb-1 uppercase tracking-tight font-semibold">
            Customer Rating (CSAT)
          </p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-display text-on-surface font-bold">{currentKPI.csat}</p>
            <p className="text-secondary font-body-md font-medium">/ 5.0</p>
          </div>
        </div>
      </section>

      {/* Large Main Interactive Chart */}
      <section className="bg-white p-8 rounded-xl border border-outline-variant shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Ticket Volume vs. Resolution Rate
            </h3>
            <p className="text-secondary font-body-md">Daily activity trends for the current period</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-label-md text-secondary">New Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary-container border border-primary" />
              <span className="font-label-md text-secondary">Resolved</span>
            </div>
          </div>
        </div>

        {/* SVG Chart Visualization */}
        <div className="w-full h-80 relative chart-grid border-b border-l border-outline-variant/30">
          <svg className="w-full h-full preserve-3d overflow-visible" viewBox="0 0 1000 300">
            {/* Resolution Line (Dotted) */}
            <path
              className="opacity-70"
              d={resolvedPath}
              fill="none"
              stroke="#d0e1fb"
              strokeDasharray="8 4"
              strokeWidth="4"
            />
            {/* Volume Line (Solid Primary) */}
            <path
              className="drop-shadow-lg"
              d={volumePath}
              fill="none"
              stroke="#004ac6"
              strokeWidth="5"
            />
            {/* Interactive Data Points */}
            {dataPoints.map((pt) => (
              <g key={pt.day}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.day === pt.day ? 9 : 6}
                  fill="#004ac6"
                  stroke="#fff"
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Dynamic Tooltip on Hover */}
          {hoveredPoint && (
            <div
              style={{
                left: `${Math.min(85, Math.max(5, (hoveredPoint.x / 1000) * 100))}%`,
                top: `${hoveredPoint.y - 60}px`,
              }}
              className="absolute bg-inverse-surface text-white text-xs p-2.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 transition-all z-20"
            >
              <p className="font-bold text-primary-fixed mb-0.5">{hoveredPoint.day}</p>
              <p>Volume: {hoveredPoint.volume} tickets</p>
              <p>Resolved: {hoveredPoint.resolved} tickets</p>
            </div>
          )}

          {/* Chart X-Axis Labels */}
          <div className="absolute bottom-[-24px] w-full flex justify-between text-[10px] text-secondary font-medium uppercase tracking-widest px-4">
            {dataPoints.map((pt) => (
              <span key={pt.day} className="hover:text-primary transition-colors cursor-default">
                {pt.day}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Split View Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Efficiency by Department */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant shadow-xs flex flex-col justify-between">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6">
            Efficiency by Department
          </h3>
          <div className="space-y-6">
            {(reportData?.departmentPerformance || []).map((item) => (
              <div key={item.department} className="space-y-2">
                <div className="flex justify-between font-label-md">
                  <span className="text-on-surface font-semibold">{item.department}</span>
                  <span className="text-primary font-bold">{item.percentage}%</span>
                </div>
                <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {!reportData?.departmentPerformance.length && !isApplying && (
              <p className="text-body-md text-secondary">No department data available.</p>
            )}
          </div>
        </div>

        {/* SLA Performance by Priority Table */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant shadow-xs overflow-hidden">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6">
            SLA Performance by Priority
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-md text-secondary uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Priority</th>
                  <th className="pb-4 font-semibold text-center">Met</th>
                  <th className="pb-4 font-semibold text-center">Breached</th>
                  <th className="pb-4 font-semibold text-right">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-body-md">
                {(reportData?.slaByPriority || []).map((item) => {
                  const priorityStyles = {
                    CRITICAL: "bg-red-50 text-red-600",
                    HIGH: "bg-orange-50 text-orange-600",
                    MEDIUM: "bg-blue-50 text-blue-600",
                    LOW: "bg-gray-50 text-gray-600",
                  }[item.priority] || "bg-surface-container text-secondary";

                  return (
                    <tr key={item.priority}>
                      <td className="py-4">
                        <span className={`${priorityStyles} text-[10px] font-bold px-2 py-1 rounded uppercase`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-4 text-center font-body-md">{item.met}</td>
                      <td className="py-4 text-center font-body-md text-error font-semibold">{item.breached}</td>
                      <td className="py-4 text-right font-bold text-green-600">
                        {item.successRate === null ? "—" : `${item.successRate}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Export Center Banner */}
      <section className="bg-inverse-surface text-white p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="bg-primary p-4 rounded-full shadow-md">
            <span className="material-symbols-outlined text-white text-3xl">download</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold">Export Center</h3>
            <p className="text-surface-variant font-body-md mt-1">
              Generate detailed PDF or CSV reports for offline executive presentation.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            className="px-6 py-3 bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg font-label-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-sm ${isExportingCSV ? "animate-spin" : ""}`}>
              {isExportingCSV ? "sync" : "description"}
            </span>
            <span>{isExportingCSV ? "Generating..." : "CSV Format"}</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-label-md transition-all active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 font-bold"
          >
            <span className={`material-symbols-outlined text-sm ${isExportingPDF ? "animate-spin" : ""}`}>
              {isExportingPDF ? "sync" : "picture_as_pdf"}
            </span>
            <span>{isExportingPDF ? "Exporting..." : "Export PDF"}</span>
          </button>
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
