import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import api from "../../data/api";

const pageSizeOptions = [10, 25, 50];

export default function AdminUsers() {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // filters (plan + dates filtered client-side; server gets search/page/limit/sort)
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    subscriptionPlan: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: searchParams.get("search") || "",
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
          sort,
        },
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

      setRows((r) =>
        r.map((u) => (u._id === editUser._id ? { ...u, ...body } : u))
      );

      const { data: updated } = await api.put(
        `/admin/users/${editUser._id}`,
        body
      );

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
    try {
      setRows((r) => r.filter((u) => u._id !== userId));
      setTotal((t) => Math.max(0, t - 1));
      await api.delete(`/admin/users/${userId}`);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to delete user");
      load();
    }
  };

  return (
    <Fragment>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 p-6 font-sans text-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-300 to-red-400">
                User Management
              </h1>
              <p className="text-gray-400 mt-1">Manage all your platform users efficiently.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block w-full p-2.5 pr-8 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n} className="bg-white text-gray-900">
                      {n} per page
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600 group-hover:text-gray-900">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block w-full p-2.5 pr-8 hover:bg-gray-100 transition-colors cursor-pointer"
                  style={{ minWidth: "160px" }}
                >
                  <option value="-createdAt" className="bg-white">Newest First</option>
                  <option value="createdAt" className="bg-white">Oldest First</option>
                  <option value="name" className="bg-white">Name (A-Z)</option>
                  <option value="-name" className="bg-white">Name (Z-A)</option>
                  <option value="email" className="bg-white">Email (A-Z)</option>
                  <option value="-email" className="bg-white">Email (Z-A)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600 group-hover:text-gray-900">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
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

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <i className="fa fa-filter mr-2 text-red-600"></i> Filters
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <form onSubmit={onSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 pr-10 placeholder-gray-500 transition-all"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-red-600 transition-colors">
                    <i className="fa fa-search"></i>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={filters.subscriptionPlan}
                  onChange={(e) => handleFilterChange("subscriptionPlan", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                >
                  <option value="all" className="bg-white">All Plans</option>
                  <option value="free" className="bg-white">Free</option>
                  <option value="premium" className="bg-white">Premium</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div className="lg:col-span-2">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 transition-all"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div className="lg:col-span-2 flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300 hover:shadow-md focus:outline-none"
                >
                  Reset
                </button>
                <button
                  onClick={exportCSV}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm px-4 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none"
                >
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
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
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-600 animate-pulse">
                        <i className="fa fa-circle-o-notch fa-spin mr-2"></i> Loading users...
                      </td>
                    </tr>
                  ) : filteredRows.length > 0 ? (
                    filteredRows.map((u, index) => (
                      <tr
                        key={u._id}
                        className="hover:bg-gray-50 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-red-500 transition-all"
                              src={u.avatarUrl || "/placeholder.svg"}
                              alt={u.name}
                            />
                            <div className="ml-4">
                              <Link
                                to={`/profile/${u.publicId || u._id}`}
                                target="_blank"
                                className="text-sm font-medium text-gray-900 hover:text-red-600 hover:underline transition-colors cursor-pointer block"
                              >
                                {u.name}
                              </Link>
                              <div className="text-xs text-gray-500">
                                <Link to={`/profile/${u.publicId || u._id}`} target="_blank" className="hover:text-red-600 transition-colors">
                                  View Profile ↗
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${(u.plan || 'free') === 'premium'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                            {(u.plan || 'free').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                          {u.role || 'user'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${u.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            u.status === 'banned' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                            {(u.status || 'active').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          {/* Actions Dropdown */}
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => toggleDropdown(index)}
                              className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-12 0a1 1 0 100-2 1 1 0 000 2z" />
                              </svg>
                            </button>

                            {dropdownOpen === index && (
                              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white border border-gray-200 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all origin-top-right">
                                <div className="py-1">
                                  <button
                                    onClick={() => openEdit(u)}
                                    className="group flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <i className="fa fa-pencil w-5 text-gray-500"></i> Edit
                                  </button>
                                  <button
                                    onClick={() => setStatus(u._id, u.status === "active" ? "suspended" : "active")}
                                    className="group flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition-colors"
                                  >
                                    <i className="fa fa-ban w-5 text-yellow-600"></i> {u.status === "active" ? "Suspend" : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => setStatus(u._id, "banned")}
                                    className="group flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                                  >
                                    <i className="fa fa-gavel w-5 text-red-600"></i> Ban
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={() => removeUser(u._id)}
                                    className="group flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <i className="fa fa-trash w-5"></i> Delete
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Backdrop to close dropdown */}
                            {dropdownOpen === index && (
                              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(null)}></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                        No users found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="py-4 px-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <i className="la la-angle-left text-lg"></i>
                </button>
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
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {pNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <i className="la la-angle-right text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={editOpen} onHide={() => setEditOpen(false)} centered contentClassName="bg-transparent border-0">
        {editUser && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                <button onClick={() => setEditOpen(false)} className="text-gray-600 hover:text-gray-900 transition-colors">
                  <i className="fa fa-times text-lg"></i>
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editUser.name}
                      onChange={(e) => setEditUser((u) => ({ ...u, name: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser((u) => ({ ...u, email: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                    <select
                      value={editUser.plan}
                      onChange={(e) => setEditUser((u) => ({ ...u, plan: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="free" className="bg-white">Free</option>
                      <option value="premium" className="bg-white">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editUser.role}
                      onChange={(e) => setEditUser((u) => ({ ...u, role: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="user" className="bg-white">User</option>
                      <option value="admin" className="bg-white">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editUser.status}
                      onChange={(e) => setEditUser((u) => ({ ...u, status: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="active" className="bg-white">Active</option>
                      <option value="suspended" className="bg-white">Suspended</option>
                      <option value="banned" className="bg-white">Banned</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editUser.city}
                      onChange={(e) => setEditUser((u) => ({ ...u, city: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={editUser.country}
                      onChange={(e) => setEditUser((u) => ({ ...u, country: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Valid Until</label>
                  <input
                    type="date"
                    value={editUser.planValidUntil}
                    onChange={(e) => setEditUser((u) => ({ ...u, planValidUntil: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </form>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 border border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={editing}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editing ? <><i className="fa fa-spinner fa-spin mr-2"></i> Saving...</> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Fragment>
  );
}
