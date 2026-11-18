"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { siteConfig } from "@/config/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden xl:block">
      <ul className="flex items-center gap-1">
        {siteConfig.nav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-primary text-primary-fg" : "text-text hover:bg-surface-2"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu after navigating.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-full border border-border bg-surface"
      >
        <Menu className="size-5" />
      </button>

      {open &&
        createPortal(
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-3 top-3 rounded-3xl border border-border bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-hand text-2xl">{siteConfig.name}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full hover:bg-surface-2"
              >
                <X className="size-5" />
              </button>
            </div>
            <form action="/search" className="mb-3">
              <label className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2.5">
                <Search className="size-4 text-muted" />
                <span className="sr-only">Search the archive</span>
                <input
                  name="q"
                  type="search"
                  placeholder="find a clip, date, or photo…"
                  className="w-full bg-transparent text-base outline-none placeholder:text-muted"
                />
              </label>
            </form>
            <nav aria-label="Main">
              <ul className="grid grid-cols-2 gap-2">
                {siteConfig.nav.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-2xl px-4 py-3 font-medium ${
                          active ? "bg-primary text-primary-fg" : "bg-surface-2"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
