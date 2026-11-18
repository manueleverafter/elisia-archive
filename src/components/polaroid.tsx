import { Download } from "lucide-react";
import type { Polaroid } from "@/lib/types";
import { Placeholder } from "./media-shared";
import { formatDate } from "./ui";

export function PolaroidCard({ photo, tilt = 0 }: { photo: Polaroid; tilt?: number }) {
  return (
    <figure
      style={{ rotate: `${tilt}deg` }}
      className="group rounded-lg border border-border bg-surface p-2.5 pb-3 shadow-card transition hover:z-10 hover:scale-[1.03] hover:rotate-0"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-2">
        {photo.imageUrl ? (
          // Web copies are already resized to WebP on upload, so they are
          // served straight from R2 instead of through image optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.imageUrl}
            alt={photo.caption}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Placeholder label={photo.caption} className="absolute inset-0" />
        )}
        {photo.originalUrl && (
          <a
            href={photo.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-text shadow-card transition hover:bg-primary hover:text-primary-fg"
            aria-label={`Open the HD original of ${photo.caption}`}
          >
            <Download className="size-3" /> HD
          </a>
        )}
      </div>
      <figcaption className="mt-2.5 text-center">
        <span className="block font-hand text-lg leading-tight">{photo.caption}</span>
        <span className="mt-1 block text-xs text-muted">
          {photo.creditUrl ? (
            <a href={photo.creditUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              {photo.credit}
            </a>
          ) : (
            photo.credit
          )}{" "}
          · <time dateTime={photo.date}>{formatDate(photo.date)}</time>
        </span>
      </figcaption>
    </figure>
  );
}
