import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // default: localStorage
import { combineReducers } from "redux";

import groupReducer from "./groupSlice"; // we will create this next

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  groups: groupReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
