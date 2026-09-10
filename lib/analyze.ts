import OpenAI from "openai";
import { demoAnalysisFor } from "@/lib/demo-analysis";
import { normalizeFindings } from "@/lib/findings";
import { createId } from "@/lib/ids";
import type { AnalyzeRequestBody, AnalyzeResponseBody, VehicleMeta } from "@/lib/types";

export function hasLiveKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function vehicleLine(vehicle: VehicleMeta): string {
  const ymm = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  const bits = [
    ymm || null,
    vehicle.vin ? `VIN ${vehicle.vin}` : null,
    vehicle.odometer ? `${vehicle.odometer} miles` : null,
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : "Vehicle details not provided";
}

const SYSTEM_PROMPT = `You are a professional automotive condition inspector for Susquehanna Chrysler Dodge Jeep Ram. You review wholesale and retail lot photos and produce structured damage notes a recon manager can act on.

Detect: dents, scratches, scrapes, rust, paint chips, cracked or starred glass, missing parts, tire and wheel damage, bumper damage, hail-like dings, misaligned panels, and interior wear when visible.

Rules:
- Do not invent damage. If the panel looks clean, return an empty findings array.
- Ignore glare, reflections, water spots, and background objects that are not vehicle damage.
- Severity: minor = cosmetic / PDR or polish; moderate = repair or replace likely; severe = structural, large crease, safety glass, or tire that should not go retail as-is.
- bbox is normalized 0-1 (x, y, w, h) relative to the image, tight around the damage.
- confidence is 0-1.

Return JSON only with this shape:
{
  "overview": "one sentence about this photo",
  "findings": [
    {
      "type": "dent|scratch|scrape|rust|paint_chip|cracked_glass|missing_part|tire_damage|bumper_damage|hail|other",
      "severity": "minor|moderate|severe",
      "location": "short location on the vehicle",
      "description": "inspector-style note",
      "confidence": 0.0,
      "bbox": { "x": 0.0, "y": 0.0, "w": 0.0, "h": 0.0 }
    }
  ]
}`;

export async function analyzePhoto(body: AnalyzeRequestBody): Promise<AnalyzeResponseBody> {
  if (!hasLiveKey()) {
    return demoAnalysisFor(body.angleId, body.angleLabel);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const userText = [
    `Photo angle: ${body.angleLabel} (${body.angleId}).`,
    `Vehicle: ${vehicleLine(body.vehicle)}.`,
    "List every distinct damage area you can see in this photo.",
  ].join(" ");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1800,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          {
            type: "image_url",
            image_url: { url: body.imageDataUrl, detail: "high" },
          },
        ],
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: { overview?: unknown; findings?: unknown };
  try {
    parsed = JSON.parse(raw) as { overview?: unknown; findings?: unknown };
  } catch {
    throw new Error("Vision model returned invalid JSON");
  }

  const findings = normalizeFindings(parsed.findings).map((finding) => ({
    ...finding,
    id: finding.id || createId(),
  }));

  return {
    mode: "live",
    overview: String(parsed.overview ?? "").slice(0, 400),
    findings,
  };
}
