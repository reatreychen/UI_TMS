"use client";

import { Search, List, KanbanSquare, Bell, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectUser, logout } from "@/src/store/slices/authSlice";

export function AgentTopNav() {
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


  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-surface px-container-margin py-3 shadow-sm">
      <div className="flex flex-1 items-center gap-stack-lg">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search tickets, customers, or ID..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-low p-1">
          <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high">
            <List aria-hidden className="size-4.5" />
            <span className="text-label-md">List View</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-surface-container-lowest px-3 py-1.5 font-bold text-primary shadow-sm ring-1 ring-black/5 transition-all">
            <KanbanSquare aria-hidden className="size-4.5" fill="currentColor" />
            <span className="text-label-md">Kanban</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <Bell aria-hidden className="size-5.5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface bg-error"></span>
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <HelpCircle aria-hidden className="size-5.5" />
        </button>

        <div className="mx-2 h-8 w-px bg-outline-variant"></div>

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
