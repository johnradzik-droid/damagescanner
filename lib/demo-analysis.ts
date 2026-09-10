import { createId } from "./ids";
import type { AnalyzeResponseBody, DamageFinding } from "./types";

const front: DamageFinding[] = [
  {
    id: createId(),
    type: "bumper_damage",
    severity: "moderate",
    location: "Front bumper cover, passenger side",
    description: "Scuffed bumper cover with a crease above the lower air inlet. Paint through to primer in a 4-inch patch.",
    confidence: 0.86,
    bbox: { x: 0.52, y: 0.58, w: 0.28, h: 0.18 },
  },
  {
    id: createId(),
    type: "paint_chip",
    severity: "minor",
    location: "Hood leading edge",
    description: "Multiple small stone chips along the hood edge. No rust bleed yet.",
    confidence: 0.78,
    bbox: { x: 0.28, y: 0.34, w: 0.44, h: 0.12 },
  },
];

const rear: DamageFinding[] = [
  {
    id: createId(),
    type: "scrape",
    severity: "moderate",
    location: "Rear bumper, driver side",
    description: "Parking scrape across the bumper cover with a torn lower valance lip.",
    confidence: 0.84,
    bbox: { x: 0.12, y: 0.6, w: 0.4, h: 0.2 },
  },
  {
    id: createId(),
    type: "dent",
    severity: "minor",
    location: "Tailgate / trunk lid, lower left",
    description: "Shallow round dent, roughly golf-ball size. Paint intact.",
    confidence: 0.71,
    bbox: { x: 0.22, y: 0.42, w: 0.16, h: 0.14 },
  },
];

const driver: DamageFinding[] = [
  {
    id: createId(),
    type: "scratch",
    severity: "minor",
    location: "Driver front door, mid-panel",
    description: "Thin key-style scratch ~8 inches. Likely polishable; does not catch a fingernail deeply.",
    confidence: 0.74,
    bbox: { x: 0.34, y: 0.4, w: 0.3, h: 0.1 },
  },
  {
    id: createId(),
    type: "dent",
    severity: "moderate",
    location: "Driver rear door, above body line",
    description: "Door ding with a small paint chip at the center. Typical lot damage.",
    confidence: 0.81,
    bbox: { x: 0.58, y: 0.38, w: 0.14, h: 0.12 },
  },
];

const fl: DamageFinding[] = [
  {
    id: createId(),
    type: "scrape",
    severity: "moderate",
    location: "Driver front fender and bumper corner",
    description: "Cladding scrape wrapping the corner. Bumper misaligned ~1/4 inch at the fender seam.",
    confidence: 0.8,
    bbox: { x: 0.18, y: 0.46, w: 0.36, h: 0.24 },
  },
];

const fr: DamageFinding[] = [
  {
    id: createId(),
    type: "paint_chip",
    severity: "minor",
    location: "Passenger front fender flare",
    description: "Two chips on the flare lip. Primer showing, no rust.",
    confidence: 0.69,
    bbox: { x: 0.48, y: 0.5, w: 0.18, h: 0.14 },
  },
];

const rl: DamageFinding[] = [
  {
    id: createId(),
    type: "dent",
    severity: "severe",
    location: "Driver rear quarter panel",
    description: "Deep crease in the quarter ahead of the lamp. Paint cracked; possible inner-structure check needed.",
    confidence: 0.88,
    bbox: { x: 0.3, y: 0.36, w: 0.34, h: 0.28 },
  },
];

const rr: DamageFinding[] = [
  {
    id: createId(),
    type: "rust",
    severity: "minor",
    location: "Passenger rear wheel arch lip",
    description: "Surface rust starting on the arch lip. Early, still cosmetic.",
    confidence: 0.66,
    bbox: { x: 0.42, y: 0.55, w: 0.22, h: 0.16 },
  },
];

const hood: DamageFinding[] = [
  {
    id: createId(),
    type: "hail",
    severity: "moderate",
    location: "Hood and roof, center",
    description: "Dense dime-size dings consistent with hail. Count is high on the hood; roof shows a lighter pattern.",
    confidence: 0.83,
    bbox: { x: 0.22, y: 0.18, w: 0.56, h: 0.48 },
  },
];

const wheels: DamageFinding[] = [
  {
    id: createId(),
    type: "tire_damage",
    severity: "moderate",
    location: "Left-front tire, outer shoulder",
    description: "Outer shoulder wear with a small sidewall scuff. Recommend measuring tread depth on all four.",
    confidence: 0.77,
    bbox: { x: 0.18, y: 0.28, w: 0.64, h: 0.5 },
  },
  {
    id: createId(),
    type: "other",
    severity: "minor",
    location: "Left-front alloy rim",
    description: "Curb rash on the outer lip, approximately 3 inches. Cosmetic.",
    confidence: 0.82,
    bbox: { x: 0.28, y: 0.12, w: 0.4, h: 0.16 },
  },
];

const glass: DamageFinding[] = [
  {
    id: createId(),
    type: "cracked_glass",
    severity: "minor",
    location: "Windshield, passenger-side lower",
    description: "Star chip ~1/2 inch with a short leg. Repair candidate if it has not spread.",
    confidence: 0.9,
    bbox: { x: 0.58, y: 0.62, w: 0.14, h: 0.12 },
  },
];

const interior: DamageFinding[] = [
  {
    id: createId(),
    type: "other",
    severity: "minor",
    location: "Driver seat outboard bolster",
    description: "Bolster wear with light cracking in the finish. Typical for mileage. No tears in the insert.",
    confidence: 0.73,
    bbox: { x: 0.12, y: 0.4, w: 0.3, h: 0.28 },
  },
];

const byAngle: Record<string, { overview: string; findings: DamageFinding[] }> = {
  front: {
    overview: "Front clip shows bumper cover damage and hood-edge chips; headlights look intact.",
    findings: front,
  },
  rear: {
    overview: "Rear bumper has a parking scrape; small dent on the tailgate/trunk.",
    findings: rear,
  },
  driver: {
    overview: "Driver side has a light scratch and a moderate door ding — typical lot wear.",
    findings: driver,
  },
  passenger: {
    overview: "Passenger side presents clean in this sample; no obvious panel damage.",
    findings: [],
  },
  front_left: {
    overview: "Driver-front corner scrape with a slight bumper misalignment at the fender.",
    findings: fl,
  },
  front_right: {
    overview: "Passenger-front corner is mostly clean aside from flare chips.",
    findings: fr,
  },
  rear_left: {
    overview: "Driver-rear quarter has a severe crease — flag for recon / wholesale grade.",
    findings: rl,
  },
  rear_right: {
    overview: "Passenger-rear arch shows early surface rust.",
    findings: rr,
  },
  roof_hood: {
    overview: "Hood and roof show a hail-like ding pattern.",
    findings: hood,
  },
  wheels: {
    overview: "LF tire shoulder wear plus cosmetic rim rash.",
    findings: wheels,
  },
  glass: {
    overview: "Windshield has a repairable star chip on the passenger side.",
    findings: glass,
  },
  interior: {
    overview: "Cabin is retail-presentable with driver bolster wear only.",
    findings: interior,
  },
};

function extraFindings(label: string): { overview: string; findings: DamageFinding[] } {
  return {
    overview: `Sample close-up notes for “${label}”.`,
    findings: [
      {
        id: createId(),
        type: "scratch",
        severity: "minor",
        location: label || "Extra photo",
        description: "Light surface scratch visible in this extra shot. Confirm if it is through the clear coat.",
        confidence: 0.64,
        bbox: { x: 0.3, y: 0.3, w: 0.4, h: 0.22 },
      },
    ],
  };
}

function cloneFindings(findings: DamageFinding[]): DamageFinding[] {
  return findings.map((finding) => ({ ...finding, id: createId(), bbox: finding.bbox ? { ...finding.bbox } : undefined }));
}

export function demoAnalysisFor(angleId: string, label: string): AnalyzeResponseBody {
  const sample = byAngle[angleId] ?? extraFindings(label);
  return {
    mode: "demo",
    overview: sample.overview,
    findings: cloneFindings(sample.findings),
  };
}
