"use client";

import { ExternalLink, Play } from "lucide-react";
import { useMemo, useState } from "react";
import type { FeedPost } from "@/lib/types";
import { platformInfo } from "./media-shared";


const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function SocialFeed({ posts }: { posts: FeedPost[] }) {
  const [platform, setPlatform] = useState("all");
  const [newest, setNewest] = useState(true);
  const platforms = useMemo(() => [...new Set(posts.map((p) => p.platform))], [posts]);
  const shown = useMemo(() => {
    const list = platform === "all" ? posts : posts.filter((p) => p.platform === platform);
    return [...list].sort((a, b) => (newest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  }, [posts, platform, newest]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
      active ? "border-transparent bg-primary text-primary-fg" : "border-border bg-surface hover:bg-surface-2"
    }`;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl">latest updates</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold tracking-wider text-muted uppercase">
            {shown.length} updates
          </span>
          <div role="group" aria-label="Sort" className="flex rounded-full border border-border bg-surface p-1">
            <button type="button" aria-pressed={newest} onClick={() => setNewest(true)} className={`rounded-full px-3 py-1 text-sm ${newest ? "bg-surface-2 font-semibold" : "text-muted"}`}>
              Newest
            </button>
            <button type="button" aria-pressed={!newest} onClick={() => setNewest(false)} className={`rounded-full px-3 py-1 text-sm ${!newest ? "bg-surface-2 font-semibold" : "text-muted"}`}>
              Oldest
            </button>
          </div>
        </div>
      </div>

      {platforms.length > 1 && (
        <div role="group" aria-label="Filter by platform" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button type="button" aria-pressed={platform === "all"} onClick={() => setPlatform("all")} className={chip(platform === "all")}>
            All
          </button>
          {platforms.map((p) => (
            <button key={p} type="button" aria-pressed={platform === p} onClick={() => setPlatform(p)} className={chip(platform === p)}>
              {platformInfo[p]?.name ?? p}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">No posts yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <li key={p.id}>
              <FeedCard post={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FeedCard({ post: p }: { post: FeedPost }) {
  const [playing, setPlaying] = useState(false);
  const name = platformInfo[p.platform]?.name ?? p.platform;

  let media: React.ReactNode;
  if (playing && p.tiktokId) {
    media = (
      <iframe
        src={`https://www.tiktok.com/player/v1/${p.tiktokId}?autoplay=1&description=0&music_info=0`}
        title={p.caption || "TikTok video"}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        className="absolute inset-0 size-full"
      />
    );
  } else if (p.thumbUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    media = <img src={p.thumbUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />;
  } else {
    media = <div className="bg-gradient absolute inset-0 opacity-70" />;
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-border bg-surface shadow-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        {media}
        <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur">
          {name}
        </span>
        {p.platform === "tiktok" && p.tiktokId && !playing && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play this TikTok here"
            className="absolute inset-0 grid place-items-center bg-black/10 transition hover:bg-black/25"
          >
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-fg shadow-card">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        {p.caption && <p className="line-clamp-3 text-sm font-medium">{p.caption}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-3 text-xs">
          <time dateTime={p.date} className="font-semibold text-primary">
            {fmt.format(new Date(p.date))}
          </time>
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline">
            Open on {name} <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
