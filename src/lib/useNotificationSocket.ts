"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectIsAuthenticated } from "@/src/store/slices/authSlice";
import {
  addNotification,
  setRead,
  setAllRead,
  removeNotification,
} from "@/src/store/slices/notificationSlice";
import type { Notification } from "@/src/services/notificationService";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";

export function useNotificationSocket() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket: Socket = io(`${WS_URL}/ws/notifications`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[NotificationSocket] Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[NotificationSocket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[NotificationSocket] Disconnected:", reason);
    });

    /** New notification pushed from server */
    socket.on("notification:new", (notification: Notification) => {
      dispatch(addNotification(notification));
      toast(notification.title, {
        icon: "🔔",
        duration: 5000,
        style: {
          borderLeft: "4px solid #004ac6",
        },
      });
    });

    /** A notification was marked as read (multi-device sync) */
    socket.on("notification:read", ({ id }: { id: string }) => {
      dispatch(setRead(id));
    });

    /** All notifications marked as read */
    socket.on("notification:read-all", () => {
      dispatch(setAllRead());
    });

    /** A notification was deleted */
    socket.on("notification:deleted", ({ id }: { id: string }) => {
      dispatch(removeNotification(id));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, dispatch]);

  return socketRef;
}
