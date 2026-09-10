"use client";

import { DAMAGE_TYPE_LABEL } from "@/lib/findings";
import type { DamageFinding, Severity } from "@/lib/types";

const BORDER: Record<Severity, string> = {
  minor: "#3ddc97",
  moderate: "#ff9f1c",
  severe: "#ff5c5c",
};

export function PhotoAnnotator({
  src,
  findings,
  label,
}: {
  src: string;
  findings: DamageFinding[];
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label ?? "Vehicle photo"} className="block w-full" />
        {findings.map((finding) =>
          finding.bbox ? (
            <div
              key={finding.id}
              className="pointer-events-none absolute rounded-md border-2"
              style={{
                left: `${finding.bbox.x * 100}%`,
                top: `${finding.bbox.y * 100}%`,
                width: `${finding.bbox.w * 100}%`,
                height: `${finding.bbox.h * 100}%`,
                borderColor: BORDER[finding.severity],
                boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
              }}
            >
              <span
                className="absolute -top-6 left-0 max-w-[12rem] truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black"
                style={{ background: BORDER[finding.severity] }}
              >
                {DAMAGE_TYPE_LABEL[finding.type]}
              </span>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
