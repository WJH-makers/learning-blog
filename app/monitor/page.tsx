import MonitorView from "./View";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CfStats {
  today: { requests: string; bandwidth: string; views: string; threats: number; uniques: number };
  week: { requests: string; bandwidth: string; threats: number };
}

interface Point { t: number; cpu: number; mem: number; load: number }
interface Srv {
  cpu: number;
  mem: number;
  load: number;
  uptime: string;
  disk: string;
  day: Point[];
  week: Point[];
}

async function getStats<T>(path: string): Promise<T | null> {
  try {
    const base = process.env.NODE_ENV === "production" ? "http://127.0.0.1:3001" : "http://localhost:3000";
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function MonitorPage() {
  const stats = await getStats<CfStats>("/api/cf-stats");
  const srv = await getStats<Srv>("/api/server-stats");

  return (
    <div className="page-shell narrow">
      <section className="hero monitor-hero">
        <div>
          <p className="eyebrow">Monitor Dashboard</p>
          <h1 className="profile-name">监控室</h1>
        </div>
      </section>

      <MonitorView initial={srv} />

      {stats && (
        <>
          <div className="section-head" style={{ marginTop: 20 }}>
            <div>
              <p className="eyebrow">Traffic</p>
              <h2>网站流量</h2>
            </div>
            <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="button">Cloudflare →</a>
          </div>
          <section className="stats-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            <div><strong>{stats.today.requests}</strong><span>今日请求</span></div>
            <div><strong>{stats.today.bandwidth}B</strong><span>今日流量</span></div>
            <div><strong>{stats.today.views}</strong><span>页面浏览</span></div>
            <div><strong>{stats.today.uniques}</strong><span>独立访客</span></div>
            <div><strong>{stats.today.threats}</strong><span>威胁拦截</span></div>
          </section>
          <section className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 0, borderTop: 0 }}>
            <div style={{ opacity: 0.7 }}><strong>{stats.week.requests}</strong><span>7天请求</span></div>
            <div style={{ opacity: 0.7 }}><strong>{stats.week.bandwidth}B</strong><span>7天流量</span></div>
            <div style={{ opacity: 0.7 }}><strong>{stats.week.threats}</strong><span>7天拦截</span></div>
          </section>
        </>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <a href="https://monitor.wwjjhh.online" target="_blank" rel="noreferrer" className="button primary">
          Netdata 系统大盘
        </a>
        <a href="https://status.wwjjhh.online" target="_blank" rel="noreferrer" className="button">
          Uptime Kuma 在线状态
        </a>
      </div>
    </div>
  );
}
