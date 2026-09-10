import { hasLiveKey } from "@/lib/analyze";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    { mode: hasLiveKey() ? "live" : "demo" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
