// src/pages/AdminPayments/AdminPayments.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { iconBoxcard } from "../../data/constant/alldata";
import api from "../../data/api";

const pageSizeOptions = [10, 25, 50];

// ----- date helpers (inclusive ranges) -----
function toISOStartOfDay(d) {
  // UTC start-of-day (00:00:00.000Z)
  const x = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  );
  return x.toISOString();
}
function toISOEndOfDay(d) {
  // UTC end-of-day (23:59:59.999Z)
  const x = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  );
  return x.toISOString();
}
function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
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

export default function AdminPayments() {
  // ---------- filters / paging ----------
  const [preset, setPreset] = useState("all"); // all | today | week | month | custom
  const [startDate, setStartDate] = useState(""); // ISO strings (with time)
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all"); // all | completed | pending | failed
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ---------- data ----------
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [recentSubs, setRecentSubs] = useState([]);
  const [error, setError] = useState("");

  // details modal
  const [detailItem, setDetailItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  // compute real date range from preset if needed (inclusive)
  const computedRange = useMemo(() => {
    if (preset === "custom") {
      return {
        start: startDate || "",
        end: endDate || "",
      };
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
    return { start: "", end: "" }; // "all"
  }, [preset, startDate, endDate]);

  // derived metrics from current page (lightweight & responsive)
  const derived = useMemo(() => {
    const completed = payments.filter((p) => isCompleted(p.status));
    const pending = payments.filter((p) => isPending(p.status));
    const failed = payments.filter((p) => isFailed(p.status));

    const revenue = completed.reduce((sum, p) => {
      const amt =
        typeof p.amount === "number" ? p.amount : parseFloat(p.amount || 0);
      return sum + (isFinite(amt) ? amt : 0);
    }, 0);

    // unique userIds with a completed/succeeded payment in the current view
    const uniqueActive = new Set(
      completed.map((p) => String(p.userId?._id || p.userId || ""))
    ).size;

    return {
      revenue,
      activeSubs: uniqueActive,
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      currency:
        completed.find((p) => p.currency)?.currency ||
        payments.find((p) => p.currency)?.currency ||
        "USD",
    };
  }, [payments]);

  // load payments
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        // backend accepts "succeeded|pending|failed"; we map "completed" -> "succeeded"
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

  // load recent subscriptions list (completed premium subs)
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
    try {
      const { data } = await api.get(`/admin/payments/${id}`);
      setDetailItem(data);
      setShowDetail(true);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to load payment details");
    }
  };

  return (
    <div className="container-fluid">
      <div className="col-xl-12">
        <h3>Subscriptions & Payments</h3>
      </div>

      <div className="container-fluid px-0">
        <div className="row h-100">
          {/* Stats Cards (derived from current view) */}
          <div className="col-xl-6 col-lg-12 d-flex flex-column">
            <div className="row flex-fill">
              <div className="col-xl-6 col-lg-3 col-md-6 col-sm-6 d-flex m-0">
                <div className="card flex-fill">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div className="card-menu">
                      <span>Active Subscriptions (view)</span>
                      <h2 className="mb-0">{derived.activeSubs}</h2>
                    </div>
                    <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-content-center">
                      {iconBoxcard[2].icon}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6 col-lg-3 col-md-6 col-sm-6 d-flex">
                <div className="card flex-fill">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div className="card-menu">
                      <span>Total Revenue (view)</span>
                      <h2 className="mb-0">
                        {derived.revenue.toLocaleString(undefined, {
                          style: "currency",
                          currency: derived.currency || "USD",
                          maximumFractionDigits: 2,
                        })}
                      </h2>
                    </div>
                    <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-content-center">
                      {iconBoxcard[1].icon}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6 col-lg-3 col-md-6 col-sm-6 d-flex">
                <div className="card flex-fill">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div className="card-menu">
                      <span>Pending (view)</span>
                      <h2 className="mb-0">{derived.pendingCount}</h2>
                    </div>
                    <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-content-center">
                      {iconBoxcard[0].icon}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6 col-lg-3 col-md-6 col-sm-6 d-flex">
                <div className="card flex-fill">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div className="card-menu">
                      <span>Failed (view)</span>
                      <h2 className="mb-0">{derived.failedCount}</h2>
                    </div>
                    <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-content-center">
                      {iconBoxcard[2].icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Subscribed */}
          <div className="col-xl-6 col-lg-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header border-0 pb-0">
                <h3 className="h-title">Recently Subscribed</h3>
              </div>
              <div className="card-body px-0 pb-0 flex-grow-1">
                <div
                  className="dz-scroll recent-customer"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  {recentSubs.length ? (
                    recentSubs.map((s) => (
                      <div key={s._id} className="px-3 py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div>
                              <div
                                className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{
                                  width: 40,
                                  height: 40,
                                  fontWeight: 600,
                                }}
                              >
                                {(s.userId?.name || "U")
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </div>
                            </div>
                            <div className="ms-3">
                              <h6 className="mb-0">
                                <Link to="#" className="text-decoration-none">
                                  {s.userId?.name || "User"}
                                </Link>
                              </h6>
                              <p className="mb-0 text-muted small">
                                {s.userId?.email || "-"}
                              </p>
                            </div>
                          </div>
                          <span className="text-muted small">
                            {s.createdAt ? formatDate(s.createdAt) : "-"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted px-3 py-4">
                      No recent premium subscriptions.
                    </div>
                  )}
                </div>
              </div>
              <div className="card-footer border-0">
                <Link
                  to={`/admin/users`}
                  className="btn btn-primary w-100 mb-2"
                >
                  View Users
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="col-xl-12 col-lg-12 col-xxl-12 col-sm-12">
          <div className="card">
            <div className="card-header">
              <div className="w-100 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h4 className="card-title mb-2 mb-sm-0">
                  Recent Payments Queue
                </h4>

                {/* search */}
                <form className="d-flex gap-2" onSubmit={onSearch}>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Search description…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 240 }}
                  />
                  <button className="btn btn-sm btn-primary">Search</button>
                </form>

                {/* date preset */}
                <select
                  className="form-select form-select-sm"
                  value={preset}
                  onChange={(e) => onPreset(e.target.value)}
                  style={{ width: 150 }}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom…</option>
                </select>

                {preset === "custom" && (
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ width: 220 }}
                    />
                    <span className="text-muted">to</span>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: 220 }}
                    />
                  </div>
                )}

                {/* status */}
                <select
                  className="form-select form-select-sm"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  style={{ width: 150 }}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <div className="d-flex gap-2">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(parseInt(e.target.value, 10));
                      setPage(1);
                    }}
                    className="form-select form-select-sm"
                    style={{ width: 120 }}
                  >
                    {pageSizeOptions.map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="table-responsive recentOrderTable">
                <table className="table verticle-middle table-responsive-md">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Name</th>
                      <th scope="col">E-Mail</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          Loading…
                        </td>
                      </tr>
                    ) : payments.length > 0 ? (
                      payments.map((p) => {
                        const uid = p.userId?._id || p.userId;
                        const short = String(p._id || "").slice(-6);
                        const badgeClass = isCompleted(p.status)
                          ? "badge-success"
                          : isPending(p.status)
                          ? "badge-warning"
                          : isFailed(p.status)
                          ? "badge-danger"
                          : "badge-secondary";
                        const amount =
                          typeof p.amount === "number"
                            ? p.amount
                            : parseFloat(p.amount || 0);
                        const currency = p.currency || "USD";
                        return (
                          <tr key={p._id}>
                            <td>…{short}</td>
                            <td>{p.userId?.name || "-"}</td>
                            <td>{p.userId?.email || "-"}</td>
                            <td>
                              {isFinite(amount)
                                ? amount.toLocaleString(undefined, {
                                    style: "currency",
                                    currency,
                                  })
                                : "-"}
                            </td>
                            <td>
                              {p.createdAt ? formatDate(p.createdAt) : "-"}
                            </td>
                            <td>
                              <span
                                className={`badge badge-rounded ${badgeClass}`}
                              >
                                {String(p.status || "").toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <Dropdown className="dropdown custom-dropdown mb-0">
                                <Dropdown.Toggle className="btn sharp btn-primary tp-btn i-false">
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                  >
                                    <g fill="none">
                                      <circle
                                        fill="#000"
                                        cx="12"
                                        cy="5"
                                        r="2"
                                      />
                                      <circle
                                        fill="#000"
                                        cx="12"
                                        cy="12"
                                        r="2"
                                      />
                                      <circle
                                        fill="#000"
                                        cx="12"
                                        cy="19"
                                        r="2"
                                      />
                                    </g>
                                  </svg>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
                                  <Dropdown.Item
                                    onClick={() => openDetails(p._id)}
                                  >
                                    Details
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    disabled
                                    className="text-muted"
                                  >
                                    Cancel (N/A)
                                  </Dropdown.Item>
                                  {uid && (
                                    <Dropdown.Item
                                      onClick={() =>
                                        window.open(
                                          `/profile/${
                                            p.userId?.publicId || uid
                                          }`,
                                          "_blank"
                                        )
                                      }
                                    >
                                      View User
                                    </Dropdown.Item>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="text-muted">
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              className="mb-2"
                            >
                              <circle cx="11" cy="11" r="8"></circle>
                              <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <p className="mb-0">
                              No payments found for the selected filters
                            </p>
                            <small>Try adjusting date/status/search</small>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">Total: {total}</div>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage(1)}
                  >
                    «
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </button>
                  <span className="btn btn-light disabled">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    className="btn btn-outline-secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Modal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        centered
        size="lg"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Payment Details</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => setShowDetail(false)}
            />
          </div>
          <div className="modal-body">
            {detailItem ? (
              <pre
                className="bg-light p-3 rounded"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {JSON.stringify(detailItem, null, 2)}
              </pre>
            ) : (
              <div className="text-muted">No details</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
