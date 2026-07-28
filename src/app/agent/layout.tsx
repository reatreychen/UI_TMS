import { AgentSidebar } from "@/src/components/agent/AgentSidebar";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";

export const metadata = {
  title: "Agent Console | Kinetic TMS",
  description: "Agent interface for Kinetic Ticket Management System",
};

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <div className="flex min-h-screen bg-surface font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        {/* Fixed Sidebar */}
        <AgentSidebar />
        
        {/* Main Canvas - offset by sidebar width */}
        <div className="ml-[280px] flex min-h-screen flex-1 flex-col">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
