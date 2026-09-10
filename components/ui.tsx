"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useAnalysisMode } from "@/components/mode";
import type { Severity } from "@/lib/types";

export function ModeBadge() {
  const mode = useAnalysisMode();
  const live = mode === "live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
        live
          ? "border-emerald-400 bg-emerald-400 text-black"
          : "border-gold bg-gold text-black"
      }`}
    >
      <span className="size-1.5 rounded-full bg-black" />
      {live ? "Live GPT-4o" : "Demo mode"}
    </span>
  );
}

export function AppHeader({ backHref, title }: { backHref?: string; title?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl border border-white/15 text-lg text-paper"
            aria-label="Back"
          >
            ←
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Susquehanna CDJR</p>
          <p className="truncate text-lg font-bold text-paper">{title ?? "Damage Scanner"}</p>
        </div>
        <ModeBadge />
      </div>
    </header>
  );
}

const btnBase =
  "inline-flex w-full min-h-16 items-center justify-center gap-2 rounded-2xl px-5 text-lg font-bold tracking-tight transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-gold text-black shadow-[0_4px_0_#b89612]",
    secondary: "border-2 border-gold bg-panel text-gold",
    ghost: "border border-white/20 bg-transparent text-paper",
    danger: "border-2 border-bad text-bad bg-transparent",
  }[variant];
  return <button className={`${btnBase} ${styles} ${className}`} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: ReactNode;
}) {
  const styles = {
    primary: "bg-gold text-black shadow-[0_4px_0_#b89612]",
    secondary: "border-2 border-gold bg-panel text-gold",
    ghost: "border border-white/20 bg-transparent text-paper",
  }[variant];
  return (
    <Link href={href} className={`${btnBase} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-muted">{label}</span>
      <input
        {...props}
        className="min-h-14 w-full rounded-2xl border border-white/15 bg-panel px-4 text-base text-paper outline-none placeholder:text-muted/70 focus:border-gold"
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-muted">{label}</span>
      <textarea
        {...props}
        className="min-h-32 w-full rounded-2xl border border-white/15 bg-panel px-4 py-3 text-base text-paper outline-none placeholder:text-muted/70 focus:border-gold"
      />
    </label>
  );
}

export function SeverityChip({ severity, count }: { severity: Severity; count?: number }) {
  const colors: Record<Severity, string> = {
    minor: "bg-go text-black",
    moderate: "bg-warn text-black",
    severe: "bg-bad text-white",
  };
  return (
    <span className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-bold ${colors[severity]}`}>
      {count !== undefined ? `${count} ` : ""}
      {severity}
    </span>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col bg-ink text-paper">
      {children}
    </div>
  );
}

export function Pad({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex-1 px-4 py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] ${className}`}>{children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-white/10 bg-panel p-4 ${className}`}>{children}</div>;
}
