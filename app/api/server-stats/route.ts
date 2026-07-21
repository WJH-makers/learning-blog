import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DATA_FILE = "/tmp/monitor-history.json";

type Point = { t: number; cpu: number; mem: number; load: number };

const MAX_POINTS = 10080;
const MAX_FILE_SIZE = 512_000;

function loadHistory(): Point[] {
  try {
    if (!existsSync(DATA_FILE)) return [];
    const stat = readFileSync(DATA_FILE, "utf8");
    if (stat.length > MAX_FILE_SIZE) return [];
    const data: Point[] = JSON.parse(stat);
    const cutoff = Date.now() - 8 * 86400000;
    return data.filter(p => p.t > cutoff);
  } catch {
    try { writeFileSync(DATA_FILE, "[]"); } catch {}
    return [];
  }
}

function saveHistory(data: Point[]) {
  const trimmed = data.length > MAX_POINTS ? data.slice(-MAX_POINTS) : data;
  const json = JSON.stringify(trimmed);
  if (json.length > MAX_FILE_SIZE) {
    try { writeFileSync(DATA_FILE, JSON.stringify(trimmed.slice(-5000))); } catch {}
    return;
  }
  try { writeFileSync(DATA_FILE, json); } catch {}
}

function collect(): Point {
  let cpu = 0;
  let mem = { pct: 0 };
  let load = 0;
  try {
    const raw = execSync("top -bn1 -d0.3 | grep '%Cpu' | head -1", { encoding: "utf8", timeout: 6000 });
    const m = raw.match(/(\d+\.?\d*)\s*id/);
    cpu = m ? Math.round(100 - parseFloat(m[1])) : 0;
  } catch {}
  try {
    const mraw = execSync("free -m | grep Mem:", { encoding: "utf8", timeout: 3000 });
    const parts = mraw.trim().split(/\s+/);
    const total = parseInt(parts[1], 10);
    const used = parseInt(parts[2], 10);
    mem = { pct: total ? Math.round((used / total) * 100) : 0 };
  } catch {}
  try {
    load = parseFloat(execSync("cat /proc/loadavg", { encoding: "utf8", timeout: 3000 }).split(/\s+/)[0]);
  } catch {}
  return { t: Date.now(), cpu, mem: mem.pct, load };
}

function parseUptime() {
  try {
    const s = parseInt(execSync("cat /proc/uptime", { encoding: "utf8", timeout: 3000 }).split(" ")[0], 10);
    return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
  } catch { return "?"; }
}

function parseDisk() {
  try {
    return execSync("df -h / | tail -1 | awk '{print $3\"/\"$2\" (\"$5\")\"}'", { encoding: "utf8", timeout: 5000 }).trim();
  } catch { return "?"; }
}

function downsample(data: Point[], buckets: number): Point[] {
  if (data.length <= buckets * 2) return data;
  const step = Math.floor(data.length / buckets);
  const result: Point[] = [];
  for (let i = 0; i < data.length - 1; i += step) {
    const chunk = data.slice(i, Math.min(i + step, data.length));
    result.push({
      t: chunk[Math.floor(chunk.length / 2)].t,
      cpu: Math.round(chunk.reduce((s, p) => s + p.cpu, 0) / chunk.length),
      mem: Math.round(chunk.reduce((s, p) => s + p.mem, 0) / chunk.length),
      load: Math.round(chunk.reduce((s, p) => s + p.load, 0) / chunk.length * 10) / 10,
    });
  }
  return result;
}

export async function GET() {
  const now = Date.now();
  let history = loadHistory();

  const lastTs = history.length > 0 ? history[history.length - 1].t : 0;
  const gaps = Math.min(Math.floor((now - lastTs) / 60000), 60);
  if (gaps > 0 && lastTs > 0) {
    const latest = collect();
    for (let i = 1; i <= gaps; i++) {
      history.push({
        t: lastTs + i * 60000,
        cpu: latest.cpu,
        mem: latest.mem,
        load: latest.load,
      });
    }
  }

  const point = collect();
  history.push(point);
  if (history.length > 10080) history = history.slice(-10080);
  saveHistory(history);

  const dayAgo = now - 86400000;
  const weekAgo = now - 7 * 86400000;
  const lastDay = history.filter(p => p.t >= dayAgo);
  const lastWeek = history.filter(p => p.t >= weekAgo);

  return NextResponse.json({
    cpu: point.cpu,
    mem: point.mem,
    load: point.load,
    uptime: parseUptime(),
    disk: parseDisk(),
    day: downsample(lastDay, 48),
    week: downsample(lastWeek, 56),
  });
}
