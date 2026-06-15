import React from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../../utils/urlHelpers";

const RecentUsersList = ({ users = [], loading, onViewMore }) => {
  return (
    <div className="adash-card">
      <div className="adash-card__head">
        <div>
          <h3 className="adash-card__title">Latest Registrations</h3>
          <p className="adash-card__hint">Members who recently joined</p>
        </div>
        <span className="adash-tag">Recent</span>
      </div>

      <div className="adash-list">
        {loading ? (
          <div className="adash-loading">
            <div className="adash-spinner" />
          </div>
        ) : users.length ? (
          users.map((u) => {
            const avatar = resolveImageUrl(u.avatarUrl);
            const initial = (u.name || "?").slice(0, 1).toUpperCase();
            return (
              <Link
                key={u._id}
                to={`/profile/${u.publicId || u._id}`}
                className="adash-row"
              >
                {avatar ? (
                  <img src={avatar} className="adash-avatar" alt={u.name} />
                ) : (
                  <div className="adash-avatar adash-avatar--initial">
                    {initial}
                  </div>
                )}
                <div className="adash-row__main">
                  <p className="adash-row__name">{u.name || "Unnamed"}</p>
                  <p className="adash-row__meta">{u.email}</p>
                </div>
                <div className="adash-row__right">
                  <span className="adash-status adash-status--active">Active</span>
                  <span className="adash-link">View</span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="adash-empty">No recent users</div>
        )}
      </div>

      <div className="adash-card__foot">
        <button type="button" className="adash-btn" onClick={onViewMore}>
          View All Users
        </button>
      </div>
    </div>
  );
};

export default RecentUsersList;
