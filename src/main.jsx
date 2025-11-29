// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// ❌ REMOVE: import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <App />   {/* App already returns <RouterProvider /> */}
    </UserProvider>
  </StrictMode>
);
