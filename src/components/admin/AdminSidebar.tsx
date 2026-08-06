"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: "dashboard" },
    { name: "User Management", href: "/admin/users", icon: "group" },
    { name: "Department Management", href: "/admin/departments-management", icon: "corporate_fare" },
    { name: "Agent Management", href: "/admin/departments", icon: "support_agent" },
    { name: "Permissions", href: "/admin/permissions", icon: "admin_panel_settings" },
    { name: "Categories", href: "/admin/categories", icon: "category" },
    { name: "Ticket Management", href: "/admin/ticket-management", icon: "confirmation_number" },
    { name: "Reports", href: "/admin/reports", icon: "assessment" },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: "analytics" },
    { name: "Knowledge Base", href: "/admin/knowledge-base", icon: "lightbulb" },
    { name: "Manage Resources", href: "/admin/resources", icon: "folder_managed" },
    { name: "Pricing Plans", href: "/admin/pricing-plans", icon: "payments" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm flex flex-col p-stack-md z-40">
      {/* Brand Header */}
      <div className="mb-stack-lg px-2">
        <Link href={"/customer/knowledge-base"} className="font-headline-md text-headline-md font-bold text-primary">
          TMS Enterprise
        </Link>
        <p className="text-label-md font-label-md text-secondary opacity-70">
          Admin Suite
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-semibold shadow-xs"
                  : "text-secondary hover:bg-surface-container-high active:scale-98"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "text-primary font-bold" : ""}`}>
                {item.icon}
              </span>
              <span className="font-body-md text-body-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>  

      {/* Bottom Footer Actions */}
      <div className="mt-auto pt-stack-md border-t border-outline-variant space-y-1">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              const event = new CustomEvent("open-new-ticket-modal");
              window.dispatchEvent(event);
            }
          }}
          className="w-full mb-4 bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="font-body-md text-body-md">New Ticket</span>
        </button>

        <Link
          href="/admin/roles"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors duration-200 ${
            pathname === "/admin/roles" ? "bg-secondary-container text-on-secondary-container font-semibold" : ""
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </Link>
        <Link
          href="/admin/knowledge-base"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-high transition-colors duration-200"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-md text-body-md">Help & Docs</span>
        </Link>
      </div>
    </aside>
  );
}
