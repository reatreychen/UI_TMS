import { ReportsTopNav } from "@/src/components/agent/ReportsTopNav";
import { ReportsHeader } from "@/src/components/agent/ReportsHeader";
import { ReportsKPIs } from "@/src/components/agent/ReportsKPIs";
import { ReportsVolumeTrends } from "@/src/components/agent/ReportsVolumeTrends";
import { ReportsCategoryStats } from "@/src/components/agent/ReportsCategoryStats";
import { ReportsPerformanceStats } from "@/src/components/agent/ReportsPerformanceStats";
import { ReportsContributorsTable } from "@/src/components/agent/ReportsContributorsTable";

export const metadata = {
  title: "Reports & Analytics | TMS Enterprise",
  description: "Performance insights and ticket trends overview.",
};

export default function AgentReportsPage() {
  return (
    <>
      <ReportsTopNav />

      {/* Page Canvas */}
      <main className="flex-1 overflow-y-auto pb-stack-lg">
        <div className="mx-auto max-w-[1440px] px-container-margin pt-8">
          <ReportsHeader />
          <ReportsKPIs />
          <ReportsVolumeTrends />

          {/* Smaller Charts Grid */}
          <div className="mb-stack-lg grid grid-cols-1 gap-gutter lg:grid-cols-2">
            <ReportsCategoryStats />
            <ReportsPerformanceStats />
          </div>

          <ReportsContributorsTable />
        </div>

        {/* Footer */}
        <footer className="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant px-container-margin py-8 text-secondary md:flex-row">
          <p className="font-label-md text-label-md">
            © 2024 TMS Enterprise. All data is real-time and subject to cache
            delay of 5 minutes.
          </p>
          <div className="flex gap-stack-md font-label-md text-label-md">
            <a href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Compliance
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              System Status
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
