"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader, Button, Field, Pad, Screen } from "@/components/ui";
import { useInspection } from "@/components/useInspection";
import type { VehicleMeta } from "@/lib/types";

const MAKES = [
  "Ram",
  "Jeep",
  "Dodge",
  "Chrysler",
  "Ford",
  "Chevrolet",
  "GMC",
  "Toyota",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
  "Subaru",
  "Volkswagen",
  "BMW",
  "Mercedes-Benz",
];

export function VehicleForm({ id }: { id: string }) {
  const router = useRouter();
  const { inspection, loading, missing, persist } = useInspection(id);
  const [draft, setDraft] = useState<VehicleMeta | null>(null);
  const vehicle = draft ?? inspection?.vehicle ?? null;

  function set<K extends keyof VehicleMeta>(key: K, value: string) {
    if (!vehicle) return;
    setDraft({ ...vehicle, [key]: value });
  }

  async function continueWalkaround() {
    if (!inspection || !vehicle) return;
    await persist({ ...inspection, vehicle });
    router.push(`/inspect/${id}/capture`);
  }

  if (loading) {
    return (
      <Screen>
        <AppHeader backHref="/" title="Vehicle" />
        <Pad>Loading…</Pad>
      </Screen>
    );
  }
  if (missing || !vehicle || !inspection) {
    return (
      <Screen>
        <AppHeader backHref="/" title="Not found" />
        <Pad>That inspection is not on this phone.</Pad>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader backHref="/" title="Vehicle details" />
      <Pad className="flex flex-col gap-4">
        <p className="text-sm text-muted">Optional — fill what you have. You can edit this later.</p>
        <Field
          label="VIN"
          value={vehicle.vin}
          maxLength={17}
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="17-character VIN"
          onChange={(e) => set("vin", e.target.value.toUpperCase())}
        />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Year" inputMode="numeric" maxLength={4} value={vehicle.year} placeholder="2022" onChange={(e) => set("year", e.target.value)} />
          <div className="col-span-2">
            <Field
              label="Make"
              list="makes"
              value={vehicle.make}
              placeholder="Ram"
              onChange={(e) => set("make", e.target.value)}
            />
            <datalist id="makes">
              {MAKES.map((make) => (
                <option key={make} value={make} />
              ))}
            </datalist>
          </div>
        </div>
        <Field label="Model" value={vehicle.model} placeholder="1500 Laramie" onChange={(e) => set("model", e.target.value)} />
        <Field label="Stock / RO #" value={vehicle.stockOrRo} placeholder="4C28A or RO 18422" onChange={(e) => set("stockOrRo", e.target.value)} />
        <Field
          label="Odometer"
          inputMode="numeric"
          value={vehicle.odometer}
          placeholder="Miles"
          onChange={(e) => set("odometer", e.target.value)}
        />
        <Field
          label="Inspector"
          value={vehicle.inspectorName}
          placeholder="Your name"
          autoComplete="name"
          onChange={(e) => set("inspectorName", e.target.value)}
        />
        <Button type="button" onClick={() => void continueWalkaround()}>
          Start walkaround
        </Button>
        {inspection.status === "analyzed" ? (
          <Button type="button" variant="secondary" onClick={() => router.push(`/inspect/${id}/report`)}>
            Open last report
          </Button>
        ) : null}
      </Pad>
    </Screen>
  );
}
