import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminUserService, AdminUser, CreateAdminUserPayload, UpdateAdminUserPayload } from "@/src/services/adminUserService";

interface AdminUserState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminUserState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsersThunk = createAsyncThunk(
  "adminUser/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const users = await adminUserService.getUsers();
      return users || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch users");
    }
  }
);

export const createUserThunk = createAsyncThunk(
  "adminUser/createUser",
  async (payload: CreateAdminUserPayload, { rejectWithValue }) => {
    try {
      const user = await adminUserService.createUser(payload);
      return user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to create user");
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  "adminUser/updateUser",
  async ({ id, payload }: { id: string; payload: UpdateAdminUserPayload }, { rejectWithValue }) => {
    try {
      const updated = await adminUserService.updateUser(id, payload);
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to update user");
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "adminUser/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await adminUserService.deleteUser(userId);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to delete user");
    }
  }
);

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.users = state.users.map((u) => (u.id === action.payload.id ? action.payload : u));
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default adminUserSlice.reducer;
