"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectIsAuthenticated } from "@/src/store/slices/authSlice";
import { fetchUnreadCountThunk } from "@/src/store/slices/notificationSlice";
import { useNotificationSocket } from "@/src/lib/useNotificationSocket";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useNotificationSocket();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCountThunk());
    }
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
}
