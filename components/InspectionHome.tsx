"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink, Card, ModeBadge, Pad, Screen, SeverityChip } from "@/components/ui";
import { deleteInspection, listInspections } from "@/lib/db";
import { vehicleTitle } from "@/lib/inspection";
import { allFindings, countSeverities, formatWhen } from "@/lib/report-utils";
import type { Inspection } from "@/lib/types";

export function InspectionHome() {
  const [rows, setRows] = useState<Inspection[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listInspections().then((data) => {
      if (!cancelled) setRows(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Screen>
      <header className="border-b border-white/10 bg-ink pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Susquehanna CDJR</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-paper">Damage Scanner</h1>
              <p className="mt-1 text-sm text-muted">Wholesale + retail lot evals</p>
            </div>
            <ModeBadge />
          </div>
        </div>
      </header>
      <Pad className="flex flex-col gap-5">
        <ButtonLink href="/inspect/new">New inspection</ButtonLink>
        <p className="text-center text-sm text-muted">
          Walk the car, shoot the standard angles, get a structured report. Photos stay on this phone
          until you run analysis.
        </p>
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Saved on this device</h2>
          {rows === null ? (
            <p className="text-muted">Loading…</p>
          ) : rows.length === 0 ? (
            <Card>
              <p className="text-base font-semibold">No inspections yet</p>
              <p className="mt-1 text-sm text-muted">
                Start an eval on the lot. You can skip any angle and add extra close-ups.
              </p>
            </Card>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((row) => {
                const counts = countSeverities(allFindings(row));
                const href =
                  row.status === "analyzed"
                    ? `/inspect/${row.id}/report`
                    : row.status === "ready"
                      ? `/inspect/${row.id}/capture`
                      : `/inspect/${row.id}`;
                return (
                  <li key={row.id}>
                    <Card className="p-0">
                      <Link href={href} className="block p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold leading-tight">{vehicleTitle(row.vehicle)}</p>
                            <p className="mt-1 text-sm text-muted">
                              {row.vehicle.stockOrRo ? `Stock/RO ${row.vehicle.stockOrRo} · ` : ""}
                              {formatWhen(row.updatedAt)}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                            {row.status}
                          </span>
                        </div>
                        {counts.total > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {counts.severe ? <SeverityChip severity="severe" count={counts.severe} /> : null}
                            {counts.moderate ? <SeverityChip severity="moderate" count={counts.moderate} /> : null}
                            {counts.minor ? <SeverityChip severity="minor" count={counts.minor} /> : null}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-muted">
                            {row.photos.filter((p) => p.imageDataUrl).length} photos captured
                          </p>
                        )}
                      </Link>
                      <div className="border-t border-white/10 px-4 py-2">
                        <button
                          type="button"
                          className="min-h-12 text-sm font-bold text-bad"
                          onClick={async () => {
                            if (confirm("Delete this inspection from this phone?")) {
                              await deleteInspection(row.id);
                              setRows(await listInspections());
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </Pad>
    </Screen>
  );
}
