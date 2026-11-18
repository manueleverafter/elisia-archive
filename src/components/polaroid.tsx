import Image from "next/image";
import type { Polaroid } from "@/lib/types";
import { Placeholder } from "./media-shared";
import { SampleBadge, formatDate } from "./ui";

export function PolaroidCard({ photo, tilt = 0 }: { photo: Polaroid; tilt?: number }) {
  return (
    <figure
      style={{ rotate: `${tilt}deg` }}
      className="rounded-lg border border-border bg-surface p-2.5 pb-3 shadow-card transition hover:z-10 hover:scale-[1.03] hover:rotate-0"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
        {photo.imageUrl ? (
          <Image
            src={photo.imageUrl}
            alt={photo.caption}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <Placeholder label={photo.caption} className="absolute inset-0" />
        )}
        {photo.sample && (
          <span className="absolute top-2 left-2">
            <SampleBadge />
          </span>
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
