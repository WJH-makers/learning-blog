"use client";

interface CfDay {
  t: string;
  requests: number;
  views: number;
  threats: number;
  bytes: number;
  uniques: number;
}

function timeLabel(d: string): string {
  try {
    const dt = new Date(d + "T00:00:00");
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  } catch { return d; }
}

function lineChart(
  data: { t: string; [k: string]: unknown }[],
  keys: { key: string; label: string; color: string }[],
  w: number,
  h: number,
) {
  if (!data || data.length < 2) return null;

  const allMax = Math.max(1, ...data.flatMap(d => keys.map(k => Number(d[k.key]) || 0)));
  const pad = 28;
  const bh = h - pad;
  const step = (w - pad * 2) / (data.length - 1);

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {keys.map((k, ki) => {
        const pts = data.map((d, i) => {
          const x = (pad + i * step).toFixed(1);
          const y = (bh - ((Number(d[k.key]) || 0) / allMax) * (bh - 12)).toFixed(1);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polyline
            key={ki}
            points={pts}
            fill="none"
            stroke={k.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={ki > 0 ? "3 2" : "0"}
          />
        );
      })}
      <text x={pad} y={h - 3} fill="var(--neutral-400)" fontSize="9">
        {timeLabel(String(data[0].t))}
      </text>
      <text x={w - pad} y={h - 3} fill="var(--neutral-400)" fontSize="9" textAnchor="end">
        {timeLabel(String(data[data.length - 1].t))}
      </text>
    </svg>
  );
}

export default function CfCharts({
  week_chart,
  month_chart,
}: {
  week_chart: CfDay[];
  month_chart: { t: string; requests: number; threats: number }[];
}) {
  return (
    <>
      <div className="section-head" style={{ marginTop: 24 }}>
        <div>
          <p className="eyebrow">Traffic</p>
          <h2>网站流量</h2>
        </div>
        <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="button">
          Cloudflare →
        </a>
      </div>

      {week_chart && week_chart.length > 1 && (
        <div style={{ marginTop: 8 }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>7 Days</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: "0.65rem", color: "#e55" }}>Requests</span>
              {lineChart(week_chart, [{ key: "requests", label: "Requests", color: "#e55" }], 320, 52)}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: "0.65rem", color: "#36a" }}>Views</span>
              {lineChart(week_chart, [{ key: "views", label: "Views", color: "#36a" }], 320, 52)}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: "0.65rem", color: "#e9c46a" }}>Uniques</span>
              {lineChart(week_chart, [{ key: "uniques", label: "Uniques", color: "#e9c46a" }], 320, 52)}
            </div>
          </div>
        </div>
      )}

      {month_chart && month_chart.length > 1 && (
        <div style={{ marginTop: 12 }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>30 Days — Requests & Threats</p>
          <div style={{ maxWidth: 680 }}>
            {lineChart(month_chart, [
              { key: "requests", label: "Requests", color: "#888" },
              { key: "threats", label: "Threats", color: "#e55" },
            ], 660, 60)}
          </div>
        </div>
      )}
    </>
  );
}
