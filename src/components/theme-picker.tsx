"use client";

import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useThemePrefs } from "@/lib/theme-store";
import { themes, type Mode } from "@/lib/themes";

const modes: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "Auto", Icon: Monitor },
];

export function ThemePicker() {
  const { theme, mode, setTheme, setMode } = useThemePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Change theme and light or dark mode"
        className="grid size-10 place-items-center rounded-full border border-border bg-surface text-text transition hover:bg-surface-2"
      >
        <Palette className="size-[18px]" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Appearance"
          className="absolute right-0 z-50 mt-2 w-72 rounded-3xl border border-border bg-surface p-4 shadow-card"
        >
          <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Mode</p>
          <div role="radiogroup" aria-label="Mode" className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1">
            {modes.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={mode === id}
                onClick={() => setMode(id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition ${
                  mode === id ? "bg-surface font-semibold text-text shadow-card" : "text-muted hover:text-text"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Theme</p>
          <div role="radiogroup" aria-label="Color theme" className="grid gap-1">
            {themes.map((t) => {
              const active = theme === t.id;
              const bg =
                t.swatch.length > 1 ? `linear-gradient(120deg, ${t.swatch.join(", ")})` : t.swatch[0];
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 text-left text-sm transition ${
                    active ? "bg-surface-2 font-semibold" : "hover:bg-surface-2"
                  }`}
                >
                  <span className="size-6 shrink-0 rounded-full border border-border" style={{ background: bg }} />
                  <span className="flex-1">{t.label}</span>
                  {t.kind === "multi" && <span className="text-[10px] tracking-wider text-muted uppercase">mix</span>}
                  {active && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
