import { AgentSidebar } from "@/src/components/agent/AgentSidebar";
import { AgentTopNav } from "@/src/components/agent/AgentTopNav";
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
    <ProtectedRoute allowedRoles={["agent","admin"]}>
          <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container selection:text-on-primary-container">
            {/* Sidebar Component */}
             <AgentTopNav />
            
            {/* Top Header Component */}
           <AgentSidebar />

            {/* Main Workspace Canvas */}
            <main className="ml-[280px] p-gutter max-w-[1440px] min-h-[calc(100vh-64px)] transition-all">
              {children}
            </main>
          </div>
        </ProtectedRoute>
  );
}
