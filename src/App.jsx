// src/App.jsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";
import "./assets/css/style.css";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import MainLayout, { AdminLayout, PublicLayout } from "./layout/MainLayout";
import UserPage from "./pages/UserPage/UserPage";
import AdminUsers from "./pages/AdminUsers/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminPayments from "./pages/AdminPayments/AdminPayments";
import ContentMod from "./pages/ContentMod/ContentMod";
import PubUserPage from "./pages/PubUserPage/PubUserPage";
import AdminSettings from "./pages/AdminSettings/AdminSettings";

// ---- guards ----
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getTokenRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const body = token.split(".")[1];
    const json = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(decodeURIComponent(escape(json)));
    return (claims?.role || "").toLowerCase();
  } catch {
    return "";
  }
};

const isAdmin = (u) => {
  const role = (u?.role || u?.Role || "").toLowerCase();
  const roles = Array.isArray(u?.roles)
    ? u.roles.map((r) => r.toLowerCase())
    : [];
  return (
    role === "admin" ||
    u?.isAdmin === true ||
    roles.includes("admin") ||
    getTokenRole() === "admin"
  );
};

function RequireAuth() {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const user = getUser();
  const token = localStorage.getItem("token");
  return token && isAdmin(user) ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  const router = createBrowserRouter([
    // Public
    {
      path: "/",
      element: <PublicLayout />,
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },

        // Public profile (renamed from "/:id" to avoid conflicts)
        { path: "/profile/:publicId", element: <PubUserPage /> },
      ],
    },

    // Authenticated user area
    {
      element: <RequireAuth />, // gate everything below
      children: [
        {
          path: "/user/:id",
          element: <MainLayout />,
          children: [{ index: true, element: <UserPage /> }],
        },
      ],
    },

    // Admin area
    {
      element: <RequireAdmin />,
      children: [
        {
          path: "/admin",
          element: <AdminLayout />,
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: "users", element: <AdminUsers /> },
            { path: "payments", element: <AdminPayments /> },
            { path: "content", element: <ContentMod /> },
            { path: "settings", element: <AdminSettings /> },
            { path: "register", element: <Register /> },
          ],
        },
      ],
    },

    // 404
    { path: "*", element: <Navigate to="/login" replace /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;