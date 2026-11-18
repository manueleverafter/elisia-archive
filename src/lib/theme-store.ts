"use client";

import { useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { MODE_KEY, THEME_KEY, themes, type Mode, type ThemeId } from "./themes";

type Prefs = { theme: ThemeId; mode: Mode };

const SERVER_PREFS: Prefs = { theme: siteConfig.defaultTheme, mode: "system" };
const listeners = new Set<() => void>();
let cache: Prefs | null = null;

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the choice still applies for this visit */
  }
}

function load(): Prefs {
  const t = read(THEME_KEY);
  const m = read(MODE_KEY);
  return {
    theme: themes.some((x) => x.id === t) ? (t as ThemeId) : siteConfig.defaultTheme,
    mode: m === "light" || m === "dark" ? m : "system",
  };
}

const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

function apply(p: Prefs) {
  const d = document.documentElement;
  const resolved = p.mode === "system" ? (systemDark() ? "dark" : "light") : p.mode;
  d.setAttribute("data-theme", p.theme);
  d.setAttribute("data-mode", resolved);
  d.style.colorScheme = resolved;
}

function update(next: Partial<Prefs>) {
  cache = { ...(cache ?? load()), ...next };
  if (next.theme) write(THEME_KEY, next.theme);
  if (next.mode) write(MODE_KEY, next.mode);
  apply(cache);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if ((cache ?? load()).mode === "system") apply(cache ?? load());
  };
  mq.addEventListener("change", onSystem);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onSystem);
  };
}

export function useThemePrefs() {
  const prefs = useSyncExternalStore(
    subscribe,
    () => (cache ??= load()),
    () => SERVER_PREFS,
  );
  return {
    ...prefs,
    setTheme: (theme: ThemeId) => update({ theme }),
    setMode: (mode: Mode) => update({ mode }),
  };
}
