import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export function AuthCard({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center font-hand text-3xl">
          {siteConfig.name} ♡
        </Link>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h1 className="font-display text-3xl">{title}</h1>
          {intro && <div className="mt-2 text-muted">{intro}</div>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: ReactNode }) {
  const cls = {
    info: "border-border bg-surface-2",
    ok: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    error: "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  }[tone];
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`mb-4 rounded-2xl border p-3 text-sm ${cls}`}>
      {children}
    </p>
  );
}
