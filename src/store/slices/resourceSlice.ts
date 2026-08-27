import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllResources,
  createResource,
  updateResource,
  deleteResource,
  bulkDeleteResources,
  bulkArchiveResources,
  ResourceRecord,
} from "@/src/services/portalService";
import { RootState } from "../store";

export interface ResourceQueryParams {
  type?: string;
  status?: string;
  q?: string;
}

interface ResourceState {
  items: ResourceRecord[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  items: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchResourcesThunk = createAsyncThunk(
  "resource/fetchResources",
  async (query: ResourceQueryParams | undefined, { rejectWithValue }) => {
    try {
      const data = await fetchAllResources(query);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch resources"
      );
    }
  }
);

export const createResourceThunk = createAsyncThunk(
  "resource/createResource",
  async (payload: Partial<ResourceRecord>, { rejectWithValue }) => {
    try {
      const data = await createResource(payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create resource"
      );
    }
  }
);

export const updateResourceThunk = createAsyncThunk(
  "resource/updateResource",
  async ({ id, payload }: { id: string; payload: Partial<ResourceRecord> }, { rejectWithValue }) => {
    try {
      const data = await updateResource(id, payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update resource"
      );
    }
  }
);

export const deleteResourceThunk = createAsyncThunk(
  "resource/deleteResource",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteResource(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete resource"
      );
    }
  }
);

export const bulkDeleteResourcesThunk = createAsyncThunk(
  "resource/bulkDeleteResources",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await bulkDeleteResources(ids);
      return ids;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to bulk delete resources"
      );
    }
  }
);

export const bulkArchiveResourcesThunk = createAsyncThunk(
  "resource/bulkArchiveResources",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await bulkArchiveResources(ids);
      return ids;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to bulk archive resources"
      );
    }
  }
);

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchResourcesThunk
      .addCase(fetchResourcesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourcesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResourcesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createResourceThunk
      .addCase(createResourceThunk.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createResourceThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createResourceThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // updateResourceThunk
      .addCase(updateResourceThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated.id) {
          const index = state.items.findIndex((item) => String(item.id) === String(updated.id));
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...updated };
          }
        }
      })
      // deleteResourceThunk
      .addCase(deleteResourceThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.items = state.items.filter((item) => String(item.id) !== String(deletedId));
      })
      // bulkDeleteResourcesThunk
      .addCase(bulkDeleteResourcesThunk.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload.map(String));
        state.items = state.items.filter((item) => !deletedIds.has(String(item.id)));
      })
      // bulkArchiveResourcesThunk
      .addCase(bulkArchiveResourcesThunk.fulfilled, (state, action) => {
        const archivedIds = new Set(action.payload.map(String));
        state.items = state.items.map((item) => {
          if (archivedIds.has(String(item.id))) {
            return { ...item, status: "Archived" };
          }
          return item;
        });
      });
  },
});

export const selectResources = (state: RootState) => state.resource.items;
export const selectResourceLoading = (state: RootState) => state.resource.loading;
export const selectResourceActionLoading = (state: RootState) => state.resource.actionLoading;
export const selectResourceError = (state: RootState) => state.resource.error;

export default resourceSlice.reducer;
