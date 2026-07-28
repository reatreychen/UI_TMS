import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";

export default function CustomerTicketsPage() {
  return (
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <h1 className="text-headline-md font-bold text-on-surface">My Tickets</h1>
        <p className="text-body-md text-on-surface-variant">Track status and active updates for your submitted support requests.</p>
      </div>
    </ProtectedRoute>
  );
}
