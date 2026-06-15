// src/pages/ContentMod/ContentMod.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../data/api";

const PAGE_SIZES = [10, 25, 50];

// ----- inline icons -----
const Icon = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" /></svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
  ),
  kebab: (
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><path d="M4 22v-7" /></svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>
  ),
  pie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  ),
};

// reason taxonomy → shared color + bucket
const REASON_META = [
  { key: "spam",      label: "Spam",            color: "#e6920c", match: (r) => r.includes("spam") },
  { key: "abuse",     label: "Hate / Violence", color: "#e0394f", match: (r) => r.includes("violence") || r.includes("hate") || r.includes("abuse") },
  { key: "misinfo",   label: "Misinformation",  color: "#2b7ff5", match: (r) => r.includes("misinfo") },
  { key: "copyright", label: "Copyright",       color: "#93a39a", match: (r) => r.includes("copyright") },
  { key: "other",     label: "Other",           color: "#16b364", match: () => true },
];

function bucketReason(reason) {
  const r = (reason || "").toLowerCase();
  return REASON_META.find((m) => m.match(r)) || REASON_META[REASON_META.length - 1];
}

function reasonBadgeClass(reason) {
  const r = (reason || "").toLowerCase();
  if (r.includes("spam")) return "ad-badge ad-badge--amber ad-badge--nodot";
  if (r.includes("violence") || r.includes("hate")) return "ad-badge ad-badge--red ad-badge--nodot";
  if (r.includes("misinfo")) return "ad-badge ad-badge--blue ad-badge--nodot";
  if (r.includes("copyright")) return "ad-badge ad-badge--gray ad-badge--nodot";
  return "ad-badge ad-badge--green ad-badge--nodot";
}

function reasonOf(r) {
  return r?.reason || r?.category || (r?.type === "spam" ? "Spam" : "Reported Content") || "Reported Content";
}
function typeOf(r) {
  return r?.target?.type || r?.type || "-";
}

function ReporterCell({ r }) {
  const name = r?.reporter?.name || r?.reporterName || r?.reporter?.email || "Unknown";
  const email = r?.reporter?.email || r?.reporterEmail || null;
  return (
    <td>
      <div className="ad-cell-strong">{name}</div>
      {email && (
        <a href={`mailto:${email}`} className="ad-link" style={{ fontSize: 12.5 }}>{email}</a>
      )}
    </td>
  );
}

function WhenCell({ r }) {
  const d = r?.createdAt ? new Date(r.createdAt) : null;
  return (
    <td>
      <div className="ad-cell-strong" style={{ fontWeight: 500 }}>{d ? d.toLocaleDateString() : "-"}</div>
      <div className="ad-cell-sub">{d ? d.toLocaleTimeString() : ""}</div>
    </td>
  );
}

function ReasonCell({ r }) {
  const reason = reasonOf(r);
  const details = r?.details || r?.message || "";
  return (
    <td>
      <div className="ad-cell-strong" style={{ fontWeight: 500, maxWidth: 320, whiteSpace: "normal" }}>{details || "-"}</div>
      <span className={reasonBadgeClass(reason)} style={{ marginTop: 6 }}>{reason}</span>
    </td>
  );
}

function TargetCell({ r }) {
  const isObj = (v) => v && typeof v === "object";
  const normalizedType = r?.target?.type || r?.type || "-";
  const normalizedId = r?.target?.id || null;

  const post = r?.post || null;
  const postId = normalizedId || r?.postId || (isObj(post) ? post._id : null) || r?.targetId || null;
  const postOwner =
    (isObj(post) && (post.user || post.userId)) ||
    (isObj(r?.targetUser) ? r.targetUser : r?.targetUser) || null;
  const postOwnerId = isObj(postOwner) ? postOwner._id || postOwner.id || null : postOwner || null;
  const postOwnerPublicId = isObj(postOwner) ? postOwner.publicId || null : null;

  const user =
    (isObj(r?.user) && r.user) ||
    (isObj(r?.reportedUser) && r.reportedUser) ||
    (isObj(r?.targetUser) && r.targetUser) || null;
  const userId = isObj(user) ? user._id || user.id || null : r?.userId || null;
  const userPublicId = isObj(user) ? user.publicId || null : null;

  const type = normalizedType;

  return (
    <td className="ad-right">
      {type === "post" ? (
        <>
          {postId ? (
            <span className="ad-cell-strong" style={{ color: "var(--ad-green-600)" }}>Post #{String(postId).slice(-6)}</span>
          ) : (
            <span className="ad-cell-sub">Post</span>
          )}
          <p className="ad-cell-sub" style={{ marginTop: 2 }}>
            {postOwnerPublicId || postOwnerId ? (
              <Link to={`/profile/${postOwnerPublicId || postOwnerId}`} target="_blank" rel="noreferrer" className="ad-link">view author</Link>
            ) : ("by user")}
          </p>
        </>
      ) : (
        <>
          <span className="ad-cell-strong" style={{ color: "var(--ad-green-600)" }}>User</span>
          <p className="ad-cell-sub" style={{ marginTop: 2 }}>
            {userPublicId || userId ? (
              <Link to={`/profile/${userPublicId || userId}`} target="_blank" rel="noreferrer" className="ad-link">view profile</Link>
            ) : ("-")}
          </p>
        </>
      )}
    </td>
  );
}

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
            <div
              className="ad-breakdown__fill"
              style={{ width: `${(it.value / max) * 100}%`, background: it.color }}
            />
          </div>
        </div>
      ))}
      {total === 0 && (
        <p className="ad-state__sub" style={{ textAlign: "center", margin: "4px 0 0" }}>
          Nothing on this page to break down yet.
        </p>
      )}
    </div>
  );
}

export default function ContentMod() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("open");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const abortRef = useRef(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const params = { page, pageSize };
      if (status && status !== "all") params.status = status;
      if (type && type !== "all") params.type = type;

      const { data } = await api.get("/admin/reports", {
        params,
        signal: abortRef.current.signal,
      });

      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      setRows(list);
      setTotal(
        typeof data?.total === "number"
          ? data.total
          : Array.isArray(data?.items)
            ? data.items.length
            : Array.isArray(data)
              ? data.length
              : 0
      );
    } catch (e) {
      if (e.name !== "CanceledError") {
        setError(e?.response?.data?.error || "Failed to load reports");
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
  }, [page, pageSize, status, type]);

  const resolveAs = async (report, decision, action) => {
    const prev = rows.slice();
    setRows((r) => r.filter((x) => x._id !== report._id));
    setTotal((t) => Math.max(0, t - 1));

    try {
      await api.patch(`/admin/reports/${report._id}`, {
        decision,
        ...(action ? { action } : {}),
      });
    } catch (e) {
      setRows(prev);
      setTotal((t) => t + 1);
      alert(e?.response?.data?.error || "Failed to resolve report");
    }
  };

  const filteredRows = useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) => {
      const hay =
        [r?.reason, r?.details, r?.reporter?.name, r?.reporter?.email, r?.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";
      return hay.includes(needle);
    });
  }, [rows, q]);

  // derived insights for the KPI row + side rail (current page of reports)
  const insights = useMemo(() => {
    const reasonCounts = Object.fromEntries(REASON_META.map((m) => [m.key, 0]));
    let posts = 0;
    let users = 0;
    rows.forEach((r) => {
      const t = typeOf(r);
      if (t === "post") posts += 1;
      else if (t === "user") users += 1;
      reasonCounts[bucketReason(reasonOf(r)).key] += 1;
    });
    const high = reasonCounts.abuse;
    const reasonItems = REASON_META.map((m) => ({
      label: m.label,
      color: m.color,
      value: reasonCounts[m.key],
    })).filter((i) => i.value > 0);
    return { posts, users, high, reasonItems, pageCount: rows.length };
  }, [rows]);

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const onPage = "this page";

  return (
    <div className="ad-shell ad-page">
      <div className="ad-wrap ad-stagger" style={{ display: "grid", gap: 22 }}>
        {/* Hero */}
        <div className="ad-hero">
          <div className="ad-hero__lead">
            <div className="ad-hero__icon">{Icon.shield}</div>
            <div>
              <p className="ad-eyebrow">Trust &amp; Safety</p>
              <h1 className="ad-hero__title">Content Moderation</h1>
              <p className="ad-hero__sub">Review reported posts and users, and act in one click.</p>
            </div>
          </div>
          <div className="ad-hero__stats">
            <div className="ad-hero-stat">
              <p className="ad-hero-stat__label">Open Queue</p>
              <p className="ad-hero-stat__value">{total}</p>
            </div>
            <div className="ad-hero-stat">
              <p className="ad-hero-stat__label">High Priority</p>
              <p className="ad-hero-stat__value">{insights.high}</p>
            </div>
            <button className="ad-iconbtn" onClick={load} title="Refresh" style={{ alignSelf: "center" }}>{Icon.refresh}</button>
          </div>
        </div>

        {/* KPI row */}
        <div className="ad-kpis">
          <StatTile tone="green" icon={Icon.flag} label="Total Reports" value={total} meta={<span className="ad-badge ad-badge--gray ad-badge--nodot">{status === "all" ? "All statuses" : `Status: ${status}`}</span>} />
          <StatTile tone="blue" icon={Icon.file} label="Posts Reported" value={insights.posts} meta={<span className="ad-stat__period">{onPage}</span>} />
          <StatTile tone="amber" icon={Icon.users} label="Users Reported" value={insights.users} meta={<span className="ad-stat__period">{onPage}</span>} />
          <StatTile tone="pink" icon={Icon.alert} label="High Priority" value={insights.high} meta={<span className="ad-stat__period">hate / violence</span>} />
        </div>

        {/* Board: table (main) + insight rail (side) */}
        <div className="ad-board">
          <div className="ad-board__main">
            <div className="ad-card ad-tablecard">
              {/* Toolbar baked into the card head */}
              <div className="ad-toolbar">
                <h3 className="ad-toolbar__title">Report Queue</h3>
                <div className="ad-search" style={{ flex: "1 1 220px", minWidth: 180 }}>
                  {Icon.search}
                  <input
                    className="ad-input"
                    type="text"
                    placeholder="Search reports…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <select
                  className="ad-select"
                  style={{ width: 160 }}
                  value={status}
                  onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                >
                  <option value="open">Status: Open</option>
                  <option value="reviewed">Status: Reviewed</option>
                  <option value="all">Status: All</option>
                </select>
                <select
                  className="ad-select"
                  style={{ width: 140 }}
                  value={type}
                  onChange={(e) => { setPage(1); setType(e.target.value); }}
                >
                  <option value="all">Type: All</option>
                  <option value="post">Type: Post</option>
                  <option value="user">Type: User</option>
                </select>
                <select
                  className="ad-select"
                  style={{ width: 120 }}
                  value={pageSize}
                  onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10)); }}
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="ad-alert ad-alert--error"><span>{error}</span></div>
              )}

              <div className="ad-tablewrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Reported By</th>
                      <th>Date</th>
                      <th>Reason / Message</th>
                      <th className="ad-right">Type</th>
                      <th className="ad-right">Target</th>
                      <th className="ad-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="ad-state ad-state--loading">
                            <div className="ad-spinner" />
                            <p className="ad-state__sub" style={{ marginTop: 12 }}>Loading reports…</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredRows.length ? (
                      filteredRows.map((r, index) => {
                        const isPost = r?.type === "post" || r?.target?.type === "post";
                        return (
                          <tr key={r._id}>
                            <ReporterCell r={r} />
                            <WhenCell r={r} />
                            <ReasonCell r={r} />
                            <td className="ad-right">
                              <span className="ad-badge ad-badge--gray ad-badge--nodot">{r?.type || r?.target?.type || "-"}</span>
                            </td>
                            <TargetCell r={r} />
                            <td className="ad-right">
                              <div style={{ position: "relative", display: "inline-block" }}>
                                <button className="ad-kebab" onClick={() => toggleDropdown(index)} aria-label="Actions">
                                  {Icon.kebab}
                                </button>
                                {dropdownOpen === index && (
                                  <>
                                    <div className="ad-menu-backdrop" onClick={() => setDropdownOpen(null)} />
                                    <div className="ad-menu">
                                      <button
                                        className="ad-menu__item ad-menu__item--green"
                                        onClick={() => { setDropdownOpen(null); resolveAs(r, "accept"); }}
                                      >
                                        {Icon.check} Accept
                                      </button>
                                      <button
                                        className="ad-menu__item ad-menu__item--danger"
                                        onClick={() => { setDropdownOpen(null); resolveAs(r, "reject"); }}
                                      >
                                        {Icon.x} Reject
                                      </button>
                                      {isPost && (
                                        <>
                                          <div className="ad-menu__sep" />
                                          <button
                                            className="ad-menu__item ad-menu__item--danger"
                                            onClick={() => { setDropdownOpen(null); resolveAs(r, "accept", "remove"); }}
                                          >
                                            {Icon.trash} Remove Post
                                          </button>
                                        </>
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
                            {Icon.shield}
                            <p className="ad-state__title">No reports found</p>
                            <p className="ad-state__sub">Nothing matches your filters — the queue is clear.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="ad-pager">
                <div className="ad-pager__info">Total: <b>{total}</b></div>
                <div className="ad-pager__btns">
                  <button className="ad-pg" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
                  <button className="ad-pg" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
                  <span className="ad-pg ad-pg--active">{page} / {totalPages}</span>
                  <button className="ad-pg" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
                  <button className="ad-pg" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
                </div>
              </div>
            </div>
          </div>

          {/* Side rail */}
          <div className="ad-board__side">
            {/* Reports by reason */}
            <div className="ad-card">
              <div className="ad-panel__head">
                <div style={{ display: "flex", gap: 12 }}>
                  <span className="ad-panel__ico">{Icon.pie}</span>
                  <div>
                    <h3 className="ad-panel__title">Reports by reason</h3>
                    <p className="ad-panel__hint">Across the current page</p>
                  </div>
                </div>
              </div>
              <div className="ad-panel__body">
                <Breakdown items={insights.reasonItems} total={insights.pageCount} />
              </div>
            </div>

            {/* Reports by type */}
            <div className="ad-card">
              <div className="ad-panel__head">
                <div style={{ display: "flex", gap: 12 }}>
                  <span className="ad-panel__ico">{Icon.layers}</span>
                  <div>
                    <h3 className="ad-panel__title">Target type</h3>
                    <p className="ad-panel__hint">Posts vs. users</p>
                  </div>
                </div>
              </div>
              <div className="ad-panel__body">
                <Breakdown
                  items={[
                    { label: "Posts", color: "#2b7ff5", value: insights.posts },
                    { label: "Users", color: "#e6920c", value: insights.users },
                  ].filter((i) => i.value > 0)}
                  total={insights.posts + insights.users}
                />
              </div>
            </div>

            {/* Moderation guide */}
            <div className="ad-card">
              <div className="ad-panel__head">
                <div style={{ display: "flex", gap: 12 }}>
                  <span className="ad-panel__ico">{Icon.book}</span>
                  <div>
                    <h3 className="ad-panel__title">Moderation guide</h3>
                    <p className="ad-panel__hint">How decisions apply</p>
                  </div>
                </div>
              </div>
              <div className="ad-panel__body">
                <div className="ad-tips">
                  <div className="ad-tip">
                    <span className="ad-tip__ico ad-tip__ico--green">{Icon.check}</span>
                    <div>
                      <p className="ad-tip__title">Accept</p>
                      <p className="ad-tip__sub">Upholds the report and closes it as a valid violation.</p>
                    </div>
                  </div>
                  <div className="ad-tip">
                    <span className="ad-tip__ico ad-tip__ico--red">{Icon.x}</span>
                    <div>
                      <p className="ad-tip__title">Reject</p>
                      <p className="ad-tip__sub">Dismisses the report — the content stays live.</p>
                    </div>
                  </div>
                  <div className="ad-tip">
                    <span className="ad-tip__ico ad-tip__ico--amber">{Icon.trash}</span>
                    <div>
                      <p className="ad-tip__title">Remove Post</p>
                      <p className="ad-tip__sub">Accepts and takes the reported post down in one step.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
