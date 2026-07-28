"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectUser, logout } from "@/src/store/slices/authSlice";

export function AdminHeader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const displayName = user?.fullName || "Admin User";
  const displayEmail = user?.email || "admin@kinetic-tms.com";
  const roleTitle = typeof user?.role === "object" ? user.role?.name : user?.role || "Administrator";

  const handleLogout = () => {
    setShowProfileMenu(false);
    dispatch(logout());
    router.push("/login");
  };

  const notifications = [
    { id: 1, title: "High Latency Alert", desc: "Database latency in EU-West spiked over 300ms", time: "10m ago", type: "alert" },
    { id: 2, title: "New Critical Ticket", desc: "#TK-4819 SSO Authentication failure", time: "25m ago", type: "ticket" },
    { id: 3, title: "CSAT Weekly Milestone", desc: "Customer satisfaction reached 4.82 average", time: "2h ago", type: "success" },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-surface border-b border-outline-variant flex items-center justify-between px-gutter h-16 ml-[280px] max-w-[calc(100%-280px)]">
      {/* Search Input Bar */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("admin-search", { detail: e.target.value }));
              }
            }}
            placeholder="Search tickets, agents, or knowledge base..."
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-10 text-body-md focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("admin-search", { detail: "" }));
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Bar Right Actions */}
      <div className="flex items-center gap-4 relative">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
              setHasUnread(false);
            }}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-3">
                <h3 className="font-bold text-on-surface text-body-lg">Notifications</h3>
                <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/40"
                  >
                    <div className="flex items-center justify-between text-body-md font-semibold text-on-surface">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-outline font-normal">{n.time}</span>
                    </div>
                    <p className="text-label-md text-on-surface-variant mt-1 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-outline-variant text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <button
          onClick={() => {
            alert("Kinetic Admin Help Center & Documentation loaded.");
          }}
          className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
          title="Help & Support"
        >
          <span className="material-symbols-outlined">help</span>
        </button>

        <div className="h-8 w-[1px] bg-outline-variant mx-1" />

        {/* User Profile Badge */}
        <div className="relative">
          <div
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 pl-2 cursor-pointer group rounded-lg p-1 hover:bg-surface-container-low transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="font-label-md text-label-md text-on-surface font-bold">{displayName}</p>
              <p className="text-[10px] text-outline uppercase tracking-wider">{roleTitle}</p>
            </div>
            <img
              src={user?.profileImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuCS8bCaqwcDmEDwd64WANnfilqwxhRQs5T4Lh3PzUhZj226kyi01YjD0fYSFg4__ADzFHVEzyQS7ZdKQlLcpEv7Q1ehpKLhPjMhAAj6TjKMjdg_yMXW2-oMmAlBndWlGldMdP-spJ9A2uRRs7ZrPsSAgCX0X9_a3q9vuAt1sl6Yy2BZTdTBSvqv2OZ2QefqBl9Ri_-IPnXmko3ysQfbZAhsVBolOkjeSaTAu3gh_2lHB16RPD3r--egxX6UlgKfFnsCuTV8TrnuYI29"}
              alt="Enterprise TMS Admin Avatar"
              className="w-9 h-9 rounded-full border-2 border-primary-container object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-outline-variant mb-1">
                <p className="font-bold text-on-surface text-body-md">{displayName}</p>
                <p className="text-xs text-outline">{displayEmail}</p>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-body-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Profile Settings
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 text-body-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">security</span>
                Security Log
              </button>
              <div className="my-1 border-t border-outline-variant" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-body-md text-error hover:bg-error-container/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
