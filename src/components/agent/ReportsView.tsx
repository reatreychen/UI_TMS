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

export function ReportsView() {
  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;
  const [report, setReport] = useState<AgentReportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);

    try {
      const analytics = await fetchAgentReportAnalytics(currentUserId);
      setReport(analytics);
      setError(null);
    } catch (requestError) {
      console.error("Failed to load agent reports", requestError);
      setError("Unable to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadReport();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadReport]);

  return (
    <>
      <ReportsHeader />
      {loading ? (
        <div className="rounded-xl border border-outline-variant bg-white p-8 text-center text-secondary">
          Loading report data...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadReport()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-white"
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
