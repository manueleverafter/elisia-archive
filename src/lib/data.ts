// Data access layer. Right now it returns SAMPLE data (marked with
// `sample: true` and shown with a "sample" badge). Once Supabase is
// connected, only the bodies of these functions change.

import { siteConfig } from "@/config/site";
import type {
  MediaItem,
  Polaroid,
  Post,
  PressItem,
  ProfileFact,
  Release,
  SocialLink,
} from "./types";

const media: MediaItem[] = [
  {
    id: "m1",
    title: "Sample: Debut stage highlight",
    platform: "youtube",
    url: "https://www.youtube.com/",
    category: "performance",
    tags: ["stage", "debut"],
    date: "2026-10-30",
    description: "Placeholder. Mods will replace this with a real video link.",
    featured: true,
    sample: true,
  },
  {
    id: "m2",
    title: "Sample: Behind the scenes vlog",
    platform: "youtube",
    url: "https://www.youtube.com/",
    category: "behind",
    tags: ["vlog"],
    date: "2026-10-12",
    sample: true,
  },
  {
    id: "m3",
    title: "Sample: Fancam clip",
    platform: "tiktok",
    url: "https://www.tiktok.com/",
    category: "fancam",
    tags: ["fancam"],
    date: "2026-09-28",
    sample: true,
  },
  {
    id: "m4",
    title: "Sample: Variety show moment",
    platform: "x",
    url: "https://x.com/",
    category: "variety",
    tags: ["variety", "funny"],
    date: "2026-09-02",
    sample: true,
  },
  {
    id: "m5",
    title: "Sample: Live stream recap",
    platform: "youtube",
    url: "https://www.youtube.com/",
    category: "live",
    tags: ["live"],
    date: "2026-08-15",
    sample: true,
  },
  {
    id: "m6",
    title: "Sample: Dance practice",
    platform: "x",
    url: "https://x.com/",
    category: "performance",
    tags: ["dance"],
    date: "2026-07-21",
    sample: true,
  },
];

const polaroids: Polaroid[] = [
  { id: "p1", caption: "Sample: bunny ears day", credit: "@fansite", date: "2026-11-02", tags: ["cute"], sample: true },
  { id: "p2", caption: "Sample: pink era photoshoot", credit: "@official", date: "2026-10-20", tags: ["photoshoot"], sample: true },
  { id: "p3", caption: "Sample: airport fashion", credit: "@fansite", date: "2026-10-05", tags: ["airport"], sample: true },
  { id: "p4", caption: "Sample: fan meeting", credit: "@fansite", date: "2026-09-18", tags: ["event"], sample: true },
  { id: "p5", caption: "Sample: selca", credit: "@official", date: "2026-09-01", tags: ["selca"], sample: true },
  { id: "p6", caption: "Sample: stage close-up", credit: "@fansite", date: "2026-08-22", tags: ["stage"], sample: true },
];

const releases: Release[] = [
  {
    id: "r1",
    title: "Sample release",
    type: "group",
    date: "2026-10-01",
    links: [
      { label: "Spotify", url: "https://open.spotify.com/" },
      { label: "Apple Music", url: "https://music.apple.com/" },
      { label: "YouTube Music", url: "https://music.youtube.com/" },
      { label: "YouTube", url: "https://www.youtube.com/" },
    ],
    goal: { label: "MV views", current: 6_400_000, target: 10_000_000 },
    sample: true,
  },
];

const posts: Post[] = [
  {
    id: "u1",
    title: `Welcome to the burrow, ${siteConfig.fandom.shortName}!`,
    body: `This is the new home for everything ${siteConfig.idol.name}. Mods are filling it in, so check back often.`,
    date: "2026-11-18",
    author: "ELFORT admins",
    pinned: true,
    tag: "announcement",
  },
  {
    id: "u2",
    title: "Sample: streaming party this weekend",
    body: "Placeholder post. Mods can write updates like this from the admin panel.",
    date: "2026-11-10",
    author: "mod",
    tag: "project",
    sample: true,
  },
  {
    id: "u3",
    title: "Sample: birthday project sign-ups",
    body: "Placeholder post for a fan project.",
    date: "2026-11-01",
    author: "mod",
    tag: "event",
    sample: true,
  },
];

const press: PressItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `n${i + 1}`,
  headline: `Sample headline #${i + 1}: news article mentioning ${siteConfig.idol.name}`,
  outlet: ["Outlet A", "Outlet B", "Outlet C"][i % 3],
  url: "https://example.com/",
  date: `2026-${String(11 - Math.floor(i / 3)).padStart(2, "0")}-${String(20 - i).padStart(2, "0")}`,
  era: i < 4 ? "Current era" : "Pre-debut",
  mention: i % 2 ? "mention" : "feature",
  sample: true,
}));

const socials: SocialLink[] = [
  {
    id: "s1",
    label: "UNIS Instagram",
    handle: "@unis_offcl",
    url: "https://www.instagram.com/unis_offcl/",
    platform: "instagram",
    owner: "group",
  },
];

const profile: ProfileFact[] = [
  { label: "Name", value: siteConfig.idol.name },
  { label: "Nicknames", value: siteConfig.idol.nicknames.join(", ") },
  { label: "Fandom", value: `${siteConfig.fandom.name} (${siteConfig.fandom.shortName})` },
  { label: "Favorite color", value: "Pink" },
];

const byDateDesc = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);

export async function getFeaturedMedia() {
  return media.find((m) => m.featured) ?? media[0];
}
export async function getMedia() {
  return [...media].sort(byDateDesc);
}
export async function getPolaroids() {
  return [...polaroids].sort(byDateDesc);
}
export async function getReleases() {
  return [...releases].sort(byDateDesc);
}
export async function getPosts() {
  return [...posts].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || byDateDesc(a, b));
}
export async function getPress() {
  return [...press].sort(byDateDesc);
}
export async function getSocials() {
  return socials;
}
export async function getProfile() {
  return profile;
}

export async function searchAll(q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const hit = (...fields: (string | undefined)[]) =>
    fields.some((f) => f?.toLowerCase().includes(needle));
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
  ].sort(byDateDesc);
}
