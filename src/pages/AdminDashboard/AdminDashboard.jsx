// src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { iconBoxcard } from "../../data/constant/alldata.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../data/api";

import StatCard from "../../components/Data/StatCard";
import RecentUsersList from "../../components/Data/RecentUsersList";
import RecentSubscriptionsList from "../../components/Data/RecentSubscriptionsList";

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

  const [quickSearch, setQuickSearch] = useState("");

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="mb-0">Dashboard</h3>
        <form onSubmit={handleQuickSearch} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Quick User Search..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            style={{ width: "250px" }}
          />
          <button className="btn btn-primary" type="submit">
            <i className="fa fa-search"></i>
          </button>
        </form>
      </div>

      <div className="row">
        {/* Total Posts */}
        <StatCard
          title="Total Posts"
          count={stats.totalPosts}
          icon={iconBoxcard[0].icon}
          loading={loading}
        />

        {/* Total Users */}
        <StatCard
          title="Total Users"
          count={stats.totalUsers}
          icon={iconBoxcard[3].icon}
          loading={loading}
        />

        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          count={stats.totalRevenue}
          icon={iconBoxcard[1].icon}
          loading={loading}
          fmt={fmtMoney}
        />

        {/* Total Subscriptions */}
        <StatCard
          title="Total Subscriptions"
          count={stats.totalSubscriptions}
          icon={iconBoxcard[2].icon}
          loading={loading}
        />

        {/* Recently Joined */}
        <RecentUsersList
          users={recentUsers}
          loading={loadingLists}
          onViewMore={() => navigate("/admin/users")}
        />

        {/* Recently Subscribed */}
        <RecentSubscriptionsList
          subscriptions={recentSubs}
          loading={loadingLists}
          onViewMore={() => navigate("/admin/payments")}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
