import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { resolveImageUrl } from "../../utils/urlHelpers";
import api from "../../data/api";

const pageSizeOptions = [10, 25, 50];

// ----- inline icons -----
const Icon = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" /></svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></svg>
  ),
  kebab: (
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
  ),
  ban: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
  ),
  gavel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 13l-7.5 7.5a2.12 2.12 0 0 1-3-3L11 10" /><path d="M9 7l4 4M13 3l8 8M15 5l-4 4" /></svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
  ),
  crown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h20M3 8l4.5 4L12 5l4.5 7L21 8l-1.5 8h-15z" /></svg>
  ),
  shieldCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
  ),
  pie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  ),
};

// ---- small presentational pieces ----
function StatTile({ tone, icon, label, value, meta }) {
  return (
    <div className="ad-stat">
      <div className={`ad-stat__icon ad-stat__icon--${tone}`}>{icon}</div>
      <div className="ad-stat__body">
        <p className="ad-stat__label">{label}</p>
        <h3 className="ad-stat__value">{value}</h3>
        {meta && <p className="ad-stat__meta">{meta}</p>}
      </div>
    </div>
  );
}

function Breakdown({ items, total }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="ad-breakdown">
      {items.map((it) => (
        <div className="ad-breakdown__row" key={it.label}>
          <div className="ad-breakdown__top">
            <span className="ad-breakdown__label">
              <span className="ad-breakdown__dot" style={{ background: it.color }} />
              {it.label}
            </span>
            <span className="ad-breakdown__val">{it.value}</span>
          </div>
          <div className="ad-breakdown__bar">
            <div className="ad-breakdown__fill" style={{ width: `${(it.value / max) * 100}%`, background: it.color }} />
          </div>
        </div>
      ))}
      {total === 0 && (
        <p className="ad-state__sub" style={{ textAlign: "center", margin: "4px 0 0" }}>
          No data on this page yet.
        </p>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    subscriptionPlan: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: searchParams.get("search") || "",
  });

  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const abortRef = useRef(null);

  const toggleDropdown = (index) =>
    setDropdownOpen(dropdownOpen === index ? null : index);

  const resetFilters = () =>
    setFilters({ subscriptionPlan: "all", dateFrom: "", dateTo: "", searchTerm: "" });

  const handleFilterChange = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const { data } = await api.get("/admin/users", {
        params: { search: filters.searchTerm || "", page, limit, sort },
        signal: abortRef.current.signal,
      });

      const list = Array.isArray(data?.users) ? data.users : [];
      setRows(list);
      setTotal(Number(data?.total || list.length || 0));
    } catch (e) {
      if (e.name !== "CanceledError") {
        setError(e?.response?.data?.error || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sort]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const filteredRows = useMemo(() => {
    const df = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dt = filters.dateTo ? new Date(filters.dateTo) : null;
    if (dt) dt.setHours(23, 59, 59, 999);

    return rows.filter((u) => {
      if (filters.subscriptionPlan !== "all") {
        const want = filters.subscriptionPlan.toLowerCase();
        if ((u.plan || "free").toLowerCase() !== want) return false;
      }
      if (df || dt) {
        const joined = u.createdAt ? new Date(u.createdAt) : null;
        if (joined) {
          if (df && joined < df) return false;
          if (dt && joined > dt) return false;
        }
      }
      return true;
    });
  }, [rows, filters]);

  // derived insights for the KPI row + side rail (current page of users)
  const insights = useMemo(() => {
    let premium = 0;
    let free = 0;
    let active = 0;
    let suspended = 0;
    let banned = 0;
    let admins = 0;
    filteredRows.forEach((u) => {
      if ((u.plan || "free").toLowerCase() === "premium") premium += 1;
      else free += 1;
      const s = (u.status || "active").toLowerCase();
      if (s === "banned") banned += 1;
      else if (s === "active") active += 1;
      else suspended += 1;
      if ((u.role || "user").toLowerCase() === "admin") admins += 1;
    });
    return { premium, free, active, suspended, banned, admins, pageCount: filteredRows.length };
  }, [filteredRows]);

  const exportCSV = () => {
    const header = ["Name", "Email", "Plan", "Role", "Status", "Joined"];
    const lines = filteredRows.map((u) => [
      `"${u.name || ""}"`,
      `"${u.email || ""}"`,
      `"${u.plan || "free"}"`,
      `"${u.role || "user"}"`,
      `"${u.status || "active"}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}"`,
    ]);
    const csv = [header.join(","), ...lines.map((l) => l.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openEdit = (user) => {
    setEditUser({
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      plan: user.plan || "free",
      status: user.status || "active",
      city: user.city || "",
      country: user.country || "",
      planValidUntil: user.planValidUntil
        ? String(user.planValidUntil).slice(0, 10)
        : "",
    });
    setEditOpen(true);
    setDropdownOpen(null);
  };

  const saveEdit = async () => {
    if (!editUser?._id) return;
    setEditing(true);
    try {
      const body = {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        plan: editUser.plan,
        status: editUser.status,
        city: editUser.city,
        country: editUser.country,
      };
      if (editUser.planValidUntil)
        body.planValidUntil = new Date(editUser.planValidUntil).toISOString();

      setRows((r) => r.map((u) => (u._id === editUser._id ? { ...u, ...body } : u)));

      const { data: updated } = await api.put(`/admin/users/${editUser._id}`, body);

      if (updated?._id) {
        setRows((r) => r.map((u) => (u._id === updated._id ? updated : u)));
      }

      setEditOpen(false);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to update user");
      load();
    } finally {
      setEditing(false);
    }
  };

  const setStatus = async (userId, status) => {
    setDropdownOpen(null);
    try {
      setRows((r) => r.map((u) => (u._id === userId ? { ...u, status } : u)));
      await api.put(`/admin/users/${userId}/status`, { status });
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to update status");
      load();
    }
  };

  const removeUser = async (userId) => {
    const ok = window.confirm("Delete this user? This cannot be undone.");
    if (!ok) return;
    setDropdownOpen(null);
    try {
      setRows((r) => r.filter((u) => u._id !== userId));
      setTotal((t) => Math.max(0, t - 1));
      await api.delete(`/admin/users/${userId}`);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to delete user");
      load();
    }
  };

  const planBadge = (plan) =>
    (plan || "free") === "premium" ? "ad-badge ad-badge--violet ad-badge--nodot" : "ad-badge ad-badge--gray ad-badge--nodot";
  const statusBadge = (s) =>
    s === "active" ? "ad-badge ad-badge--green" : s === "banned" ? "ad-badge ad-badge--red" : "ad-badge ad-badge--amber";

  const pageWindow = Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
    let pNum = i + 1;
    if (page > 3 && totalPages > 5) pNum = page - 2 + i;
    return pNum;
  }).filter((n) => n <= totalPages);

  return (
    <Fragment>
      <div className="ad-shell ad-page">
        <div className="ad-wrap ad-stagger" style={{ display: "grid", gap: 22 }}>
          {/* Hero */}
          <div className="ad-hero">
            <div className="ad-hero__lead">
              <div className="ad-hero__icon">{Icon.users}</div>
              <div>
                <p className="ad-eyebrow">People</p>
                <h1 className="ad-hero__title">User Management</h1>
                <p className="ad-hero__sub">Search, filter, edit and moderate every member of your platform.</p>
              </div>
            </div>
            <div className="ad-hero__tools">
              <select
                className="ad-select"
                style={{ width: 140 }}
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(1);
                }}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
              <select
                className="ad-select"
                style={{ width: 160 }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="-name">Name (Z-A)</option>
                <option value="email">Email (A-Z)</option>
                <option value="-email">Email (Z-A)</option>
              </select>
              <button className="ad-iconbtn" onClick={load} title="Refresh">{Icon.refresh}</button>
            </div>
          </div>

          {/* KPI row */}
          <div className="ad-kpis">
            <StatTile tone="blue" icon={Icon.users} label="Total Users" value={total.toLocaleString()} meta={<span className="ad-badge ad-badge--gray ad-badge--nodot">All members</span>} />
            <StatTile tone="amber" icon={Icon.crown} label="Premium Members" value={insights.premium} meta={<span className="ad-stat__period">this page</span>} />
            <StatTile tone="green" icon={Icon.shieldCheck} label="Active" value={insights.active} meta={<span className="ad-stat__period">this page</span>} />
            <StatTile tone="pink" icon={Icon.ban} label="Suspended / Banned" value={insights.suspended + insights.banned} meta={<span className="ad-stat__period">this page</span>} />
          </div>

          {/* Filters */}
          <div className="ad-card">
            <div className="ad-card__head">
              <h3 className="ad-card__title">Filters</h3>
            </div>
            <div className="ad-card__body">
              <div className="ad-filters ad-filters--users">
                <form onSubmit={onSearch} className="ad-search">
                  {Icon.search}
                  <input
                    className="ad-input"
                    type="text"
                    placeholder="Search by name or email…"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  />
                </form>

                <select
                  className="ad-select"
                  value={filters.subscriptionPlan}
                  onChange={(e) => handleFilterChange("subscriptionPlan", e.target.value)}
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>

                <input
                  className="ad-input"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  style={{ colorScheme: "light" }}
                />
                <input
                  className="ad-input"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  style={{ colorScheme: "light" }}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="ad-btn ad-btn--ghost" onClick={resetFilters}>Reset</button>
                  <button className="ad-btn ad-btn--primary" onClick={exportCSV}>{Icon.download} Export</button>
                </div>
              </div>
            </div>
          </div>

          {/* Board: table (main) + insight rail (side) */}
          <div className="ad-board">
            <div className="ad-board__main">
              <div className="ad-card ad-tablecard">
                <div className="ad-toolbar">
                  <h3 className="ad-toolbar__title">Members</h3>
                  <span className="ad-count">{Icon.users} {total.toLocaleString()} total</span>
                </div>
                {error && (
                  <div className="ad-alert ad-alert--error"><span>{error}</span></div>
                )}
                <div className="ad-tablewrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Plan</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th className="ad-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7}>
                            <div className="ad-state ad-state--loading">
                              <div className="ad-spinner" />
                              <p className="ad-state__sub" style={{ marginTop: 12 }}>Loading users…</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredRows.length > 0 ? (
                        filteredRows.map((u, index) => {
                          const avatar = resolveImageUrl(u.avatarUrl);
                          const initial = (u.name || "?").slice(0, 1).toUpperCase();
                          return (
                            <tr key={u._id}>
                              <td>
                                <div className="ad-id">
                                  {avatar ? (
                                    <img className="ad-avatar ad-avatar--round" src={avatar} alt={u.name} />
                                  ) : (
                                    <div className="ad-avatar ad-avatar--initial ad-avatar--round">{initial}</div>
                                  )}
                                  <div className="ad-id__main">
                                    <Link to={`/profile/${u.publicId || u._id}`} target="_blank" className="ad-id__name">
                                      {u.name || "Unnamed"}
                                    </Link>
                                    <Link to={`/profile/${u.publicId || u._id}`} target="_blank" className="ad-id__sub">
                                      View profile ↗
                                    </Link>
                                  </div>
                                </div>
                              </td>
                              <td>{u.email}</td>
                              <td><span className={planBadge(u.plan)}>{(u.plan || "free").toUpperCase()}</span></td>
                              <td style={{ textTransform: "capitalize" }}>{u.role || "user"}</td>
                              <td><span className={statusBadge(u.status)}>{u.status || "active"}</span></td>
                              <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                              <td className="ad-right">
                                <div style={{ position: "relative", display: "inline-block" }}>
                                  <button className="ad-kebab" onClick={() => toggleDropdown(index)} aria-label="Actions">
                                    {Icon.kebab}
                                  </button>
                                  {dropdownOpen === index && (
                                    <>
                                      <div className="ad-menu-backdrop" onClick={() => setDropdownOpen(null)} />
                                      <div className="ad-menu">
                                        <button className="ad-menu__item ad-menu__item--green" onClick={() => openEdit(u)}>
                                          {Icon.edit} Edit
                                        </button>
                                        <button
                                          className="ad-menu__item ad-menu__item--amber"
                                          onClick={() => setStatus(u._id, u.status === "active" ? "suspended" : "active")}
                                        >
                                          {Icon.ban} {u.status === "active" ? "Suspend" : "Activate"}
                                        </button>
                                        <button className="ad-menu__item ad-menu__item--danger" onClick={() => setStatus(u._id, "banned")}>
                                          {Icon.gavel} Ban
                                        </button>
                                        <div className="ad-menu__sep" />
                                        <button className="ad-menu__item ad-menu__item--danger" onClick={() => removeUser(u._id)}>
                                          {Icon.trash} Delete
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7}>
                            <div className="ad-state">
                              {Icon.users}
                              <p className="ad-state__title">No users found</p>
                              <p className="ad-state__sub">Try adjusting your filters.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="ad-pager">
                  <div className="ad-pager__info">Page <b>{page}</b> of <b>{totalPages}</b></div>
                  <div className="ad-pager__btns">
                    <button className="ad-pg" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹</button>
                    {pageWindow.map((pNum) => (
                      <button key={pNum} onClick={() => setPage(pNum)} className={`ad-pg ${pNum === page ? "ad-pg--active" : ""}`}>
                        {pNum}
                      </button>
                    ))}
                    <button className="ad-pg" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Side rail */}
            <div className="ad-board__side">
              {/* Plan split */}
              <div className="ad-card">
                <div className="ad-panel__head">
                  <div style={{ display: "flex", gap: 12 }}>
                    <span className="ad-panel__ico">{Icon.pie}</span>
                    <div>
                      <h3 className="ad-panel__title">Plan split</h3>
                      <p className="ad-panel__hint">Free vs. premium — this page</p>
                    </div>
                  </div>
                </div>
                <div className="ad-panel__body">
                  <Breakdown
                    items={[
                      { label: "Free", color: "#93a39a", value: insights.free },
                      { label: "Premium", color: "#e6920c", value: insights.premium },
                    ].filter((i) => i.value > 0)}
                    total={insights.pageCount}
                  />
                </div>
              </div>

              {/* Account status */}
              <div className="ad-card">
                <div className="ad-panel__head">
                  <div style={{ display: "flex", gap: 12 }}>
                    <span className="ad-panel__ico">{Icon.pulse}</span>
                    <div>
                      <h3 className="ad-panel__title">Account status</h3>
                      <p className="ad-panel__hint">Health of the current page</p>
                    </div>
                  </div>
                </div>
                <div className="ad-panel__body">
                  <Breakdown
                    items={[
                      { label: "Active", color: "#16b364", value: insights.active },
                      { label: "Suspended", color: "#e6920c", value: insights.suspended },
                      { label: "Banned", color: "#e0394f", value: insights.banned },
                    ].filter((i) => i.value > 0)}
                    total={insights.pageCount}
                  />
                </div>
              </div>

              {/* Guide */}
              <div className="ad-card">
                <div className="ad-panel__head">
                  <div style={{ display: "flex", gap: 12 }}>
                    <span className="ad-panel__ico">{Icon.book}</span>
                    <div>
                      <h3 className="ad-panel__title">Managing members</h3>
                      <p className="ad-panel__hint">What each action does</p>
                    </div>
                  </div>
                </div>
                <div className="ad-panel__body">
                  <div className="ad-tips">
                    <div className="ad-tip">
                      <span className="ad-tip__ico ad-tip__ico--green">{Icon.edit}</span>
                      <div>
                        <p className="ad-tip__title">Edit</p>
                        <p className="ad-tip__sub">Update a member's plan, role, status and profile details.</p>
                      </div>
                    </div>
                    <div className="ad-tip">
                      <span className="ad-tip__ico ad-tip__ico--amber">{Icon.ban}</span>
                      <div>
                        <p className="ad-tip__title">Suspend</p>
                        <p className="ad-tip__sub">Temporarily blocks access — reversible at any time.</p>
                      </div>
                    </div>
                    <div className="ad-tip">
                      <span className="ad-tip__ico ad-tip__ico--red">{Icon.gavel}</span>
                      <div>
                        <p className="ad-tip__title">Ban</p>
                        <p className="ad-tip__sub">Permanently bars the account from the platform.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={editOpen} onHide={() => setEditOpen(false)} centered contentClassName="bg-transparent border-0">
        {editUser && (
          <div className="ad-modal">
            <div className="ad-modal__head">
              <h3 className="ad-modal__title">Edit User</h3>
              <button className="ad-modal__close" onClick={() => setEditOpen(false)}>{Icon.close}</button>
            </div>
            <div className="ad-modal__body">
              <div className="ad-form-grid">
                <div className="ad-field" style={{ gridColumn: "span 6" }}>
                  <label className="ad-label">Name</label>
                  <input className="ad-input" type="text" value={editUser.name}
                    onChange={(e) => setEditUser((u) => ({ ...u, name: e.target.value }))} />
                </div>
                <div className="ad-field" style={{ gridColumn: "span 6" }}>
                  <label className="ad-label">Email</label>
                  <input className="ad-input" type="email" value={editUser.email}
                    onChange={(e) => setEditUser((u) => ({ ...u, email: e.target.value }))} />
                </div>

                <div className="ad-field" style={{ gridColumn: "span 4" }}>
                  <label className="ad-label">Plan</label>
                  <select className="ad-select" value={editUser.plan}
                    onChange={(e) => setEditUser((u) => ({ ...u, plan: e.target.value }))}>
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="ad-field" style={{ gridColumn: "span 4" }}>
                  <label className="ad-label">Role</label>
                  <select className="ad-select" value={editUser.role}
                    onChange={(e) => setEditUser((u) => ({ ...u, role: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="ad-field" style={{ gridColumn: "span 4" }}>
                  <label className="ad-label">Status</label>
                  <select className="ad-select" value={editUser.status}
                    onChange={(e) => setEditUser((u) => ({ ...u, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>

                <div className="ad-field" style={{ gridColumn: "span 6" }}>
                  <label className="ad-label">City</label>
                  <input className="ad-input" type="text" value={editUser.city}
                    onChange={(e) => setEditUser((u) => ({ ...u, city: e.target.value }))} />
                </div>
                <div className="ad-field" style={{ gridColumn: "span 6" }}>
                  <label className="ad-label">Country</label>
                  <input className="ad-input" type="text" value={editUser.country}
                    onChange={(e) => setEditUser((u) => ({ ...u, country: e.target.value }))} />
                </div>
                <div className="ad-field" style={{ gridColumn: "span 6" }}>
                  <label className="ad-label">Plan Valid Until</label>
                  <input className="ad-input" type="date" value={editUser.planValidUntil}
                    onChange={(e) => setEditUser((u) => ({ ...u, planValidUntil: e.target.value }))}
                    style={{ colorScheme: "light" }} />
                </div>
              </div>
            </div>
            <div className="ad-modal__foot">
              <button className="ad-btn ad-btn--ghost" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="ad-btn ad-btn--primary" onClick={saveEdit} disabled={editing}>
                {editing ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Fragment>
  );
}
