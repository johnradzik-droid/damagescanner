"use client";

import { useParams } from "next/navigation";
import { VehicleForm } from "@/components/VehicleForm";

export default function VehiclePage() {
  const params = useParams<{ id: string }>();
  return <VehicleForm id={params.id} />;
}
