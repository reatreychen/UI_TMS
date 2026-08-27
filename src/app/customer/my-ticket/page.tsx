import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { TopNav } from "@/src/components/portal/TopNav";
import { HeroSection } from "@/src/components/portal/HeroSection";
import { MetricCards } from "@/src/components/portal/MetricCards";
import { RecentTicketsTable } from "@/src/components/portal/RecentTicketsTable";
import { QuickHelpBento } from "@/src/components/portal/QuickHelpBento";
import { PortalFooter } from "@/src/components/portal/PortalFooter";

export default function CustomerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          <TopNav activePage="dashboard" />
          <main className="mx-auto max-w-[1440px] space-y-stack-lg px-container-margin py-stack-lg">
            <HeroSection />
            <MetricCards />
            <RecentTicketsTable />
            <QuickHelpBento />
          </main>
        </div>
        <PortalFooter />
      </div>
    </ProtectedRoute>
  );
}
