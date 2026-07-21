"use client";

import { useEffect, useState } from "react";
import SparkLines from "./SparkLine";

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

export default function MonitorView({ initial }: { initial: Srv | null }) {
  const [srv, setSrv] = useState<Srv | null>(initial);

  useEffect(() => {
    let running = true;
    async function poll() {
      while (running) {
        try {
          const r = await fetch("/api/server-stats");
          if (r.ok && running) setSrv(await r.json());
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }
    poll();
    return () => { running = false; };
  }, []);

  if (!srv) return null;

  return (
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
        <div><strong>{srv.mem}%</strong><span>内存</span></div>
        <div><strong>{srv.load.toFixed(1)}</strong><span>负载</span></div>
        <div><strong>{srv.disk}</strong><span>磁盘</span></div>
      </section>
      <SparkLines day={srv.day} week={srv.week} />
    </>
  );
}
