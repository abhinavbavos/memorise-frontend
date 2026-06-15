import React from "react";

const TrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M5 15l5-5 4 4 5-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 8h3v3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrendDown = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M5 9l5 5 4-4 5 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 16h3v-3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StatCard = ({
  title,
  count,
  icon,
  loading,
  fmt,
  tone = "violet",
  trend,            // number, e.g. 12.4 or -8.1
  period = "Last 30 days",
}) => {
  const up = (trend ?? 0) >= 0;
  return (
    <div className="adash-stat">
      <div className={`adash-stat__icon adash-stat__icon--${tone}`}>{icon}</div>
      <p className="adash-stat__label">{title}</p>
      {loading ? (
        <div className="adash-skel" />
      ) : (
        <h3 className="adash-stat__value">{fmt ? fmt(count) : Number(count).toLocaleString()}</h3>
      )}
      <div className="adash-stat__foot">
        {trend != null && (
          <span className={`adash-trend adash-trend--${up ? "up" : "down"}`}>
            {up ? <TrendUp /> : <TrendDown />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="adash-stat__period">{period}</span>
      </div>
    </div>
  );
};

export default StatCard;
