import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchTicket, updateTicketStatus, assignTicket } from "@/src/services/portalService";
import type { RootState } from "../store";

function getResolvePath(currentStatus: string): string[] {
  switch (currentStatus.toUpperCase()) {
    case "OPEN":
      return ["ASSIGNED", "IN_PROGRESS", "RESOLVED"];
    case "ASSIGNED":
      return ["IN_PROGRESS", "RESOLVED"];
    case "IN_PROGRESS":
      return ["RESOLVED"];
    case "PENDING":
      return ["IN_PROGRESS", "RESOLVED"];
    case "RESOLVED":
    case "CLOSED":
      return []; 
    default:
      return [];
  }
}

export const fetchAgentTicketThunk = createAsyncThunk<any, string, { state: RootState }>(
  "agentTicket/fetch",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchTicket(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load ticket");
    }
  }
);

export const assignAgentTicketThunk = createAsyncThunk<
  void,
  { ticketId: string; agentId: string },
  { state: RootState }
>(
  "agentTicket/assign",
  async ({ ticketId, agentId }, { dispatch, rejectWithValue }) => {
    try {
      await assignTicket(ticketId, agentId);
      dispatch(fetchAgentTicketThunk(ticketId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to assign ticket");
    }
  }
);

export const updateAgentTicketStatusThunk = createAsyncThunk<
  void,
  { ticketId: string; status: string },
  { state: RootState }
>(
  "agentTicket/updateStatus",
  async ({ ticketId, status }, { dispatch, rejectWithValue }) => {
    try {
      await updateTicketStatus(ticketId, status);
      dispatch(fetchAgentTicketThunk(ticketId));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update status";
      return rejectWithValue(msg);
    }
  }
);

export const resolveAgentTicketThunk = createAsyncThunk<
  void,
  { ticketId: string },
  { state: RootState }
>(
  "agentTicket/resolve",
  async ({ ticketId }, { dispatch, rejectWithValue }) => {
    try {
      await updateTicketStatus(ticketId, "RESOLVED");
      dispatch(fetchAgentTicketThunk(ticketId));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to resolve ticket";
      return rejectWithValue(msg);
    }
  }
);

interface AgentTicketState {
  rawTicket: any | null;
  loading: boolean;
  isAssigning: boolean;
  isResolving: boolean;
  error: string | null;
}

const initialState: AgentTicketState = {
  rawTicket: null,
  loading: false,
  isAssigning: false,
  isResolving: false,
  error: null,
};

const agentTicketSlice = createSlice({
  name: "agentTicket",
  initialState,
  reducers: {
    clearAgentTicket(state) {
      state.rawTicket = null;
      state.loading = false;
      state.error = null;
      state.isAssigning = false;
      state.isResolving = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchAgentTicketThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentTicketThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.rawTicket = action.payload;
      })
      .addCase(fetchAgentTicketThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Assign
    builder
      .addCase(assignAgentTicketThunk.pending, (state) => {
        state.isAssigning = true;
        state.error = null;
      })
      .addCase(assignAgentTicketThunk.fulfilled, (state) => {
        state.isAssigning = false;
      })
      .addCase(assignAgentTicketThunk.rejected, (state, action) => {
        state.isAssigning = false;
        state.error = action.payload as string;
      });

    // Resolve
    builder
      .addCase(resolveAgentTicketThunk.pending, (state) => {
        state.isResolving = true;
        state.error = null;
      })
      .addCase(resolveAgentTicketThunk.fulfilled, (state) => {
        state.isResolving = false;
      })
      .addCase(resolveAgentTicketThunk.rejected, (state, action) => {
        state.isResolving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAgentTicket } = agentTicketSlice.actions;
export default agentTicketSlice.reducer;
