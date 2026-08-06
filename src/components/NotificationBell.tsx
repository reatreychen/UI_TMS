"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsCurrentPage,
  selectNotificationsTotalPages,
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
  deleteNotificationThunk,
} from "@/src/store/slices/notificationSlice";
import type { Notification } from "@/src/services/notificationService";

function NotificationIcon({ type }: { type: "unread" | "read" }) {
  return (
    <span
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[16px] ${
        type === "unread"
          ? "bg-primary/10 text-primary"
          : "bg-surface-container-low text-outline"
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">notifications</span>
    </span>
  );
}

function SkeletonItem() {
  return (
    <div className="flex gap-3 p-3 animate-pulse">
      <div className="w-8 h-8 bg-surface-container rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-surface-container rounded w-3/4" />
        <div className="h-2.5 bg-surface-container rounded w-full" />
        <div className="h-2 bg-surface-container rounded w-1/4" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-outline text-[28px]">notifications_off</span>
      </div>
      <p className="text-body-md font-semibold text-on-surface mb-1">All caught up!</p>
      <p className="text-label-md text-on-surface-variant">You have no notifications right now.</p>
    </div>
  );
}

export function NotificationBell() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectNotificationsLoading);
  const currentPage = useAppSelector(selectNotificationsCurrentPage);
  const totalPages = useAppSelector(selectNotificationsTotalPages);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    // Reload first page when opening
    if (!open) {
      dispatch(fetchNotificationsThunk({ page: 1, limit: 20 }));
    }
  };

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(markAsReadThunk(id));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(deleteNotificationThunk(id));
  };

  const handleMarkAll = () => {
    dispatch(markAllAsReadThunk());
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      dispatch(fetchNotificationsThunk({ page: currentPage + 1, limit: 20 }));
    }
  };

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={handleToggle}
        className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative cursor-pointer"
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-[3px] ring-2 ring-surface animate-bounce"
            style={{ animationIterationCount: 2 }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-dropdown"
          className="absolute right-0 mt-2 w-96 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            animation: "notifDropIn 0.18s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-on-surface text-body-lg">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                id="mark-all-read-btn"
                onClick={handleMarkAll}
                className="text-xs text-primary font-semibold hover:underline transition-opacity flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-outline-variant/40">
            {isLoading && notifications.length === 0 ? (
              <>
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </>
            ) : notifications.length === 0 ? (
              <EmptyState />
            ) : (
              notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  id={`notification-item-${n.id}`}
                  onClick={(e) => !n.isRead && handleMarkRead(e, n.id)}
                  className={`group relative flex gap-3 px-4 py-3 transition-colors cursor-pointer ${
                    n.isRead
                      ? "hover:bg-surface-container-low/50"
                      : "bg-primary/[0.03] hover:bg-primary/[0.06]"
                  }`}
                >
                  {/* Unread indicator */}
                  {!n.isRead && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}

                  <NotificationIcon type={n.isRead ? "read" : "unread"} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-body-sm leading-snug ${
                          n.isRead
                            ? "text-on-surface-variant font-normal"
                            : "text-on-surface font-semibold"
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[10px] text-outline whitespace-nowrap flex-shrink-0 mt-0.5">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-label-md text-on-surface-variant mt-0.5 leading-snug line-clamp-2">
                      {n.body}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    id={`delete-notification-${n.id}`}
                    onClick={(e) => handleDelete(e, n.id)}
                    className="absolute top-2 right-2 p-1 rounded-full text-outline hover:text-error hover:bg-error-container/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete notification"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))
            )}

            {/* Load more */}
            {!isLoading && currentPage < totalPages && (
              <div className="px-4 py-3 text-center">
                <button
                  id="load-more-notifications-btn"
                  onClick={handleLoadMore}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Load more
                </button>
              </div>
            )}

            {isLoading && notifications.length > 0 && (
              <div className="py-3 flex justify-center">
                <span className="material-symbols-outlined text-primary animate-spin text-[20px]">
                  progress_activity
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
            <span className="text-[11px] text-outline">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-[11px] text-outline hover:text-on-surface transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes notifDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
