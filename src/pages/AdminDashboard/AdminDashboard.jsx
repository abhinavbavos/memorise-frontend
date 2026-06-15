// src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { iconBoxcard } from "../../data/constant/alldata.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../data/api";

import StatCard from "../../components/Data/StatCard";
import RecentUsersList from "../../components/Data/RecentUsersList";
import RecentSubscriptionsList from "../../components/Data/RecentSubscriptionsList";
import { BarChart, LineChart } from "../../components/Data/DashboardCharts";
import "./AdminDashboard.css";

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

// build the last `n` month buckets, ending with the current month
function lastMonths(n) {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString(undefined, { month: "short" }),
    });
  }
  return out;
}

const monthKeyOf = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${d.getMonth()}`;
};

// month-over-month % change from a bucketed value array
const momTrend = (arr) => {
  if (!arr || arr.length < 2) return null;
  const cur = arr[arr.length - 1];
  const prev = arr[arr.length - 2];
  if (!prev) return cur > 0 ? 100 : null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
};

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

  // ---- chart + trend data derived from the recent records we already load ----
  const { months, userBuckets, subCountBuckets, subAmtBuckets } = useMemo(() => {
    const buckets = lastMonths(6);
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    const userB = new Array(buckets.length).fill(0);
    const subCountB = new Array(buckets.length).fill(0);
    const subAmtB = new Array(buckets.length).fill(0);

    recentUsers.forEach((u) => {
      const k = monthKeyOf(u.createdAt);
      if (k != null && idx.has(k)) userB[idx.get(k)] += 1;
    });
    recentSubs.forEach((s) => {
      const k = monthKeyOf(s.createdAt);
      if (k != null && idx.has(k)) {
        subCountB[idx.get(k)] += 1;
        const amt = Number(s.amount) || 0;
        subAmtB[idx.get(k)] += amt;
      }
    });

    return {
      months: buckets,
      userBuckets: userB,
      subCountBuckets: subCountB,
      subAmtBuckets: subAmtB,
    };
  }, [recentUsers, recentSubs]);

  const hasUserSeries = userBuckets.some((v) => v > 0);
  const hasSubSeries = subCountBuckets.some((v) => v > 0);

  const barData = months.map((m, i) => ({ label: m.label, value: userBuckets[i] }));
  const lineSeries = [
    { name: "New Users", color: "#16b364", values: userBuckets },
    { name: "Subscriptions", color: "#2b7ff5", values: subCountBuckets },
  ];

  const [quickSearch, setQuickSearch] = useState("");

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const today = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="adash ad-page">
      {/* Header */}
      <div className="ad-hero" style={{ marginBottom: 22 }}>
        <div className="ad-hero__lead">
          <div className="ad-hero__icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <div>
            <p className="ad-eyebrow">Dashboard</p>
            <h1 className="ad-hero__title">Overview</h1>
            <p className="ad-hero__sub">
              Welcome back — here's what's happening across Memorise.
            </p>
          </div>
        </div>
        <div className="ad-hero__tools">
          <span className="adash-pill">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {today}
          </span>
          <form onSubmit={handleQuickSearch} className="adash-search">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Quick user search…"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* KPI cards */}
      <div className="adash-grid adash-grid--kpi ad-stagger">
        <StatCard
          title="Total Posts"
          count={stats.totalPosts}
          icon={iconBoxcard[0].icon}
          loading={loading}
          tone="pink"
        />
        <StatCard
          title="Total Users"
          count={stats.totalUsers}
          icon={iconBoxcard[3].icon}
          loading={loading}
          tone="blue"
          trend={hasUserSeries ? momTrend(userBuckets) : undefined}
        />
        <StatCard
          title="Total Revenue"
          count={stats.totalRevenue}
          icon={iconBoxcard[2].icon}
          loading={loading}
          fmt={fmtMoney}
          tone="green"
          trend={hasSubSeries ? momTrend(subAmtBuckets) : undefined}
        />
        <StatCard
          title="Total Subscriptions"
          count={stats.totalSubscriptions}
          icon={iconBoxcard[1].icon}
          loading={loading}
          tone="amber"
          trend={hasSubSeries ? momTrend(subCountBuckets) : undefined}
        />
      </div>

      {/* Charts */}
      <div className="adash-grid adash-grid--charts ad-stagger">
        <div className="adash-card">
          <div className="adash-card__head">
            <div>
              <h3 className="adash-card__title">New Users</h3>
              <p className="adash-card__hint">Sign-ups over the last 6 months</p>
            </div>
            <span className="adash-tag">6 months</span>
          </div>
          {loadingLists ? (
            <div className="adash-loading"><div className="adash-spinner" /></div>
          ) : hasUserSeries ? (
            <BarChart data={barData} />
          ) : (
            <div className="adash-empty">No recent sign-up data to chart yet</div>
          )}
        </div>

        <div className="adash-card">
          <div className="adash-card__head">
            <div>
              <h3 className="adash-card__title">Activity Trend</h3>
              <p className="adash-card__hint">Users vs subscriptions</p>
            </div>
            <span className="adash-tag">6 months</span>
          </div>
          {loadingLists ? (
            <div className="adash-loading"><div className="adash-spinner" /></div>
          ) : hasUserSeries || hasSubSeries ? (
            <>
              <LineChart series={lineSeries} labels={months.map((m) => m.label)} />
              <div className="adash-legend">
                {lineSeries.map((s) => (
                  <span key={s.name} className="adash-legend__item">
                    <span className="adash-legend__dot" style={{ background: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="adash-empty">No recent activity to chart yet</div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="adash-grid adash-grid--tables ad-stagger">
        <RecentUsersList
          users={recentUsers}
          loading={loadingLists}
          onViewMore={() => navigate("/admin/users")}
        />
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
