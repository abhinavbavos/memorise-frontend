// src/pages/AdminUsers/AdminUsers.jsx
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  Modal,
  Nav,
  Pagination,
  Row,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../data/api";

const pageSizeOptions = [10, 25, 50];

export default function AdminUsers() {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // filters (plan + dates filtered client-side; server gets search/page/limit/sort)
  const [filters, setFilters] = useState({
    subscriptionPlan: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  });

  // paging / data
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const abortRef = useRef(null);

  const toggleDropdown = (index) =>
    setDropdownOpen(dropdownOpen === index ? null : index);

  const resetFilters = () =>
    setFilters({
      subscriptionPlan: "all",
      dateFrom: "",
      dateTo: "",
      searchTerm: "",
    });

  const handleFilterChange = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  // server load (search/page/limit/sort)
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const { data } = await api.get("/admin/users", {
        params: {
          search: filters.searchTerm || "",
          page,
          limit,
          sort, // backend supports: createdAt | name | email with optional leading '-'
        },
        signal: abortRef.current.signal,
      });

      const list = Array.isArray(data?.users) ? data.users : [];
      setRows(list);
      setTotal(Number(data?.total || list.length || 0));
    } catch (e) {
      // axios throws DOMException name "CanceledError" when aborted
      if (e.name !== "CanceledError") {
        setError(e?.response?.data?.error || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  // initial + when page/limit/sort change
  useEffect(() => {
    load();
    // cleanup inflight on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sort]);

  // manual search submit
  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  // client-side filters applied on top of server result
  const filteredRows = useMemo(() => {
    const df = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dt = filters.dateTo ? new Date(filters.dateTo) : null;
    // make "Date To" inclusive (end of day)
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

  // export current filtered view to CSV
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

  // actions
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

      // optimistic UI
      setRows((r) =>
        r.map((u) => (u._id === editUser._id ? { ...u, ...body } : u))
      );

      const { data: updated } = await api.put(
        `/admin/users/${editUser._id}`,
        body
      );

      // ensure we reflect server truth (e.g., normalized fields)
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
    try {
      // optimistic UI
      setRows((r) => r.map((u) => (u._id === userId ? { ...u, status } : u)));
      await api.put(`/admin/users/${userId}/status`, { status }); // matches router
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to update status");
      load();
    }
  };

  const removeUser = async (userId) => {
    const ok = window.confirm("Delete this user? This cannot be undone.");
    if (!ok) return;
    try {
      setRows((r) => r.filter((u) => u._id !== userId));
      setTotal((t) => Math.max(0, t - 1));
      await api.delete(`/admin/users/${userId}`);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to delete user");
      load();
    }
  };

  // UI helpers (kept from your scaffold)
  const drop = (index, user) => (
    <div className="position-relative">
      <button
        className="btn btn-primary tp-btn-light sharp i-false"
        onClick={() => toggleDropdown(index)}
        style={{ background: "transparent", border: "none" }}
        aria-expanded={dropdownOpen === index ? "true" : "false"}
      >
        <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <rect x="0" y="0" width="24" height="24"></rect>
            <circle fill="#000000" cx="5" cy="12" r="2"></circle>
            <circle fill="#000000" cx="12" cy="12" r="2"></circle>
            <circle fill="#000000" cx="19" cy="12" r="2"></circle>
          </g>
        </svg>
      </button>
      {dropdownOpen === index && (
        <div
          className="dropdown-menu show position-absolute"
          style={{ right: 0, top: "100%", zIndex: 1000 }}
        >
          <button className="dropdown-item" onClick={() => openEdit(user)}>
            Edit
          </button>
          <button
            className="dropdown-item"
            onClick={() =>
              setStatus(
                user._id,
                user.status === "active" ? "suspended" : "active"
              )
            }
          >
            {user.status === "active" ? "Suspend" : "Activate"}
          </button>
          <button
            className="dropdown-item"
            onClick={() => setStatus(user._id, "banned")}
          >
            Ban
          </button>
          <button
            className="dropdown-item text-danger"
            onClick={() => removeUser(user._id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  // pagination component (now driven by state)
  const PaginationBar = () => (
    <Pagination className="pagination-gutter pagination-danger no-bg">
      <li className="page-item page-indicator">
        <button
          className="page-link"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          <i className="la la-angle-left" />
        </button>
      </li>
      {Array.from({ length: totalPages }).map((_, i) => (
        <Pagination.Item
          key={i + 1}
          active={i + 1 === page}
          onClick={() => setPage(i + 1)}
        >
          {i + 1}
        </Pagination.Item>
      ))}
      <li className="page-item page-indicator">
        <button
          className="page-link"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          <i className="la la-angle-right" />
        </button>
      </li>
    </Pagination>
  );

  return (
    <Fragment>
      <div className="container-fluid">
        <div className="col-xl-12 d-flex align-items-center justify-content-between">
          <h3 className="mb-3">User Management</h3>
          <div className="d-flex gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="form-select"
              style={{ width: 120 }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-select"
              style={{ width: 170 }}
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="name">Name A→Z</option>
              <option value="-name">Name Z→A</option>
              <option value="email">Email A→Z</option>
              <option value="-email">Email Z→A</option>
            </select>

            <button className="btn btn-outline-secondary" onClick={load}>
              Refresh
            </button>
          </div>
        </div>

        <div className="container-fluid px-0">
          {/* Filter */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="fa fa-filter me-2"></i>Filters
                  </h5>
                </div>
                <div className="card-body">
                  <Row className="g-3">
                    <Col md={3}>
                      <Form onSubmit={onSearch}>
                        <Form.Group>
                          <Form.Label>Search Users</Form.Label>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="text"
                              placeholder="Search by name or email..."
                              value={filters.searchTerm}
                              onChange={(e) =>
                                handleFilterChange("searchTerm", e.target.value)
                              }
                            />
                            <Button variant="primary" type="submit">
                              Search
                            </Button>
                          </div>
                        </Form.Group>
                      </Form>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Subscription Plan</Form.Label>
                        <Form.Select
                          value={filters.subscriptionPlan}
                          onChange={(e) =>
                            handleFilterChange(
                              "subscriptionPlan",
                              e.target.value
                            )
                          }
                        >
                          <option value="all">All Plans</option>
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Date From</Form.Label>
                        <Form.Control
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) =>
                            handleFilterChange("dateFrom", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Date To</Form.Label>
                        <Form.Control
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) =>
                            handleFilterChange("dateTo", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                      <div className="d-flex gap-2 w-100">
                        <Button
                          variant="outline-secondary"
                          onClick={resetFilters}
                          className="flex-fill"
                        >
                          <i className="fa fa-refresh me-2"></i>Reset
                        </Button>
                        <Button
                          variant="primary"
                          className="flex-fill"
                          onClick={exportCSV}
                        >
                          <i className="fa fa-download me-2"></i>Export
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger mb-3">{error}</div>
                  )}
                  <div className="table-responsive">
                    <table className="table mb-0 table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Plan</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody id="customers">
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4">
                              Loading…
                            </td>
                          </tr>
                        ) : filteredRows.length ? (
                          filteredRows.map((u, index) => (
                            <tr key={u._id} className="btn-reveal-trigger">
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-xl me-2">
                                    <img
                                      className="rounded-circle img-fluid"
                                      src={u.avatarUrl || "/placeholder.svg"}
                                      width="30"
                                      height="30"
                                      alt={u.name}
                                      style={{ objectFit: "cover" }}
                                    />
                                  </div>
                                  <div className="media-body">
                                    <div className="fw-semibold">{u.name}</div>
                                    <div className="text-muted small">
                                      <Link
                                        to={`/profile/${u.publicId || u._id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        View public
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2">
                                <a href={`mailto:${u.email}`}>{u.email}</a>
                              </td>
                              <td className="py-2 text-capitalize">
                                {u.plan || "free"}
                              </td>
                              <td className="py-2 text-capitalize">
                                {u.role || "user"}
                              </td>
                              <td className="py-2 text-capitalize">
                                {u.status || "active"}
                              </td>
                              <td className="py-2">
                                {u.createdAt
                                  ? new Date(u.createdAt).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="py-2 text-end">
                                {drop(index, u)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-4 text-muted"
                            >
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-center mt-3">
                <Nav>
                  <PaginationBar />
                </Nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={editOpen} onHide={() => setEditOpen(false)} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit User</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => setEditOpen(false)}
            />
          </div>
          <div className="modal-body">
            {editUser && (
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={editUser.name}
                        onChange={(e) =>
                          setEditUser((u) => ({ ...u, name: e.target.value }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={editUser.email}
                        onChange={(e) =>
                          setEditUser((u) => ({ ...u, email: e.target.value }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Plan</Form.Label>
                      <Form.Select
                        value={editUser.plan}
                        onChange={(e) =>
                          setEditUser((u) => ({ ...u, plan: e.target.value }))
                        }
                      >
                        <option value="free">free</option>
                        <option value="premium">premium</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        value={editUser.role}
                        onChange={(e) =>
                          setEditUser((u) => ({ ...u, role: e.target.value }))
                        }
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={editUser.status}
                        onChange={(e) =>
                          setEditUser((u) => ({ ...u, status: e.target.value }))
                        }
                      >
                        <option value="active">active</option>
                        <option value="suspended">suspended</option>
                        <option value="banned">banned</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        value={editUser.city}
                        onChange={(e) =>
                          setEditUser((u) => ({ ...u, city: e.target.value }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        value={editUser.country}
                        onChange={(e) =>
                          setEditUser((u) => ({
                            ...u,
                            country: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Plan Valid Until (optional)</Form.Label>
                      <Form.Control
                        type="date"
                        value={editUser.planValidUntil}
                        onChange={(e) =>
                          setEditUser((u) => ({
                            ...u,
                            planValidUntil: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveEdit} disabled={editing}>
              {editing ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* small dropdown CSS kept from your file */}
      <style>{`
        .dropdown-menu {
          display: block;
          min-width: 10rem;
          padding: 0.5rem 0;
          margin: 0;
          font-size: 0.875rem;
          color: #212529;
          text-align: left;
          list-style: none;
          background-color: #fff;
          background-clip: padding-box;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 0.375rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
        }
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 0.25rem 1rem;
          clear: both;
          font-weight: 400;
          color: #212529;
          text-align: inherit;
          text-decoration: none;
          white-space: nowrap;
          background-color: transparent;
          border: 0;
        }
        .dropdown-item:hover {
          color: #1e2125;
          background-color: #e9ecef;
        }
        .dropdown-item.text-danger {
          color: #dc3545;
        }
        .dropdown-item.text-danger:hover {
          color: #721c24;
          background-color: #f5c6cb;
        }
      `}</style>
    </Fragment>
  );
}
