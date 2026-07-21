import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const NETDATA = "http://127.0.0.1:19999";

export async function GET(_req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("monitor_token")?.value;
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const qs = new URL(_req.url).search;
  const resp = await fetch(`${NETDATA}/${qs}`, {
    headers: { Authorization: `Basic ${token}` },
  });

  return new NextResponse(await resp.arrayBuffer(), {
    status: resp.status,
    headers: { "Content-Type": "text/html", "Cache-Control": "no-store" },
  });
}
