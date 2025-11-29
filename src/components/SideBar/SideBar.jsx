// src/pages/Admin/SideBar.jsx
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/memrise.png";

const SideBar = ({ menuToggle }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const { pathname } = useLocation();

  const handleMenuActive = (title) => {
    setActiveMenu(activeMenu === title ? null : title);
  };

  const handleSubmenuActive = (title) => {
    setActiveSubmenu(activeSubmenu === title ? null : title);
  };

  const cn = (...classes) => classes.filter(Boolean).join(" ");

  // Helpers to determine active route groups
  const isPath = (prefix) =>
    pathname === prefix || pathname.startsWith(prefix + "/");

  return (
    <div
      className="deznav border-right"
      style={menuToggle ? { display: `none` } : { display: `block` }}
    >
      <div className="deznav-scroll">
        <div className="logo">
          <Link to="/admin" aria-label="Admin Home">
            <img src={logo} alt="Memorise Admin" />
          </Link>
        </div>

        <ul className="metismenu" id="menu">
          {/* Dashboard Section */}
          <li className="menu-title">Dashboard</li>

          <li
            className={cn(
              isPath("/admin") && !isPath("/admin/") ? "mm-active" : ""
            )}
          >
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => cn(isActive ? "mm-active" : "")}
              onClick={() => handleMenuActive("Dashboard")}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="nav-text">Dashboard</span>
            </NavLink>
          </li>

          {/* Content Moderation */}
          <li className={cn(isPath("/admin/content") ? "mm-active" : "")}>
            <NavLink
              to="/admin/content"
              className={({ isActive }) => cn(isActive ? "mm-active" : "")}
              onClick={() => handleMenuActive("Menu Management")}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="nav-text">Content Moderation</span>
            </NavLink>
          </li>

          {/* User Management */}
          <li className={cn(isPath("/admin/users") ? "mm-active" : "")}>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => cn(isActive ? "mm-active" : "")}
              onClick={() => handleMenuActive("Staff")}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 7c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5 5-2.24 5-5zM12 14c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="nav-text">User Management</span>
            </NavLink>
            {/* Submenu example */}
            <ul
              className={cn(
                "submenu",
                activeMenu === "Staff" ? "show" : "",
                activeSubmenu === "UserList" ? "active" : ""
              )}
              style={{
                display: activeMenu === "Staff" ? "block" : "none",
                paddingLeft: "2rem",
              }}
            >
              <li>
                <NavLink
                  to="/admin/users/list"
                  className={({ isActive }) => cn(isActive ? "mm-active" : "")}
                  onClick={() => handleSubmenuActive("UserList")}
                >
                  User List
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/users/add"
                  className={({ isActive }) => cn(isActive ? "mm-active" : "")}
                  onClick={() => handleSubmenuActive("AddUser")}
                >
                  Add User
                </NavLink>
              </li>
            </ul>
          </li>

          {/* Subscriptions & Payments */}
          <li className={cn(isPath("/admin/payments") ? "mm-active" : "")}>
            <NavLink
              to="/admin/payments"
              className={({ isActive }) => cn(isActive ? "mm-active" : "")}
              onClick={() => handleMenuActive("Payments")}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="nav-text">Subscriptions & Payments</span>
            </NavLink>
          </li>

          {/* Settings */}
          <li className="menu-title">Settings</li>

          <li className={cn(isPath("/admin/settings") ? "mm-active" : "")}>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => cn(isActive ? "mm-active" : "")}
              onClick={() => handleMenuActive("Settings")}
            >
              <div className="menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="nav-text">Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
