import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const NETDATA_URL = process.env.NETDATA_URL ?? "http://127.0.0.1:19999";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("monitor_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/monitor", process.env.NEXT_PUBLIC_SITE_URL ?? "https://wwjjhh.online"));
  }

  const resp = await fetch(NETDATA_URL, {
    headers: { Authorization: `Basic ${token}` },
  });

  const body = await resp.text();
  const newHeaders = new Headers();
  newHeaders.set("Content-Type", resp.headers.get("Content-Type") ?? "text/html");
  newHeaders.set("Cache-Control", "no-store");

  return new NextResponse(body, { status: resp.status, headers: newHeaders });
}
