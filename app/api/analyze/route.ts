import { analyzePhoto, hasLiveKey } from "@/lib/analyze";
import type { AnalyzeRequestBody } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function isDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/") && value.length < 6_000_000;
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody;
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isDataUrl(body.imageDataUrl)) {
    return Response.json({ error: "image_required" }, { status: 400 });
  }

  try {
    const result = await analyzePhoto({
      imageDataUrl: body.imageDataUrl,
      angleId: String(body.angleId ?? "extra"),
      angleLabel: String(body.angleLabel ?? "Photo"),
      vehicle: body.vehicle ?? {
        vin: "",
        year: "",
        make: "",
        model: "",
        stockOrRo: "",
        odometer: "",
        inspectorName: "",
      },
    });
    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("analyze failed", message);
    return Response.json(
      { error: "openai_failed", message, mode: hasLiveKey() ? "live" : "demo" },
      { status: 502 },
    );
  }
}
