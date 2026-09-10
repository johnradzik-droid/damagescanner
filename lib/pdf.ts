import { jsPDF } from "jspdf";
import { DAMAGE_TYPE_LABEL } from "./findings";
import { vehicleTitle } from "./inspection";
import { allFindings, countSeverities, fileStamp, formatOdometer, formatWhen } from "./report-utils";
import type { Inspection } from "./types";

const MARGIN = 48;
const PAGE_W = 612;
const PAGE_H = 792;
const CONTENT = PAGE_W - MARGIN * 2;

function wrap(doc: jsPDF, text: string, width: number): string[] {
  return doc.splitTextToSize(text, width) as string[];
}

export async function downloadPdfReport(inspection: Inspection): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const findings = allFindings(inspection);
  const counts = countSeverities(findings);
  const mode = inspection.lastMode ?? "demo";
  let y = MARGIN;

  const addPageIfNeeded = (need: number) => {
    if (y + need < PAGE_H - MARGIN) return;
    doc.addPage();
    y = MARGIN;
  };

  doc.setFillColor(12, 12, 12);
  doc.rect(0, 0, PAGE_W, 92, "F");
  doc.setFillColor(255, 225, 74);
  doc.rect(0, 92, PAGE_W, 6, "F");
  doc.setTextColor(255, 225, 74);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SUSQUEHANNA CDJR", MARGIN, 36);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Vehicle damage report", MARGIN, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text(`${mode === "demo" ? "DEMO sample analysis" : "LIVE GPT-4o analysis"}  ·  ${formatWhen(inspection.updatedAt)}`, MARGIN, 80);

  y = 128;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(vehicleTitle(inspection.vehicle), MARGIN, y);
  y += 22;

  const meta: string[] = [];
  if (inspection.vehicle.vin) meta.push(`VIN ${inspection.vehicle.vin}`);
  if (inspection.vehicle.stockOrRo) meta.push(`Stock/RO ${inspection.vehicle.stockOrRo}`);
  if (inspection.vehicle.odometer) meta.push(formatOdometer(inspection.vehicle.odometer));
  if (inspection.vehicle.inspectorName) meta.push(`Inspector ${inspection.vehicle.inspectorName}`);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  if (meta.length) {
    for (const line of wrap(doc, meta.join("   ·   "), CONTENT)) {
      doc.text(line, MARGIN, y);
      y += 16;
    }
  }

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Severity summary", MARGIN, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    findings.length
      ? `${counts.severe} severe   ·   ${counts.moderate} moderate   ·   ${counts.minor} minor   ·   ${counts.total} total`
      : "No damage findings recorded.",
    MARGIN,
    y,
  );
  y += 28;

  if (inspection.inspectorNotes.trim()) {
    doc.setFont("helvetica", "bold");
    doc.text("Inspector notes", MARGIN, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    for (const line of wrap(doc, inspection.inspectorNotes.trim(), CONTENT)) {
      addPageIfNeeded(18);
      doc.text(line, MARGIN, y);
      y += 15;
    }
    y += 12;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  addPageIfNeeded(24);
  doc.text("Findings", MARGIN, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (!findings.length) {
    doc.text("No findings.", MARGIN, y);
    y += 18;
  } else {
    for (const photo of inspection.photos) {
      if (!photo.findings.length) continue;
      addPageIfNeeded(36);
      doc.setFont("helvetica", "bold");
      doc.text(photo.label, MARGIN, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      for (const finding of photo.findings) {
        const head = `${DAMAGE_TYPE_LABEL[finding.type]} (${finding.severity}) — ${finding.location}`;
        const block = wrap(doc, head, CONTENT);
        const desc = wrap(doc, `${finding.description}  (${Math.round(finding.confidence * 100)}% confidence)`, CONTENT);
        addPageIfNeeded(16 * (block.length + desc.length) + 10);
        for (const line of block) {
          doc.text(line, MARGIN, y);
          y += 13;
        }
        doc.setTextColor(80, 80, 80);
        for (const line of desc) {
          doc.text(line, MARGIN, y);
          y += 13;
        }
        doc.setTextColor(20, 20, 20);
        y += 8;
      }
    }
  }

  for (const photo of inspection.photos) {
    if (!photo.imageDataUrl) continue;
    doc.addPage();
    y = MARGIN;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(photo.label, MARGIN, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (photo.overview) {
      for (const line of wrap(doc, photo.overview, CONTENT)) {
        doc.text(line, MARGIN, y);
        y += 13;
      }
    }
    y += 8;
    try {
      const maxW = CONTENT;
      const maxH = PAGE_H - y - MARGIN;
      doc.addImage(photo.imageDataUrl, "JPEG", MARGIN, y, maxW, Math.min(maxH, maxW * 0.72), undefined, "FAST");
    } catch {
      doc.text("(Photo could not be embedded.)", MARGIN, y);
    }
  }

  doc.save(`damage-report-${fileStamp(inspection)}.pdf`);
}
