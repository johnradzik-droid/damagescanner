"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader, Pad, Screen } from "@/components/ui";
import { saveInspection } from "@/lib/db";
import { createBlankInspection } from "@/lib/inspection";

export default function NewInspectionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const inspection = createBlankInspection();
        await saveInspection(inspection);
        if (!cancelled) router.replace(`/inspect/${inspection.id}`);
      } catch {
        if (!cancelled) setError("Could not start an inspection on this device.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Screen>
      <AppHeader backHref="/" title="New inspection" />
      <Pad>{error ?? "Starting inspection…"}</Pad>
    </Screen>
  );
}
