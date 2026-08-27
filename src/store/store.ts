import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";
import agentReducer from "./slices/agentSlice";
import departmentReducer from "./slices/departmentSlice";
import adminUserReducer from "./slices/adminUserSlice";
import categoryReducer from "./slices/categorySlice";
import ticketReducer from "./slices/ticketSlice";
import agentTicketReducer from "./slices/agentTicketSlice";
import notificationReducer from "./slices/notificationSlice";
import resourceReducer from "./slices/resourceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    role: roleReducer,
    permission: permissionReducer,
    agent: agentReducer,
    department: departmentReducer,
    adminUser: adminUserReducer,
    category: categoryReducer,
    ticket: ticketReducer,
    agentTicket: agentTicketReducer,
    notifications: notificationReducer,
    resource: resourceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
