"use client";

import { useParams } from "next/navigation";
import { CaptureFlow } from "@/components/CaptureFlow";

export default function CapturePage() {
  const params = useParams<{ id: string }>();
  return <CaptureFlow id={params.id} />;
}
