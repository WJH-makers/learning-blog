import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Point = { t: number; cpu: number; mem: number };

const history: Point[] = [];
const MAX = 20;

function parseMem() {
  try {
    const raw = execSync("free -m | grep Mem:", { encoding: "utf8", timeout: 3000 });
    const parts = raw.trim().split(/\s+/);
    const total = parseInt(parts[1], 10);
    const used = parseInt(parts[2], 10);
    return { total, used, pct: total ? Math.round((used / total) * 100) : 0 };
  } catch {
    return { total: 0, used: 0, pct: 0 };
  }
}

function parseCpu() {
  try {
    const raw = execSync("top -bn1 -d0.3 | grep '%Cpu' | head -1", { encoding: "utf8", timeout: 6000 });
    const m = raw.match(/(\d+\.?\d*)\s*id/);
    return m ? Math.round(100 - parseFloat(m[1])) : 0;
  } catch { return 0; }
}

function parseLoad() {
  try {
    return parseFloat(execSync("cat /proc/loadavg", { encoding: "utf8", timeout: 3000 }).split(/\s+/)[0]);
  } catch { return 0; }
}

function parseUptime() {
  try {
    const s = parseInt(execSync("cat /proc/uptime", { encoding: "utf8", timeout: 3000 }).split(" ")[0], 10);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  } catch { return "?"; }
}

function parseDisk() {
  try {
    return execSync("df -h / | tail -1 | awk '{print $3\"/\"$2\" (\"$5\")\"}'", { encoding: "utf8", timeout: 5000 }).trim();
  } catch { return "?"; }
}

export async function GET() {
  const mem = parseMem();
  const cpu = parseCpu();
  const now = Date.now();

  history.push({ t: now, cpu, mem: mem.pct });
  if (history.length > MAX) history.shift();

  return NextResponse.json({
    cpu,
    mem,
    load: parseLoad(),
    uptime: parseUptime(),
    disk: parseDisk(),
    spark: history.map(h => ({ t: h.t, cpu: h.cpu, mem: h.mem })),
  });
}
