"use client";

import { ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Polaroid } from "@/lib/types";
import { PolaroidCard } from "./polaroid";

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function slug(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60) || "photo";
}

/**
 * Polaroid grid where each print opens a full-size viewer: caption, credit,
 * date, source link, HD download, arrows / keyboard / swipe between photos.
 * Uses the native <dialog> so focus, Esc and the backdrop behave correctly.
 */
export function PolaroidGallery({
  photos,
  className,
  tilts = [-2, 1.5, -1, 2, -1.5, 1],
}: {
  photos: Polaroid[];
  className: string;
  tilts?: number[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const touchX = useRef<number | null>(null);
  const photo = index === null ? null : photos[index];

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = useCallback(() => dialog.current?.close(), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => setIndex(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("close", onClose);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("close", onClose);
      el.removeEventListener("keydown", onKey);
    };
  }, [step]);

  // Keep the page behind the viewer from scrolling while it's open.
  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) return;
    const body = document.body;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = "";
    };
  }, [isOpen]);

  async function downloadHd(p: Polaroid) {
    const url = p.originalUrl ?? p.imageUrl;
    if (!url) return;
    setSaving(true);
    try {
      // Cross-origin links ignore the download attribute, so fetch the file
      // first and save it under a readable name.
      const blob = await (await fetch(url)).blob();
      const ext = (url.split(".").pop() ?? "jpg").split("?")[0];
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `elisia-${slug(p.caption)}-${p.date}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    } catch {
      window.open(url, "_blank", "noopener");
    } finally {
      setSaving(false);
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition";

  return (
    <>
      <ul className={className}>
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Open ${p.caption}`}
              className="block w-full cursor-zoom-in text-left"
            >
              <PolaroidCard photo={p} tilt={tilts[i % tilts.length]} interactive={false} />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={photo?.caption ?? "Photo"}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-[100dvh] max-w-[100vw] bg-transparent p-0 text-text backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        {photo && (
          <div
            className="relative flex max-h-[95dvh] w-[min(94vw,560px)] flex-col overflow-hidden rounded-3xl border-2 border-primary bg-surface shadow-card"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <header className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl leading-tight">{photo.caption}</h2>
                <p className="mt-1 text-xs text-muted">
                  credit: {photo.credit} · {fmt.format(new Date(photo.date))}
                  {photo.width && photo.height ? ` · ${photo.width}×${photo.height}` : ""}
                </p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full border border-border hover:bg-surface-2">
                <X className="size-5" />
              </button>
            </header>

            <div className="relative min-h-0 flex-1 bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={photo.id}
                src={photo.imageUrl}
                alt={photo.caption}
                width={photo.width}
                height={photo.height}
                className="mx-auto max-h-[70dvh] w-auto object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute top-1/2 left-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/65">
                    <ChevronLeft className="size-5" />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/65">
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>

            <footer className="flex flex-wrap items-center gap-2 p-4">
              {photo.creditUrl && (
                <a href={photo.creditUrl} target="_blank" rel="noopener noreferrer" className={`${btn} border-border hover:bg-surface-2`}>
                  source <ExternalLink className="size-3.5" />
                </a>
              )}
              {(photo.originalUrl || photo.imageUrl) && (
                <button
                  type="button"
                  onClick={() => downloadHd(photo)}
                  disabled={saving}
                  className={`${btn} border-transparent bg-primary text-primary-fg hover:brightness-110 disabled:opacity-60`}
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  {photo.originalUrl ? "HD download" : "download"}
                </button>
              )}
              {photos.length > 1 && (
                <span className="ml-auto text-xs text-muted">
                  {(index ?? 0) + 1} / {photos.length}
                </span>
              )}
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}
