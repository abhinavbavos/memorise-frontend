import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminNav.css";
import api from "../../data/api";

const AdminNav = ({ setMenuToggle, menuToggle }) => {
  const [userMenu, setUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("adm_theme") === "dark"
  );
  const [me, setMe] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // --- helpers ---
  const signGetKey = async (key) => {
    if (!key) return null;
    try {
      const { data } = await api.get("/files/sign", { params: { key } });
      return data?.url || null;
    } catch {
      return null;
    }
  };

  // --- load current user (must be admin) ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        if (!mounted) return;
        if (data?.role !== "admin") {
          // not an admin -> bounce
          navigate("/login", { replace: true });
          return;
        }
        setMe(data);

        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
        else if (data.avatarKey) {
          const u = await signGetKey(data.avatarKey);
          if (mounted) setAvatarUrl(u);
        }
      } catch {
        navigate("/login", { replace: true });
      }
    })();
    return () => (mounted = false);
    // re-check if route changes (optional safety)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // --- outside click & ESC to close ---
  useEffect(() => {
    const onAway = (e) => {
      if (
        userMenu &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setUserMenu(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setUserMenu(false);

    document.addEventListener("mousedown", onAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [userMenu]);

  // --- theme toggle (persist) ---
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark-mode");
    else document.documentElement.classList.remove("dark-mode");
    localStorage.setItem("adm_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((s) => !s);

  const doLogout = async () => {
    try {
      await api.post("/auth/logout"); // ok if 404; we still clear locally
    } catch {}
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      delete api.defaults.headers.common.Authorization;
    } catch {}
    navigate("/login", { replace: true });
  };

  const displayName = me?.name || "Admin User";
  const subtitle = me?.email || "System Administrator";
  const avatarSrc = avatarUrl || undefined;

  return (
    <div className="admin-header-wrapper">
      <div className="admin-header-container">
        <nav className="admin-navigation">
          <div className="admin-nav-content">
            <div className="admin-nav-left-section">
              <div className="admin-brand-container">
                <button
                  type="button"
                  className="sideMenuToggle"
                  onClick={() => setMenuToggle(!menuToggle)}
                  aria-label="Toggle sidebar"
                >
                  <div className="hamburger">
                    <div className="line" />
                    <div className="line" />
                    <div className="line" />
                  </div>
                </button>
                <div className="admin-logo-wrapper">
                  <span className="admin-brand-title">Admin Dashboard</span>
                </div>
              </div>
            </div>

            <div className="admin-nav-right-section">
              <ul className="admin-nav-items">
                {/* Theme toggle */}
                <li className="admin-nav-item">
                  <button
                    type="button"
                    className="admin-theme-toggle"
                    onClick={toggleDarkMode}
                    aria-label="Toggle theme"
                  >
                    <div
                      className={`admin-toggle-switch ${
                        isDarkMode ? "admin-dark" : "admin-light"
                      }`}
                    >
                      <div className="admin-toggle-slider">
                        {isDarkMode ? (
                          <svg width="16" height="16" viewBox="0 0 24 24">
                            <path
                              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                              fill="currentColor"
                            />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5" fill="currentColor" />
                            <line
                              x1="12"
                              y1="1"
                              x2="12"
                              y2="3"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="12"
                              y1="21"
                              x2="12"
                              y2="23"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="4.22"
                              y1="4.22"
                              x2="5.64"
                              y2="5.64"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="18.36"
                              y1="18.36"
                              x2="19.78"
                              y2="19.78"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="1"
                              y1="12"
                              x2="3"
                              y2="12"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="21"
                              y1="12"
                              x2="23"
                              y2="12"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="4.22"
                              y1="19.78"
                              x2="5.64"
                              y2="18.36"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line
                              x1="18.36"
                              y1="5.64"
                              x2="19.78"
                              y2="4.22"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </li>

                {/* User menu */}
                <li className="admin-nav-item">
                  <button
                    ref={btnRef}
                    type="button"
                    className="admin-user-menu"
                    onClick={() => setUserMenu((s) => !s)}
                    aria-haspopup="true"
                    aria-expanded={userMenu ? "true" : "false"}
                    title="Account"
                  >
                    <div className="admin-user-media">
                      <div className="admin-user-avatar">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt="admin avatar"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                              fill="currentColor"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>

                  <div
                    ref={menuRef}
                    className={`admin-user-dropdown ${
                      userMenu ? "admin-show" : ""
                    }`}
                    role="menu"
                  >
                    <div className="admin-dropdown-card">
                      <div className="admin-dropdown-header">
                        <div className="admin-user-profile">
                          <div className="admin-profile-avatar">
                            {avatarSrc ? (
                              <img
                                src={avatarSrc}
                                alt=""
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                  fill="currentColor"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h6>{displayName}</h6>
                            <span>{subtitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-dropdown-body">
                        <Link to="/admin" className="admin-dropdown-link">
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                              d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="admin-link-text">Dashboard</span>
                        </Link>
                        <Link to="/admin/users" className="admin-dropdown-link">
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                              d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="admin-link-text">Users</span>
                        </Link>
                        <Link
                          to="/admin/content"
                          className="admin-dropdown-link"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                              d="M19 3H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="admin-link-text">Content</span>
                        </Link>
                        <Link
                          to="/admin/payments"
                          className="admin-dropdown-link"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                              d="M21 7H3V5h18v2zm0 4H3v8h18v-8zM5 13h6v2H5v-2z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="admin-link-text">Payments</span>
                        </Link>
                      </div>

                      <div className="admin-dropdown-footer">
                        <Link
                          to="/admin/settings"
                          className="admin-dropdown-link"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                              d="M19.14,12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 00.12-.61l-1.92-3.32a.5.5 0 00-.59-.22l-2.39.96a7.05 7.05 0 00-1.62-.94l-.36-2.54a.5.5 0 00-.48-.41h-3.84a.5.5 0 00-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 00-.59.22L2.74 8.87a.5.5 0 00.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.5.5 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.5.5 0 00-.12-.61L19.14 12.94zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="admin-link-text">
                            Admin Settings
                          </span>
                        </Link>

                        <button
                          type="button"
                          className="admin-dropdown-link admin-logout-btn"
                          onClick={doLogout}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path
                              d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="admin-link-text">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminNav;
