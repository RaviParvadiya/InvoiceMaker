import { configureStore } from "@reduxjs/toolkit";
import clientsReducer from "./clientSlice";
import invoiceReducer from "./invoiceSlice";

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    invoices: invoiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
