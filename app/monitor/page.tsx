import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CfStats {
  today: { requests: string; bandwidth: string; views: string; threats: number; uniques: number };
  week: { requests: string; bandwidth: string; threats: number };
}

async function getStats(): Promise<CfStats | null> {
  try {
    const base = process.env.NODE_ENV === "production" ? "http://127.0.0.1:3001" : "";
    const res = await fetch(`${base}/api/cf-stats`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function MonitorPage() {
  const stats = await getStats();

  return (
    <div className="page-shell narrow">
      <section className="hero monitor-hero">
        <div>
          <p className="eyebrow">Monitor Dashboard</p>
          <h1 className="profile-name">监控室</h1>
          <p className="hero-text" style={{ fontSize: "0.95rem", opacity: 0.7 }}>
            服务器实时状态 · 流量分析
          </p>
        </div>
      </section>

      <div className="section-head" style={{ marginTop: 12 }}>
        <div>
          <p className="eyebrow">Traffic</p>
          <h2>网站流量</h2>
        </div>
        <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="button">Cloudflare →</a>
      </div>

      {stats ? (
        <>
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
      ) : (
        <div className="empty-state">
          <p className="eyebrow">No Data</p>
          <h3>流量统计加载中...</h3>
        </div>
      )}

      <div className="section-head" style={{ marginTop: 32 }}>
        <div>
          <p className="eyebrow">Realtime</p>
          <h2>系统监控</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
