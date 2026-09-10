import { DAMAGE_TYPE_LABEL } from "./findings";
import type { DamageFinding, Inspection, Severity } from "./types";

export interface SeverityCounts {
  minor: number;
  moderate: number;
  severe: number;
  total: number;
}

export function allFindings(inspection: Inspection): DamageFinding[] {
  return inspection.photos.flatMap((photo) =>
    photo.skipped || !photo.imageDataUrl ? [] : photo.findings,
  );
}

export function countSeverities(findings: DamageFinding[]): SeverityCounts {
  const counts: SeverityCounts = { minor: 0, moderate: 0, severe: 0, total: 0 };
  for (const finding of findings) {
    counts[finding.severity] += 1;
    counts.total += 1;
  }
  return counts;
}

export function highestSeverity(findings: DamageFinding[]): Severity | null {
  if (findings.some((f) => f.severity === "severe")) return "severe";
  if (findings.some((f) => f.severity === "moderate")) return "moderate";
  if (findings.length) return "minor";
  return null;
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatOdometer(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return value;
  return `${Number(digits).toLocaleString()} mi`;
}

export function findingLine(finding: DamageFinding): string {
  return `${DAMAGE_TYPE_LABEL[finding.type]} · ${finding.severity} · ${finding.location}`;
}

export function fileStamp(inspection: Inspection): string {
  const stock = inspection.vehicle.stockOrRo.replace(/[^\w-]+/g, "") || inspection.id.slice(0, 8);
  const day = inspection.createdAt.slice(0, 10);
  return `${stock}-${day}`;
}

export function inspectionToJson(inspection: Inspection): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: "Susquehanna CDJR Damage Scanner",
      mode: inspection.lastMode ?? "demo",
      inspection,
    },
    null,
    2,
  );
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
