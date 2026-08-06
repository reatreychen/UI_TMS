"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectIsAuthenticated } from "@/src/store/slices/authSlice";
import { fetchUnreadCountThunk } from "@/src/store/slices/notificationSlice";
import { useNotificationSocket } from "@/src/lib/useNotificationSocket";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Establish the WebSocket connection (only when authenticated)
  useNotificationSocket();

  // On login: fetch only the unread badge count (cheap scalar query).
  // The full list is loaded lazily when the user opens the dropdown.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCountThunk());
    }
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
}
