// for setting up Redux

import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./slices/taskSlice";

// Define the store
export const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;