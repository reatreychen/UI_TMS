import React from "react";
import { AdminSidebar } from "@/src/components/admin/AdminSidebar";
import { AdminHeader } from "@/src/components/admin/AdminHeader";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";

export const metadata = {
  title: "Kinetic Enterprise TMS - Admin Dashboard",
  description: "Admin portal and real-time performance telemetry for Kinetic Enterprise TMS.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary-container selection:text-on-primary-container">
        {/* Sidebar Component */}
        <AdminSidebar />

        {/* Top Header Component */}
        <AdminHeader />

        {/* Main Workspace Canvas */}
        <main className="ml-[280px] p-gutter max-w-[1440px] min-h-[calc(100vh-64px)] transition-all">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
