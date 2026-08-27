import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminAgentService, AgentRecord, AgentStats, CreateAgentPayload } from "@/src/services/adminAgentService";

interface AgentState {
  agents: AgentRecord[];
  stats: AgentStats;
  selectedAgentId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agents: [],
  stats: { totalAgents: 0, availableNow: 0, availabilityPct: 0 },
  selectedAgentId: null,
  loading: false,
  error: null,
};

export const fetchAgentsThunk = createAsyncThunk(
  "agent/fetchAgents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminAgentService.getAgentManagementData();
      const stats = adminAgentService.computeStats(data.agents || []);
      return { agents: data.agents || [], stats };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch agents");
    }
  }
);

export const createAgentThunk = createAsyncThunk(
  "agent/createAgent",
  async (
    { payload, agentRoleId }: { payload: CreateAgentPayload; agentRoleId: string | null },
    { rejectWithValue }
  ) => {
    try {
      const created = await adminAgentService.createAgent(payload, agentRoleId);
      return created;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to create agent");
    }
  }
);

export const removeAgentThunk = createAsyncThunk(
  "agent/removeAgent",
  async (agentId: string, { rejectWithValue }) => {
    try {
      await adminAgentService.removeAgent(agentId);
      return agentId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to remove agent");
    }
  }
);

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setSelectedAgentId(state, action: PayloadAction<string | null>) {
      state.selectedAgentId = action.payload;
    },
    toggleAgentAutoAssign(state, action: PayloadAction<string>) {
      const agentId = action.payload;
      state.agents = state.agents.map((a) => {
        if (a.id === agentId) {
          return { ...a, autoAssignEnabled: !a.autoAssignEnabled };
        }
        return a;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload.agents;
        state.stats = action.payload.stats;
        if (!state.selectedAgentId && action.payload.agents.length > 0) {
          state.selectedAgentId = action.payload.agents[0].id;
        }
      })
      .addCase(fetchAgentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAgentThunk.fulfilled, (state, action) => {
        state.agents.push(action.payload);
        state.stats = adminAgentService.computeStats(state.agents);
      })
      .addCase(removeAgentThunk.fulfilled, (state, action) => {
        state.agents = state.agents.filter((a) => a.id !== action.payload);
        state.stats = adminAgentService.computeStats(state.agents);
      });
  },
});

export const { setSelectedAgentId, toggleAgentAutoAssign } = agentSlice.actions;
export default agentSlice.reducer;
