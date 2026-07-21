"use client";

interface Props {
  data: { t: number; cpu: number; mem: number }[];
}

function polyline(values: number[], w: number, h: number, max: number) {
  if (values.length < 2) return "";
  const step = w / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"}${x},${Math.round(y)}`;
    })
    .join(" ");
}

export default function SparkLine({ data }: Props) {
  if (!data || data.length < 2) return null;

  const w = 200;
  const h = 48;
  const cpuMax = Math.max(10, ...data.map(d => d.cpu));
  const memMax = Math.max(10, ...data.map(d => d.mem));

  return (
    <div style={{ display: "flex", gap: 12, margin: "8px 0 0", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <span style={{ fontSize: "0.7rem", color: "var(--neutral-500)" }}>CPU</span>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            points={data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.cpu / cpuMax) * h}`).join(" ")}
          />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <span style={{ fontSize: "0.7rem", color: "var(--neutral-500)" }}>MEM</span>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            points={data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.mem / memMax) * h}`).join(" ")}
          />
        </svg>
      </div>
    </div>
  );
}
