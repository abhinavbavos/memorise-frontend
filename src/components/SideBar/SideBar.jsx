// src/components/SideBar/SideBar.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/images/memrise.png";

// ----- inline icons (stroke-based, crisp) -----
const Icon = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20M6 15h4" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4L12 3z" />
    </svg>
  ),
};

const NAV = [
  { section: "Overview" },
  { to: "/admin", end: true, icon: Icon.grid, label: "Dashboard" },
  { to: "/admin/content", icon: Icon.shield, label: "Content Moderation" },
  { to: "/admin/users", icon: Icon.users, label: "User Management" },
  { to: "/admin/payments", icon: Icon.card, label: "Subscriptions & Payments" },
  { section: "System" },
  { to: "/admin/settings", icon: Icon.settings, label: "Settings" },
];

const COLLAPSE_DELAY = 2000; // ms before the rail collapses after the mouse leaves

const SideBar = ({ menuToggle, setMenuToggle }) => {
  // Default to the slim icon rail; hover expands it, leaving collapses it again.
  const [expanded, setExpanded] = useState(false);

  // On mobile the rail becomes an off-canvas drawer toggled by the header
  // hamburger (menuToggle). Tapping a link or the scrim closes it.
  const closeDrawer = () => setMenuToggle && setMenuToggle(false);
  const collapseTimer = useRef(null);

  const clearTimer = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearTimer();
    setExpanded(true);
  };

  const handleLeave = () => {
    clearTimer();
    collapseTimer.current = setTimeout(() => setExpanded(false), COLLAPSE_DELAY);
  };

  // Tidy the pending timer if the sidebar unmounts mid-countdown.
  useEffect(() => clearTimer, []);

  return (
    <>
      {/* In-flow spacer reserves the slim rail's footprint so the expanded
          rail can overlay the page without shoving the content sideways. */}
      <div className="ad-side__slot" aria-hidden="true" />
      <aside
        className={`ad-side ${expanded ? "ad-side--expanded" : "ad-side--collapsed"} ${
          menuToggle ? "ad-side--open" : ""
        }`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
      <div className="ad-side__brand">
        <Link to="/admin" aria-label="Admin home" className="ad-side__brandlink">
          <img src={logo} alt="Memorise" className="ad-side__logo" />
        </Link>
      </div>

      <nav className="ad-side__nav">
        {NAV.map((item, i) =>
          item.section ? (
            <p key={`s-${i}`} className="ad-side__label">{item.section}</p>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `ad-side__link ${isActive ? "ad-side__link--active" : ""}`
              }
            >
              <span className="ad-side__ico">{item.icon}</span>
              <span className="ad-side__text">{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="ad-side__foot">
        <div className="ad-side__promo">
          <span className="ad-side__promo-ico">{Icon.spark}</span>
          <div>
            <p className="ad-side__promo-title">Memorise Admin</p>
            <p className="ad-side__promo-sub">Premium console</p>
          </div>
        </div>
      </div>
      </aside>
      {/* Tap-to-close scrim — only visible while the mobile drawer is open. */}
      <div
        className={`ad-side__scrim ${menuToggle ? "ad-side__scrim--show" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
    </>
  );
};

export default SideBar;
