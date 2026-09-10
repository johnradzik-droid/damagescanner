import type {
  BoundingBox,
  DamageFinding,
  DamageType,
  Severity,
} from "./types";
import { createId } from "./ids";

const DAMAGE_TYPES: DamageType[] = [
  "dent",
  "scratch",
  "scrape",
  "rust",
  "paint_chip",
  "cracked_glass",
  "missing_part",
  "tire_damage",
  "bumper_damage",
  "hail",
  "other",
];

const SEVERITIES: Severity[] = ["minor", "moderate", "severe"];

export const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  dent: "Dent",
  scratch: "Scratch",
  scrape: "Scrape",
  rust: "Rust",
  paint_chip: "Paint chip",
  cracked_glass: "Cracked glass",
  missing_part: "Missing part",
  tire_damage: "Tire damage",
  bumper_damage: "Bumper damage",
  hail: "Hail-like mark",
  other: "Other",
};

export function isDamageType(value: string): value is DamageType {
  return DAMAGE_TYPES.includes(value as DamageType);
}

export function isSeverity(value: string): value is Severity {
  return SEVERITIES.includes(value as Severity);
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeBbox(raw: unknown): BoundingBox | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const box = raw as Record<string, unknown>;
  const x = clamp01(asNumber(box.x));
  const y = clamp01(asNumber(box.y));
  const w = clamp01(asNumber(box.w, asNumber(box.width)));
  const h = clamp01(asNumber(box.h, asNumber(box.height)));
  if (w < 0.02 || h < 0.02) return undefined;
  return {
    x,
    y,
    w: Math.min(w, 1 - x),
    h: Math.min(h, 1 - y),
  };
}

export function normalizeFindings(raw: unknown): DamageFinding[] {
  if (!Array.isArray(raw)) return [];
  const findings: DamageFinding[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const typeRaw = String(row.type ?? row.damageType ?? "other")
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const type: DamageType = isDamageType(typeRaw)
      ? typeRaw
      : typeRaw.includes("hail")
        ? "hail"
        : typeRaw.includes("chip")
          ? "paint_chip"
          : typeRaw.includes("glass") || typeRaw.includes("windshield")
            ? "cracked_glass"
            : typeRaw.includes("tire") || typeRaw.includes("wheel")
              ? "tire_damage"
              : typeRaw.includes("bumper")
                ? "bumper_damage"
                : "other";
    const sevRaw = String(row.severity ?? "minor").toLowerCase();
    const severity: Severity = isSeverity(sevRaw)
      ? sevRaw
      : sevRaw.includes("sev")
        ? "severe"
        : sevRaw.includes("mod")
          ? "moderate"
          : "minor";
    let confidence = asNumber(row.confidence, 0.5);
    if (confidence > 1) confidence = confidence / 100;
    findings.push({
      id: typeof row.id === "string" && row.id ? row.id : createId(),
      type,
      severity,
      location: String(row.location ?? "Unspecified").slice(0, 120),
      description: String(row.description ?? row.notes ?? "").slice(0, 400),
      confidence: Math.round(clamp01(confidence) * 100) / 100,
      bbox: normalizeBbox(row.bbox ?? row.box),
    });
  }
  return findings;
}

export function emptyVehicle() {
  return {
    vin: "",
    year: "",
    make: "",
    model: "",
    stockOrRo: "",
    odometer: "",
    inspectorName: "",
  };
}
