import { STANDARD_ANGLES } from "./angles";
import { createId } from "./ids";
import { emptyVehicle } from "./findings";
import type { Inspection, PhotoRecord, VehicleMeta } from "./types";

const LAST_INSPECTOR_KEY = "lotscan:last-inspector";

export function readLastInspector(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LAST_INSPECTOR_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastInspector(name: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = name.trim();
    if (trimmed) window.localStorage.setItem(LAST_INSPECTOR_KEY, trimmed);
  } catch {
    /* ignore quota */
  }
}

export function blankPhoto(angleId: string, label: string, hint?: string): PhotoRecord {
  return {
    id: createId(),
    angleId,
    label,
    hint,
    skipped: false,
    imageDataUrl: null,
    findings: [],
  };
}

export function createBlankInspection(partial?: Partial<VehicleMeta>): Inspection {
  const now = new Date().toISOString();
  return {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    status: "draft",
    vehicle: { ...emptyVehicle(), inspectorName: readLastInspector(), ...partial },
    photos: STANDARD_ANGLES.map((angle) => blankPhoto(angle.id, angle.label, angle.hint)),
    inspectorNotes: "",
  };
}

export function vehicleTitle(vehicle: VehicleMeta): string {
  const ymm = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  if (ymm) return ymm;
  if (vehicle.vin) return vehicle.vin;
  if (vehicle.stockOrRo) return `Stock ${vehicle.stockOrRo}`;
  return "Untitled vehicle";
}

export function photoReadyCount(photos: PhotoRecord[]): { captured: number; skipped: number; pending: number } {
  let captured = 0;
  let skipped = 0;
  let pending = 0;
  for (const photo of photos) {
    if (photo.imageDataUrl) captured += 1;
    else if (photo.skipped) skipped += 1;
    else pending += 1;
  }
  return { captured, skipped, pending };
}

export function photosToAnalyze(photos: PhotoRecord[]): PhotoRecord[] {
  return photos.filter((photo) => Boolean(photo.imageDataUrl) && !photo.skipped);
}
