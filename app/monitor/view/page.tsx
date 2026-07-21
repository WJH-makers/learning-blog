import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MonitorViewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("monitor_token")?.value;

  if (!token) {
    redirect("/monitor");
  }

  return (
    <div style={{ position: "fixed", inset: 0, border: 0, margin: 0, padding: 0 }}>
      <iframe
        src="/api/monitor-proxy"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Netdata Monitor"
      />
    </div>
  );
}
