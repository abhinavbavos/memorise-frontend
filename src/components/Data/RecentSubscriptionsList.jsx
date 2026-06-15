import React from "react";

const fmtAmount = (s) =>
  s.amount != null
    ? Number(s.amount).toLocaleString(undefined, {
        style: "currency",
        currency: s.currency || "INR",
        maximumFractionDigits: 0,
      })
    : "—";

const RecentSubscriptionsList = ({ subscriptions = [], loading, onViewMore }) => {
  return (
    <div className="adash-card">
      <div className="adash-card__head">
        <div>
          <h3 className="adash-card__title">Latest Transactions</h3>
          <p className="adash-card__hint">Most recent premium purchases</p>
        </div>
        <span className="adash-tag">Recent</span>
      </div>

      <div className="adash-list">
        {loading ? (
          <div className="adash-loading">
            <div className="adash-spinner" />
          </div>
        ) : subscriptions.length ? (
          subscriptions.map((s) => {
            const name = s.userId?.name || "User";
            const initial = name.slice(0, 1).toUpperCase();
            const date = s.createdAt
              ? new Date(s.createdAt).toLocaleDateString()
              : "";
            return (
              <div key={s._id} className="adash-row">
                <div className="adash-avatar adash-avatar--initial">
                  {initial}
                </div>
                <div className="adash-row__main">
                  <p className="adash-row__name">{name}</p>
                  <p className="adash-row__meta">{date}</p>
                </div>
                <div className="adash-row__right">
                  <span className="adash-amount">{fmtAmount(s)}</span>
                  <span className="adash-status adash-status--active">Paid</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="adash-empty">No recent subscriptions</div>
        )}
      </div>

      <div className="adash-card__foot">
        <button type="button" className="adash-btn" onClick={onViewMore}>
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default RecentSubscriptionsList;
