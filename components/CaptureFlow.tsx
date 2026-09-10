"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { CarGuide } from "@/components/CarGuide";
import { AppHeader, Button, Card, Pad, Screen } from "@/components/ui";
import { useInspection } from "@/components/useInspection";
import { EXTRA_HINT, STANDARD_ANGLES, isStandardAngle } from "@/lib/angles";
import { fileToCompressedDataUrl } from "@/lib/image";
import { blankPhoto, photosToAnalyze } from "@/lib/inspection";
import { createId } from "@/lib/ids";
import { makeSamplePhoto } from "@/lib/sample-photos";
import type { AnalyzeResponseBody, Inspection, PhotoRecord } from "@/lib/types";

type Step = number | "review";

export function CaptureFlow({ id }: { id: string }) {
  const router = useRouter();
  const { inspection, loading, missing, persist } = useInspection(id);
  const [step, setStep] = useState<Step>(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const standardCount = STANDARD_ANGLES.length;
  const extras = useMemo(
    () => inspection?.photos.filter((photo) => !isStandardAngle(photo.angleId)) ?? [],
    [inspection],
  );

  if (loading) {
    return (
      <Screen>
        <AppHeader backHref={`/inspect/${id}`} title="Capture" />
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

  const photo: PhotoRecord | undefined =
    step === "review" ? undefined : inspection.photos[step as number];
  const angle = photo ? STANDARD_ANGLES.find((item) => item.id === photo.angleId) : undefined;

  async function applyPhoto(file: File) {
    if (!inspection || step === "review") return;
    setBusy("Saving photo…");
    setError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      const index = step as number;
      const photos = inspection.photos.map((item, i) =>
        i === index
          ? {
              ...item,
              imageDataUrl: dataUrl,
              skipped: false,
              capturedAt: new Date().toISOString(),
              findings: [],
              overview: undefined,
              analyzedAt: undefined,
              analyzeError: undefined,
            }
          : item,
      );
      await persist({ ...inspection, photos, analyzedAt: undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that photo");
    } finally {
      setBusy(null);
    }
  }

  async function skipCurrent() {
    if (!inspection || step === "review") return;
    const index = step as number;
    const photos = inspection.photos.map((item, i) =>
      i === index
        ? {
            ...item,
            skipped: true,
            imageDataUrl: null,
            findings: [],
            overview: undefined,
            analyzedAt: undefined,
          }
        : item,
    );
    const next = await persist({ ...inspection, photos });
    goNext(next, index);
  }

  function goNext(current: Inspection, index: number) {
    if (index + 1 < current.photos.length) setStep(index + 1);
    else setStep("review");
  }

  async function fillSamples() {
    if (!inspection) return;
    setBusy("Building sample photos…");
    setError(null);
    try {
      const photos = inspection.photos.map((item) => {
        if (item.imageDataUrl) return item;
        return {
          ...item,
          skipped: false,
          imageDataUrl: makeSamplePhoto(item.label, item.id),
          capturedAt: new Date().toISOString(),
          findings: [],
          overview: undefined,
          analyzedAt: undefined,
          analyzeError: undefined,
        };
      });
      await persist({ ...inspection, photos, analyzedAt: undefined });
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build sample photos");
    } finally {
      setBusy(null);
    }
  }

  async function addExtra() {
    if (!inspection) return;
    const n = extras.length + 1;
    const extra = blankPhoto(`extra-${createId()}`, `Extra photo ${n}`, EXTRA_HINT);
    const photos = [...inspection.photos, extra];
    await persist({ ...inspection, photos });
    setStep(photos.length - 1);
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await applyPhoto(file);
  }

  async function analyzeAll() {
    if (!inspection) return;
    const queue = photosToAnalyze(inspection.photos);
    if (!queue.length) {
      setError("Capture or pick at least one photo before analyzing.");
      return;
    }
    setError(null);
    let current = inspection;
    for (let i = 0; i < queue.length; i += 1) {
      const target = queue[i];
      setProgress({ current: i + 1, total: queue.length, label: target.label });
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageDataUrl: target.imageDataUrl,
            angleId: target.angleId,
            angleLabel: target.label,
            vehicle: current.vehicle,
          }),
        });
        const payload = (await res.json()) as AnalyzeResponseBody & { message?: string };
        if (!res.ok) throw new Error(payload.message || "Analysis failed");
        current = {
          ...current,
          lastMode: payload.mode,
          analyzedAt: new Date().toISOString(),
          photos: current.photos.map((photoRow) =>
            photoRow.id === target.id
              ? {
                  ...photoRow,
                  findings: payload.findings,
                  overview: payload.overview,
                  analyzedAt: new Date().toISOString(),
                  analyzeError: undefined,
                }
              : photoRow,
          ),
        };
        current = await persist(current);
      } catch (err) {
        current = {
          ...current,
          photos: current.photos.map((photoRow) =>
            photoRow.id === target.id
              ? { ...photoRow, analyzeError: err instanceof Error ? err.message : "Failed" }
              : photoRow,
          ),
        };
        current = await persist(current);
      }
    }
    setProgress(null);
    router.push(`/inspect/${id}/report`);
  }

  return (
    <Screen>
      <AppHeader
        backHref={step === "review" || step === 0 ? `/inspect/${id}` : undefined}
        title={step === "review" ? "Review photos" : photo?.label ?? "Capture"}
      />
      {step !== "review" && step !== 0 ? (
        <button
          type="button"
          className="px-4 py-2 text-left text-sm font-bold text-gold"
          onClick={() => setStep((step as number) - 1)}
        >
          ← Previous angle
        </button>
      ) : null}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={onFile} />
      <input ref={galleryRef} type="file" accept="image/*" className="sr-only" onChange={onFile} />

      {progress ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-gold">Analyzing damage</p>
          <p className="mt-3 text-3xl font-black">
            {progress.current} / {progress.total}
          </p>
          <p className="mt-2 text-lg text-paper">{progress.label}</p>
          <p className="mt-6 max-w-xs text-sm text-muted">Keep this screen open. Each photo is sent to the analyzer in turn.</p>
        </div>
      ) : null}

      {step === "review" ? (
        <Pad className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            {inspection.photos.filter((p) => p.imageDataUrl).length} captured ·{" "}
            {inspection.photos.filter((p) => p.skipped && !p.imageDataUrl).length} skipped. Tap a tile to recapture.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {inspection.photos.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="overflow-hidden rounded-2xl border border-white/10 bg-panel text-left"
                onClick={() => setStep(index)}
              >
                <div className="relative aspect-square bg-black/40">
                  {item.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageDataUrl} alt={item.label} className="size-full object-contain bg-black" />
                  ) : (
                    <div className="flex size-full items-center justify-center px-1 text-center text-[11px] font-bold uppercase tracking-wide text-muted">
                      {item.skipped ? "Skipped" : "Needed"}
                    </div>
                  )}
                </div>
                <p className="truncate px-2 py-1.5 text-[11px] font-semibold">{item.label}</p>
              </button>
            ))}
          </div>
          {error ? <p className="text-sm font-semibold text-bad">{error}</p> : null}
          <Button type="button" variant="ghost" onClick={() => void fillSamples()}>
            Fill empty slots with sample photos
          </Button>
          <Button type="button" variant="secondary" onClick={() => void addExtra()}>
            Add extra photo
          </Button>
          <Button type="button" onClick={() => void analyzeAll()} disabled={Boolean(busy)}>
            Analyze damage
          </Button>
        </Pad>
      ) : photo ? (
        <Pad className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>
              {(step as number) + 1} / {inspection.photos.length}
              {(step as number) >= standardCount ? " · extra" : ""}
            </span>
            <button type="button" className="text-gold" onClick={() => setStep("review")}>
              Review all
            </button>
          </div>
          <Card>
            <p className="text-2xl font-black">{photo.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{photo.hint ?? EXTRA_HINT}</p>
            {angle ? (
              <div className="mt-3">
                <CarGuide zone={angle.zone} />
              </div>
            ) : null}
          </Card>
          {photo.imageDataUrl ? (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.imageDataUrl} alt={photo.label} className="w-full" />
            </div>
          ) : photo.skipped ? (
            <Card className="border-dashed">
              <p className="font-bold">Skipped</p>
              <p className="text-sm text-muted">You can still capture this angle later from Review.</p>
            </Card>
          ) : null}
          {error ? <p className="text-sm font-semibold text-bad">{error}</p> : null}
          {busy ? <p className="text-sm text-gold">{busy}</p> : null}
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="secondary" onClick={() => cameraRef.current?.click()} disabled={Boolean(busy)}>
              Camera
            </Button>
            <Button type="button" variant="secondary" onClick={() => galleryRef.current?.click()} disabled={Boolean(busy)}>
              Gallery
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="ghost" onClick={() => void skipCurrent()} disabled={Boolean(busy)}>
              Skip
            </Button>
            <Button
              type="button"
              onClick={() => goNext(inspection, step as number)}
              disabled={Boolean(busy) || (!photo.imageDataUrl && !photo.skipped)}
            >
              Next
            </Button>
          </div>
        </Pad>
      ) : null}
    </Screen>
  );
}
