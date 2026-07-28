"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/src/store/hooks";
import { logout } from "@/src/store/slices/authSlice";
import {
  Ticket,
  LayoutDashboard,
  List,
  Users,
  BarChart,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  BookOpen,
} from "lucide-react";

export function AgentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] flex-col border-r border-outline-variant bg-surface-container-lowest p-stack-md md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary">
          <Ticket aria-hidden className="size-6" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-headline-md font-bold leading-tight text-primary-container">
            TMS Enterprise
          </h1>
          <p className="font-label-md text-label-md text-on-surface-variant">
            Agent Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <Link
          href="/agent/dashboard"
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all ${
            pathname === "/agent/dashboard"
              ? "bg-secondary-container font-bold text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {pathname === "/agent/dashboard" && (
            <div className="absolute left-0 h-8 w-1 rounded-r bg-primary" />
          )}
          <LayoutDashboard
            aria-hidden
            className={`size-5 ${pathname === "/agent/dashboard" ? "text-primary" : ""}`}
            fill={pathname === "/agent/dashboard" ? "currentColor" : "none"}
          />
          Dashboard
        </Link>
        <Link
          href="/agent/my-tickets"
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all ${
            pathname === "/agent/my-tickets"
              ? "bg-primary-container font-bold text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <Ticket
            aria-hidden
            className="size-5"
            fill={pathname === "/agent/my-tickets" ? "currentColor" : "none"}
          />
          My Tickets
        </Link>
        <Link
          href="/agent/queue"
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all ${
            pathname === "/agent/queue"
              ? "bg-secondary-container font-bold text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {pathname === "/agent/queue" && (
            <div className="absolute left-0 h-8 w-1 rounded-r bg-primary" />
          )}
          <List
            aria-hidden
            className={`size-5 ${pathname === "/agent/queue" ? "text-primary" : ""}`}
            fill={pathname === "/agent/queue" ? "currentColor" : "none"}
          />
          Queue
        </Link>
        <Link
          href="/agent/customers"
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all ${
            pathname === "/agent/customers"
              ? "bg-secondary-container font-bold text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {pathname === "/agent/customers" && (
            <div className="absolute left-0 h-8 w-1 rounded-r bg-primary" />
          )}
          <Users
            aria-hidden
            className={`size-5 ${pathname === "/agent/customers" ? "text-primary" : ""}`}
            fill={pathname === "/agent/customers" ? "currentColor" : "none"}
          />
          Customers
        </Link>
        <Link
          href="/agent/knowledge-base"
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all ${
            pathname === "/agent/knowledge-base"
              ? "bg-secondary-container font-bold text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {pathname === "/agent/knowledge-base" && (
            <div className="absolute left-0 h-8 w-1 rounded-r bg-primary" />
          )}
          <BookOpen
            aria-hidden
            className={`size-5 ${pathname === "/agent/knowledge-base" ? "text-primary" : ""}`}
          />
          Knowledge Base
        </Link>
        <Link
          href="/agent/reports"
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all ${
            pathname === "/agent/reports"
              ? "bg-secondary-container font-bold text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {pathname === "/agent/reports" && (
            <div className="absolute left-0 h-8 w-1 rounded-r bg-primary" />
          )}
          <BarChart
            aria-hidden
            className={`size-5 ${pathname === "/agent/reports" ? "text-primary" : ""}`}
            fill={pathname === "/agent/reports" ? "currentColor" : "none"}
          />
          Reports
        </Link>
        <Link
          href="/agent/settings"
          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 font-label-md text-label-md transition-all ${
            pathname === "/agent/settings"
              ? "bg-secondary-container font-bold text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {pathname === "/agent/settings" && (
            <div className="absolute left-0 h-8 w-1 rounded-r bg-primary" />
          )}
          <HelpCircle
            aria-hidden
            className={`size-5 ${pathname === "/agent/settings" ? "text-primary" : ""}`}
          />
          Support
        </Link>
      </nav>

      <div className="mt-auto space-y-4">
        <div className="space-y-1 border-t border-outline-variant pt-4">
          <Link
            href="/agent/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant hover:bg-surface-container-high"
          >
            <Settings aria-hidden className="size-5" />
            <span className="text-label-md font-label-md font-medium">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer text-left"
          >
            <LogOut aria-hidden className="size-5" />
            <span className="text-label-md font-label-md font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
