import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // default: localStorage
import { combineReducers } from "redux";
import { encryptTransform } from "redux-persist-transform-encrypt";
import groupReducer from "./groupSlice"; // we will create this next
import userReducer from "./userSlice";

const persistConfig = {
  key: "root",
  storage,
  transforms: [
    encryptTransform({
      secretKey: process.env.REACT_APP_KEY,
      onError: function (error) {
        console.error("Encryption error", error);
      },
    }),
  ],
};

const rootReducer = combineReducers({
  groups: groupReducer,
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
