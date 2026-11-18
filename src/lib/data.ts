// Public data layer. Every read is cached and tagged "content"; any change
// in the admin panel expires the tag, so visitors see updates immediately
// while the database is only hit when something actually changed.

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./server/mongo";
import { readSettings, type ImageValue, type LinkValue } from "./server/content";
import type { MediaItem, Polaroid, Post, PressItem, ProfileFact, Release, SocialLink } from "./types";

export const CONTENT_TAG = "content";

type Doc = Record<string, unknown> & { _id: unknown };

async function live(name: string, sort: Record<string, 1 | -1>, limit = 500): Promise<Doc[]> {
  return (await db
    .collection(name)
    .find({ deletedAt: null })
    .sort(sort)
    .limit(limit)
    .toArray()) as Doc[];
}

const s = (v: unknown) => (typeof v === "string" ? v : "");
const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);

function toMedia(d: Doc): MediaItem {
  return {
    id: String(d._id),
    title: s(d.title),
    platform: (s(d.platform) || "youtube") as MediaItem["platform"],
    url: s(d.url),
    youtubeId: s(d.youtubeId) || undefined,
    category: (s(d.category) || "performance") as MediaItem["category"],
    tags: arr<string>(d.tags),
    date: s(d.date),
    description: s(d.description) || undefined,
    featured: !!d.featured,
  };
}

export async function getMedia() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return (await live("media", { date: -1 })).map(toMedia);
}

export async function getFeaturedMedia(): Promise<MediaItem | null> {
  const media = await getMedia();
  return media.find((m) => m.featured) ?? media[0] ?? null;
}

export async function getPolaroids(): Promise<Polaroid[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return (await live("polaroids", { date: -1 })).map((d) => {
    const img = d.image as ImageValue | undefined;
    return {
      id: String(d._id),
      caption: s(d.caption),
      imageUrl: img?.url,
      originalUrl: img?.originalUrl,
      width: img?.width,
      height: img?.height,
      credit: s(d.credit),
      creditUrl: s(d.creditUrl) || undefined,
      date: s(d.date),
      tags: arr<string>(d.tags),
    };
  });
}

export async function getReleases(): Promise<Release[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return (await live("releases", { date: -1 })).map((d) => {
    const target = Number(d.goalTarget) || 0;
    return {
      id: String(d._id),
      title: s(d.title),
      type: (s(d.type) || "single") as Release["type"],
      date: s(d.date),
      coverUrl: (d.cover as ImageValue | undefined)?.url,
      links: arr<LinkValue>(d.links),
      goal: target
        ? { label: s(d.goalLabel) || "Goal", current: Number(d.goalCurrent) || 0, target }
        : undefined,
    };
  });
}

export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return (await live("posts", { pinned: -1, date: -1 })).map((d) => ({
    id: String(d._id),
    title: s(d.title),
    body: s(d.body),
    date: s(d.date),
    author: s(d.author) || "mods",
    pinned: !!d.pinned,
    tag: (s(d.tag) || "announcement") as Post["tag"],
  }));
}

export async function getPress(): Promise<PressItem[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return (await live("press", { date: -1 }, 2000)).map((d) => ({
    id: String(d._id),
    headline: s(d.headline),
    outlet: s(d.outlet),
    url: s(d.url),
    date: s(d.date),
    era: s(d.era) || "Other",
    mention: (s(d.mention) || "mention") as PressItem["mention"],
  }));
}

export async function getSocials(): Promise<SocialLink[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return (await live("socials", { order: 1, label: 1 })).map((d) => ({
    id: String(d._id),
    label: s(d.label),
    handle: s(d.handle),
    url: s(d.url),
    platform: (s(d.platform) || "instagram") as SocialLink["platform"],
    owner: (s(d.owner) || "official") as SocialLink["owner"],
  }));
}

export async function getSiteSettings() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return readSettings();
}

export async function getProfile(): Promise<ProfileFact[]> {
  return (await getSiteSettings()).profile;
}

export async function searchAll(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const [media, polaroids, posts, press] = await Promise.all([getMedia(), getPolaroids(), getPosts(), getPress()]);
  const hit = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(needle));
  return [
    ...media
      .filter((m) => hit(m.title, m.description, m.date, ...m.tags))
      .map((m) => ({ kind: "Media", title: m.title, href: "/media", date: m.date })),
    ...polaroids
      .filter((p) => hit(p.caption, p.credit, p.date, ...p.tags))
      .map((p) => ({ kind: "Polaroid", title: p.caption, href: "/photos", date: p.date })),
    ...posts
      .filter((p) => hit(p.title, p.body, p.date))
      .map((p) => ({ kind: "Fanbase", title: p.title, href: "/updates", date: p.date })),
    ...press
      .filter((p) => hit(p.headline, p.outlet, p.date, p.era))
      .map((p) => ({ kind: "Press", title: p.headline, href: "/press", date: p.date })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 100);
}
