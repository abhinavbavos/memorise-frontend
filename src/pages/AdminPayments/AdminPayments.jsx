import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import api from "../../data/api";

const pageSizeOptions = [10, 25, 50];

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
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [adminCurrency, setAdminCurrency] = useState(() => {
    // Load saved currency preference from localStorage
    return localStorage.getItem('adminCurrency') || 'USD';
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
      currency: adminCurrency, // Use admin-selected currency
      originalCurrency:
        completed.find((p) => p.currency)?.currency ||
        payments.find((p) => p.currency)?.currency ||
        "USD",
    };
  }, [payments]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 p-6 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">
              Subscriptions & Payments
            </h3>
            <p className="text-gray-600 mt-1">
              Overview of revenue and transaction history.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Currency Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Currency:</label>
              <select
                value={adminCurrency}
                onChange={(e) => {
                  const newCurrency = e.target.value;
                  setAdminCurrency(newCurrency);
                  localStorage.setItem('adminCurrency', newCurrency);
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 p-2.5 transition-all"
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
            <button
              onClick={load}
              className="p-2.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300 group"
              title="Refresh"
            >
              <i className="fa fa-refresh group-hover:rotate-180 transition-transform duration-500"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Stats Section */}
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Subs */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa fa-users text-6xl text-gray-400"></i>
              </div>
              <div className="relative z-10">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-1">Active Subscriptions</p>
                <h2 className="text-3xl font-bold text-gray-900">{derived.activeSubs}</h2>
                <div className="mt-2 text-xs text-gray-700 bg-gray-100 inline-block px-2 py-1 rounded border border-gray-200">
                  Current View
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa fa-dollar text-6xl text-green-600"></i>
              </div>
              <div className="relative z-10">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-1">Total Revenue</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {derived.revenue.toLocaleString(undefined, {
                    style: "currency",
                    currency: derived.currency || "USD",
                    maximumFractionDigits: 2,
                  })}
                </h2>
                <div className="mt-2 text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded border border-green-200">
                  Current View
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa fa-clock-o text-6xl text-yellow-600"></i>
              </div>
              <div className="relative z-10">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-1">Pending Payments</p>
                <h2 className="text-3xl font-bold text-gray-900">{derived.pendingCount}</h2>
              </div>
            </div>

            {/* Failed */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fa fa-times-circle text-6xl text-red-600"></i>
              </div>
              <div className="relative z-10">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-1">Failed Payments</p>
                <h2 className="text-3xl font-bold text-gray-900">{derived.failedCount}</h2>
              </div>
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="xl:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recently Subscribed</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "400px" }}>
              {recentSubs.length ? (
                recentSubs.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {(s.userId?.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          <Link to={`/profile/${s.userId?.publicId || s.userId?._id}`} target="_blank" className="hover:text-red-600 transition-colors">
                            {s.userId?.name || "User"}
                          </Link>
                        </h4>
                        <p className="text-xs text-gray-600">{s.userId?.email || "-"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {s.createdAt ? formatDate(s.createdAt) : "-"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No recent premium subscriptions.
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <Link to="/admin/users" className="block w-full py-2 px-4 rounded-xl bg-gray-100 text-gray-700 text-center text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-all">
                View All Users
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <div className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <i className="fa fa-filter mr-2 text-red-600"></i> Transactions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <form onSubmit={onSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 pr-10 placeholder-gray-500 transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-red-600 transition-colors">
                  <i className="fa fa-search"></i>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <select
                value={preset}
                onChange={(e) => onPreset(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
              >
                <option value="all" className="bg-white">All Dates</option>
                <option value="today" className="bg-white">Today</option>
                <option value="week" className="bg-white">This Week</option>
                <option value="month" className="bg-white">This Month</option>
                <option value="custom" className="bg-white">Custom...</option>
              </select>
            </div>

            {preset === "custom" ? (
              <>
                <div className="lg:col-span-2">
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
                <div className="lg:col-span-2">
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </>
            ) : (
              <div className="lg:col-span-4"></div>
            )}

            <div className="lg:col-span-2">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
              >
                <option value="all" className="bg-white">All Statuses</option>
                <option value="completed" className="bg-white">Completed</option>
                <option value="pending" className="bg-white">Pending</option>
                <option value="failed" className="bg-white">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 m-4 rounded text-red-800">
              <p>{error}</p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600 animate-pulse">
                      <i className="fa fa-circle-o-notch fa-spin mr-2"></i> Loading payments...
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((p, index) => {
                    const uid = p.userId?._id || p.userId;
                    const amount = typeof p.amount === "number" ? p.amount : parseFloat(p.amount || 0);
                    const currency = p.currency || "USD";

                    return (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                          ...{String(p._id || "").slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{p.userId?.name || "-"}</div>
                          <div className="text-xs text-gray-600">{p.userId?.email || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                          {isFinite(amount)
                            ? amount.toLocaleString(undefined, {
                              style: "currency",
                              currency: adminCurrency, // Use admin-selected currency
                            })
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {p.createdAt ? formatDate(p.createdAt) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${isCompleted(p.status) ? 'bg-green-50 text-green-700 border-green-200' :
                            isPending(p.status) ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {String(p.status || "").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => toggleDropdown(index)}
                              className="text-gray-600 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-12 0a1 1 0 100-2 1 1 0 000 2z" />
                              </svg>
                            </button>

                            {dropdownOpen === index && (
                              <>
                                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl bg-white border border-gray-200 z-50 overflow-hidden transform transition-all origin-top-right">
                                  <div className="py-1">
                                    <button
                                      onClick={() => openDetails(p._id)}
                                      className="group flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                    >
                                      <i className="fa fa-info-circle w-5 text-gray-600 group-hover:text-red-600"></i> Details
                                    </button>
                                    {uid && (
                                      <Link
                                        to={`/profile/${p.userId?.publicId || uid}`}
                                        target="_blank"
                                        className="group flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                        onClick={() => setDropdownOpen(null)}
                                      >
                                        <i className="fa fa-user w-5 text-gray-600 group-hover:text-red-600"></i> View User
                                      </Link>
                                    )}
                                  </div>
                                </div>
                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(null)}></div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-indigo-300">
                      <div className="flex flex-col items-center justify-center">
                        <i className="fa fa-inbox text-4xl mb-3 opacity-50"></i>
                        <p>No payments found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="py-4 px-6 border-t border-white/5 flex items-center justify-between">
            <div className="text-sm text-indigo-300">
              Showing page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <i className="la la-angle-left text-lg"></i>
              </button>
              {/* Simplified Pagination */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pNum = i + 1;
                if (page > 3 && totalPages > 5) {
                  pNum = page - 2 + i;
                }
                if (pNum > totalPages) return null;

                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${pNum === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-indigo-600/10 text-indigo-300 hover:bg-indigo-600/30 hover:text-white'
                      }`}
                  >
                    {pNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <i className="la la-angle-right text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered contentClassName="bg-transparent border-0" size="lg">
        {detailItem && (
          <div className="bg-[#1a1c2e] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl z-0 pointer-events-none"></div>
            <div className="relative z-10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h5 className="text-xl font-bold text-white">Payment Details</h5>
                <button onClick={() => setShowDetail(false)} className="text-indigo-400 hover:text-white transition-colors">
                  <i className="fa fa-times text-lg"></i>
                </button>
              </div>
              <div className="bg-black/30 rounded-xl p-4 overflow-auto max-h-[60vh] border border-white/5">
                <pre className="text-sm font-mono text-indigo-200 whitespace-pre-wrap">
                  {JSON.stringify(detailItem, null, 2)}
                </pre>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
