// src/pages/ContentMod/ContentMod.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../data/api";

const PAGE_SIZES = [10, 25, 50];

function ReporterCell({ r }) {
  const name =
    r?.reporter?.name || r?.reporterName || r?.reporter?.email || "Unknown";
  const email = r?.reporter?.email || r?.reporterEmail || null;
  const id = r?.reporter?._id || r?.reporterId || null;

  return (
    <td className="py-2">
      <strong>{name}</strong>
      <br />
      {email && (
        <a href={`mailto:${email}`} className="text-decoration-none">
          {email}
        </a>
      )}
      {id && <p className="mb-0 text-500">ID: {id}</p>}
    </td>
  );
}

function WhenCell({ r }) {
  const d = r?.createdAt ? new Date(r.createdAt) : null;
  return (
    <td className="py-2">
      {d ? d.toLocaleDateString() : "-"}
      <br />
      <small className="text-muted">{d ? d.toLocaleTimeString() : ""}</small>
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
    ? "badge-warning"
    : reason.toLowerCase().includes("copyright")
    ? "badge-secondary"
    : reason.toLowerCase().includes("violence") ||
      reason.toLowerCase().includes("hate")
    ? "badge-danger"
    : reason.toLowerCase().includes("misinfo")
    ? "badge-info"
    : "badge-primary";
  const details = r?.details || r?.message || "";

  return (
    <td className="py-2">
      {details || "-"}
      {details ? (
        <p className="mb-0 text-500">{reason}</p>
      ) : (
        <span className={`badge ${badgeClass} badge-sm`}>{reason}</span>
      )}
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
    <td className="py-2 text-end">
      {type === "post" ? (
        <>
          {postId ? (
            <span className="text-primary">
              <strong>Post #{String(postId).slice(-6)}</strong>
            </span>
          ) : (
            <span className="text-muted">Post</span>
          )}
          <p className="mb-0 text-500">
            {postOwnerPublicId || postOwnerId ? (
              <Link
                to={`/profile/${postOwnerPublicId || postOwnerId}`}
                target="_blank"
                rel="noreferrer"
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
          <span className="text-primary">
            <strong>User</strong>
          </span>
          <p className="mb-0 text-500">
            {userPublicId || userId ? (
              <Link
                to={`/profile/${userPublicId || userId}`}
                target="_blank"
                rel="noreferrer"
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

  return (
    <div className="container-fluid">
      <div className="col-xl-12">
        <h3>Content Moderation</h3>
      </div>

      {/* Toolbar */}
      <div className="d-flex flex-wrap gap-2 align-items-center my-3">
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text">
            <i className="fa fa-search" />
          </span>
          <input
            className="form-control"
            placeholder="Search (local)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          style={{ width: 180 }}
        >
          <option value="open">Status: Open</option>
          <option value="reviewed">Status: Reviewed</option>
          <option value="all">Status: All</option>
        </select>

        <select
          className="form-select"
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
          style={{ width: 160 }}
        >
          <option value="all">Type: All</option>
          <option value="post">Type: Post</option>
          <option value="user">Type: User</option>
        </select>

        <select
          className="form-select ms-auto"
          value={pageSize}
          onChange={(e) => {
            setPage(1);
            setPageSize(parseInt(e.target.value, 10));
          }}
          style={{ width: 130 }}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm mb-0 table-responsive-lg">
              <thead className="text-white bg-primary">
                <tr>
                  <th className="align-middle">Reported By</th>
                  <th className="align-middle">Date</th>
                  <th className="align-middle minw200">Reason / Message</th>
                  <th className="align-middle text-end">Type</th>
                  <th className="align-middle text-end">Target</th>
                  <th className="no-sort text-end">Action</th>
                </tr>
              </thead>
              <tbody id="reports">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading…
                    </td>
                  </tr>
                ) : filteredRows.length ? (
                  filteredRows.map((r) => (
                    <tr className="btn-reveal-trigger" key={r._id}>
                      <ReporterCell r={r} />
                      <WhenCell r={r} />
                      <ReasonCell r={r} />
                      <td className="py-2 text-end">
                        <span className="badge badge-sm bg-light text-dark">
                          {r?.type || r?.target?.type || "-"}
                        </span>
                      </td>
                      <TargetCell r={r} />
                      <td className="py-2 text-end">
                        <Dropdown className="dropdown text-sans-serif">
                          <Dropdown.Toggle
                            as="div"
                            variant=""
                            className="i-false"
                          >
                            <button
                              className="btn btn-primary i-false tp-btn-light sharp"
                              type="button"
                            >
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18px"
                                  height="18px"
                                  viewBox="0 0 24 24"
                                  version="1.1"
                                >
                                  <g
                                    stroke="none"
                                    strokeWidth="1"
                                    fill="none"
                                    fillRule="evenodd"
                                  >
                                    <rect
                                      x="0"
                                      y="0"
                                      width="24"
                                      height="24"
                                    ></rect>
                                    <circle
                                      fill="#000000"
                                      cx="12"
                                      cy="5"
                                      r="2"
                                    ></circle>
                                    <circle
                                      fill="#000000"
                                      cx="12"
                                      cy="12"
                                      r="2"
                                    ></circle>
                                    <circle
                                      fill="#000000"
                                      cx="12"
                                      cy="19"
                                      r="2"
                                    ></circle>
                                  </g>
                                </svg>
                              </span>
                            </button>
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="dropdown-menu dropdown-menu-right border py-0">
                            <div className="py-2">
                              {/* Accept */}
                              <button
                                className="dropdown-item text-success"
                                onClick={() =>
                                  resolveAs(
                                    r,
                                    "accept",
                                    r?.type === "post" ||
                                      r?.target?.type === "post"
                                      ? undefined // accept => hide post
                                      : undefined // user accept => ban user on backend
                                  )
                                }
                              >
                                Accept
                              </button>

                              {/* Reject */}
                              <div className="dropdown-divider" />
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => resolveAs(r, "reject")}
                              >
                                Reject
                              </button>

                              {/* Post-only: Remove */}
                              {(r?.type === "post" ||
                                r?.target?.type === "post") && (
                                <>
                                  <div className="dropdown-divider" />
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() =>
                                      resolveAs(r, "accept", "remove")
                                    }
                                  >
                                    Remove Post
                                  </button>
                                </>
                              )}
                            </div>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
  );
}
