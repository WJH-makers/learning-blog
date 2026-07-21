import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const NETDATA = process.env.NETDATA_URL ?? "http://127.0.0.1:19999";

function contentType(path: string): string {
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".woff2")) return "font/woff2";
  return "text/html";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("monitor_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/monitor", process.env.NEXT_PUBLIC_SITE_URL ?? "https://wwjjhh.online"));
  }

  const { path } = await params;
  const qs = new URL(_req.url).search;
  const target = path.length > 0
    ? `${NETDATA}/${path.join("/")}${qs}`
    : `${NETDATA}/${qs}`;

  const resp = await fetch(target, {
    headers: { Authorization: `Basic ${token}` },
  });

  const body = await resp.arrayBuffer();
  const headers = new Headers();
  headers.set("Content-Type", contentType(path[path.length - 1] ?? ""));
  headers.set("Cache-Control", "no-store");

  return new NextResponse(body, { status: resp.status, headers });
}
