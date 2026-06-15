import React, { useId } from "react";

/* ------------------------------------------------------------------ *
 * Lightweight, dependency-free SVG charts for the admin dashboard.
 * They scale responsively via viewBox + width:100%.
 * ------------------------------------------------------------------ */

const niceTop = (max) => {
  if (max <= 0) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

/* ----------------------------- Bar chart ----------------------------- */
export function BarChart({ data = [], height = 240 }) {
  const uid = useId().replace(/:/g, "");
  const W = 640;
  const H = height;
  const padL = 38;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = niceTop(Math.max(1, ...data.map((d) => d.value)));
  const ticks = 4;
  const slot = innerW / Math.max(1, data.length);
  const barW = Math.min(34, slot * 0.45);
  const maxVal = Math.max(...data.map((d) => d.value), 0);

  return (
    <div className="adash-chart-wrap">
      <svg
        className="adash-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`barG-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1ecb7b" />
            <stop offset="100%" stopColor="#11a45e" />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const y = padT + (innerH / ticks) * i;
          const val = Math.round(max - (max / ticks) * i);
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="#e9f1ec"
                strokeWidth="1"
              />
              <text
                className="adash-chart-axis"
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
              >
                {val >= 1000 ? `${Math.round(val / 100) / 10}k` : val}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {data.map((d, i) => {
          const h = max ? (d.value / max) * innerH : 0;
          const x = padL + slot * i + (slot - barW) / 2;
          const y = padT + innerH - h;
          const isMax = d.value === maxVal && maxVal > 0;
          return (
            <g key={i}>
              <rect
                className="adash-bar"
                x={x}
                y={y}
                width={barW}
                height={Math.max(2, h)}
                rx={barW / 2.4}
                fill={isMax ? `url(#barG-${uid})` : "#dceee4"}
              >
                <title>{`${d.label}: ${d.value.toLocaleString()}`}</title>
              </rect>
              <text
                className="adash-chart-axis"
                x={x + barW / 2}
                y={H - 10}
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* --------------------------- Smooth line chart --------------------------- */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

export function LineChart({ series = [], labels = [], height = 240 }) {
  const uid = useId().replace(/:/g, "");
  const W = 560;
  const H = height;
  const padL = 38;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const ticks = 4;

  const allVals = series.flatMap((s) => s.values);
  const max = niceTop(Math.max(1, ...allVals));
  const n = labels.length || (series[0]?.values.length ?? 0);
  const stepX = n > 1 ? innerW / (n - 1) : innerW;

  const toPts = (vals) =>
    vals.map((v, i) => ({
      x: padL + stepX * i,
      y: padT + innerH - (max ? (v / max) * innerH : 0),
    }));

  return (
    <div className="adash-chart-wrap">
      <svg
        className="adash-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {series.map((s, si) => (
            <linearGradient
              key={si}
              id={`areaG-${uid}-${si}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* gridlines + y labels */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const y = padT + (innerH / ticks) * i;
          const val = Math.round(max - (max / ticks) * i);
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="#e9f1ec"
                strokeWidth="1"
              />
              <text
                className="adash-chart-axis"
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
              >
                {val >= 1000 ? `${Math.round(val / 100) / 10}k` : val}
              </text>
            </g>
          );
        })}

        {/* x labels */}
        {labels.map((lb, i) => (
          <text
            key={i}
            className="adash-chart-axis"
            x={padL + stepX * i}
            y={H - 10}
            textAnchor="middle"
          >
            {lb}
          </text>
        ))}

        {/* series: area + line + dots */}
        {series.map((s, si) => {
          const pts = toPts(s.values);
          const line = smoothPath(pts);
          const area = `${line} L ${pts[pts.length - 1].x} ${
            padT + innerH
          } L ${pts[0].x} ${padT + innerH} Z`;
          return (
            <g key={si}>
              <path d={area} fill={`url(#areaG-${uid}-${si})`} />
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map((p, pi) => (
                <circle
                  key={pi}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#fff"
                  stroke={s.color}
                  strokeWidth="2"
                >
                  <title>{`${s.name} — ${labels[pi] ?? pi}: ${s.values[
                    pi
                  ].toLocaleString()}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
