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
        state.permissions = action.payload;
      })
      .addCase(fetchPermissionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default permissionSlice.reducer;
