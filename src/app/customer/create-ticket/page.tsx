import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { TopNav } from "@/src/components/portal/TopNav";
import { CreateTicketForm } from "@/src/components/portal/CreateTicketForm";
import { CreateTicketSidebar } from "@/src/components/portal/CreateTicketSidebar";
import { PortalFooter } from "@/src/components/portal/PortalFooter";

export const metadata = {
  title: "Submit a Ticket | Support Portal",
  description: "Submit a new support ticket and our team will assist you.",
};

export default function CreateTicketPage() {
  return (
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
        <div>
          <TopNav activePage="create-ticket" />

          <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:px-8 py-10 lg:grid-cols-12">
            <CreateTicketForm />
            <CreateTicketSidebar />
          </main>
        </div>

        <PortalFooter />
      </div>
    </ProtectedRoute>
  );
}
