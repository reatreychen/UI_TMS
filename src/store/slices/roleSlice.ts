import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminRoleService, AdminPermission } from "@/src/services/adminRoleService";
import { AdminRole } from "@/src/services/adminUserService";

interface RoleState {
  roles: AdminRole[];
  selectedRole: AdminRole | null;
  selectedRolePermissionIds: string[];
  loading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  selectedRole: null,
  selectedRolePermissionIds: [],
  loading: false,
  isSaving: false,
  error: null,
};

export const fetchRolesThunk = createAsyncThunk(
  "role/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const roles = await adminRoleService.getRoles();
      return roles || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch roles");
    }
  }
);

export const createRoleThunk = createAsyncThunk(
  "role/createRole",
  async (payload: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const role = await adminRoleService.createRole(payload);
      return role;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to create role");
    }
  }
);

export const updateRoleThunk = createAsyncThunk(
  "role/updateRole",
  async ({ id, payload }: { id: string; payload: { name?: string; description?: string } }, { rejectWithValue }) => {
    try {
      const updated = await adminRoleService.updateRole(id, payload);
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to update role");
    }
  }
);

export const deleteRoleThunk = createAsyncThunk(
  "role/deleteRole",
  async (roleId: string, { rejectWithValue }) => {
    try {
      await adminRoleService.deleteRole(roleId);
      return roleId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to delete role");
    }
  }
);

export const fetchRolePermissionsThunk = createAsyncThunk(
  "role/fetchRolePermissions",
  async (roleId: string, { rejectWithValue }) => {
    try {
      const perms = await adminRoleService.getRolePermissions(roleId);
      return (perms || []).map((p) => p.id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch role permissions");
    }
  }
);

export const replaceRolePermissionsThunk = createAsyncThunk(
  "role/replaceRolePermissions",
  async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }, { rejectWithValue }) => {
    try {
      await adminRoleService.replaceRolePermissions(roleId, permissionIds);
      return permissionIds;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to save permissions");
    }
  }
);

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    setSelectedRole(state, action: PayloadAction<AdminRole | null>) {
      state.selectedRole = action.payload;
    },
    toggleRolePermission(state, action: PayloadAction<string>) {
      const permId = action.payload;
      if (state.selectedRolePermissionIds.includes(permId)) {
        state.selectedRolePermissionIds = state.selectedRolePermissionIds.filter((id) => id !== permId);
      } else {
        state.selectedRolePermissionIds.push(permId);
      }
    },
    setSelectedRolePermissions(state, action: PayloadAction<string[]>) {
      state.selectedRolePermissionIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRolesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
        if (!state.selectedRole && action.payload.length > 0) {
          state.selectedRole = action.payload[0];
        }
      })
      .addCase(fetchRolesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Role
      .addCase(createRoleThunk.fulfilled, (state, action) => {
        state.roles.push(action.payload);
        state.selectedRole = action.payload;
      })
      // Update Role
      .addCase(updateRoleThunk.fulfilled, (state, action) => {
        state.roles = state.roles.map((r) => (r.id === action.payload.id ? action.payload : r));
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      // Delete Role
      .addCase(deleteRoleThunk.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = state.roles[0] || null;
        }
      })
      // Fetch Role Permissions
      .addCase(fetchRolePermissionsThunk.fulfilled, (state, action) => {
        state.selectedRolePermissionIds = action.payload;
      })
      // Replace Role Permissions
      .addCase(replaceRolePermissionsThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(replaceRolePermissionsThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        state.selectedRolePermissionIds = action.payload;
      })
      .addCase(replaceRolePermissionsThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedRole, toggleRolePermission, setSelectedRolePermissions } = roleSlice.actions;
export default roleSlice.reducer;
