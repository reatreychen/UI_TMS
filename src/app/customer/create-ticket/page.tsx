import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { CreateTicketForm } from "@/src/components/portal/CreateTicketForm";
import { CreateTicketSidebar } from "@/src/components/portal/CreateTicketSidebar";

export const metadata = {
  title: "Create Ticket | Kinetic TMS",
  description:
    "Submit a new support request to the Kinetic TMS team. Provide details, set priority, and attach files.",
};

export default function CreateTicketPage() {
  return (
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
      <div className="min-h-screen bg-background">
        <TopNav activePage="tickets" />

        <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-stack-lg px-container-margin py-stack-lg lg:grid-cols-12">
          <CreateTicketForm />
          <CreateTicketSidebar />
        </main>

        <PortalFooter />
      </div>
    </ProtectedRoute>
  );
}
