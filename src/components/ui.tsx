import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto w-full ${wide ? "max-w-7xl" : "max-w-6xl"} px-4 sm:px-6 ${className}`}>{children}</div>
  );
}

export function PageHeader({
  title,
  intro,
  aside,
}: {
  title: string;
  intro?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 pt-10 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
      </div>
      {aside}
    </header>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div" | "li";
}) {
  return (
    <Tag className={`rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6 ${className}`}>
      {children}
    </Tag>
  );
}

export function CardTitle({ icon, children, aside }: { icon?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-xl">
        {icon && <span className="text-primary">{icon}</span>}
        {children}
      </h2>
      {aside}
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "primary" }) {
  const styles =
    tone === "primary"
      ? "bg-primary text-primary-fg border-transparent"
      : "bg-surface-2 text-text border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}

export function SampleBadge() {
  return (
    <span
      title="Placeholder content. Mods will replace this."
      className="inline-flex items-center rounded-full border border-dashed border-muted bg-surface/85 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted uppercase"
    >
      sample
    </span>
  );
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">{children}</p>
  );
}
