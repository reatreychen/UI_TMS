"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Bell, CheckCheck, Trash2, Check, Inbox } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
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

export default function CustomerNotificationsPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectNotificationsLoading);
  const currentPage = useAppSelector(selectNotificationsCurrentPage);
  const totalPages = useAppSelector(selectNotificationsTotalPages);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    dispatch(
      fetchNotificationsThunk({
        page: 1,
        limit: 20,
        isRead: filter === "unread" ? false : undefined,
      })
    );
  }, [dispatch, filter]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(
      fetchNotificationsThunk({
        page: newPage,
        limit: 20,
        isRead: filter === "unread" ? false : undefined,
      })
    );
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  return (
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
              <Bell className="size-6 text-primary" /> Notifications
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Stay updated on your ticket progress and agent resolution updates.
            </p>
          </div>

        {unreadCount > 0 && (
          <button
            onClick={() => dispatch(markAllAsReadThunk())}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="size-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center border-b border-outline-variant gap-4 text-sm font-medium">
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 transition-colors border-b-2 ${
            filter === "all"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            filter === "unread"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-primary text-on-primary rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-outline-variant bg-surface animate-pulse flex gap-4"
              >
                <div className="size-10 rounded-full bg-surface-container flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                  <div className="h-3 bg-surface-container rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-surface border border-outline-variant rounded-2xl p-6">
            <div className="size-16 rounded-full bg-surface-container flex items-center justify-center mb-4 text-on-surface-variant">
              <Inbox className="size-8" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">No notifications found</h3>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
              {filter === "unread"
                ? "You have no unread notifications right now."
                : "You're all caught up! Ticket updates from agents will appear here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                !item.isRead
                  ? "bg-primary/5 border-primary/20 shadow-sm"
                  : "bg-surface border-outline-variant opacity-90"
              }`}
            >
              <div
                className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !item.isRead
                    ? "bg-primary text-on-primary font-bold"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <Bell className="size-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm ${
                      !item.isRead
                        ? "font-bold text-on-surface"
                        : "font-semibold text-on-surface"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 break-words">
                  {item.body}
                </p>
                <div className="text-[11px] text-on-surface-variant/70 mt-2">
                  {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!item.isRead && (
                  <button
                    onClick={() => dispatch(markAsReadThunk(item.id))}
                    title="Mark as read"
                    className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Check className="size-4" />
                  </button>
                )}
                <button
                  onClick={() => dispatch(deleteNotificationThunk(item.id))}
                  title="Delete notification"
                  className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant disabled:opacity-50 hover:bg-surface-container transition-colors"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant disabled:opacity-50 hover:bg-surface-container transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
