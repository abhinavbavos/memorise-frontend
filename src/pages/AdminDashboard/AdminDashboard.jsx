// src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { SVGICON } from "../../data/constant/theme.jsx";
import { iconBoxcard } from "../../data/constant/alldata.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Spinner } from "react-bootstrap";
import api from "../../data/api";

function DropBtnBlog() {
  return (
    <Dropdown className="custom-dropdown mb-0">
      <Dropdown.Toggle
        className="btn sharp tp-btn dark-btn i-false d-flex align-items-center justify-center"
        as="div"
      >
        {SVGICON.DropDots}
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu-right" align="end">
        <Dropdown.Item eventKey="Details">Details</Dropdown.Item>
        <Dropdown.Item className="text-primary" eventKey="Cancel">
          Cancel
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

// helper: ask backend to sign a GET for a given S3 key
async function signGetKey(key) {
  if (!key) return null;
  try {
    const { data } = await api.get("/files/sign", { params: { key } });
    return data?.url || null;
  } catch {
    return null;
  }
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingLists, setLoadingLists] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    openReports: 0,
    totalSubscriptions: 0, // count of succeeded payments
    totalRevenue: 0, // sum of succeeded payments
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSubs, setRecentSubs] = useState([]);

  // load KPI tiles
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // 1) basic dashboard counters
        const { data: dash } = await api.get("/admin/dashboard"); // { users, posts, openReports }

        // 2) aggregate succeeded payments across pages (backend limit max 100)
        const LIMIT = 100;
        let page = 1;
        let totalRevenue = 0;
        let totalSubscriptions = 0;

        // first page
        const first = await api.get("/admin/payments", {
          params: { status: "succeeded", page, limit: LIMIT },
        });
        const firstData = first.data || {};
        const totalPages = Math.max(1, Number(firstData.totalPages || 1));

        const consume = (items = []) => {
          totalSubscriptions += items.length;
          for (const p of items) {
            const amt =
              typeof p.amount === "number"
                ? p.amount
                : parseFloat(p.amount || 0);
            if (Number.isFinite(amt)) totalRevenue += amt;
          }
        };

        consume(firstData.items);

        // remaining pages (if any)
        while (++page <= totalPages) {
          const { data } = await api.get("/admin/payments", {
            params: { status: "succeeded", page, limit: LIMIT },
          });
          consume(data?.items);
        }

        if (!mounted) return;
        setStats({
          totalUsers: dash.users || 0,
          totalPosts: dash.posts || 0,
          openReports: dash.openReports || 0,
          totalSubscriptions,
          totalRevenue,
        });
      } catch {
        if (!mounted) return;
        // keep previous stats (zeros by default)
        setStats((s) => ({ ...s }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // load “Recently Joined” & “Recently Subscribed”
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingLists(true);
      try {
        // recent users
        const { data: users } = await api.get("/admin/users/recent", {
          params: { limit: 6 },
        });

        // resolve avatar for each user
        const usersWithAvatars = await Promise.all(
          (users || []).map(async (u) => {
            if (u.avatarUrl) return u;
            if (u.avatarKey) {
              const url = await signGetKey(u.avatarKey);
              return { ...u, avatarUrl: url };
            }
            return u;
          })
        );

        // recent premium purchases
        const { data: subs } = await api.get("/admin/subscriptions/recent", {
          params: { limit: 6 },
        });

        if (!mounted) return;
        setRecentUsers(usersWithAvatars || []);
        setRecentSubs(subs || []);
      } catch {
        if (!mounted) return;
        setRecentUsers([]);
        setRecentSubs([]);
      } finally {
        if (mounted) setLoadingLists(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fmtMoney = useMemo(
    () =>
      (n, c = "USD") =>
        (Number(n) || 0).toLocaleString(undefined, {
          style: "currency",
          currency: c,
          maximumFractionDigits: 0,
        }),
    []
  );

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Total Posts */}
        <div className="col-xl-3 col-sm-6">
          <div className="card">
            <div className="card-body d-flex justify-content-between">
              <div className="card-menu">
                <span>Total Posts</span>
                <h2 className="mb-0">
                  {loading ? <Spinner size="sm" /> : stats.totalPosts}
                </h2>
              </div>
              <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-center">
                {iconBoxcard[0].icon}
              </div>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="col-xl-3 col-sm-6">
          <div className="card">
            <div className="card-body d-flex justify-content-between">
              <div className="card-menu">
                <span>Total Users</span>
                <h2 className="mb-0">
                  {loading ? <Spinner size="sm" /> : stats.totalUsers}
                </h2>
              </div>
              <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-center">
                {iconBoxcard[3].icon}
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue (sum of all succeeded payments) */}
        <div className="col-xl-3 col-sm-6">
          <div className="card">
            <div className="card-body d-flex justify-content-between">
              <div className="card-menu">
                <span>Total Revenue</span>
                <h2 className="mb-0">
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    fmtMoney(stats.totalRevenue)
                  )}
                </h2>
              </div>
              <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-center">
                {iconBoxcard[1].icon}
              </div>
            </div>
          </div>
        </div>

        {/* Total Subscriptions (count of succeeded payments) */}
        <div className="col-xl-3 col-sm-6">
          <div className="card">
            <div className="card-body d-flex justify-content-between">
              <div className="card-menu">
                <span>Total Subscriptions</span>
                <h2 className="mb-0">
                  {loading ? <Spinner size="sm" /> : stats.totalSubscriptions}
                </h2>
              </div>
              <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-center">
                {iconBoxcard[2].icon}
              </div>
            </div>
          </div>
        </div>

        {/* Recently Joined */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h3 className="h-title">Recently Joined</h3>
            </div>
            <div className="card-body px-0 pb-0">
              <div className="dz-scroll recent-customer">
                {loadingLists ? (
                  <div className="p-3 text-center">
                    <Spinner />
                  </div>
                ) : recentUsers.length ? (
                  recentUsers.map((u) => (
                    <Link key={u._id} to={`/profile/${u.publicId || u._id}`}>
                      <ul className="d-flex custome-list justify-between">
                        <div className="d-flex">
                          <li>
                            <img
                              src={u.avatarUrl || "/placeholder.svg"}
                              className="avatar"
                              alt={u.name}
                              style={{ objectFit: "cover" }}
                            />
                          </li>
                          <li className="ms-2">
                            <h6 className="mb-0">
                              <span className="text-dark">{u.name}</span>
                            </h6>
                            <p className="mb-0 text-muted small">{u.email}</p>
                          </li>
                        </div>
                        <DropBtnBlog />
                      </ul>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-muted text-center">
                    No recent users
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer border-0">
              <button
                type="button"
                className="btn btn-primary btn-block mb-2"
                onClick={() => navigate("/admin/users")}
              >
                View More
              </button>
            </div>
          </div>
        </div>

        {/* Recently Subscribed */}
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header border-0 pb-0">
              <h3 className="h-title">Recently Subscribed</h3>
            </div>
            <div className="card-body px-0 pb-0">
              <div className="dz-scroll recent-customer">
                {loadingLists ? (
                  <div className="p-3 text-center">
                    <Spinner />
                  </div>
                ) : recentSubs.length ? (
                  recentSubs.map((s) => (
                    <div key={s._id}>
                      <ul className="d-flex custome-list justify-between">
                        <div className="d-flex">
                          <li>
                            <div
                              className="avatar d-flex align-items-center justify-content-center bg-primary text-white"
                              style={{
                                borderRadius: "50%",
                                width: 48,
                                height: 48,
                              }}
                            >
                              {(s.userId?.name || "?")
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>
                          </li>
                          <li className="ms-2">
                            <h6 className="mb-0">
                              <span className="text-dark">
                                {s.userId?.name || "User"}
                              </span>
                            </h6>
                            <p className="mb-0 text-muted small">
                              {s.amount != null
                                ? Number(s.amount).toLocaleString(undefined, {
                                    style: "currency",
                                    currency: s.currency || "USD",
                                  })
                                : "-"}{" "}
                              •{" "}
                              {s.createdAt
                                ? new Date(s.createdAt).toLocaleDateString()
                                : ""}
                            </p>
                          </li>
                        </div>
                        <DropBtnBlog />
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-muted text-center">
                    No recent subscriptions
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer border-0">
              <button
                type="button"
                className="btn btn-primary btn-block mb-2"
                onClick={() => navigate("/admin/payments")}
              >
                View Subscriptions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
