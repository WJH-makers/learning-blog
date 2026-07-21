import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseMeminfo(): { total: number; used: number; free: number; pct: number } {
  try {
    const raw = execSync("free -m | grep Mem:", { encoding: "utf8", timeout: 3000 });
    const parts = raw.trim().split(/\s+/);
    const total = parseInt(parts[1], 10);
    const used = parseInt(parts[2], 10);
    return { total, used, free: total - used, pct: total ? Math.round((used / total) * 100) : 0 };
  } catch {
    return { total: 0, used: 0, free: 0, pct: 0 };
  }
}

function parseCpu(): number {
  try {
    const raw = execSync("top -bn1 -d 0.5 | grep '%Cpu' | head -1", { encoding: "utf8", timeout: 6000 });
    const m = raw.match(/(\d+\.?\d*)\s*id/);
    return m ? Math.round(100 - parseFloat(m[1])) : 0;
  } catch {
    return 0;
  }
}

function parseLoadavg(): { load1: number; load5: number; load15: number } {
  try {
    const raw = execSync("cat /proc/loadavg", { encoding: "utf8", timeout: 3000 }).trim();
    const [l1, l5, l15] = raw.split(/\s+/).map(Number);
    return { load1: l1, load5: l5, load15: l15 };
  } catch {
    return { load1: 0, load5: 0, load15: 0 };
  }
}

function parseUptime(): string {
  try {
    const raw = execSync("cat /proc/uptime", { encoding: "utf8", timeout: 3000 });
    const secs = parseInt(raw.split(" ")[0], 10);
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  } catch {
    return "?";
  }
}

export async function GET() {
  const mem = parseMeminfo();
  const load = parseLoadavg();
  const uptime = parseUptime();
  const cpuPct = parseCpu();

  const disk = execSync("df -h / | tail -1 | awk '{print $3\"/\"$2\" (\"$5\")\"}'", { encoding: "utf8", timeout: 5000 }).trim();

  return NextResponse.json({
    cpu: Math.round(cpuPct),
    mem,
    load,
    uptime,
    disk,
  });
}
