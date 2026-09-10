export type Severity = "minor" | "moderate" | "severe";

export type DamageType =
  | "dent"
  | "scratch"
  | "scrape"
  | "rust"
  | "paint_chip"
  | "cracked_glass"
  | "missing_part"
  | "tire_damage"
  | "bumper_damage"
  | "hail"
  | "other";

export type AnalysisMode = "demo" | "live";

export type InspectionStatus = "draft" | "ready" | "analyzed";

export interface BoundingBox {
  /** Normalized 0–1 relative to image width/height. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DamageFinding {
  id: string;
  type: DamageType;
  severity: Severity;
  location: string;
  description: string;
  confidence: number;
  bbox?: BoundingBox;
}

export interface VehicleMeta {
  vin: string;
  year: string;
  make: string;
  model: string;
  stockOrRo: string;
  odometer: string;
  inspectorName: string;
}

export interface PhotoRecord {
  id: string;
  angleId: string;
  label: string;
  hint?: string;
  skipped: boolean;
  imageDataUrl: string | null;
  capturedAt?: string;
  overview?: string;
  findings: DamageFinding[];
  analyzedAt?: string;
  analyzeError?: string;
}

export interface Inspection {
  id: string;
  createdAt: string;
  updatedAt: string;
  analyzedAt?: string;
  status: InspectionStatus;
  lastMode?: AnalysisMode;
  vehicle: VehicleMeta;
  photos: PhotoRecord[];
  inspectorNotes: string;
}

export interface AnalyzeRequestBody {
  imageDataUrl: string;
  angleId: string;
  angleLabel: string;
  vehicle: VehicleMeta;
}

export interface AnalyzeResponseBody {
  mode: AnalysisMode;
  overview: string;
  findings: DamageFinding[];
}
