"use client";

import { useParams } from "next/navigation";
import { ReportView } from "@/components/ReportView";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  return <ReportView id={params.id} />;
}
