// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainApp from "./MainApp";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store"; // your new store
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: "https://m24bivvguzhttlxrar4grzwzum.appsync-api.ap-south-1.amazonaws.com/graphql",
      region: "ap-south-1",
      defaultAuthMode: "apiKey",
      apiKey: "da2-xvk63jh7xrhbfjvwswqg7imlju",
      subscriptionEndpoint: "wss://m24bivvguzhttlxrar4grzwzum.appsync-realtime-api.ap-south-1.amazonaws.com/graphql",
    },
  },
});

const container = document.getElementById("root");
const root = createRoot(container);

// Disable console logs in production
if (process.env.NODE_ENV === "production" || process.env.REACT_APP_ENV === "PROD") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then(
      (registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      },
      (error) => {
        console.log("Service Worker registration failed:", error);
      }
    );
  });
}

root.render(
  // <React.StrictMode>
  //   <div className="centered-container">
  //     <MainApp />
  //   </div>
  // </React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <React.StrictMode>
        <div className="centered-container">
          <MainApp />
        </div>
      </React.StrictMode>
    </PersistGate>
  </Provider>
);
