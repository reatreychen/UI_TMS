"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import {
  fetchAgentReportAnalytics,
  type AgentReportAnalytics,
} from "@/src/services/reportService";
import { ReportsHeader } from "./ReportsHeader";
import { ReportsKPIs } from "./ReportsKPIs";
import { ReportsVolumeTrends } from "./ReportsVolumeTrends";
import { ReportsCategoryStats } from "./ReportsCategoryStats";
import { ReportsPerformanceStats } from "./ReportsPerformanceStats";
import { ReportsContributorsTable } from "./ReportsContributorsTable";

const POLL_INTERVAL_SEC = 15;

export function ReportsView() {
  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;
  const [report, setReport] = useState<AgentReportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [, setTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(
    async (showFullLoading = false) => {
      if (showFullLoading || !report) {
        setLoading(true);
      }
      setIsRefreshing(true);

      try {
        const analytics = await fetchAgentReportAnalytics(currentUserId, dateRange, selectedDepartment);
        setReport(analytics);
        setLastUpdated(new Date());
        setError(null);
      } catch (requestError) {
        console.error("Failed to load agent reports", requestError);
        if (!report) {
          setError("Unable to load report data. Please try again.");
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUserId, report, dateRange, selectedDepartment],
  );

  // Initial load
  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadReport(true);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  // Periodic Auto-Polling
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadReport(false);
      }
    }, POLL_INTERVAL_SEC * 1000);

    return () => window.clearInterval(intervalId);
  }, [autoRefreshEnabled, loadReport]);

  // Update relative timestamp ticker every second
  useEffect(() => {
    const ticker = window.setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(ticker);
  }, []);

  // Refresh when returning to tab
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && autoRefreshEnabled) {
        void loadReport(false);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [autoRefreshEnabled, loadReport]);



  const handleExportCSV = () => {
    if (!report) return;
    const headers = ["Contributor Agent", "Role", "Tickets Resolved", "Average Rating", "SLA Met"];
    const rows = report.contributors.map((c) => [
      `"${c.name}"`,
      `"${c.role}"`,
      c.resolved,
      c.rating ?? "4.9",
      `"${c.slaMet}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reports_analytics_${dateRange.toLowerCase().replace(/ /g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <ReportsHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled((prev) => !prev)}
        onManualRefresh={() => void loadReport(false)}
        pollIntervalSec={POLL_INTERVAL_SEC}
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          void loadReport(true);
        }}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={(dept) => {
          setSelectedDepartment(dept);
          void loadReport(true);
        }}
        onExportReport={handleExportCSV}
      />
      {loading && !report ? (
        <div className="rounded-xl border border-outline-variant bg-white p-8 text-center text-secondary">
          Loading report data...
        </div>
      ) : error && !report ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadReport(true)}
            className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-white cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : report ? (
        <>
          <ReportsKPIs items={report.kpis} />
          <ReportsVolumeTrends weeks={report.volumeWeeks} />

          <div className="mb-stack-lg grid grid-cols-1 gap-gutter lg:grid-cols-2">
            <ReportsCategoryStats categories={report.categories} />
            <ReportsPerformanceStats performance={report.performance} />
          </div>

          <ReportsContributorsTable contributors={report.contributors} />
        </>
      ) : null}
    </>
  );
}

