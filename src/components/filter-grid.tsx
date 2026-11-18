"use client";

import { useState, type ReactNode } from "react";

/**
 * Generic chip filter: renders chips for each category and only the
 * matching children. Items are pre-rendered on the server and passed in.
 */
export function FilterGrid({
  filters,
  items,
  className,
  label,
}: {
  filters: { id: string; label: string }[];
  items: { key: string; tags: string[]; node: ReactNode }[];
  className: string;
  label: string;
}) {
  const [active, setActive] = useState("all");
  const shown = active === "all" ? items : items.filter((i) => i.tags.includes(active));

  return (
    <>
      <div role="group" aria-label={label} className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {[{ id: "all", label: "All" }, ...filters].map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => setActive(f.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === f.id
                ? "border-transparent bg-primary text-primary-fg"
                : "border-border bg-surface hover:bg-surface-2"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {shown.length ? (
        <ul className={className}>
          {shown.map((i) => (
            <li key={i.key}>{i.node}</li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">
          Nothing here yet.
        </p>
      )}
    </>
  );
}
