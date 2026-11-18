"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { getUploadTargets, type UploadRequest } from "@/app/admin/actions";

type Value = { url: string; originalUrl?: string; width?: number; height?: number } | undefined;

const WEB_MAX = 1600;

/** Makes the fast-loading web copy: max 1600px on the long side, WebP. */
async function makeWebCopy(file: File) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, WEB_MAX / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (!blob) throw new Error("Couldn't process this image.");
  return { blob, width: bmp.width, height: bmp.height };
}

export function ImageField({
  name,
  folder,
  defaultValue,
  keepOriginal = true,
}: {
  name: string;
  folder: string;
  defaultValue?: Value;
  keepOriginal?: boolean;
}) {
  const [value, setValue] = useState<Value>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const web = await makeWebCopy(file);
      const reqs: UploadRequest[] = [{ variant: "web", type: "image/webp", size: web.blob.size }];
      if (keepOriginal) reqs.push({ variant: "original", type: file.type, size: file.size });
      const targets = await getUploadTargets(folder, reqs);
      await Promise.all(
        targets.map(async (t) => {
          const body = t.variant === "web" ? web.blob : file;
          const res = await fetch(t.putUrl, {
            method: "PUT",
            body,
            headers: { "content-type": t.variant === "web" ? "image/webp" : file.type },
          });
          if (!res.ok) throw new Error(`Upload failed (${res.status}).`);
        }),
      );
      setValue({
        url: targets.find((t) => t.variant === "web")!.publicUrl,
        originalUrl: targets.find((t) => t.variant === "original")?.publicUrl,
        width: web.width,
        height: web.height,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name={`${name}.url`} value={value?.url ?? ""} />
      <input type="hidden" name={`${name}.originalUrl`} value={value?.originalUrl ?? ""} />
      <input type="hidden" name={`${name}.width`} value={value?.width ?? ""} />
      <input type="hidden" name={`${name}.height`} value={value?.height ?? ""} />

      {value?.url ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt="" className="max-h-64 rounded-2xl border border-border" />
          <button
            type="button"
            onClick={() => setValue(undefined)}
            aria-label="Remove photo"
            className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-surface/90 shadow-card"
          >
            <X className="size-4" />
          </button>
          {value.width && (
            <p className="mt-1 text-xs text-muted">
              {value.width}×{value.height}
              {value.originalUrl ? " · original kept for HD download" : ""}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-2 px-4 py-8 text-muted transition hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-7 animate-spin" /> : <ImagePlus className="size-7" />}
          <span className="text-sm font-medium">{busy ? "Uploading…" : "Choose a photo"}</span>
          <span className="text-xs">JPG, PNG, WebP · up to 25 MB</span>
        </button>
      )}
      {value?.url && (
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="mt-2 block text-sm font-semibold text-primary"
        >
          {busy ? "Uploading…" : "Replace photo"}
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
