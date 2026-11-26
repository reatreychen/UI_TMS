"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Bell, CheckCheck, Trash2, Check, Inbox, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
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
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
        <div>
          <TopNav />

          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div>
              <Link
                href="/customer/my-ticket"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4"
              >
                <ArrowLeft className="size-4" />
                Back to My Tickets
              </Link>

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                      <Bell className="size-5" />
                    </span>
                    Notifications
                  </h1>
                  <p className="text-sm text-slate-600 mt-1.5">
                    Stay updated on your ticket replies, status changes, and support resolutions.
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(markAllAsReadThunk())}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
                  >
                    <CheckCheck className="size-4 text-blue-600" />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`pb-3 px-2 text-sm transition-colors border-b-2 cursor-pointer ${
                  filter === "all"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                All Notifications
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`pb-3 px-2 text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
                  filter === "unread"
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-900 font-medium"
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] bg-blue-600 text-white rounded-full font-bold tabular-nums">
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
                      className="p-4 rounded-2xl border border-slate-200 bg-white animate-pulse flex gap-4"
                    >
                      <div className="size-10 rounded-full bg-slate-100 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                    <Inbox className="size-7" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">No notifications found</h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">
                    {filter === "unread"
                      ? "You have no unread notifications right now."
                      : "You're all caught up! Ticket updates from support agents will appear here."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-colors flex items-start gap-4 ${
                      !item.isRead
                        ? "bg-white border-blue-200 ring-1 ring-blue-100 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        !item.isRead
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Bell className="size-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm ${
                            !item.isRead
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-800"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 break-words leading-relaxed">
                        {item.body}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-2">
                        {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={() => dispatch(markAsReadThunk(item.id))}
                          title="Mark as read"
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Check className="size-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dispatch(deleteNotificationThunk(item.id))}
                        title="Delete notification"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        <PortalFooter />
      </div>
    </ProtectedRoute>
  );
}
