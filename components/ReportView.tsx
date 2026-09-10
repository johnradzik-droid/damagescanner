"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PhotoAnnotator } from "@/components/PhotoAnnotator";
import { AppHeader, Button, Card, Pad, Screen, SeverityChip, TextArea } from "@/components/ui";
import { useAnalysisMode } from "@/components/mode";
import { useInspection } from "@/components/useInspection";
import { DAMAGE_TYPE_LABEL } from "@/lib/findings";
import { vehicleTitle } from "@/lib/inspection";
import { downloadPdfReport } from "@/lib/pdf";
import {
  allFindings,
  countSeverities,
  downloadBlob,
  fileStamp,
  formatOdometer,
  inspectionToJson,
} from "@/lib/report-utils";

export function ReportView({ id }: { id: string }) {
  const router = useRouter();
  const statusMode = useAnalysisMode();
  const { inspection, loading, missing, persist } = useInspection(id);
  const [exporting, setExporting] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);

  const findings = useMemo(() => (inspection ? allFindings(inspection) : []), [inspection]);
  const counts = countSeverities(findings);
  const mode = inspection?.lastMode ?? statusMode;

  async function saveNotes(value: string) {
    if (!inspection) return;
    setNotes(value);
    await persist({ ...inspection, inspectorNotes: value });
  }

  async function exportPdf() {
    if (!inspection) return;
    setExporting(true);
    try {
      await downloadPdfReport(inspection);
    } finally {
      setExporting(false);
    }
  }

  function exportJson() {
    if (!inspection) return;
    const blob = new Blob([inspectionToJson(inspection)], { type: "application/json" });
    downloadBlob(`damage-report-${fileStamp(inspection)}.json`, blob);
  }

  if (loading) {
    return (
      <Screen>
        <AppHeader backHref="/" title="Report" />
        <Pad>Loading…</Pad>
      </Screen>
    );
  }
  if (missing || !inspection) {
    return (
      <Screen>
        <AppHeader backHref="/" title="Not found" />
        <Pad>That inspection is not on this phone.</Pad>
      </Screen>
    );
  }

  const noteValue = notes ?? inspection.inspectorNotes;
  const failed = inspection.photos.filter((photo) => photo.analyzeError);
  const hasPhotos = inspection.photos.some((photo) => photo.imageDataUrl);

  return (
    <Screen>
      <AppHeader backHref={`/inspect/${id}/capture`} title="Damage report" />
      <Pad className="flex flex-col gap-5">
        {mode === "demo" ? (
          <Card className="border-gold bg-gold/15">
            <p className="text-sm font-black uppercase tracking-wider text-gold">Demo analysis</p>
            <p className="mt-1 text-sm leading-5">
              Sample findings are shown so you can use the full UI without an API key. They are not
              a read of these photos. Add <code className="text-gold">OPENAI_API_KEY</code> to{" "}
              <code className="text-gold">.env.local</code> for live GPT-4o vision.
            </p>
          </Card>
        ) : (
          <Card className="border-emerald-400/40">
            <p className="text-sm font-black uppercase tracking-wider text-emerald-300">Live GPT-4o</p>
            <p className="mt-1 text-sm text-muted">Photos were sent to OpenAI vision for this report.</p>
          </Card>
        )}

        <Card>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold">Vehicle</p>
          <h2 className="mt-1 text-2xl font-black">{vehicleTitle(inspection.vehicle)}</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {inspection.vehicle.vin ? <li>VIN {inspection.vehicle.vin}</li> : null}
            {inspection.vehicle.stockOrRo ? <li>Stock/RO {inspection.vehicle.stockOrRo}</li> : null}
            {inspection.vehicle.odometer ? <li>{formatOdometer(inspection.vehicle.odometer)}</li> : null}
            {inspection.vehicle.inspectorName ? <li>Inspector {inspection.vehicle.inspectorName}</li> : null}
          </ul>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <SummaryStat label="Severe" value={counts.severe} tone="severe" />
          <SummaryStat label="Moderate" value={counts.moderate} tone="moderate" />
          <SummaryStat label="Minor" value={counts.minor} tone="minor" />
        </div>
        <p className="text-center text-sm text-muted">{counts.total} findings across captured photos</p>

        {failed.length ? (
          <Card className="border-bad/40">
            <p className="font-bold text-bad">Some photos failed analysis</p>
            <ul className="mt-2 text-sm text-muted">
              {failed.map((photo) => (
                <li key={photo.id}>
                  {photo.label}: {photo.analyzeError}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {!hasPhotos ? (
          <Card>
            <p className="font-bold">No photos yet</p>
            <p className="mt-1 text-sm text-muted">Go back to the walkaround and capture at least one angle.</p>
          </Card>
        ) : null}

        {findings.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Summary list</h3>
            {findings.map((finding) => (
              <Card key={finding.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityChip severity={finding.severity} />
                  <span className="font-bold">{DAMAGE_TYPE_LABEL[finding.type]}</span>
                  <span className="text-sm text-muted">{Math.round(finding.confidence * 100)}%</span>
                </div>
                <p className="font-semibold">{finding.location}</p>
                <p className="text-sm leading-5 text-muted">{finding.description}</p>
              </Card>
            ))}
          </section>
        ) : hasPhotos && inspection.analyzedAt ? (
          <Card>
            <p className="font-bold">No damage called out</p>
            <p className="mt-1 text-sm text-muted">
              {mode === "demo"
                ? "This demo angle set includes a clean passenger side. Other angles still have sample hits."
                : "The model did not report damage on the captured photos."}
            </p>
          </Card>
        ) : null}

        <section className="flex flex-col gap-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Per-photo callouts</h3>
          {inspection.photos
            .filter((photo) => photo.imageDataUrl)
            .map((photo) => (
              <div key={photo.id} className="flex flex-col gap-3">
                <div>
                  <p className="text-lg font-black">{photo.label}</p>
                  {photo.overview ? <p className="text-sm text-muted">{photo.overview}</p> : null}
                </div>
                <PhotoAnnotator src={photo.imageDataUrl!} findings={photo.findings} label={photo.label} />
                {photo.findings.length === 0 ? (
                  <p className="text-sm text-muted">No callouts on this photo.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {photo.findings.map((finding) => (
                      <li key={finding.id}>
                        <span className="font-bold">{DAMAGE_TYPE_LABEL[finding.type]}</span>
                        {" · "}
                        {finding.severity}
                        {" · "}
                        {finding.location}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </section>

        <TextArea
          label="Inspector notes"
          value={noteValue}
          placeholder="Recon flags, wholesale vs retail, missing spare, etc."
          onChange={(e) => void saveNotes(e.target.value)}
        />

        <div className="flex flex-col gap-3">
          <Button type="button" onClick={() => void exportPdf()} disabled={exporting}>
            {exporting ? "Building PDF…" : "Export PDF"}
          </Button>
          <Button type="button" variant="secondary" onClick={exportJson}>
            Export JSON
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push(`/inspect/${id}/capture`)}>
            Back to photos
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/")}>
            Done — back to lot list
          </Button>
        </div>
      </Pad>
    </Screen>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "minor" | "moderate" | "severe";
}) {
  return (
    <Card className="text-center">
      <p className="text-3xl font-black">{value}</p>
      <div className="mt-2 flex justify-center">
        <SeverityChip severity={tone} />
      </div>
      <p className="sr-only">{label}</p>
    </Card>
  );
}
