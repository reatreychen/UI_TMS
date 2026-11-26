"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Ticket,
  UserCircle,
  X,
} from "lucide-react";

import { NotificationBell } from "@/src/components/NotificationBell";
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

const PORTAL_NAV_LINKS = [
  {
    label: "Help Center",
    href: "/customer/knowledge-base",
    match: ["/customer/knowledge-base"],
  },
  {
    label: "My Tickets",
    href: "/customer/my-ticket",
    match: ["/customer/my-ticket", "/customer/tickets"],
  },
  {
    label: "Support",
    href: "/customer/support",
    match: ["/customer/support"],
  },
  {
    label: "Solutions",
    href: "/customer/solutions",
    match: ["/customer/solutions", "/solutions"],
  },
  {
    label: "Resources",
    href: "/customer/resources",
    match: ["/customer/resources", "/resources"],
  },
  {
    label: "Pricing",
    href: "/customer/pricing",
    match: ["/customer/pricing", "/pricing"],
  },
];

const emptySubscribe = () => () => {};

export function TopNav({ activePage }: { activePage?: ActivePage }) {
  void activePage;
  const pathname = usePathname() || "";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectUser);
  const userRole = useAppSelector(selectRoleName);

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setMobileNavOpen(false);
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
    if (userRole === "admin") return "/admin/ticket-management";
    if (userRole === "agent") return "/agent/tickets";
    return "/customer/my-ticket";
  };

  const showUserDropdown = mounted && isAuthenticated && Boolean(currentUser);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
          : "bg-white border-b border-slate-200/80"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/customer/knowledge-base"
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
            <Image
              src="/images/tms_pro_logo.jpg"
              alt="TMS Pro Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              TMS <span className="text-blue-600">Pro</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">
              Help Center
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Portal navigation" className="hidden lg:flex items-center gap-1">
          {PORTAL_NAV_LINKS.map((item) => {
            const isActive = item.match.some((prefix) => pathname.startsWith(prefix));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/customer/create-ticket"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-2xs transition-colors"
          >
            <Plus className="size-4" aria-hidden />
            <span>Submit Ticket</span>
          </Link>

          {mounted && isAuthenticated && <NotificationBell />}

          {showUserDropdown ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-xs overflow-hidden">
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
                <span className="text-sm font-medium text-slate-800 hidden sm:block max-w-[120px] truncate">
                  {currentUser?.fullName}
                </span>
                <ChevronDown
                  className={`size-4 text-slate-400 transition-transform duration-150 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>

              {isMenuOpen && (
                <div className="modal-pop absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {currentUser?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                  <Link
                    href={getMyTicketsHref()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Ticket className="size-4 text-slate-500" aria-hidden />
                    My Tickets
                  </Link>

                  <Link
                    href="/customer/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Bell className="size-4 text-slate-500" aria-hidden />
                    Notifications
                  </Link>

                  <Link
                    href={getProfileHref()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <UserCircle className="size-4 text-slate-500" aria-hidden />
                    Profile Settings
                  </Link>

                  {userRole?.toLowerCase() !== "customer" &&
                    userRole?.toLowerCase() !== "user" && (
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <LayoutDashboard className="size-4 text-slate-500" aria-hidden />
                        Workspace Dashboard
                      </Link>
                    )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-sm transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
            className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {PORTAL_NAV_LINKS.map((item) => {
            const isActive = item.match.some((prefix) => pathname.startsWith(prefix));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/customer/create-ticket"
            onClick={() => setMobileNavOpen(false)}
            className="sm:hidden mt-2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold"
          >
            <Plus className="size-4" aria-hidden />
            <span>Submit a Ticket</span>
          </Link>
        </div>
      )}
    </header>
  );
}
