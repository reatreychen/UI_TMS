import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminRoleService, AdminPermission } from "@/src/services/adminRoleService";

interface PermissionState {
  permissions: AdminPermission[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  loading: false,
  error: null,
};

export const fetchPermissionsThunk = createAsyncThunk(
  "permission/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminRoleService.getPermissions();
      return res;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch permissions"
      );
    }
  }
);

export const createPermissionThunk = createAsyncThunk(
  "permission/createPermission",
  async (payload: { module: string; action: string }, { rejectWithValue }) => {
    try {
      const res = await adminRoleService.createPermission(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create permission"
      );
    }
  }
);

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload || [];
      })
      .addCase(fetchPermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPermissionThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.permissions.push(action.payload);
        }
      });
  },
});

export default permissionSlice.reducer;
