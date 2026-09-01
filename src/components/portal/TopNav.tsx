"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { CreateTicketTrigger } from "./CreateTicketModal";
import { NotificationBell } from "@/src/components/NotificationBell";
import { TelegramBotModal } from "./TelegramBotModal";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  logout,
  selectIsAuthenticated,
  selectUser,
  selectRoleName,
} from "@/src/store/slices/authSlice";

export type ActivePage =
  | "dashboard"
  | "tickets"
  | "reports"
  | "settings"
  | "knowledge-base"
  | "support"
  | "create-ticket";

export function TopNav({ activePage }: { activePage?: ActivePage }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectUser);
  const userRole = useAppSelector(selectRoleName);

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCreateTicketActive = pathname.startsWith("/customer/create-ticket");
  const isKnowledgeBaseActive = pathname.startsWith("/customer/knowledge-base");
  const isSupportActive = pathname.startsWith("/customer/support");
  const isSolutionsActive = pathname.startsWith("/customer/solutions") || pathname.startsWith("/solutions");
  const isPricingActive = pathname.startsWith("/customer/pricing") || pathname.startsWith("/pricing");
  const isResourcesActive = pathname.startsWith("/customer/resources") || pathname.startsWith("/resources");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    dispatch(logout());
    router.push("/login");
  };

  const getProfileHref = () => {
    if (userRole === "admin") return "/admin/profile";
    if (userRole === "agent") return "/agent/profile";
    return "/customer/profile";
  };

  const getDashboardHref = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "agent") return "/agent/dashboard";
    return "/customer/my-ticket";
  };

  const getMyTicketsHref = () => {
    if (userRole === "admin") return "/admin/users";
    if (userRole === "agent") return "/agent/tickets";
    return "/customer/my-ticket";
  };

  // Prevent SSR vs Client hydration mismatch by ensuring client-only auth state renders after mount
  const showMyTickets = mounted && isAuthenticated;
  const showUserDropdown = mounted && isAuthenticated && Boolean(currentUser);

  return (
    <div>
      <header className="bg-surface sticky top-0 z-50 w-full border-b border-outline-variant shadow-sm">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-container-margin py-3">
          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-headline-md font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">bolt</span>
              <span>TMS Pro</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/customer/knowledge-base"
                className={`text-body-md transition-colors ${
                  isKnowledgeBaseActive
                    ? "border-b-2 border-primary pb-1 text-primary font-medium"
                    : "rounded px-2 py-1 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Knowledge Base
              </Link>
              <Link
                href="/customer/solutions"
                className={`text-body-md transition-colors ${
                  isSolutionsActive
                    ? "border-b-2 border-primary pb-1 text-primary font-medium"
                    : "rounded px-2 py-1 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Solutions
              </Link>        
              <Link
                href="/customer/support"
                className={`text-body-md transition-colors ${
                  isSupportActive
                    ? "border-b-2 border-primary pb-1 text-primary font-medium"
                    : "rounded px-2 py-1 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Support
              </Link>
              <Link
                href="/customer/pricing"
                className={`text-body-md transition-colors ${
                  isPricingActive
                    ? "border-b-2 border-primary pb-1 text-primary font-medium"
                    : "rounded px-2 py-1 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/customer/resources"
                className={`text-body-md transition-colors ${
                  isResourcesActive
                    ? "border-b-2 border-primary pb-1 text-primary font-medium"
                    : "rounded px-2 py-1 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Resources
              </Link>
            </nav>
          </div>

          {/* Right: Search + CTA + Auth + Icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden items-center rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 sm:flex">
              <span className="material-symbols-outlined mr-2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-44 border-none bg-transparent text-body-md focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Create Ticket CTA */}
            <CreateTicketTrigger className="bg-primary-container text-on-primary hover:bg-primary active:scale-95 px-4 py-2 rounded-lg font-bold text-body-md transition-all">
              Create Ticket
            </CreateTicketTrigger>

            {/* Notifications */}
            {mounted && isAuthenticated ? (
              <NotificationBell />
            ) : (
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
              </button>
            )}

            {/* Help */}
            <button
              type="button"
              aria-label="Help"
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">
                help_outline
              </span>
            </button>

            {/* Auth Dropdown OR Login Link */}
            {showUserDropdown ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-all shadow-sm cursor-pointer"
                >
                  <div className="h-7 w-7 flex items-center justify-center rounded-full bg-primary text-on-primary font-bold text-label-md overflow-hidden">
                    {currentUser?.profileImage ? (
                      <img
                        src={currentUser.profileImage}
                        alt={currentUser.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      currentUser?.fullName?.[0]?.toUpperCase() ?? "U"
                    )}
                  </div>
                  <span className="text-body-md font-semibold text-on-surface hidden sm:block max-w-[120px] truncate">
                    {currentUser?.fullName}
                  </span>
                  <span className={`material-symbols-outlined text-outline text-[18px] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2.5 border-b border-outline-variant/60 mb-1">
                      <p className="text-body-md font-bold text-on-surface truncate">
                        {currentUser?.fullName}
                      </p>
                      <p className="text-label-md text-on-surface-variant truncate">
                        {currentUser?.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary-container/15 text-primary">
                        {userRole}
                      </span>
                    </div>

                    <Link
                      href={getProfileHref()}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        account_circle
                      </span>
                      View Profile
                    </Link>

                    {userRole?.toLowerCase() !== "customer" && userRole?.toLowerCase() !== "user" && (
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          dashboard
                        </span>
                        Dashboard
                      </Link>
                    )}
                    
                    {userRole?.toLowerCase() !== "admin" && (
                      <Link
                        href={getMyTicketsHref()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          confirmation_number
                        </span>
                        My Tickets
                      </Link>
                    )}

                    <div className="border-t border-outline-variant/60 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-md font-medium text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-primary font-bold rounded-lg hover:bg-surface-container-low transition-colors text-body-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
