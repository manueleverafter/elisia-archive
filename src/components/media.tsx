"use client";

import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import type { MediaItem } from "@/lib/types";
import { Placeholder, platformLabel } from "./media-shared";

/**
 * "Lite" YouTube embed: shows only the thumbnail until clicked, then loads
 * the real player. Much faster on phones than embedding every iframe.
 */
export function MediaThumb({ item }: { item: MediaItem }) {
  const [playing, setPlaying] = useState(false);

  if (item.platform === "youtube" && item.youtubeId) {
    if (playing) {
      return (
        <iframe
          className="aspect-video w-full"
          src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative block aspect-video w-full overflow-hidden"
        aria-label={`Play ${item.title}`}
      >
        <Image
          src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 grid place-items-center bg-black/10 transition group-hover:bg-black/25">
          <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-fg shadow-card">
            <Play className="ml-0.5 size-6 fill-current" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="group relative block">
      <Placeholder label={item.title} className="aspect-video w-full" />
      <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-text">
        Watch on {platformLabel[item.platform]} <ExternalLink className="size-3" />
      </span>
    </a>
  );
}
