import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  notificationService,
  Notification,
  FetchNotificationsParams,
} from "../../services/notificationService";
import type { RootState } from "../store";

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchNotificationsThunk = createAsyncThunk<
  { items: Notification[]; totalPages: number; currentPage: number; unreadCount: number },
  FetchNotificationsParams,
  { rejectValue: string }
>("notifications/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const res = await notificationService.fetchAll(params);
    const unreadCount = res.items.filter((n) => !n.isRead).length;
    return {
      items: res.items,
      totalPages: res.meta.totalPages,
      currentPage: res.meta.page,
      unreadCount,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to load notifications");
  }
});

export const fetchUnreadCountThunk = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notifications/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    return await notificationService.fetchUnreadCount();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch unread count");
  }
});

export const markAsReadThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/markAsRead", async (id, { rejectWithValue }) => {
  try {
    await notificationService.markAsRead(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to mark as read");
  }
});

export const markAllAsReadThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notifications/markAllAsRead", async (_, { rejectWithValue }) => {
  try {
    await notificationService.markAllAsRead();
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to mark all as read");
  }
});

export const deleteNotificationThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/delete", async (id, { rejectWithValue }) => {
  try {
    await notificationService.remove(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete notification");
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────

export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /** Called by the WebSocket hook when a new notification arrives */
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    /** Called by the WebSocket hook when notification:read event is received */
    setRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    /** Called by the WebSocket hook when notification:read-all event is received */
    setAllRead: (state) => {
      state.items.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    },
    /** Called by the WebSocket hook when notification:deleted event is received */
    removeNotification: (state, action: PayloadAction<string>) => {
      const idx = state.items.findIndex((n) => n.id === action.payload);
      if (idx !== -1) {
        if (!state.items[idx].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(idx, 1);
      }
    },
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchNotificationsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.unreadCount = action.payload.unreadCount;
    });
    builder.addCase(fetchNotificationsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Error";
    });

    // Fetch unread count
    builder.addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Mark single as read
    builder.addCase(markAsReadThunk.fulfilled, (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all as read
    builder.addCase(markAllAsReadThunk.fulfilled, (state) => {
      state.items.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    });

    // Delete
    builder.addCase(deleteNotificationThunk.fulfilled, (state, action) => {
      const idx = state.items.findIndex((n) => n.id === action.payload);
      if (idx !== -1) {
        if (!state.items[idx].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(idx, 1);
      }
    });
  },
});

export const {
  addNotification,
  setRead,
  setAllRead,
  removeNotification,
  resetNotifications,
} = notificationSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) => state.notifications.isLoading;
export const selectNotificationsTotalPages = (state: RootState) => state.notifications.totalPages;
export const selectNotificationsCurrentPage = (state: RootState) => state.notifications.currentPage;

export default notificationSlice.reducer;
