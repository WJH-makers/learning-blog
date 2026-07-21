import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 300_000;

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export async function GET() {
  const token = process.env.CLOUDFLARE_TOKEN;
  const zone = process.env.CLOUDFLARE_ZONE_ID;

  if (!token || !zone) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const cached = CACHE.get("stats");
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastWeek = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{viewer{zones(filter:{zoneTag:"${zone}"}){httpRequests1dGroups(limit:1,filter:{date_geq:"${today}",date_leq:"${today}"}){sum{requests bytes pageViews threats}uniq{uniques}}}httpRequests1dGroups:httpRequests1dGroups(limit:7,filter:{date_geq:"${lastWeek}",date_leq:"${today}"}){sum{requests bytes threats}}}}`,
      }),
    });

    const json = await res.json();
    const groups = json?.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];
    const week = json?.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];

    const todayStats = groups[0]?.sum ?? {};
    const weekRequests = week.reduce((a: number, b: { sum: { requests: number } }) => a + (b.sum?.requests ?? 0), 0);
    const weekThreats = week.reduce((a: number, b: { sum: { threats: number } }) => a + (b.sum?.threats ?? 0), 0);
    const weekBytes = week.reduce((a: number, b: { sum: { bytes: number } }) => a + (b.sum?.bytes ?? 0), 0);

    const data = {
      today: {
        requests: fmt(todayStats.requests ?? 0),
        bandwidth: fmt(todayStats.bytes ?? 0),
        views: fmt(todayStats.pageViews ?? 0),
        threats: todayStats.threats ?? 0,
        uniques: groups[0]?.uniq?.uniques ?? 0,
      },
      week: {
        requests: fmt(weekRequests),
        bandwidth: fmt(weekBytes),
        threats: weekThreats,
      },
    };

    CACHE.set("stats", { data, ts: Date.now() });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
