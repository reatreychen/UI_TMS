import { ReportsView } from "@/src/components/agent/ReportsView";

export const metadata = {
  title: "Reports & Analytics | TMS Enterprise",
  description: "Performance insights and ticket trends overview.",
};

export default function AgentReportsPage() {
  return (
    <>
      {/* Page Canvas */}
      <main className="flex-1 overflow-y-auto pb-stack-lg">
        <div className="mx-auto max-w-[1440px] px-container-margin pt-8">
          <ReportsView />
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
