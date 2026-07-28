import { CustomersTopNav } from "@/src/components/agent/CustomersTopNav";
import { CustomersView } from "@/src/components/agent/CustomersView";

export const metadata = {
  title: "Customers | TMS Enterprise Agent Portal",
  description: "Manage and view all associated customer accounts.",
};

export default function AgentCustomersPage() {
  return (
    <>
      <CustomersTopNav />

      {/* Main Content Canvas */}
      <main className="h-[calc(100vh-64px)] overflow-y-auto bg-[#F8FAFC]">
        <CustomersView />
      </main>
    </>
  );
}
