import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTicket,
  uploadTicketAttachment,
  CreateTicketPayload,
  CreatedTicket,
} from "@/src/services/portalService";

interface SubmitTicketArgs {
  payload: CreateTicketPayload;
  files: File[];
  uploadedById: string;
}

export const submitTicketThunk = createAsyncThunk(
  "ticket/submitTicket",
  async (args: SubmitTicketArgs, { rejectWithValue }) => {
    try {
      const ticket = await createTicket(args.payload);
      if (args.files.length > 0) {
        await Promise.all(
          args.files.map((file) =>
            uploadTicketAttachment(ticket.id, args.uploadedById, file)
          )
        );
      }
      return ticket;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to submit ticket"
      );
    }
  }
);

interface TicketState {
  isSubmitting: boolean;
  error: string | null;
  lastCreatedTicket: CreatedTicket | null;
}

const initialState: TicketState = {
  isSubmitting: false,
  error: null,
  lastCreatedTicket: null,
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    resetTicketState(state) {
      state.isSubmitting = false;
      state.error = null;
      state.lastCreatedTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTicketThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitTicketThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.lastCreatedTicket = action.payload;
      })
      .addCase(submitTicketThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTicketState } = ticketSlice.actions;
export default ticketSlice.reducer;
