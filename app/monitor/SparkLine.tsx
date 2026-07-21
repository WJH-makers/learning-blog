"use client";

interface Point { t: number; cpu: number; mem: number; load: number }

function timeLabel(ts: number, mode: "day" | "week"): string {
  const d = new Date(ts);
  if (mode === "day") return `${d.getHours().toString().padStart(2, "0")}:00`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function chartSvg(data: Point[], mode: "day" | "week", key: "cpu" | "mem" | "load", color: string, w: number, h: number) {
  if (data.length < 2) return null;
  const max = Math.max(5, ...data.map(d => d[key]));
  const pad = 30;
  const iw = w - pad * 2;
  const step = iw / (data.length - 1);

  const line = data.map((d, i) => `${(pad + i * step).toFixed(1)},${(h - (d[key] / max) * (h - 8)).toFixed(1)}`).join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x={pad} y={h - 2} fill="var(--neutral-400)" fontSize="9">{timeLabel(data[0].t, mode)}</text>
      <text x={pad + iw - 20} y={h - 2} fill="var(--neutral-400)" fontSize="9" textAnchor="end">{timeLabel(data[data.length - 1].t, mode)}</text>
    </svg>
  );
}

export default function SparkLines({ day, week }: { day: Point[]; week: Point[] }) {
  if (!day || !week) return null;

  return (
    <>
      <div style={{ marginTop: 20 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>24 Hours</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <span style={{ fontSize: "0.65rem", color: "#e55" }}>CPU</span>
            {chartSvg(day, "day", "cpu", "#e55", 320, 50)}
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <span style={{ fontSize: "0.65rem", color: "#36a" }}>MEM</span>
            {chartSvg(day, "day", "mem", "#36a", 320, 50)}
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <span style={{ fontSize: "0.65rem", color: "#e9c46a" }}>LOAD</span>
            {chartSvg(day, "day", "load", "#e9c46a", 320, 50)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>7 Days</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            {chartSvg(week, "week", "cpu", "#e55", 320, 50)}
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            {chartSvg(week, "week", "mem", "#36a", 320, 50)}
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            {chartSvg(week, "week", "load", "#e9c46a", 320, 50)}
          </div>
        </div>
      </div>
    </>
  );
}
