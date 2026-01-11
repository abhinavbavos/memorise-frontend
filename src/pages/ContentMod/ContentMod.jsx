// src/pages/ContentMod/ContentMod.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../data/api";

const PAGE_SIZES = [10, 25, 50];

function ReporterCell({ r }) {
  const name =
    r?.reporter?.name || r?.reporterName || r?.reporter?.email || "Unknown";
  const email = r?.reporter?.email || r?.reporterEmail || null;
  const id = r?.reporter?._id || r?.reporterId || null;

  return (
    <td className="px-6 py-4">
      <div className="text-sm font-medium text-gray-900">{name}</div>
      {email && (
        <a href={`mailto:${email}`} className="text-sm text-red-600 hover:text-red-700">
          {email}
        </a>
      )}
      {id && <p className="text-xs text-gray-500 mt-1">ID: {id}</p>}
    </td>
  );
}

function WhenCell({ r }) {
  const d = r?.createdAt ? new Date(r.createdAt) : null;
  return (
    <td className="px-6 py-4">
      <div className="text-sm text-gray-900">{d ? d.toLocaleDateString() : "-"}</div>
      <div className="text-xs text-gray-500">{d ? d.toLocaleTimeString() : ""}</div>
    </td>
  );
}

function ReasonCell({ r }) {
  const reason =
    r?.reason ||
    r?.category ||
    (r?.type === "spam" ? "Spam" : "Reported Content") ||
    "Reported Content";
  const badgeClass = reason.toLowerCase().includes("spam")
    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
    : reason.toLowerCase().includes("copyright")
      ? "bg-gray-100 text-gray-800 border-gray-200"
      : reason.toLowerCase().includes("violence") ||
        reason.toLowerCase().includes("hate")
        ? "bg-red-100 text-red-800 border-red-200"
        : reason.toLowerCase().includes("misinfo")
          ? "bg-blue-100 text-blue-800 border-blue-200"
          : "bg-indigo-100 text-indigo-800 border-indigo-200";
  const details = r?.details || r?.message || "";

  return (
    <td className="px-6 py-4">
      <div className="text-sm text-gray-900">{details || "-"}</div>
      <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-medium border ${badgeClass}`}>
        {reason}
      </span>
    </td>
  );
}

function TargetCell({ r }) {
  const isObj = (v) => v && typeof v === "object";

  // normalized target support
  const normalizedType = r?.target?.type || r?.type || "-";
  const normalizedId = r?.target?.id || null;

  // legacy shapes fallback (post)
  const post = r?.post || null;
  const postId =
    normalizedId ||
    r?.postId ||
    (isObj(post) ? post._id : null) ||
    r?.targetId ||
    null;

  const postOwner =
    (isObj(post) && (post.user || post.userId)) ||
    (isObj(r?.targetUser) ? r.targetUser : r?.targetUser) ||
    null;

  const postOwnerId = isObj(postOwner)
    ? postOwner._id || postOwner.id || null
    : postOwner || null;

  const postOwnerPublicId = isObj(postOwner)
    ? postOwner.publicId || null
    : null;

  // legacy shapes fallback (user)
  const user =
    (isObj(r?.user) && r.user) ||
    (isObj(r?.reportedUser) && r.reportedUser) ||
    (isObj(r?.targetUser) && r.targetUser) ||
    null;

  const userId = isObj(user) ? user._id || user.id || null : r?.userId || null;
  const userPublicId = isObj(user) ? user.publicId || null : null;

  const type = normalizedType;

  return (
    <td className="px-6 py-4 text-right">
      {type === "post" ? (
        <>
          {postId ? (
            <span className="text-sm font-medium text-red-600">
              Post #{String(postId).slice(-6)}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Post</span>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {postOwnerPublicId || postOwnerId ? (
              <Link
                to={`/profile/${postOwnerPublicId || postOwnerId}`}
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:text-red-700"
              >
                view author
              </Link>
            ) : (
              "by user"
            )}
          </p>
        </>
      ) : (
        <>
          <span className="text-sm font-medium text-red-600">User</span>
          <p className="text-xs text-gray-500 mt-1">
            {userPublicId || userId ? (
              <Link
                to={`/profile/${userPublicId || userId}`}
                target="_blank"
                rel="noreferrer"
                className="text-red-600 hover:text-red-700"
              >
                view profile
              </Link>
            ) : (
              "-"
            )}
          </p>
        </>
      )}
    </td>
  );
}

export default function ContentMod() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // backend: status = open | reviewed | all
  const [status, setStatus] = useState("open");
  const [type, setType] = useState("all"); // all | post | user
  const [q, setQ] = useState(""); // local text filter
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

  // Resolve helpers aligned with backend
  const resolveAs = async (report, decision, action) => {
    // optimistic: remove from current list
    const prev = rows.slice();
    setRows((r) => r.filter((x) => x._id !== report._id));
    setTotal((t) => Math.max(0, t - 1));

    try {
      await api.patch(`/admin/reports/${report._id}`, {
        decision, // 'accept' | 'reject'
        ...(action ? { action } : {}), // 'remove' (for posts)
      });
    } catch (e) {
      // rollback on failure
      setRows(prev);
      setTotal((t) => t + 1);
      alert(e?.response?.data?.error || "Failed to resolve report");
    }
  };

  // UI text search
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

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900">Content Moderation</h3>
          <p className="text-gray-600 mt-1">Review and manage reported content</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 pr-10 placeholder-gray-500 transition-all"
                  placeholder="Search reports..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <i className="fa fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              </div>
            </div>

            <div className="lg:col-span-2">
              <select
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                <option value="open">Status: Open</option>
                <option value="reviewed">Status: Reviewed</option>
                <option value="all">Status: All</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value);
                }}
              >
                <option value="all">Type: All</option>
                <option value="post">Type: Post</option>
                <option value="user">Type: User</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                value={pageSize}
                onChange={(e) => {
                  setPage(1);
                  setPageSize(parseInt(e.target.value, 10));
                }}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                onClick={load}
                className="w-full p-3 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300"
                title="Refresh"
              >
                <i className="fa fa-refresh mr-2"></i> Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded text-red-800">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Reported By</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Reason / Message</th>
                  <th className="px-6 py-4 text-right">Type</th>
                  <th className="px-6 py-4 text-right">Target</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600 animate-pulse">
                      <i className="fa fa-circle-o-notch fa-spin mr-2"></i> Loading reports...
                    </td>
                  </tr>
                ) : filteredRows.length ? (
                  filteredRows.map((r, index) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <ReporterCell r={r} />
                      <WhenCell r={r} />
                      <ReasonCell r={r} />
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {r?.type || r?.target?.type || "-"}
                        </span>
                      </td>
                      <TargetCell r={r} />
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="2"></circle>
                              <circle cx="12" cy="12" r="2"></circle>
                              <circle cx="12" cy="19" r="2"></circle>
                            </svg>
                          </button>

                          {dropdownOpen === index && (
                            <>
                              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl bg-white border border-gray-200 z-50 overflow-hidden">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setDropdownOpen(null);
                                      resolveAs(
                                        r,
                                        "accept",
                                        r?.type === "post" || r?.target?.type === "post"
                                          ? undefined
                                          : undefined
                                      );
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                  >
                                    <i className="fa fa-check mr-2"></i> Accept
                                  </button>

                                  <div className="border-t border-gray-100"></div>
                                  <button
                                    onClick={() => {
                                      setDropdownOpen(null);
                                      resolveAs(r, "reject");
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                  >
                                    <i className="fa fa-times mr-2"></i> Reject
                                  </button>

                                  {(r?.type === "post" || r?.target?.type === "post") && (
                                    <>
                                      <div className="border-t border-gray-100"></div>
                                      <button
                                        onClick={() => {
                                          setDropdownOpen(null);
                                          resolveAs(r, "accept", "remove");
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                      >
                                        <i className="fa fa-trash mr-2"></i> Remove Post
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setDropdownOpen(null)}
                              ></div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                      <div className="flex flex-col items-center justify-center">
                        <i className="fa fa-inbox text-4xl mb-3 opacity-50"></i>
                        <p>No reports found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="py-4 px-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Total: <span className="font-medium text-gray-900">{total}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page <= 1}
                onClick={() => setPage(1)}
              >
                «
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-200">
                Page {page} / {totalPages}
              </span>
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
              <button
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  );
}
