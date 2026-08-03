import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import ticketReducer from "./slices/ticketSlice";
import categoryReducer from "./slices/categorySlice";
import permissionReducer from "./slices/permissionSlice";
import agentTicketReducer from "./slices/agentTicketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ticket: ticketReducer,
    category: categoryReducer,
    permission: permissionReducer,
    agentTicket: agentTicketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
