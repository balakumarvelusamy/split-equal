// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainApp from "./MainApp";

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
  <React.StrictMode>
    <div className="centered-container">
      <MainApp />
    </div>
  </React.StrictMode>
);
