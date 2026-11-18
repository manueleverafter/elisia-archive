// Content model. These mirror the database tables we'll create in
// Supabase, so swapping sample data for real data won't touch the UI.

export type Platform = "youtube" | "x" | "tiktok" | "instagram";

export type MediaItem = {
  id: string;
  title: string;
  platform: Platform;
  url: string;
  /** YouTube video id, when platform is youtube */
  youtubeId?: string;
  category: "mv" | "performance" | "variety" | "live" | "fancam" | "behind";
  tags: string[];
  date: string; // ISO date
  description?: string;
  featured?: boolean;
  sample?: boolean;
};

export type Polaroid = {
  id: string;
  caption: string;
  imageUrl?: string;
  /** Full-size original, for HD download */
  originalUrl?: string;
  width?: number;
  height?: number;
  credit: string;
  creditUrl?: string;
  date: string;
  tags: string[];
  sample?: boolean;
};

export type Release = {
  id: string;
  title: string;
  type: "single" | "album" | "ost" | "group";
  date: string;
  coverUrl?: string;
  links: { label: string; url: string }[];
  goal?: { label: string; current: number; target: number };
  sample?: boolean;
};

export type Post = {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
  pinned?: boolean;
  tag: "announcement" | "project" | "event" | "notice";
  sample?: boolean;
};

export type PressItem = {
  id: string;
  headline: string;
  outlet: string;
  url: string;
  date: string;
  era: string;
  mention: "feature" | "mention";
  sample?: boolean;
};

export type SocialLink = {
  id: string;
  label: string;
  handle: string;
  url: string;
  platform: Platform | "spotify" | "weverse" | "facebook";
  owner: "official" | "group" | "fanbase";
};

export type ProfileFact = { label: string; value: string };
