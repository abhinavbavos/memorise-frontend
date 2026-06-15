import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import api from "../../data/api";

// ----- date helpers (inclusive ranges) -----
function toISOStartOfDay(d) {
  const x = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  );
  return x.toISOString();
}
function toISOEndOfDay(d) {
  const x = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  );
  return x.toISOString();
}
function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function isCompleted(status) {
  const s = String(status || "").toLowerCase();
  return s === "completed" || s === "succeeded";
}
function isPending(status) {
  return String(status || "").toLowerCase() === "pending";
}
function isFailed(status) {
  return String(status || "").toLowerCase() === "failed";
}

// ----- inline icons -----
const Icon = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  dollar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  xcircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  kebab: (
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
  ),
};

const statusBadge = (status) => {
  if (isCompleted(status)) return "ad-badge ad-badge--green";
  if (isPending(status)) return "ad-badge ad-badge--amber";
  if (isFailed(status)) return "ad-badge ad-badge--red";
  return "ad-badge ad-badge--gray";
};

export default function AdminPayments() {
  // ---------- filters / paging ----------
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [adminCurrency, setAdminCurrency] = useState(() => {
    return localStorage.getItem("adminCurrency") || "USD";
  });

  // ---------- data ----------
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [recentSubs, setRecentSubs] = useState([]);
  const [error, setError] = useState("");

  // details modal
  const [detailItem, setDetailItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const toggleDropdown = (index) =>
    setDropdownOpen(dropdownOpen === index ? null : index);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const computedRange = useMemo(() => {
    if (preset === "custom") {
      return { start: startDate || "", end: endDate || "" };
    }
    const now = new Date();
    if (preset === "today") {
      const s = new Date(now);
      const e = new Date(now);
      return { start: toISOStartOfDay(s), end: toISOEndOfDay(e) };
    }
    if (preset === "week") {
      const s = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: toISOStartOfDay(s), end: toISOEndOfDay(now) };
    }
    if (preset === "month") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: toISOStartOfDay(s), end: toISOEndOfDay(e) };
    }
    return { start: "", end: "" };
  }, [preset, startDate, endDate]);

  const derived = useMemo(() => {
    const completed = payments.filter((p) => isCompleted(p.status));
    const pending = payments.filter((p) => isPending(p.status));
    const failed = payments.filter((p) => isFailed(p.status));

    const revenue = completed.reduce((sum, p) => {
      const amt =
        typeof p.amount === "number" ? p.amount : parseFloat(p.amount || 0);
      return sum + (isFinite(amt) ? amt : 0);
    }, 0);

    const uniqueActive = new Set(
      completed.map((p) => String(p.userId?._id || p.userId || ""))
    ).size;

    return {
      revenue,
      activeSubs: uniqueActive,
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      currency: adminCurrency,
    };
  }, [payments, adminCurrency]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status:
          status === "all"
            ? undefined
            : status === "completed"
              ? "succeeded"
              : status,
        startDate: computedRange.start || undefined,
        endDate: computedRange.end || undefined,
      };
      const { data } = await api.get("/admin/payments", { params });
      setPayments(Array.isArray(data?.items) ? data.items : []);
      setTotal(data?.total || 0);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load payments");
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSubs = async () => {
    try {
      const { data } = await api.get("/admin/subscriptions/recent", {
        params: { limit: 8 },
      });
      setRecentSubs(Array.isArray(data) ? data : []);
    } catch {
      setRecentSubs([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, computedRange.start, computedRange.end]);

  useEffect(() => {
    loadRecentSubs();
  }, []);

  const onPreset = (p) => {
    setPreset(p);
    if (p !== "custom") {
      setStartDate("");
      setEndDate("");
    }
    setPage(1);
  };

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const openDetails = async (id) => {
    setDropdownOpen(null);
    try {
      const { data } = await api.get(`/admin/payments/${id}`);
      setDetailItem(data);
      setShowDetail(true);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to load payment details");
    }
  };

  const fmtMoney = (amt) =>
    isFinite(amt)
      ? Number(amt).toLocaleString(undefined, {
          style: "currency",
          currency: adminCurrency,
          maximumFractionDigits: 2,
        })
      : "—";

  const pageWindow = Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
    let pNum = i + 1;
    if (page > 3 && totalPages > 5) pNum = page - 2 + i;
    return pNum;
  }).filter((n) => n <= totalPages);

  return (
    <div className="ad-shell ad-page">
      <div className="ad-wrap ad-stagger" style={{ display: "grid", gap: 22 }}>
        {/* Header */}
        <div className="ad-hero">
          <div className="ad-hero__lead">
            <div className="ad-hero__icon">{Icon.dollar}</div>
            <div>
              <p className="ad-eyebrow">Revenue</p>
              <h1 className="ad-hero__title">Subscriptions &amp; Payments</h1>
              <p className="ad-hero__sub">Track revenue, active plans and every transaction.</p>
            </div>
          </div>
          <div className="ad-hero__tools">
            <div className="ad-field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <span className="ad-label" style={{ whiteSpace: "nowrap" }}>Currency</span>
              <select
                className="ad-select"
                style={{ width: 130 }}
                value={adminCurrency}
                onChange={(e) => {
                  const c = e.target.value;
                  setAdminCurrency(c);
                  localStorage.setItem("adminCurrency", c);
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="CHF">CHF (Fr)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
            </div>
            <button className="ad-iconbtn" onClick={load} title="Refresh">
              {Icon.refresh}
            </button>
          </div>
        </div>

        {/* Stats + Recently subscribed */}
        <div className="ad-cols ad-cols--stats-recent">
          <div className="ad-stats">
            <div className="ad-stat">
              <div className="ad-stat__icon ad-stat__icon--blue">{Icon.users}</div>
              <div className="ad-stat__body">
                <p className="ad-stat__label">Active Subscriptions</p>
                <h3 className="ad-stat__value">{derived.activeSubs}</h3>
                <p className="ad-stat__meta"><span className="ad-badge ad-badge--gray ad-badge--nodot">Current view</span></p>
              </div>
            </div>

            <div className="ad-stat">
              <div className="ad-stat__icon ad-stat__icon--green">{Icon.dollar}</div>
              <div className="ad-stat__body">
                <p className="ad-stat__label">Total Revenue</p>
                <h3 className="ad-stat__value">
                  {derived.revenue.toLocaleString(undefined, {
                    style: "currency",
                    currency: derived.currency || "USD",
                    maximumFractionDigits: 2,
                  })}
                </h3>
                <p className="ad-stat__meta"><span className="ad-badge ad-badge--green ad-badge--nodot">Current view</span></p>
              </div>
            </div>

            <div className="ad-stat">
              <div className="ad-stat__icon ad-stat__icon--amber">{Icon.clock}</div>
              <div className="ad-stat__body">
                <p className="ad-stat__label">Pending Payments</p>
                <h3 className="ad-stat__value">{derived.pendingCount}</h3>
              </div>
            </div>

            <div className="ad-stat">
              <div className="ad-stat__icon ad-stat__icon--pink">{Icon.xcircle}</div>
              <div className="ad-stat__body">
                <p className="ad-stat__label">Failed Payments</p>
                <h3 className="ad-stat__value">{derived.failedCount}</h3>
              </div>
            </div>
          </div>

          {/* Recently Subscribed */}
          <div className="ad-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="ad-card__head">
              <div>
                <h3 className="ad-card__title">Recently Subscribed</h3>
                <p className="ad-card__hint">Latest premium purchases</p>
              </div>
            </div>
            <div className="ad-mini">
              {recentSubs.length ? (
                recentSubs.map((s) => (
                  <div key={s._id} className="ad-mini__row">
                    <div className="ad-avatar ad-avatar--initial ad-avatar--round" style={{ width: 38, height: 38, fontSize: 14 }}>
                      {(s.userId?.name || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="ad-mini__main">
                      <p className="ad-mini__name">
                        <Link to={`/profile/${s.userId?.publicId || s.userId?._id}`} target="_blank">
                          {s.userId?.name || "User"}
                        </Link>
                      </p>
                      <p className="ad-mini__sub">{s.userId?.email || "-"}</p>
                    </div>
                    <span className="ad-mini__time">{s.createdAt ? formatDate(s.createdAt) : "-"}</span>
                  </div>
                ))
              ) : (
                <div className="ad-state" style={{ padding: "36px 12px" }}>
                  <p className="ad-state__sub">No recent premium subscriptions.</p>
                </div>
              )}
            </div>
            <div className="ad-card__foot">
              <Link to="/admin/users" className="ad-btn ad-btn--ghost" style={{ width: "100%" }}>
                View All Users
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ad-card">
          <div className="ad-card__head">
            <h3 className="ad-card__title">Transactions</h3>
          </div>
          <div className="ad-card__body">
            <div className="ad-filters">
              <form onSubmit={onSearch} className="ad-search">
                {Icon.search}
                <input
                  className="ad-input"
                  type="text"
                  placeholder="Search description…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>

              <select className="ad-select" value={preset} onChange={(e) => onPreset(e.target.value)}>
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom…</option>
              </select>

              {preset === "custom" ? (
                <>
                  <input
                    className="ad-input"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ colorScheme: "light" }}
                  />
                  <input
                    className="ad-input"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ colorScheme: "light" }}
                  />
                </>
              ) : (
                <>
                  <div />
                  <select
                    className="ad-select"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </>
              )}
            </div>
            {preset === "custom" && (
              <div style={{ marginTop: 14, maxWidth: 240 }}>
                <select
                  className="ad-select"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="ad-card ad-tablecard">
          {error && (
            <div className="ad-alert ad-alert--error">{Icon.xcircle}<span>{error}</span></div>
          )}
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="ad-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="ad-state ad-state--loading">
                        <div className="ad-spinner" />
                        <p className="ad-state__sub" style={{ marginTop: 12 }}>Loading payments…</p>
                      </div>
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((p, index) => {
                    const uid = p.userId?._id || p.userId;
                    const amount = typeof p.amount === "number" ? p.amount : parseFloat(p.amount || 0);
                    return (
                      <tr key={p._id}>
                        <td><span className="ad-cell-mono">…{String(p._id || "").slice(-6)}</span></td>
                        <td>
                          <div className="ad-cell-strong">{p.userId?.name || "-"}</div>
                          <div className="ad-cell-sub">{p.userId?.email || "-"}</div>
                        </td>
                        <td><span className="ad-cell-strong">{fmtMoney(amount)}</span></td>
                        <td>{p.createdAt ? formatDate(p.createdAt) : "-"}</td>
                        <td><span className={statusBadge(p.status)}>{String(p.status || "").toLowerCase()}</span></td>
                        <td className="ad-right">
                          <div style={{ position: "relative", display: "inline-block" }}>
                            <button className="ad-kebab" onClick={() => toggleDropdown(index)} aria-label="Actions">
                              {Icon.kebab}
                            </button>
                            {dropdownOpen === index && (
                              <>
                                <div className="ad-menu-backdrop" onClick={() => setDropdownOpen(null)} />
                                <div className="ad-menu">
                                  <button className="ad-menu__item ad-menu__item--green" onClick={() => openDetails(p._id)}>
                                    {Icon.info} Details
                                  </button>
                                  {uid && (
                                    <Link
                                      to={`/profile/${p.userId?.publicId || uid}`}
                                      target="_blank"
                                      className="ad-menu__item"
                                      onClick={() => setDropdownOpen(null)}
                                    >
                                      {Icon.user} View User
                                    </Link>
                                  )}
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
                    <td colSpan={6}>
                      <div className="ad-state">
                        {Icon.inbox}
                        <p className="ad-state__title">No payments found</p>
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
            <div className="ad-pager__info">
              Page <b>{page}</b> of <b>{totalPages}</b>
            </div>
            <div className="ad-pager__btns">
              <button className="ad-pg" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹</button>
              {pageWindow.map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`ad-pg ${pNum === page ? "ad-pg--active" : ""}`}
                >
                  {pNum}
                </button>
              ))}
              <button className="ad-pg" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered contentClassName="bg-transparent border-0" size="lg">
        {detailItem && (
          <div className="ad-modal">
            <div className="ad-modal__head">
              <h5 className="ad-modal__title">Payment Details</h5>
              <button className="ad-modal__close" onClick={() => setShowDetail(false)}>{Icon.close}</button>
            </div>
            <div className="ad-modal__body">
              <pre className="ad-codeblock">{JSON.stringify(detailItem, null, 2)}</pre>
            </div>
            <div className="ad-modal__foot">
              <button className="ad-btn ad-btn--primary" onClick={() => setShowDetail(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
