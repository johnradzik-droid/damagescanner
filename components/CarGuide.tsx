"use client";

import type { AngleGuide } from "@/lib/angles";

const ZONES: Record<string, string> = {
  front: "front",
  rear: "rear",
  driver: "driver",
  passenger: "passenger",
  fl: "fl",
  fr: "fr",
  rl: "rl",
  rr: "rr",
  hood: "hood",
  wheels: "wheels",
  glass: "glass",
  cabin: "cabin",
};

function fill(active: boolean): string {
  return active ? "#ffe14a" : "#2a2a2a";
}

function stroke(active: boolean): string {
  return active ? "#111" : "#6b6b6b";
}

export function CarGuide({ zone }: { zone: AngleGuide["zone"] }) {
  const on = (key: string) => zone === ZONES[key];
  return (
    <svg viewBox="0 0 200 360" className="mx-auto h-48 w-auto" aria-hidden>
      <rect x="1" y="1" width="198" height="358" rx="24" fill="#141414" stroke="#333" />
      {/* body */}
      <rect x="55" y="40" width="90" height="280" rx="28" fill="#1f1f1f" stroke="#555" />
      {/* roof / hood highlight */}
      <rect x="70" y="70" width="60" height="70" rx="10" fill={fill(on("hood") || on("glass"))} stroke={stroke(on("hood") || on("glass"))} />
      <rect x="72" y="150" width="56" height="90" rx="8" fill={fill(on("hood"))} stroke={stroke(on("hood"))} opacity={on("cabin") ? 0.35 : 1} />
      {/* cabin */}
      <rect x="74" y="88" width="52" height="48" rx="8" fill={on("cabin") ? "#ffe14a" : "#111"} stroke={stroke(on("cabin") || on("glass"))} />
      {/* glass band */}
      <rect x="68" y="62" width="64" height="18" rx="6" fill={fill(on("glass"))} stroke={stroke(on("glass"))} />
      {/* front bumper */}
      <rect x="68" y="28" width="64" height="18" rx="6" fill={fill(on("front") || on("fl") || on("fr"))} stroke={stroke(on("front"))} />
      {/* rear bumper */}
      <rect x="68" y="314" width="64" height="18" rx="6" fill={fill(on("rear") || on("rl") || on("rr"))} stroke={stroke(on("rear"))} />
      {/* driver side */}
      <rect x="40" y="110" width="16" height="140" rx="6" fill={fill(on("driver") || on("fl") || on("rl"))} stroke={stroke(on("driver"))} />
      {/* passenger side */}
      <rect x="144" y="110" width="16" height="140" rx="6" fill={fill(on("passenger") || on("fr") || on("rr"))} stroke={stroke(on("passenger"))} />
      {/* corners */}
      <circle cx="58" cy="58" r="14" fill={fill(on("fl"))} stroke={stroke(on("fl"))} />
      <circle cx="142" cy="58" r="14" fill={fill(on("fr"))} stroke={stroke(on("fr"))} />
      <circle cx="58" cy="302" r="14" fill={fill(on("rl"))} stroke={stroke(on("rl"))} />
      <circle cx="142" cy="302" r="14" fill={fill(on("rr"))} stroke={stroke(on("rr"))} />
      {/* wheels */}
      <rect x="32" y="78" width="18" height="36" rx="6" fill={fill(on("wheels") || on("fl"))} />
      <rect x="150" y="78" width="18" height="36" rx="6" fill={fill(on("wheels") || on("fr"))} />
      <rect x="32" y="246" width="18" height="36" rx="6" fill={fill(on("wheels") || on("rl"))} />
      <rect x="150" y="246" width="18" height="36" rx="6" fill={fill(on("wheels") || on("rr"))} />
    </svg>
  );
}
