"use client";

import { useEffect, useState } from "react";
import SparkLine from "./SparkLine";

interface Srv {
  cpu: number;
  mem: { total: number; used: number; pct: number };
  load: number;
  uptime: string;
  disk: string;
  spark: { t: number; cpu: number; mem: number }[];
}

export default function MonitorView({ initial }: { initial: Srv | null }) {
  const [srv, setSrv] = useState<Srv | null>(initial);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const r = await fetch("/api/server-stats");
        if (r.ok) setSrv(await r.json());
      } catch {}
    }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {srv && (
        <>
          <div className="section-head" style={{ marginTop: 12 }}>
            <div>
              <p className="eyebrow">Server</p>
              <h2>服务器资源</h2>
            </div>
            <span className="muted">运行 {srv.uptime}</span>
          </div>
          <section className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div><strong>{srv.cpu}%</strong><span>CPU</span></div>
            <div><strong>{srv.mem.pct}%</strong><span>内存 ({srv.mem.used}/{srv.mem.total}MB)</span></div>
            <div><strong>{srv.load.toFixed(1)}</strong><span>负载</span></div>
            <div><strong>{srv.disk}</strong><span>磁盘</span></div>
          </section>
          <SparkLine data={srv.spark} />
        </>
      )}
    </>
  );
}
