import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService, User, LoginPayload, RegisterPayload } from "../../services/authService";
import type { RootState } from "../store";

export type RoleName = "admin" | "agent" | "customer" | "unknown";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const getInitialTokens = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    const cachedUser = localStorage.getItem("user");
    let user: User | null = null;
    if (cachedUser) {
      try {
        user = JSON.parse(cachedUser);
      } catch (_) {}
    }
    return {
      accessToken: token,
      refreshToken: refresh,
      user,
      isAuthenticated: Boolean(token),
    };
  }
  return {
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  };
};

const initialTokens = getInitialTokens();

const initialState: AuthState = {
  user: initialTokens.user,
  accessToken: initialTokens.accessToken,
  refreshToken: initialTokens.refreshToken,
  isAuthenticated: initialTokens.isAuthenticated,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const loginThunk = createAsyncThunk<
  User,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.login(payload);
    const { user, accessToken, refreshToken } = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return user;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || "Failed to log in";
    return rejectWithValue(msg);
  }
});

export const registerThunk = createAsyncThunk<
  User,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.register(payload);
    const { user, accessToken, refreshToken } = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return user;
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || "Registration failed";
    return rejectWithValue(msg);
  }
});

export const checkAuthThunk = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>("auth/checkAuth", async (_, { rejectWithValue }) => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const res = await authService.getProfile();
    if (res.data) {
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    }
    return null;
  } catch (err: any) {
    // Network error or backend unreachable — fall back to cached user
    // so the user stays logged in instead of being kicked out
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser) as User;
      } catch (_) {}
    }
    // Only clear session on explicit 401 (token truly invalid)
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return rejectWithValue("Session expired");
    }
    // For other errors (network down etc.), keep existing session
    return rejectWithValue(err.message || "Could not verify session");
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.user = action.payload;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Login failed";
    });

    // Register
    builder.addCase(registerThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.user = action.payload;
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Registration failed";
    });

    // Check Auth
    builder.addCase(checkAuthThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuthThunk.fulfilled, (state, action: PayloadAction<User | null>) => {
      state.isLoading = false;
      state.isInitialized = true;
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    });
    builder.addCase(checkAuthThunk.rejected, (state) => {
      state.isLoading = false;
      state.isInitialized = true;
      // Only clear auth if user wasn't already authenticated via localStorage
      if (!state.user) {
        state.isAuthenticated = false;
      }
    });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export const selectRoleName = (state: RootState): RoleName => {
  const user = state.auth.user;
  if (!user) return "unknown";

  let rawRole = "";
  if (typeof user.role === "string") {
    rawRole = user.role;
  } else if (user.role && typeof user.role.name === "string") {
    rawRole = user.role.name;
  }

  const normalized = rawRole.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("agent")) return "agent";
  if (normalized.includes("customer")) return "customer";
  return "customer";
};

export default authSlice.reducer;
