import type { ReactNode } from "react";

export function AdminTitle({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        {intro && <p className="mt-1 text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6 ${className}`}>{children}</section>;
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d} d ago` : new Date(iso).toISOString().slice(0, 10);
}
