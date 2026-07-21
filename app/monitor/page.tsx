import ServerCards from "./ServerCards";
import TraficCharts from "./TraficCharts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Point { t: number; cpu: number; mem: number; load: number }
interface Srv { cpu: number; mem: number; load: number; uptime: string; disk: string; day: Point[]; week: Point[] }

interface CfDay { t: string; requests: number; views: number; threats: number; bytes: number; uniques: number }
interface CfStats {
  today: { requests: string; bandwidth: string; views: string; threats: number; uniques: number };
  week_chart: CfDay[];
  month_chart: { t: string; requests: number; threats: number }[];
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const base = process.env.NODE_ENV === "production" ? "http://127.0.0.1:3001" : "http://localhost:3000";
    const r = await fetch(`${base}${path}`, { cache: "no-store" });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

export default async function MonitorPage() {
  const [srv, cf] = await Promise.all([get<Srv>("/api/server-stats"), get<CfStats>("/api/cf-stats")]);

  return (
    <>
      <style>{`
        :root { --card-bg: #1a1a2e; --card-border: #2a2a4a; --text-dim: #8892b0; --text-bright: #ccd6f6; --accent-green: #2ecc71; --accent-red: #e74c3c; --accent-blue: #3498db; --accent-yellow: #f1c40f; }
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 12px 0; }
        .dash-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 16px 18px; }
        .dash-card .label { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .dash-card .value { font-size: 1.6rem; font-weight: 700; color: var(--text-bright); font-variant-numeric: tabular-nums; }
        .dash-card .sub { font-size: 0.7rem; color: var(--text-dim); margin-top: 4px; }
        .dash-section { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 8px; }
        .dash-section h2 { font-size: 1rem; font-weight: 600; color: var(--text-bright); }
        .dash-section .muted { font-size: 0.72rem; color: var(--text-dim); }
        .chart-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 8px; }
        .chart-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 14px 16px 10px; }
        .chart-card .chart-label { font-size: 0.68rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .chart-card svg { width: 100%; }
        @media (max-width: 600px) { .dash-grid { grid-template-columns: repeat(2, 1fr); } .dash-card .value { font-size: 1.3rem; } }
      `}</style>
      <div className="page-shell" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 16px 40px" }}>
        <div className="dash-section" style={{ marginTop: 0 }}>
          <div>
            <h2>监控室</h2>
            {srv && <span className="muted">运行 {srv.uptime} · CPU {srv.cpu}% · MEM {srv.mem}% · Load {srv.load.toFixed(1)}</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="https://monitor.wwjjhh.online" target="_blank" rel="noreferrer" className="button" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>Netdata</a>
            <a href="https://status.wwjjhh.online" target="_blank" rel="noreferrer" className="button" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>Kuma</a>
          </div>
        </div>

        {srv && <ServerCards srv={srv} />}

        {cf && <TraficCharts week={cf.week_chart} month={cf.month_chart} today={cf.today} />}
      </div>
    </>
  );
}
