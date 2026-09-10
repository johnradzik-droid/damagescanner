"use client";

import { useCallback, useEffect, useState } from "react";
import { getInspection, saveInspection } from "@/lib/db";
import { writeLastInspector } from "@/lib/inspection";
import type { Inspection } from "@/lib/types";

export function useInspection(id: string) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadedFor, setLoadedFor] = useState(id);

  if (loadedFor !== id) {
    setLoadedFor(id);
    setInspection(null);
    setLoading(true);
    setMissing(false);
  }

  useEffect(() => {
    let cancelled = false;
    getInspection(id)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setMissing(true);
          setInspection(null);
        } else {
          setMissing(false);
          setInspection(row);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setMissing(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const persist = useCallback(async (next: Inspection) => {
    writeLastInspector(next.vehicle.inspectorName);
    const captured = next.photos.some((photo) => photo.imageDataUrl);
    const analyzed = next.photos.some((photo) => photo.analyzedAt);
    const status = analyzed ? "analyzed" : captured ? "ready" : "draft";
    const stored: Inspection = { ...next, status, updatedAt: new Date().toISOString() };
    await saveInspection(stored);
    setInspection(stored);
    return stored;
  }, []);

  return { inspection, loading, missing, persist, setInspection };
}
